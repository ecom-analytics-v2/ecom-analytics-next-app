import { env } from "@/env";
import { and, eq, SQL } from "drizzle-orm";
import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { db } from "../db/drizzle";
import { shopifyWebhookSubscriptions } from "../db/schema";
import { shopifyBulkOperations } from "../db/schema/shopify/shopifyBulkOperations";

const shopifyRedirectUri = () => encodeURIComponent(`${env.BASE_URL}/api/oauth/shopify/callback`);
const generateShopifyState = () => crypto.randomBytes(20).toString("hex");

export const initShopifyOAuth = (shop_url: string) => {
  return `https://${shop_url}/admin/oauth/authorize?client_id=${env.SHOPIFY_CLIENT_ID}&scope=read_orders,read_all_orders,read_products&redirect_uri=${shopifyRedirectUri()}&state=${generateShopifyState()}`;
};

export const validateShopifyMessage = (hmac: string, message: string) => {
  const cryptoHmac = crypto.createHmac("sha256", env.SHOPIFY_CLIENT_SECRET);
  cryptoHmac.update(message);
  const calculatedDigest = cryptoHmac.digest("hex");

  const calculatedBuffer = Buffer.from(calculatedDigest, "hex");
  const receivedBuffer = Buffer.from(hmac, "hex");

  if (!crypto.timingSafeEqual(calculatedBuffer, receivedBuffer)) return false;
  return true;
};

export const validateShopifyShopUrl = (shop_url: string) => {
  const regex = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/);
  return regex.test(shop_url);
};

interface ShopifyAccessTokenResponse {
  access_token: string;
  scope: string;
}

export const exchangeShopifyCode = async (shop_url: string, code: string) => {
  try {
    const response = await fetch(
      `https://${shop_url}/admin/oauth/access_token?client_id=${env.SHOPIFY_CLIENT_ID}&client_secret=${env.SHOPIFY_CLIENT_SECRET}&code=${code}`,
      { method: "POST" }
    );
    let data;

    if (response.ok) {
      data = (await response.json()) as ShopifyAccessTokenResponse;
    } else {
      data = (await response.json()) as any;
      throw new Error(`Shopify API Error: ${await response.text()}`);
    }

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface ShopifyGraphQLResponse<T> {
  data: T;
}

const queryShopifyApi = async <T>(
  access_token: string,
  shop: string,
  query: string
): Promise<ShopifyGraphQLResponse<T> | false> => {
  try {
    const response = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    });

    let data;
    if (response.ok) {
      data = (await response.json()) as ShopifyGraphQLResponse<T>;
    } else {
      data = (await response.json()) as ShopifyErrorResponse;
      throw new Error(`Shopify API Errors: ${data.errors.map((e) => e.message).join(" | ")}`);
    }

    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface ShopifyErrorResponse {
  errors: ShopifyApiError[];
}

type ShopifyApiError = {
  message: string;
  locations: {
    line: number;
    column: number;
  }[];
  path: string[];
  extensions: {
    code: string;
    typeName: string;
    fieldName: string;
  };
};

type ShopifyReadProductsResponse = {
  products: {
    edges: {
      node: ShopifyApiProduct;
      cursor: string;
    }[];
    pageInfo: {
      hasNextPage: string;
    };
  };
};

export interface ShopifyApiProduct {
  id: string;
  title: string;
  handle: string;
}

export const readShopifyProducts = async (access_token: string, shop: string) => {
  try {
    const apiQuery = `query { products(first: 250) { edges { node { id title handle } cursor } pageInfo { hasNextPage } } }`;
    const response = await queryShopifyApi<ShopifyReadProductsResponse>(
      access_token,
      shop,
      apiQuery
    );
    if (!response) throw new Error("Failed to query Shopify API");

    return response.data.products.edges.map((p) => p.node);
  } catch (e) {
    return false;
  }
};

type ShopifyReadOrdersResponse = {
  orders: {
    edges: {
      node: ShopifyApiOrder;
    }[];
  };
};

interface ShopifyApiOrder {
  id: string;
  lineItems: {
    nodes: {
      id: string;
      product: {
        id: string;
      };
    }[];
  };
  totalPriceSet: {
    shopMoney: {
      amount: string;
    };
  };
  createdAt: string;
}

export interface FormattedShopifyApiOrder {
  id: string;
  product_ids: string[];
  total_amount: string;
  created_at: string;
}

interface ShopifyRunBulkOperationResponse {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: string;
      status: string;
    };
    userErrors: any[];
  };
}

export const runShopifyBulkOperation = async (
  access_token: string,
  shop: string,
  shopify_account_id: number,
  query: string
) => {
  //Make sure we are subscribed to the Webhook BULK_OPERATIONS_FINISH
  const whkSubscriptionExists = await db.query.shopifyWebhookSubscriptions.findFirst({
    where: and(
      eq(shopifyWebhookSubscriptions.shopifyTopic, "BULK_OPERATIONS_FINISH"),
      eq(shopifyWebhookSubscriptions.shopifyAccountId, shopify_account_id)
    ),
  });
  if (!whkSubscriptionExists) {
    const whkSubscriptionId = await createShopifyWebhookSubscription(
      access_token,
      shop,
      "BULK_OPERATIONS_FINISH",
      `${env.NODE_ENV === "development" ? env.DEV_WEBHOOK_BASE_URL : env.BASE_URL}/api/webhooks/shopify/bulk-operations-finish`
    );
    if (!whkSubscriptionId) throw new Error("Failed to create Shopify Webhook Subscription");

    await db.insert(shopifyWebhookSubscriptions).values({
      shopifyGid: whkSubscriptionId,
      shopifyTopic: "BULK_OPERATIONS_FINISH",
      shopifyAccountId: shopify_account_id,
    });
  }

  const apiQuery = `mutation {
  bulkOperationRunQuery(
    query:"""
    ${query}
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}`;

  const response = await queryShopifyApi<ShopifyRunBulkOperationResponse>(
    access_token,
    shop,
    apiQuery
  );
  if (!response) throw new Error("Failed to query Shopify API");

  return response.data.bulkOperationRunQuery.bulkOperation;
};

interface ShopifyReadBulkOperationResponse {
  node: ShopifyApiBulkOperation;
}

export interface ShopifyApiBulkOperation {
  id: string;
  url: null | string;
  status: string;
}

export const readShopifyBulkOperation = async (
  access_token: string,
  shop: string,
  bulk_operation_gid: string
) => {
  const apiQuery = `query {
  node(id: "${bulk_operation_gid}") {
    ... on BulkOperation {
      id
      status
      url
    }
  }
}`;
  const response = await queryShopifyApi<ShopifyReadBulkOperationResponse>(
    access_token,
    shop,
    apiQuery
  );
  if (!response) throw new Error("Failed to query Shopify API");

  return response.data.node;
};

export const initReadAllShopifyOrders = async (
  access_token: string,
  shop: string,
  shopify_account_id: number
) => {
  const apiQuery = `{
      orders {
        edges {
          node {
            id
            totalPriceSet {
              shopMoney {
                amount
              }
            }
            lineItems {
              edges {
                node {
                  id
                  product {
                    id
                  }
                }
              }
            }
            createdAt
          }
        }
      }
    }`;
  const bulkOperation = await runShopifyBulkOperation(
    access_token,
    shop,
    shopify_account_id,
    apiQuery
  );

  await db.insert(shopifyBulkOperations).values({
    shopifyGid: bulkOperation.id,
    status: bulkOperation.status as unknown as SQL<unknown>,
    local_purpose: "read_all_orders",
    shopifyAccountId: shopify_account_id,
  });

  return bulkOperation;
};

interface BulkOrderLineData {
  id: string;
  totalPriceSet?: {
    shopMoney: {
      amount: string;
    };
  };
  product?: {
    id: string;
  };
  __parentId?: string;
  createdAt?: string;
}

export const getBulkOperationResulsAsArray = async (result_url: string) => {
  try {
    const response = await fetch(result_url);
    if (!response.ok) throw new Error("Unable to fetch results URL");

    const data = await response.text();
    const lines = data.split("\n").filter((l) => l.startsWith("{"));
    const jsonLines = lines.map((l) => JSON.parse(l)) as BulkOrderLineData[];

    return jsonLines;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const convertBulkOrdersResult = async (bulk_orders_data: BulkOrderLineData[]) => {
  let ShopifyOrders: FormattedShopifyApiOrder[] = [];

  for (let i = 0; i < bulk_orders_data.length; i++) {
    let line_data = bulk_orders_data[i]!;

    if (line_data.id.includes("/Order/")) {
      ShopifyOrders.push({
        id: line_data.id as string,
        total_amount: line_data.totalPriceSet!.shopMoney.amount as string,
        product_ids: [],
        created_at: line_data.createdAt!,
      });
    } else if (line_data.id.includes("/LineItem/")) {
      const ShopifyOrderIndex = ShopifyOrders.findIndex((o) => o.id === line_data.__parentId);
      if (ShopifyOrderIndex === -1) continue;
      if (!line_data.product) continue;

      const existingProductIds = ShopifyOrders[ShopifyOrderIndex]?.product_ids ?? [];

      //@ts-ignore
      ShopifyOrders[ShopifyOrderIndex] = {
        ...ShopifyOrders[ShopifyOrderIndex],
        product_ids: [...existingProductIds, ...[line_data.product.id]],
      };
    }
  }

  return ShopifyOrders;
};

//{ orders(first: 250) { edges { node { id totalPriceSet { shopMoney { amount } } lineItems(first: 250) { nodes { id product { id } } } createdAt } } } }

//This method can read a maximum of 250 orders at once
export const readShopifyOrders = async (access_token: string, shop: string, since_date?: Date) => {
  try {
    const apiQuery = `query { orders(first: 250) { edges { node { id totalPriceSet { shopMoney { amount } } lineItems(first: 250) { nodes { id product { id } } } createdAt } } } }`;
    const response = await queryShopifyApi<ShopifyReadOrdersResponse>(access_token, shop, apiQuery);
    if (!response) throw new Error("Failed to query Shopify API");

    const orders = response.data.orders.edges.map((o) => ({
      id: o.node.id,
      product_ids: o.node.lineItems.nodes.map((n) => n.product.id),
      total_amount: o.node.totalPriceSet.shopMoney.amount,
      created_at: o.node.createdAt,
    })) as FormattedShopifyApiOrder[];

    return orders;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface ShopifySubscribeWebhookResponse {
  webhookSubscriptionCreate: {
    userErrors: any[];
    webhookSubscription: ShopifyApiWebhookSubscription;
  };
}

export interface ShopifyApiWebhookSubscription {
  id: string;
}

export const createShopifyWebhookSubscription = async (
  access_token: string,
  shop: string,
  topic: string,
  callbackUrl: string
) => {
  try {
    const apiQuery = `mutation {
  webhookSubscriptionCreate(
    topic: ${topic}
    webhookSubscription: {
      format: JSON,
      callbackUrl: "${callbackUrl}"}
  ) {
    userErrors {
      field
      message
    }
    webhookSubscription {
      id
    }
  }
}`;
    const response = await queryShopifyApi<ShopifySubscribeWebhookResponse>(
      access_token,
      shop,
      apiQuery
    );
    if (!response) throw new Error(`Failed to query Shopify API: ${JSON.stringify(response)}`);

    const webhookSubscriptionId = response.data.webhookSubscriptionCreate.webhookSubscription.id;

    return webhookSubscriptionId;
  } catch (e) {
    console.log(e);
    return false;
  }
};

interface ShopifyReadProductResponse {
  product: null | ShopifyApiProduct;
}

export const readShopifyProduct = async (
  access_token: string,
  shop: string,
  product_id: number
) => {
  try {
    const apiQuery = `query { product(id: \"gid://shopify/Product/${product_id}\")  { id title handle } }`;
    const response = await queryShopifyApi<ShopifyReadProductResponse>(
      access_token,
      shop,
      apiQuery
    );
    if (!response) throw new Error("Failed to query Shopify API");

    return response.data.product;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const verifyShopifyWebhook = (request: NextRequest) => {
  const shopifyHmac = request.headers.get("x-shopify-hmac-sha256");
  if (!shopifyHmac) return false;

  const messageContent = JSON.stringify(request.body);

  return validateShopifyMessage(shopifyHmac, messageContent);
};

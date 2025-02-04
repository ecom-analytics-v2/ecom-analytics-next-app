import { env } from "@/env";
import { db } from "@/lib/db/drizzle";
import { shopifyAccounts, shopifyProducts, shopifyWebhookSubscriptions } from "@/lib/db/schema";
import { shopifyOrderProducts } from "@/lib/db/schema/shopify/shopifyOrderProducts";
import { shopifyOrders } from "@/lib/db/schema/shopify/shopifyOrders";
import { and, eq } from "drizzle-orm";
import {
  createShopifyWebhookSubscription,
  FormattedShopifyApiOrder,
  initReadAllShopifyOrders,
  readShopifyProducts,
  ShopifyApiProduct,
} from "../shopify";

export const syncShopify = async (shopify_account_id: number) => {
  const shopifyAccount = await db.query.shopifyAccounts.findFirst({
    where: eq(shopifyAccounts.id, shopify_account_id),
  });
  if (!shopifyAccount) throw new Error(`[${shopify_account_id}] Shopify account not found in db`);

  const shopifyProducts = await readShopifyProducts(
    shopifyAccount.accessToken,
    shopifyAccount.shop
  );
  if (!shopifyProducts)
    throw new Error(`[${shopify_account_id}] Failed to read products from Shopify API`);

  const syncedProducts = await writeShopifyProducts(shopify_account_id, shopifyProducts);
  if (env.NODE_ENV === "development")
    console.log(`[${shopify_account_id}] Synced ${syncedProducts} unique Shopify products`);

  await ensureShopifyWebhooks(shopifyAccount.accessToken, shopifyAccount.shop, shopifyAccount.id);

  const readAllOrdersBulk = await initReadAllShopifyOrders(
    shopifyAccount.accessToken,
    shopifyAccount.shop,
    shopifyAccount.id
  );
};

const writeShopifyProducts = async (
  shopify_account_id: number,
  shopify_products: ShopifyApiProduct[]
) => {
  const existingShopifyProducts = await db.query.shopifyProducts.findMany({
    where: eq(shopifyProducts.shopifyAccountId, shopify_account_id),
  });

  const uniqueShopifyProducts = shopify_products.filter(
    (p) => existingShopifyProducts.findIndex((sp) => sp.shopifyGid === p.id) == -1
  );
  if (!(uniqueShopifyProducts.length > 0)) return 0;

  await db.insert(shopifyProducts).values(
    uniqueShopifyProducts.map((product) => ({
      shopifyGid: product.id,
      shopifyTitle: product.title,
      shopifyHandle: product.handle,
      shopifyAccountId: shopify_account_id,
    }))
  );

  return uniqueShopifyProducts.length;
};

export const writeShopifyOrders = async (
  shopify_account_id: number,
  shopify_orders: FormattedShopifyApiOrder[]
) => {
  for (let i = 0; i < shopify_orders.length; i++) {
    const order = shopify_orders[i]!;

    const shopifyOrderExists = await db.query.shopifyOrders.findFirst({
      where: and(
        eq(shopifyOrders.shopifyGid, order.id),
        eq(shopifyOrders.shopifyAccountId, shopify_account_id)
      ),
    });
    if (shopifyOrderExists) continue;

    const shopifyOrder = await db
      .insert(shopifyOrders)
      .values({
        shopifyGid: order.id,
        totalAmount: order.total_amount,
        shopifyAccountId: shopify_account_id,
        createdAt: new Date(order.created_at),
      })
      .returning();

    const shopifyOrderId = shopifyOrder.at(0)!.id;

    for (let z = 0; z < order.product_ids.length; z++) {
      let order_product = order.product_ids[z]!;

      const product = await db.query.shopifyProducts.findFirst({
        where: eq(shopifyProducts.shopifyGid, order_product),
      });
      if (!product) continue;

      await db.insert(shopifyOrderProducts).values({
        shopifyOrderId: shopifyOrderId,
        shopifyProductId: product.id,
        shopifyAccountId: shopify_account_id,
      });
    }
  }

  // await db.insert(shopifyOrders).values(
  //   shopify_orders.map((o) => ({
  //     shopifyGid: o.id,
  //     totalAmount: o.total_amount,
  //     shopifyAccountId: shopify_account_id,
  //     createdAt: new Date(o.created_at),
  //   }))
  // );
};

export const ensureShopifyWebhooks = async (
  access_token: string,
  shop: string,
  shopify_account_id: number
) => {
  const whkSubscriptionExists = await db.query.shopifyWebhookSubscriptions.findFirst({
    where: and(
      eq(shopifyWebhookSubscriptions.shopifyTopic, "ORDERS_CREATE"),
      eq(shopifyWebhookSubscriptions.shopifyAccountId, shopify_account_id)
    ),
  });
  if (!whkSubscriptionExists) {
    const whkSubscriptionId = await createShopifyWebhookSubscription(
      access_token,
      shop,
      "ORDERS_CREATE",
      `${env.NODE_ENV === "development" ? env.DEV_WEBHOOK_BASE_URL : env.BASE_URL}/api/webhooks/shopify/new-order`
    );
    if (!whkSubscriptionId) throw new Error("Failed to create Shopify Webhook Subscription");

    await db.insert(shopifyWebhookSubscriptions).values({
      shopifyGid: whkSubscriptionId,
      shopifyTopic: "ORDERS_CREATE",
      shopifyAccountId: shopify_account_id,
    });
  }
};

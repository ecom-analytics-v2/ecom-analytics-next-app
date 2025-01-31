import { db } from "@/lib/db/drizzle";
import {
  shopifyAccounts,
  shopifyOrderProducts,
  shopifyOrders,
  shopifyProducts,
} from "@/lib/db/schema";
import { readShopifyProduct } from "@/lib/integrations/shopify";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ShopifyWebhookBody {
  admin_graphql_api_id: string;
  error_code: null | string;
  status: string;

  //Order data we need
  id: string;
  confirmed: boolean;

  total_price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };

  line_items: {
    id: string;
    admin_graphql_api_id: string;
    product_exists: boolean;
    product_id: null | number;
    quantity: number;
    variant_id: string;
  }[];

  order_status_url: string;
}

export const POST = async (request: NextRequest) => {
  // const validShopifyMessage = verifyShopifyWebhook(request);
  // if (!validShopifyMessage) return NextResponse.json({ success: false }, { status: 403 });

  const bodyContent = (await request.json()) as ShopifyWebhookBody;
  if (!bodyContent.confirmed)
    return NextResponse.json({ success: false, message: "Unconfirmed order" }, { status: 201 });

  const shop = request.headers.get("x-shopify-shop-domain");
  if (!shop) return NextResponse.json({ success: false }, { status: 401 });

  const shopifyAccount = await db.query.shopifyAccounts.findFirst({
    where: eq(shopifyAccounts.shop, shop),
  });
  if (!shopifyAccount) return NextResponse.json({ success: false }, { status: 500 });

  const insertedOrders = await db
    .insert(shopifyOrders)
    .values({
      shopifyGid: bodyContent.admin_graphql_api_id,
      totalAmount: bodyContent.total_price_set.shop_money.amount,
      shopifyAccountId: shopifyAccount.id,
    })
    .returning();
  const insertedOrder = insertedOrders.at(0);
  if (!insertedOrder) return NextResponse.json({ success: false }, { status: 501 });

  for (let i = 0; i < bodyContent.line_items.length; i++) {
    let line_item = bodyContent.line_items[i]!;

    if (!line_item.product_exists || !line_item.product_id) continue;

    let product = await db.query.shopifyProducts.findFirst({
      where: eq(shopifyProducts.shopifyGid, `gid://shopify/Product/${line_item.product_id}`),
    });
    if (!product) {
      const shopifyProduct = await readShopifyProduct(
        shopifyAccount.accessToken,
        shopifyAccount.shop,
        line_item.product_id
      );
      if (!shopifyProduct) continue;

      const insertedProducts = await db
        .insert(shopifyProducts)
        .values({
          shopifyGid: `gid://shopify/Product/${line_item.product_id}`,
          shopifyTitle: shopifyProduct.title,
          shopifyHandle: shopifyProduct.handle,
          shopifyAccountId: shopifyAccount.id,
        })
        .returning();

      product = insertedProducts.at(0);
    }
    if (product === undefined) continue;

    await db.insert(shopifyOrderProducts).values({
      shopifyOrderId: insertedOrder.id,
      shopifyProductId: product.id,
      shopifyAccountId: shopifyAccount.id,
    });
  }

  return NextResponse.json({ success: true }, { status: 200 });
};

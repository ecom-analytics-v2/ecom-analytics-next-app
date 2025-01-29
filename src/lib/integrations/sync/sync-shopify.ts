import { env } from "@/env";
import { db } from "@/lib/db/drizzle";
import { shopifyAccounts, shopifyProducts } from "@/lib/db/schema";
import { shopifyOrders } from "@/lib/db/schema/shopify/shopifyOrders";
import { eq } from "drizzle-orm";
import { FormattedShopifyApiOrder, readShopifyProducts, ShopifyApiProduct } from "../shopify";

export const syncShopify = async (shopify_account_id: number) => {
  const shopifyAccount = await db.query.shopifyAccounts.findFirst({
    where: eq(shopifyAccounts.id, shopify_account_id),
  });
  if (!shopifyAccount) throw new Error(`[${shopify_account_id}] Shopify account not found in db`);

  const isFirstSync = !shopifyAccount.lastSynced;
  const lastSyncTime = shopifyAccount.lastSynced;
  console.log(isFirstSync, lastSyncTime);

  const shopifyProducts = await readShopifyProducts(
    shopifyAccount.accessToken,
    shopifyAccount.shop
  );
  if (!shopifyProducts)
    throw new Error(`[${shopify_account_id}] Failed to read products from Shopify API`);

  const syncedProducts = await writeShopifyProducts(shopify_account_id, shopifyProducts);
  if (env.NODE_ENV === "development")
    console.log(`[${shopify_account_id}] Synced ${syncedProducts} unique Shopify products`);
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
  await db.insert(shopifyOrders).values(
    shopify_orders.map((o) => ({
      shopifyGid: o.id,
      totalAmount: o.total_amount,
      shopifyAccountId: shopify_account_id,
      createdAt: new Date(o.created_at),
    }))
  );
};

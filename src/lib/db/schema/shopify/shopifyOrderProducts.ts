import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";
import { shopifyOrders } from "./shopifyOrders";
import { shopifyProducts } from "./shopifyProducts";

export const shopifyOrderProducts = pgTable(
  "shopify_order_products",
  {
    id: serial("id").primaryKey(),
    shopifyOrderId: text("shopify_order_id")
      .notNull()
      .references(() => shopifyOrders.id),
    shopifyProductId: serial("shopify_product_id")
      .notNull()
      .references(() => shopifyProducts.id),
    shopifyAccountId: serial("shopify_account_id")
      .notNull()
      .references(() => shopifyAccounts.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopifyOrderIdIndex: index("sop_oid_idx").on(table.shopifyOrderId),
    shopifyProductIdIndex: index("sop_pid_idx").on(table.shopifyProductId),
    shopifyAccountIdIndex: index("sop_aid_idx").on(table.shopifyAccountId),
  })
);

export const shopifyOrderProductsRelations = relations(shopifyOrderProducts, ({ one }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyOrderProducts.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
  shopifyOrder: one(shopifyOrders, {
    fields: [shopifyOrderProducts.shopifyOrderId],
    references: [shopifyOrders.id],
  }),
  shopifyProduct: one(shopifyProducts, {
    fields: [shopifyOrderProducts.shopifyProductId],
    references: [shopifyProducts.id],
  }),
}));

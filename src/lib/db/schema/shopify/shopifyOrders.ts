import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { decimal, index, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";
import { shopifyOrderProducts } from "./shopifyOrderProducts";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
]);

export const shopifyOrders = pgTable(
  "shopify_orders",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    shopifyGid: text("shopify_gid").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    shopifyAccountId: serial("shopify_account_id")
      .notNull()
      .references(() => shopifyAccounts.id),
    shopifyCreatedAt: timestamp("shopify_created_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopifyGidIndex: index("so_gid_idx").on(table.shopifyGid),
    shopifyAccountIdIndex: index("so_aid_idx").on(table.shopifyAccountId),
  })
);

export const shopifyOrdersRelations = relations(shopifyOrders, ({ one, many }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyOrders.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
  shopifyOrderProducts: many(shopifyOrderProducts),
}));

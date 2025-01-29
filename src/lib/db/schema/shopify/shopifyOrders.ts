import { relations } from "drizzle-orm";
import { decimal, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";
import { shopifyOrderProducts } from "./shopifyOrderProducts";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
]);

export const shopifyOrders = pgTable("shopify_orders", {
  id: serial("id").primaryKey(),
  shopifyGid: text("shopify_gid").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shopifyAccountId: serial("shopify_account_id")
    .notNull()
    .references(() => shopifyAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shopifyOrdersRelations = relations(shopifyOrders, ({ one, many }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyOrders.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
  shopifyOrderProducts: many(shopifyOrderProducts),
}));

import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";
import { shopifyOrders } from "./shopifyOrders";

export const shopifyCustomers = pgTable(
  "shopify_customers",
  {
    id: serial("id").primaryKey(),
    shopifyGid: text("shopify_gid").notNull(),
    displayName: text("display_name").notNull(),
    shopifyAccountId: serial("shopify_account_id")
      .notNull()
      .references(() => shopifyAccounts.id),
    shopifyCreatedAt: timestamp("shopify_created_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopifyGidIndex: index("sc_gid_idx").on(table.shopifyGid),
    shopifyAccountIdIndex: index("sc_aid_idx").on(table.shopifyAccountId),
  })
);

export const shopifyCustomersRelations = relations(shopifyCustomers, ({ one, many }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyCustomers.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
  orders: many(shopifyOrders),
}));

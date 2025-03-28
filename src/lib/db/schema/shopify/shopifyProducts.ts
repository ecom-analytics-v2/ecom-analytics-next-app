import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";
import { shopifyOrderProducts } from "./shopifyOrderProducts";

export const shopifyProducts = pgTable(
  "shopify_products",
  {
    id: serial("id").primaryKey(),
    shopifyGid: text("shopify_gid").notNull(),
    title: text("title").notNull(),
    handle: text("handle").notNull(),
    shopifyAccountId: serial("shopify_account_id")
      .notNull()
      .references(() => shopifyAccounts.id),
    shopifyCreatedAt: timestamp("shopify_created_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopifyGidIndex: index("sp_gid_idx").on(table.shopifyGid),
    shopifyAccountIdIndex: index("sa_aid_idx").on(table.shopifyAccountId),
  })
);

export const shopifyProductsRelations = relations(shopifyProducts, ({ one, many }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyProducts.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
  shopifyOrderProducts: many(shopifyOrderProducts),
}));

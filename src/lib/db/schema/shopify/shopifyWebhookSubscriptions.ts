import { relations } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";

export const shopifyWebhookSubscriptions = pgTable(
  "shopify_webhook_subscriptions",
  {
    id: serial("id").primaryKey(),
    shopifyGid: text("shopify_gid").notNull(),
    shopifyTopic: text("shopify_topic").notNull(),
    shopifyAccountId: serial("shopify_account_id")
      .notNull()
      .references(() => shopifyAccounts.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopifyGidIndex: index("sws_gid_idx").on(table.shopifyGid),
    shopifyAccountIdIndex: index("sws_aid_idx").on(table.shopifyAccountId),
  })
);

export const shopifyWebhookSubscriptionsRelations = relations(
  shopifyWebhookSubscriptions,
  ({ one }) => ({
    shopifyAccount: one(shopifyAccounts, {
      fields: [shopifyWebhookSubscriptions.shopifyAccountId],
      references: [shopifyAccounts.id],
    }),
  })
);

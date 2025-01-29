import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "../teams";
import { users } from "../users";
import { shopifyOrders } from "./shopifyOrders";
import { shopifyProducts } from "./shopifyProducts";
import { shopifyWebhookSubscriptions } from "./shopifyWebhookSubscriptions";

export const shopifyAccounts = pgTable("shopify_accounts", {
  id: serial("id").primaryKey(),
  shop: text("shop").notNull(),
  accessToken: text("access_token").notNull(),
  valid: boolean("valid").notNull().default(true),
  teamId: serial("team_id")
    .notNull()
    .references(() => users.id),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shopifyAccountsRelations = relations(shopifyAccounts, ({ one, many }) => ({
  team: one(teams, {
    fields: [shopifyAccounts.teamId],
    references: [teams.id],
  }),
  products: many(shopifyProducts),
  orders: many(shopifyOrders),
  webhookSubscriptions: many(shopifyWebhookSubscriptions),
}));

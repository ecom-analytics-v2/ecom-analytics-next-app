import { relations } from "drizzle-orm";
import { boolean, index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "../teams";
import { users } from "../users";
import { shopifyBulkOperations } from "./shopifyBulkOperations";
import { shopifyOrders } from "./shopifyOrders";
import { shopifyProducts } from "./shopifyProducts";
import { shopifyWebhookSubscriptions } from "./shopifyWebhookSubscriptions";

export const shopifyAccounts = pgTable(
  "shopify_accounts",
  {
    id: serial("id").primaryKey(),
    shop: text("shop").notNull(),
    accessToken: text("access_token").notNull(),
    valid: boolean("valid").notNull().default(true),
    teamId: serial("team_id")
      .notNull()
      .references(() => users.id),
    lastSynced: timestamp("last_synced"),

    installState: text("install_state").notNull(),

    //custom client
    isCustomClient: boolean("is_custom_client").default(false),
    customClientId: text("custom_client_id"),
    customClientSecret: text("custom_client_secret"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shopIndex: index("sa_sp_idx").on(table.shop),
    teamIdIndex: index("sa_tid_idx").on(table.teamId),

    customClientIdIndex: index("sa_ccid_idx").on(table.customClientId),
  })
);

export const shopifyAccountsRelations = relations(shopifyAccounts, ({ one, many }) => ({
  team: one(teams, {
    fields: [shopifyAccounts.teamId],
    references: [teams.id],
  }),
  products: many(shopifyProducts),
  orders: many(shopifyOrders),
  webhookSubscriptions: many(shopifyWebhookSubscriptions),
  bulkOperations: many(shopifyBulkOperations),
}));

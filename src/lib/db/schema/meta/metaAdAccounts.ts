import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { metaAccounts } from "./metaAccounts";
import { metaCampaigns } from "./metaCampaigns";
export const metaAdAccounts = pgTable("meta_ad_accounts", {
  id: serial("id").primaryKey(),
  metaApiAdAccountId: text("meta_api_ad_account_id").notNull(),
  metaAccountId: serial("meta_account_id")
    .notNull()
    .references(() => metaAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaAdAccountsRelations = relations(metaAdAccounts, ({ one, many }) => ({
  metaAccount: one(metaAccounts, {
    fields: [metaAdAccounts.metaAccountId],
    references: [metaAccounts.id],
  }),
  metaCampaigns: many(metaCampaigns),
}));

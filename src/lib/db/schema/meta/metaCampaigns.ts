import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { metaAdAccounts } from "./metaAdAccounts";

export const metaCampaigns = pgTable("meta_campaigns", {
  id: serial("id").primaryKey(),
  metaApiCampaignId: text("meta_api_campaign_id").notNull(),
  name: text("campaign_name").notNull(),
  objective: text("campaign_objective").notNull(),
  status: text("campaign_status").notNull(),
  metaAdAccountId: serial("meta_ad_account_id")
    .notNull()
    .references(() => metaAdAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaCampaignsRelations = relations(metaCampaigns, ({ one }) => ({
  metaAdAccount: one(metaAdAccounts, {
    fields: [metaCampaigns.metaAdAccountId],
    references: [metaAdAccounts.id],
  }),
}));

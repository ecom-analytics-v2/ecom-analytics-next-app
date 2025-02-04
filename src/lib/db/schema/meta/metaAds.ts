import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { metaCampaigns } from "./metaCampaigns";

export const metaAds = pgTable("meta_ads", {
  id: serial("id").primaryKey(),
  metaApiAdId: text("meta_api_ad_id").notNull(),
  name: text("ad_name").notNull(),
  metaCampaignId: serial("meta_campaign")
    .notNull()
    .references(() => metaCampaigns.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaAdsRelations = relations(metaAds, ({ one }) => ({
  metaCampaign: one(metaCampaigns, {
    fields: [metaAds.metaCampaignId],
    references: [metaCampaigns.id],
  }),
}));

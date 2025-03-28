import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAdsCampaigns } from "./googleAdsCampaigns";
import { googleAdsPerformanceData } from "./googleAdsPerformanceData";

export const googleAds = pgTable("google_ads_ads", {
  id: serial("id").primaryKey(),
  googleApiAdId: text("google_api_ad_id").notNull(),
  adName: text("ad_name").notNull(),
  adType: text("ad_type").notNull(),
  adGroupStatus: text("ad_group_status"),
  googleApiAdGroupId: text("google_api_ad_group_id"),
  googleAdsCampaignId: serial("google_ads_campaign_id")
    .notNull()
    .references(() => googleAdsCampaigns.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAdsRelations = relations(googleAds, ({ one, many }) => ({
  googleAdsCampaign: one(googleAdsCampaigns, {
    fields: [googleAds.googleAdsCampaignId],
    references: [googleAdsCampaigns.id],
  }),
  googleAdsPerformanceData: many(googleAdsPerformanceData),
}));

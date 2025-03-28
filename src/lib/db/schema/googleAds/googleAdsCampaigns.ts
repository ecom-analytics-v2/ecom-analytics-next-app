import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAds } from "./googleAds";
import { googleAdsAccounts } from "./googleAdsAccounts";

export const googleAdsCampaigns = pgTable("google_ads_campaigns", {
  id: serial("id").primaryKey(),
  googleApiAdCampaignId: text("google_api_ad_campaign_id").notNull(),
  campaignName: text("campaign_name").notNull(),
  campaignStatus: text("campaign_status").notNull(),
  advertisingChannelType: text("advertising_channel_type"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  googleAdsAccountId: serial("google_ads_account_id")
    .notNull()
    .references(() => googleAdsAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAdCampaignsRelations = relations(googleAdsCampaigns, ({ one, many }) => ({
  googleAdsAccount: one(googleAdsAccounts, {
    fields: [googleAdsCampaigns.googleAdsAccountId],
    references: [googleAdsAccounts.id],
  }),
  googleAds: many(googleAds),
}));

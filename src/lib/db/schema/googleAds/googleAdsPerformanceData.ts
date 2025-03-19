import { relations } from "drizzle-orm";
import { numeric, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { googleAds } from "./googleAds";

export const googleAdsPerformanceData = pgTable("google_ads_performance_data", {
  id: serial("id").primaryKey(),

  impressions: numeric("impressions"),
  clicks: numeric("clicks"),
  costMicros: numeric("cost_micros"),

  timestamp: timestamp("timestamp").notNull(),

  googleAdsAdId: serial("google_ads_ad_id")
    .notNull()
    .references(() => googleAds.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAdsPerformanceDataRelations = relations(googleAdsPerformanceData, ({ one }) => ({
  googleAdsAd: one(googleAds, {
    fields: [googleAdsPerformanceData.googleAdsAdId],
    references: [googleAds.id],
  }),
}));

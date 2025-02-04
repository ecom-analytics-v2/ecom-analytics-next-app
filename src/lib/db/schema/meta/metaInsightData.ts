import { relations } from "drizzle-orm";
import { json, numeric, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { metaAds } from "./metaAds";

export const metaInsightData = pgTable("meta_insight_data", {
  id: serial("id").primaryKey(),

  impressions: numeric("impressions").notNull(),
  spend: numeric("spend").notNull(),

  actions: json("actions").notNull(),
  cost_per_action_type: json("cost_per_action_type").notNull(),

  date_start: timestamp("date_start").notNull(),
  date_stop: timestamp("date_stop").notNull(),

  metaAdId: serial("meta_ad_id")
    .notNull()
    .references(() => metaAds.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaInsightDataRelations = relations(metaInsightData, ({ one }) => ({
  metaCampaign: one(metaAds, {
    fields: [metaInsightData.metaAdId],
    references: [metaAds.id],
  }),
}));

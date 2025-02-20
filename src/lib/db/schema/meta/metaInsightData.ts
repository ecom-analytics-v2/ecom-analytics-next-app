import { relations } from "drizzle-orm";
import { json, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { metaAds } from "./metaAds";

export const metaInsightData = pgTable("meta_insight_data", {
  id: serial("id").primaryKey(),

  spend: numeric("spend").notNull(),
  socialSpend: numeric("social_spend"),

  impressions: numeric("impressions"),
  reach: numeric("reach"),
  clicks: numeric("clicks"),

  actions: json("actions"),
  cost_per_action_type: json("cost_per_action_type"),
  cost_per_ad_click: json("cost_per_ad_click"),
  cost_per_conversion: json("cost_per_conversion"),
  cost_per_one_thousand_ad_impression: json("cost_per_one_thousand_ad_impression"),
  cost_per_outbound_click: json("cost_per_outbound_click"),
  cost_per_unique_outbound_click: json("cost_per_unique_outbound_click"),
  cost_per_thruplay: json("cost_per_thruplay"),
  cost_per_unique_action_type: json("cost_per_unique_action_type"),
  cost_per_unique_conversion: json("cost_per_unique_conversion"),

  cost_per_dda_countby_convs: numeric("cost_per_dda_countby_convs"),
  cost_per_inline_link_click: numeric("cost_per_inline_link_click"),
  cost_per_inline_post_engagement: numeric("cost_per_inline_post_engagement"),
  cost_per_unique_click: numeric("cost_per_unique_click"),
  cost_per_unique_inline_link_click: numeric("cost_per_unique_inline_link_click"),

  cpc: numeric("cpc"),
  cpm: numeric("cpm"),
  cpp: numeric("cpp"),
  ctr: numeric("ctr"),

  frequency: numeric("frequency"),
  full_view_impressions: numeric("full_view_impressions"),
  full_view_reach: numeric("full_view_reach"),

  objective: text("objective"),
  optimization_goal: text("optimization_goal"),
  buying_type: text("buying_type"),
  account_currency: text("account_currency"),

  date_start: timestamp("date_start").notNull(),
  date_start_key: text("date_start_key").notNull(),
  date_stop: timestamp("date_stop").notNull(),
  date_stop_key: text("date_stop_key").notNull(),

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

import { relations } from "drizzle-orm";
import { numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAnalyticsProperties } from "./googleAnalyticsProperties";

export const googleAnalyticsEventData = pgTable("google_analytics_event_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  eventName: text("event_name").notNull(),
  eventCount: numeric("event_count").notNull(),
  googleAnalyticsPropertyId: serial("google_analytics_property_id")
    .notNull()
    .references(() => googleAnalyticsProperties.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAnalyticsEventDataRelations = relations(googleAnalyticsEventData, ({ one }) => ({
  property: one(googleAnalyticsProperties, {
    fields: [googleAnalyticsEventData.googleAnalyticsPropertyId],
    references: [googleAnalyticsProperties.id],
  }),
}));

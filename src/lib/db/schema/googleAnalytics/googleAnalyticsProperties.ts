import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAccounts } from "../google/googleAccounts";
import { googleAnalyticsAccounts } from "./googleAnalyticsAccounts";

export const googleAnalyticsProperties = pgTable("google_analytics_properties", {
  id: serial("id").primaryKey(),
  propertyId: text("google_analytics_property_id").notNull(),
  googleAnalyticsAccountId: serial("google_analytics_account_id")
    .notNull()
    .references(() => googleAnalyticsAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAnalyticsPropertiesRelations = relations(
  googleAnalyticsProperties,
  ({ one }) => ({
    googleAccount: one(googleAccounts, {
      fields: [googleAnalyticsProperties.googleAnalyticsAccountId],
      references: [googleAccounts.id],
    }),
  })
);

import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAccounts } from "../google/googleAccounts";

export const googleAnalyticsAccounts = pgTable("google_analytics_accounts", {
  id: serial("id").primaryKey(),
  googleAnalyticsAccountId: text("google_analytics_account_id").notNull(),
  googleAccountId: serial("google_account_id")
    .notNull()
    .references(() => googleAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAnalyticsAccountsRelations = relations(googleAnalyticsAccounts, ({ one }) => ({
  googleAccount: one(googleAccounts, {
    fields: [googleAnalyticsAccounts.googleAccountId],
    references: [googleAccounts.id],
  }),
}));

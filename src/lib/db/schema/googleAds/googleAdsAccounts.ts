import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAccounts } from "../google/googleAccounts";
import { googleAdsCampaigns } from "./googleAdsCampaigns";

export const googleAdsAccounts = pgTable("google_ads_accounts", {
  id: serial("id").primaryKey(),
  googlepiAdAccountId: text("google_api_ad_account_id").notNull(),
  googleAccountId: serial("google_account_id")
    .notNull()
    .references(() => googleAccounts.id),
  valid: boolean("valid").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAdAccountsRelations = relations(googleAdsAccounts, ({ one, many }) => ({
  googleAccount: one(googleAccounts, {
    fields: [googleAdsAccounts.googleAccountId],
    references: [googleAccounts.id],
  }),
  googleAdsCampaigns: many(googleAdsCampaigns),
}));

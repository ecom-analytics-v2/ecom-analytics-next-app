import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { googleAdsAccounts } from "../googleAds/googleAdsAccounts";
import { teams } from "../teams";
import { users } from "../users";

export const googleAccounts = pgTable("google_accounts", {
  id: serial("id").primaryKey(),
  accountId: text("account_id").notNull(),
  accountName: text("account_name").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  valid: boolean("valid").notNull().default(true),
  teamId: serial("team_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleAccountsRelations = relations(googleAccounts, ({ one, many }) => ({
  team: one(teams, {
    fields: [googleAccounts.teamId],
    references: [teams.id],
  }),
  googleAdsAccounts: many(googleAdsAccounts),
}));

import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "../teams";
import { users } from "../users";

export const metaAccounts = pgTable("meta_accounts", {
  id: serial("id").primaryKey(),
  accountId: text("account_id").notNull(),
  accountName: text("account_name").notNull(),
  accessToken: text("access_token").notNull(),
  valid: boolean("valid").notNull().default(true),
  teamId: serial("team_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaAccountsRelations = relations(metaAccounts, ({ one }) => ({
  team: one(teams, {
    fields: [metaAccounts.teamId],
    references: [teams.id],
  }),
}));

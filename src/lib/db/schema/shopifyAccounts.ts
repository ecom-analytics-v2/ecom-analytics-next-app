import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { users } from "./users";

export const shopifyAccounts = pgTable("shopify_accounts", {
  id: serial("id").primaryKey(),
  shop: text("shop").notNull(),
  accessToken: text("access_token").notNull(),
  valid: boolean("valid").notNull().default(true),
  teamId: serial("team_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shopifyAccountsRelations = relations(shopifyAccounts, ({ one }) => ({
  team: one(teams, {
    fields: [shopifyAccounts.teamId],
    references: [teams.id],
  }),
}));

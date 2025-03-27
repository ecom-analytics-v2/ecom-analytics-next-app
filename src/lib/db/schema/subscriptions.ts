import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { teams } from "./teams";

export const subscriptionStatusEnum = pgEnum("sub_statuses", ["inactive", "active", "paused"]);

export const subscriptions = pgTable("stripe_subscriptions", {
  id: serial("id").primaryKey(),
  status: subscriptionStatusEnum("status").default("inactive").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  teamId: serial("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  team: one(teams, {
    fields: [subscriptions.teamId],
    references: [teams.id],
  }),
}));

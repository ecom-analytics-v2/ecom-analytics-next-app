import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { activityLogs } from "./activityLogs";
import { expenses } from "./expenses";
import { invitations } from "./invitations";
import { metaAccounts } from "./metaAccounts";
import { teamMembers } from "./teamMembers";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }).default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
  monthlyRevenue: integer("monthly_revenue"),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  expenses: many(expenses),
  metaAccount: one(metaAccounts),
}));

// Create Zod schemas for insert and select operations
export const insertTeamSchema = createInsertSchema(teams, {
  name: (schema) => schema.name.min(1).max(100),
  planName: z.enum(["free", "pro", "enterprise"]).optional(),
  subscriptionStatus: z.enum(["active", "inactive", "cancelled"]).optional(),
  monthlyRevenue: z.number().int().nonnegative().optional(),
});

export const selectTeamSchema = createSelectSchema(teams);

export type Team = z.infer<typeof selectTeamSchema>;
export type NewTeam = z.infer<typeof insertTeamSchema>;

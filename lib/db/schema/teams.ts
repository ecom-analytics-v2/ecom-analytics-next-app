import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teamMembers } from "./teamMembers";
import { activityLogs } from "./activityLogs";
import { invitations } from "./invitations";
import { expenses } from "./expenses";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  expenses: many(expenses),
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

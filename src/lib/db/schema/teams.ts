import { relations, sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { activityLogs } from "./activityLogs";
import { expenses } from "./expenses";
import { invitations } from "./invitations";
import { metaAccounts } from "./meta/metaAccounts";
import { shopifyAccounts } from "./shopify/shopifyAccounts";
import { subscriptions } from "./subscriptions";
import { teamMembers } from "./teamMembers";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  dateFilterStart: timestamp("date_filter_start").default(sql`NOW() - INTERVAL '30 days'`),
  dateFilterEnd: timestamp("date_filter_end").default(sql`NOW()`),
  planName: varchar("plan_name", { length: 50 }).default("free"),

  stripeCustomerId: text("stripe_customer_id"),

  monthlyRevenue: integer("monthly_revenue"),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  subscription: one(subscriptions),
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  expenses: many(expenses),
  metaAccount: one(metaAccounts),
  shopifyAccount: one(shopifyAccounts),
}));

// Create Zod schemas for insert and select operations
export const insertTeamSchema = createInsertSchema(teams, {
  name: (schema) => schema.name.min(1).max(100),
  planName: z.enum(["free", "pro", "enterprise"]).optional(),
  monthlyRevenue: z.number().int().nonnegative().optional(),
});

export const selectTeamSchema = createSelectSchema(teams);

export type Team = z.infer<typeof selectTeamSchema>;
export type NewTeam = z.infer<typeof insertTeamSchema>;

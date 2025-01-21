import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { invitations } from "./invitations";
import { teamMembers } from "./teamMembers";
import { teams } from "./teams";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  activeTeamId: integer("active_team_id").references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

import {
  pgTable,
  serial,
  integer,
  varchar,
  decimal,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams } from "./teams";
import { users } from "./users";

export const frequencyEnum = pgEnum("frequency", ["monthly", "yearly", "per_order", "one_time"]);

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  notes: text("notes"),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  team: one(teams, {
    fields: [expenses.teamId],
    references: [teams.id],
  }),
}));

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

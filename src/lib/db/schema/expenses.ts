import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams } from "./teams";
import { users } from "./users";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const frequencyEnum = pgEnum("frequency", ["monthly", "yearly", "per_order", "one_time"]);
export const amountTypeEnum = pgEnum("amount_type", ["dollar", "percentage"]);

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  amount_type: amountTypeEnum("amount_type").notNull().default("dollar"),
  category: varchar("category", { length: 50 }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  notes: text("notes"),
  transaction_date: timestamp("transaction_date"),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  team: one(teams, {
    fields: [expenses.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}));

export const insertExpenseSchema = createInsertSchema(expenses, {
  // Amount must be non-negative and support 2 decimal places for currency
  amount: z.number().min(0, "Amount cannot be negative").step(0.01),

  // Name required with reasonable length limits
  name: z.string().min(1, "Name is required").max(255, "Name cannot exceed 255 characters"),

  // Category must be selected from predefined list and non-empty
  category: z
    .string()
    .min(1, "Category must not be empty")
    .max(50, "Category name too long")
    .refine((val) => val.length > 0, {
      message: "You must choose a category to properly categorize this expense",
    }),

  // Frequency determines billing cycle, must be one of predefined values
  frequency: z.enum(["monthly", "yearly", "per_order", "one_time"], {
    description: "Must select a valid expense frequency",
  }),

  // Amount type determines if expense is fixed or percentage based
  amount_type: z
    .enum(["dollar", "percentage"], {
      description: "Must be either a dollar amount or percentage",
    })
    .default("dollar"),

  // Optional notes field for additional expense details
  notes: z.string().nullable().optional(),

  // Transaction date required for one-time expenses, optional otherwise
  transaction_date: z.date().nullable().optional(),

  // Foreign keys for data relationships
  teamId: z.number({
    required_error: "Team ID is required for expense assignment",
  }),
  createdBy: z.number({
    required_error: "User ID is required to track who created the expense",
  }),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = z.infer<typeof insertExpenseSchema>;

"use server";

import { db } from "@/lib/db/drizzle";
import { expenses, NewExpense } from "@/lib/db/schema/expenses";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { getUserWithTeam } from "./user";

export async function addExpense(data: NewExpense, userId: number) {
  // Ensure amount is a valid number
  if (isNaN(data.amount)) {
    console.error("Invalid amount:", data.amount);
    return { error: "Invalid amount" };
  }

  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam || !userWithTeam.teamId) {
    return { error: "User is not part of a team" };
  }

  const newExpense: NewExpense = {
    name: data.name,
    category: data.category,
    amount: data.amount,
    amount_type: data.amount_type,
    frequency: data.frequency,
    notes: data.notes,
    teamId: userWithTeam.teamId,
    createdBy: userWithTeam.user.id,
    transaction_date: data.transaction_date,
  };

  try {
    await db.insert(expenses).values({
      ...newExpense,
      amount: String(newExpense.amount),
    });
  } catch (error) {
    return { error: "Failed to add expense" };
  }
}

export async function getAllTeamExpenses(userId: number) {
  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam || !userWithTeam.teamId) {
    return [];
  }
  return await db.select().from(expenses).where(eq(expenses.teamId, userWithTeam.teamId));
}

export async function getAllTeamExpensesByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam || !userWithTeam.teamId) {
    return [];
  }
  return await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.teamId, userWithTeam.teamId),
        gte(expenses.transaction_date, startDate),
        lte(expenses.transaction_date, endDate)
      )
    );
}

export async function editExpense(expenseId: number, userId: number, data: Partial<NewExpense>) {
  // Verify user and team
  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam || !userWithTeam.teamId) {
    return { error: "User is not part of a team" };
  }

  // Verify expense exists and belongs to user's team
  const existingExpense = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.teamId, userWithTeam.teamId)))
    .limit(1);

  if (!existingExpense.length) {
    return { error: "Expense not found or access denied" };
  }

  // Validate amount if it's being updated
  if (data.amount !== undefined && isNaN(data.amount)) {
    return { error: "Invalid amount" };
  }

  try {
    await db
      .update(expenses)
      .set({
        ...data,
        amount: data.amount ? String(data.amount) : undefined,
      })
      .where(eq(expenses.id, expenseId));
    return { success: true };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { error: "Failed to update expense" };
  }
}

export async function deleteExpense(expenseId: number, userId: number) {
  // Verify user and team
  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam || !userWithTeam.teamId) {
    return { error: "User is not part of a team" };
  }

  try {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.teamId, userWithTeam.teamId)));

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { error: "Failed to delete expense" };
  }
}

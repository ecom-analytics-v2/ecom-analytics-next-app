"use server";

import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { expenses, NewExpense, Expense } from "@/lib/db/schema/expenses";
import { getUserWithTeam } from "./user";

export async function addExpense(data: NewExpense, userId: number) {
  const userWithTeam = await getUserWithTeam(userId);

  if (!userWithTeam.teamId) {
    return { error: "User is not part of a team" };
  }

  console.log(data);

  const newExpense: NewExpense = {
    name: data.name,
    type: data.type,
    amount: data.amount,
    frequency: data.frequency,
    notes: data.notes,
    teamId: userWithTeam.teamId,
    createdBy: userId,
  };

  await db.insert(expenses).values(newExpense);
}

export async function getAllTeamExpenses(userId: number) {
  const userWithTeam = await getUserWithTeam(userId);
  if (!userWithTeam.teamId) {
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
  if (!userWithTeam.teamId) {
    return [];
  }
  return await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.teamId, userWithTeam.teamId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    );
}

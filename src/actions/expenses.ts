"use server";

import { db } from "@/lib/db/drizzle";
import { expenses, NewExpense } from "@/lib/db/schema/expenses";
import { and, eq, gte, lte } from "drizzle-orm";
import { getUserWithTeam } from "./user";

export async function addExpense(data: NewExpense, userId: number) {
  const userWithTeam = await getUserWithTeam(userId);

  if (!userWithTeam || !userWithTeam.teamId) {
    return { error: "User is not part of a team" };
  }

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
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    );
}

"use server";

import { getUser, getUserWithTeam } from "@/actions/user";
import { db } from "@/lib/db/drizzle";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateDateFilter(startDate: string, endDate: string) {
  const user = await getUser();
  if (!user?.id) {
    throw new Error("Not authenticated");
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error("You must be in a team to update date filters");
  }

  await db
    .update(teams)
    .set({
      dateFilterStart: new Date(startDate),
      dateFilterEnd: new Date(endDate),
    })
    .where(eq(teams.id, userWithTeam.teamId));

  revalidatePath("/dashboard");
  return { success: true };
}

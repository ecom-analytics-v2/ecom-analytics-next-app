"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users, ActivityType, teamMembers } from "@/lib/db/schema";
import { comparePasswords, hashPassword } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserWithTeam } from "@/lib/db/queries";
import { validatedActionWithUser } from "@/lib/auth/middleware";
import { logActivity } from "./activity";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return { error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return {
        error: "New password must be different from the current password.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: "Password updated successfully." };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(deleteAccountSchema, async (data, _, user) => {
  const { password } = data;

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    return { error: "Incorrect password. Account deletion failed." };
  }

  const userWithTeam = await getUserWithTeam(user.id);

  await logActivity(userWithTeam?.teamId, user.id, ActivityType.DELETE_ACCOUNT);

  // Soft delete
  await db
    .update(users)
    .set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
      email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
    })
    .where(eq(users.id, user.id));

  if (userWithTeam?.teamId) {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, userWithTeam.teamId)));
  }

  (await cookies()).delete("session");
  redirect("/sign-in");
});

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(updateAccountSchema, async (data, _, user) => {
  const { name, email } = data;
  const userWithTeam = await getUserWithTeam(user.id);

  await Promise.all([
    db.update(users).set({ name, email }).where(eq(users.id, user.id)),
    logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
  ]);

  return { success: "Account updated successfully." };
});

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

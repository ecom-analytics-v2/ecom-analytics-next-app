"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { comparePasswords, hashPassword, verifyToken } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { ActivityType, teamMembers, User, users } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
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

export async function getUser(): Promise<User | null> {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (!sessionData || !sessionData.user || typeof sessionData.user.id !== "number") {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      activeTeamId: users.activeTeamId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0] as User;
}

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

const updateActiveTeamSchema = z.object({
  userId: z.number(),
  teamId: z.number(),
});

export async function updateActiveTeam({ userId, teamId }: { userId: number; teamId: number }) {
  // Check if the user is a member of the team
  const teamMembership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
  });

  if (!teamMembership) {
    return { error: "You are not a member of this team." };
  }

  // Update the user's activeTeamId
  await db.update(users).set({ activeTeamId: teamId }).where(eq(users.id, userId));

  // To do: Log the activity
  // await logActivity(teamId, userId, ActivityType.SWITCH_ACTIVE_TEAM)

  return { success: "Active team updated successfully." };
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import {
  users,
  teams,
  teamMembers,
  invitations,
  ActivityType,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  User,
} from "@/lib/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getUser, getUserWithTeam } from "@/actions/user";
import { validatedAction } from "@/lib/auth/middleware";
import { logActivity } from "./activity";

// Schema for sign-in data validation
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

/**
 * Handles user sign-in process.
 *
 * @param {Object} data - The sign-in form data.
 * @param {FormData} formData - Additional form data for redirection.
 * @returns {Promise<Object>} An object containing an error message if sign-in fails.
 * @throws {Error} Redirects to dashboard on successful sign-in.
 */
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return { error: "Invalid email or password. Please try again." };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password. Please try again." };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    const priceId = formData.get("priceId") as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect("/dashboard");
});

// Schema for sign-up data validation
const signUpSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

/**
 * Handles user sign-up process.
 *
 * @param {Object} data - The sign-up form data.
 * @param {FormData} formData - Additional form data for redirection.
 * @returns {Promise<Object>} An object containing an error message if sign-up fails.
 * @throws {Error} Redirects to dashboard on successful sign-up.
 */
export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { name, email, password, inviteId } = data;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    return { error: "You already have an account. Please sign in." };
  }

  const passwordHash = await hashPassword(password);

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, "pending")
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: "accepted" })
        .where(eq(invitations.id, invitation.id));

      [createdTeam] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);

      if (!createdTeam) {
        return { error: "Failed to find the invited team. Please try again." };
      }
    } else {
      // If the invitation is invalid, create a new team for the user
      [createdTeam] = await createNewTeam(name);
      teamId = createdTeam.id;
      userRole = "owner";
    }
  } else {
    // Create a new team if there's no invitation
    [createdTeam] = await createNewTeam(name);
    teamId = createdTeam.id;
    userRole = "owner";
  }

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
    role: userRole,
    activeTeamId: teamId,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: "Failed to create user. Please try again." };
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM),
    setSession(createdUser),
  ]);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    const priceId = formData.get("priceId") as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect("/dashboard");
});

// Helper function to create a new team
async function createNewTeam(userName: string) {
  const newTeam: NewTeam = {
    name: `${userName}'s Team`,
  };

  const [createdTeam] = await db.insert(teams).values(newTeam).returning();

  if (!createdTeam) {
    throw new Error("Failed to create team. Please try again.");
  }

  return [createdTeam];
}

/**
 * Handles user sign-out process.
 *
 * @throws {Error} Redirects to sign-in page after signing out.
 */
export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete("session");
  redirect("/sign-in");
}

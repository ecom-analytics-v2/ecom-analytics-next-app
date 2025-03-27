import { and, eq } from "drizzle-orm";
import { db } from "./db/drizzle";
import { subscriptions, teamMembers, teams, users } from "./db/schema";

export const getUserWithTeamAndSub = async (userId: number) => {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  const user = result[0];
  if (!user) throw new Error("User not found");

  if (!user.teamId) throw new Error("User not in a team yet");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, user.teamId),
  });
  if (!team) throw new Error("Team not found");

  const teamHasActiveSubscription = await db.query.subscriptions.findFirst({
    where: and(eq(subscriptions.teamId, team.id), eq(subscriptions.status, "active")),
  });

  return { user, team, teamHasActiveSubscription };
};

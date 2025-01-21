import { getUserWithTeam } from "@//actions/user";
import { verifyToken } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { metaAccounts } from "@/lib/db/schema";
import { getMetaAccessToken, getMetaUser } from "@/lib/integrations/meta";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (!sessionData || !sessionData.user || typeof sessionData.user.id !== "number") {
    return null;
  }

  const user = await getUserWithTeam(sessionData.user.id);
  if (!user || !user.teamId) return null;

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ code: 401, message: "Bad Request" }, { status: 401 });

  const tokenData = await getMetaAccessToken(code);
  if (!tokenData)
    return NextResponse.json(
      { code: 403, message: "Invalid Meta Authorization " },
      { status: 403 }
    );

  const metaUser = await getMetaUser(tokenData.access_token);
  if (!metaUser)
    return NextResponse.json(
      { code: 403, message: "Invalid Meta Authorization " },
      { status: 403 }
    );

  const teamHasMetaAccount = await db.query.metaAccounts.findFirst({
    where: eq(metaAccounts.teamId, user.teamId),
  });
  if (teamHasMetaAccount)
    return NextResponse.json({
      code: 401,
      message: "This team already has a Meta ads account linked!",
    });

  const metaAccountExists = await db.query.metaAccounts.findFirst({
    where: eq(metaAccounts.accountId, metaUser.id),
  });
  if (metaAccountExists)
    return NextResponse.json({
      code: 401,
      message: "This Meta ads account is already linked to a team!",
    });

  const expiresMs = tokenData.expires_in * 60;
  const metaAccount = await db
    .insert(metaAccounts)
    .values({
      accountId: metaUser.id,
      accountName: metaUser.name,
      accessToken: tokenData.access_token,
      expiresAt: new Date(new Date().getTime() + expiresMs),
      teamId: user.teamId,
    })
    .returning();

  return redirect("/dashboard/settings");
};

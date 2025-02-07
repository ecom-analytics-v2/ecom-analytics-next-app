import { getUserWithTeam } from "@/actions/user";
import { env } from "@/env";
import { verifyToken } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { googleAccounts } from "@/lib/db/schema";
import { googleOAuth2Client } from "@/lib/integrations/google";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const code = req.nextUrl.searchParams.get("code");
  if (!code)
    return NextResponse.json(
      { code: 401, message: "Bad Request: No `state` query parameter" },
      { status: 401 }
    );

  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ code: 403, message: "Unauthenticated Request" }, { status: 403 });
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (!sessionData || !sessionData.user || typeof sessionData.user.id !== "number") {
    return NextResponse.json({ code: 403, message: "Unauthenticated Request" }, { status: 403 });
  }

  const user = await getUserWithTeam(sessionData.user.id);
  if (!user || !user.teamId)
    return NextResponse.json({ code: 403, message: "Unauthenticated Request" }, { status: 403 });

  try {
    const { tokens } = await googleOAuth2Client.getToken(code);

    if (!tokens.id_token || !tokens.refresh_token || !tokens.access_token || !tokens.expiry_date)
      return NextResponse.json({ code: 500, message: "Missing Required Tokens" }, { status: 500 });

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const idPayload = ticket.getPayload();
    if (!idPayload)
      return NextResponse.json({ code: 500, message: "Missing Required Tokens" }, { status: 500 });

    const googleAccountId = idPayload?.sub;

    await db.insert(googleAccounts).values({
      accountId: googleAccountId,
      accountName: idPayload.name ?? "Google User",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date),
      teamId: user.teamId,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ code: 500, message: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.redirect("/dashboard/settings");
};

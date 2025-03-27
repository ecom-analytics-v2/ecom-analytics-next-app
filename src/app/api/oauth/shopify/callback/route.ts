import { getUserWithTeam } from "@/actions/user";
import { verifyToken } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { shopifyAccounts } from "@/lib/db/schema";
import { triggerInitialShopifySync } from "@/lib/integrations/backend-client";
import {
  exchangeShopifyCode,
  validateShopifyMessage,
  validateShopifyShopUrl,
} from "@/lib/integrations/shopify";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
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

  const shopUrl = request.nextUrl.searchParams.get("shop");
  if (!shopUrl)
    return NextResponse.json(
      { code: 401, message: "Bad Request: No `shop` query parameter" },
      { status: 401 }
    );

  const validShopUrl = validateShopifyShopUrl(shopUrl);
  if (!validShopUrl)
    return NextResponse.json(
      { code: 401, message: "Bad Request: Invalid `shop` query parameter" },
      { status: 401 }
    );

  const authorizationCode = request.nextUrl.searchParams.get("code");
  if (!authorizationCode)
    return NextResponse.json(
      { code: 401, message: "Bad Request: No `code` query parameter" },
      { status: 401 }
    );

  const state = request.nextUrl.searchParams.get("state");
  if (!state)
    return NextResponse.json(
      { code: 401, message: "Bad Request: No `state` query parameter" },
      { status: 401 }
    );

  const fullUrl = request.nextUrl.toString();
  const urlQuery = fullUrl.split("?")[1];
  if (!urlQuery) return NextResponse.json({ code: 401, message: "Bad Request" }, { status: 401 });

  const urlParts = urlQuery.split("hmac=");
  if (urlParts.length !== 2 || !urlParts[1])
    return NextResponse.json(
      { code: 401, message: "Bad Request: Invalid URL Paths" },
      { status: 401 }
    );

  const urlHmac = urlParts[1]!.split("&")[0]!;

  const urlHmacSuffix = urlParts[1];
  const hmacSuffixQueryParams = urlHmacSuffix.split("&");

  const hmacPrefixString = urlParts[0];

  const hmacSuffixString = hmacSuffixQueryParams.slice(1).join("&");
  const shopifyMessage = hmacPrefixString + hmacSuffixString;

  const shopifyAccount = await db.query.shopifyAccounts.findFirst({
    where: and(eq(shopifyAccounts.shop, shopUrl), eq(shopifyAccounts.teamId, user.teamId)),
  });
  if (!shopifyAccount)
    return NextResponse.json({ code: 401, message: "Invalid Shopify Data" }, { status: 401 });

  if (shopifyAccount.installState !== state)
    //csrf exploit attempt?
    return NextResponse.json({ code: 401, message: "Invalid Shopify Data" }, { status: 401 });

  const messageAuthenticated = validateShopifyMessage(urlHmac, shopifyMessage);

  if (!messageAuthenticated)
    return NextResponse.json(
      { code: 401, message: "Bad Request: Failed to authenticate Shopify message" },
      { status: 401 }
    );

  const tokenData = await exchangeShopifyCode(shopUrl, authorizationCode);
  if (!tokenData)
    return NextResponse.json(
      { code: 403, message: "Internal Server Error: Failed to authenticate with Shopify" },
      { status: 403 }
    );

  await db
    .update(shopifyAccounts)
    .set({
      valid: true,
      accessToken: tokenData.access_token,
    })
    .where(eq(shopifyAccounts.id, shopifyAccount.id));

  triggerInitialShopifySync(shopifyAccount);

  return NextResponse.redirect("/dashboard/settings");
};

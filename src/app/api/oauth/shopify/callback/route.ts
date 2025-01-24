import { getUserWithTeam } from "@/actions/user";
import { verifyToken } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { shopifyAccounts } from "@/lib/db/schema";
import {
  exchangeShopifyCode,
  validateShopifyMessage,
  validateShopifyShopUrl,
} from "@/lib/integrations/shopify";
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
  console.log("shopifyMessage", shopifyMessage);

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
  console.log(tokenData);

  await db.insert(shopifyAccounts).values({
    shop: shopUrl,
    accessToken: tokenData.access_token,
    teamId: user.teamId,
  });

  return redirect("/dashboard/settings");
};

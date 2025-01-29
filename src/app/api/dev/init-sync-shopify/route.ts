import { env } from "@/env";
import { syncShopify } from "@/lib/integrations/sync/sync-shopify";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  if (env.NODE_ENV !== "development")
    return NextResponse.json(
      { success: false, message: "Route only available in developer mode" },
      { status: 500 }
    );
  syncShopify(4);
  return NextResponse.json({ success: true }, { status: 200 });
};

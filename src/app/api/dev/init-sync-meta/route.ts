import { env } from "@/env";
import { db } from "@/lib/db/drizzle";
import { metaAdAccounts, metaAds, metaCampaigns, metaInsightData } from "@/lib/db/schema";
import { syncMeta } from "@/lib/integrations/sync/sync-meta";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  if (env.NODE_ENV !== "development")
    return NextResponse.json(
      { success: false, message: "Route only available in developer mode" },
      { status: 500 }
    );

  const resetMetaDb = request.nextUrl.searchParams.get("dev_reset") === "1";

  const metaAccountId = request.nextUrl.searchParams.get("dev_meta_account_id");
  if (!metaAccountId)
    return NextResponse.json({
      success: false,
      message: "Must provide query param dev_meta_account_id",
    });

  if (resetMetaDb) {
    await db.delete(metaInsightData);
    await db.delete(metaAds);
    await db.delete(metaCampaigns);
    await db.delete(metaAdAccounts);
  }

  syncMeta(parseInt(metaAccountId));

  return NextResponse.json({ success: true, dev_reset: resetMetaDb }, { status: 200 });
};

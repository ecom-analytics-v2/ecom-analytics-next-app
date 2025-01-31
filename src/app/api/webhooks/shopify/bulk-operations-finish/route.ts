import { db } from "@/lib/db/drizzle";
import { shopifyBulkOperations } from "@/lib/db/schema";
import {
  convertBulkOrdersResult,
  getBulkOperationResulsAsArray,
  readShopifyBulkOperation,
} from "@/lib/integrations/shopify";
import { writeShopifyOrders } from "@/lib/integrations/sync/sync-shopify";
import { eq, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ShopifyWebhookBody {
  admin_graphql_api_id: string;
  completed_at: string;
  created_at: string;
  error_code: null | string;
  status: string;
  type: "query" | "mutation";
}

export const POST = async (request: NextRequest) => {
  // const validShopifyMessage = verifyShopifyWebhook(request);
  // if (!validShopifyMessage) return NextResponse.json({ success: false }, { status: 403 });

  const bodyContent = (await request.json()) as ShopifyWebhookBody;

  const bulkOperation = await db.query.shopifyBulkOperations.findFirst({
    where: eq(shopifyBulkOperations.shopifyGid, bodyContent.admin_graphql_api_id),
    with: { shopifyAccount: true },
  });
  if (!bulkOperation) return NextResponse.json({ success: false }, { status: 500 });

  await db
    .update(shopifyBulkOperations)
    .set({
      status: bodyContent.status.toUpperCase() as unknown as SQL<unknown>,
    })
    .where(eq(shopifyBulkOperations.shopifyGid, bodyContent.admin_graphql_api_id));

  if (bulkOperation.local_purpose === "read_all_orders") {
    const bulkOperationData = await readShopifyBulkOperation(
      bulkOperation.shopifyAccount.accessToken,
      bulkOperation.shopifyAccount.shop,
      bulkOperation.shopifyGid
    );
    if (!bulkOperationData.url) return NextResponse.json({ success: false }, { status: 500 });

    const bulkOperationResult = await getBulkOperationResulsAsArray(bulkOperationData.url);
    if (!bulkOperationResult) return NextResponse.json({ success: false }, { status: 500 });

    const formattedOrders = await convertBulkOrdersResult(bulkOperationResult);
    await writeShopifyOrders(bulkOperation.shopifyAccountId, formattedOrders);
  }

  return NextResponse.json({ success: true }, { status: 200 });
};

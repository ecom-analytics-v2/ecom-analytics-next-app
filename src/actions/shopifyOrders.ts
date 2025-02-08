import { db } from "@/lib/db/drizzle";
import { shopifyOrders, shopifyAccounts } from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export async function getShopifyOrdersTotal(teamId: number) {
  try {
    // First get the shopify account for this team
    const shopifyAccount = await db.query.shopifyAccounts.findFirst({
      where: eq(shopifyAccounts.teamId, teamId),
    });

    if (!shopifyAccount) {
      return { error: "No Shopify account found for this team" };
    }

    // Query to sum all order amounts for this shopify account
    const result = await db
      .select({
        total: sql<string>`sum(${shopifyOrders.totalAmount})`.as("total"),
      })
      .from(shopifyOrders)
      .where(eq(shopifyOrders.shopifyAccountId, shopifyAccount.id));

    const total = result[0]?.total ?? "0";

    return { total };
  } catch (error) {
    console.error("Error getting Shopify orders total:", error);
    return { error: "Failed to get orders total" };
  }
}

export async function getShopifyOrderAmountTotal(teamId: number): Promise<string> {
  try {
    // First get the shopify account for this team
    const shopifyAccount = await db.query.shopifyAccounts.findFirst({
      where: eq(shopifyAccounts.teamId, teamId),
    });

    if (!shopifyAccount) {
      return formatCurrency(0);
    }

    // Query to sum all order amounts for this shopify account
    const result = await db
      .select({
        total: sql<string>`COALESCE(sum(${shopifyOrders.totalAmount}), 0)`.as("total"),
      })
      .from(shopifyOrders)
      .where(eq(shopifyOrders.shopifyAccountId, shopifyAccount.id));

    const totalAmount = parseFloat(result[0]?.total ?? "0");
    return formatCurrency(totalAmount);
  } catch (error) {
    console.error("Error getting Shopify orders total:", error);
    return formatCurrency(0);
  }
}

export async function getShopifyOrdersForDateRange(teamId: number) {
  try {
    // Get the shopify account for this team
    const shopifyAccount = await db.query.shopifyAccounts.findFirst({
      where: eq(shopifyAccounts.teamId, teamId),
    });

    if (!shopifyAccount) {
      return [];
    }

    // Query orders between dates for this shopify account
    const orders = await db
      .select({
        date: shopifyOrders.createdAt,
        amount: shopifyOrders.totalAmount,
      })
      .from(shopifyOrders)
      .where(and(eq(shopifyOrders.shopifyAccountId, shopifyAccount.id)));

    return orders;
  } catch (error) {
    console.error("Error getting Shopify orders for date range:", error);
    return [];
  }
}

import { getUserWithTeam } from "@/actions/user";
import { db } from "@/lib/db/drizzle";
import { teams } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

interface ShopifyOrder {
  id: number;
  shopify_gid: string;
  total_amount: number;
  shopify_account_id: number;
  created_at: string;
}

const ShopifyRouter = createTRPCRouter({
  getOrders: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        shop: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { startDate, endDate, shop } = input;

        // Extract shop name from full domain
        const shopName = shop.replace(".myshopify.com", "");

        // Format dates to YYYY-MM-DD
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        // const response = await fetch(
        //   `http://localhost:9999/api/v1/charts/getOrders?start_date=${formattedStartDate}&end_date=${formattedEndDate}&shop_id=${shopName}`
        // );

        // if (!response.ok) {
        //   throw new TRPCError({
        //     code: "BAD_REQUEST",
        //     message: `Failed to fetch orders: ${response.status} ${response.statusText}`,
        //   });
        // }

        // const data = await response.json();
        // return data;

        // Return empty array for now
        return [] as ShopifyOrder[];
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch Shopify orders",
          cause: error,
        });
      }
    }),
});

export default ShopifyRouter;

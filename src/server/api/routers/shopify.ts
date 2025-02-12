import { getUserWithTeam } from "@/actions/user";
import { db } from "@/lib/db/drizzle";
import { teams } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const ShopifyRouter = createTRPCRouter({
  getOrders: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        shopId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate, shopId } = input;
      const response = await fetch(
        `http://localhost:8080/api/v1/charts/getOrders?start_date=${startDate}&end_date=${endDate}&shop_id=${shopId}`
      );
      return response.json();
    }),
});

export default ShopifyRouter;

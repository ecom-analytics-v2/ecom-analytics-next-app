import { getUserWithTeam } from "@/actions/user";
import { env } from "@/env";
import { metaAccounts, shopifyAccounts } from "@/lib/db/schema";
import { initMetaOAuth } from "@/lib/integrations/meta";
import { initShopifyOAuth } from "@/lib/integrations/shopify";
import {
  ConnectionStatus,
  ConnectShopifySchema,
  GetConnectionStatusSchema,
} from "@/types/api/connections-router";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const ConnectionsRouter = createTRPCRouter({
  getConnectionStatus: protectedProcedure
    .input(GetConnectionStatusSchema)
    .query(async ({ ctx, input }) => {
      const user = await getUserWithTeam(ctx.session.user.id);
      if (!user || !user.teamId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must be in a team to use this endpoint!",
        });

      if (input.connection === "meta") {
        const metaAccount = await ctx.db.query.metaAccounts.findFirst({
          where: eq(metaAccounts.teamId, user.teamId),
        });

        if (!metaAccount) {
          return {
            state: "no_account" as ConnectionStatus,
            connect_url: initMetaOAuth(),
          };
        } else if (metaAccount.valid === false) {
          return {
            state: "account_relink_required" as ConnectionStatus,
            connect_url: initMetaOAuth(),
          };
        } else {
          return {
            state: "account_connected" as ConnectionStatus,
            account_details: {
              id: metaAccount.id,
              name: metaAccount.accountName,
            },
          };
        }
      } else if (input.connection === "shopify") {
        const shopifyAccount = await ctx.db.query.shopifyAccounts.findFirst({
          where: eq(shopifyAccounts.teamId, user.teamId),
        });

        if (!shopifyAccount) {
          return {
            state: "no_account" as ConnectionStatus,
            connect_url: `${env.BASE_URL}/api/oauth/shopify/install`,
          };
        } else {
          return {
            state: "account_connected",
            account_details: {
              id: `local_${shopifyAccount.id}`,
              name: shopifyAccount.shop,
            },
          };
        }
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or unavailable provider" });
      }
    }),
  connectShopify: protectedProcedure
    .input(ConnectShopifySchema)
    .mutation(async ({ ctx, input }) => {
      const user = await getUserWithTeam(ctx.session.user.id);
      if (!user || !user.teamId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must be in a team to use this endpoint!",
        });

      const shopifyAccount = await ctx.db.query.shopifyAccounts.findFirst({
        where: eq(shopifyAccounts.teamId, user.teamId),
      });
      if (shopifyAccount)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This team already has a connected Shopify account!",
        });

      return { redirect_uri: initShopifyOAuth(input.shopify_shop) };
    }),
});

export default ConnectionsRouter;

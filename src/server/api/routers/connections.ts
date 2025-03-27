import { getUserWithTeam } from "@/actions/user";
import { env } from "@/env";
import { db } from "@/lib/db/drizzle";
import { googleAccounts, metaAccounts, shopifyAccounts } from "@/lib/db/schema";
import { triggerInitialShopifySync } from "@/lib/integrations/backend-client";
import { initGoogleOAuth } from "@/lib/integrations/google";
import { initMetaOAuth } from "@/lib/integrations/meta";
import {
  generateShopifyState,
  initShopifyOAuth,
  readShopifyProducts,
} from "@/lib/integrations/shopify";
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
      } else if (input.connection === "google") {
        const googleAccount = await ctx.db.query.googleAccounts.findFirst({
          where: eq(googleAccounts.teamId, user.teamId),
        });

        if (!googleAccount) {
          return {
            state: "no_account",
            connect_url: initGoogleOAuth(),
          };
        } else {
          return {
            state: "account_connected",
            account_details: {
              id: `local_${googleAccount.id}`,
              name: googleAccount.accountName,
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

      const installState = generateShopifyState();

      if (input.connection_type === "custom_client" && input.custom_client) {
        const validAccessToken = await readShopifyProducts(
          input.custom_client.access_token,
          input.shopify_shop
        );
        if (!validAccessToken)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to validate Shopify API key",
          });

        const insertedShopifyAccounts = await db
          .insert(shopifyAccounts)
          .values({
            shop: input.shopify_shop,
            teamId: user.teamId,
            accessToken: input.custom_client.access_token,
            installState: installState,
            isCustomClient: true,
            customClientId: input.custom_client.client_id,
            customClientSecret: input.custom_client.client_secret,
          })
          .returning();

        const insertedShopifyAccount = insertedShopifyAccounts.at(0);
        if (!insertedShopifyAccount)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create local account record",
          });

        triggerInitialShopifySync(insertedShopifyAccount);

        return {
          complete: true,
          shopify_account_id: insertedShopifyAccount.id,
        };
      } else {
        const insertedShopifyAccounts = await db
          .insert(shopifyAccounts)
          .values({
            shop: input.shopify_shop,
            accessToken: "null_key",
            teamId: user.teamId,
            valid: false,
            installState: installState,
          })
          .returning();

        const insertedShopifyAccount = insertedShopifyAccounts.at(0);
        if (!insertedShopifyAccount)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create local account record",
          });

        return { redirect_uri: initShopifyOAuth(input.shopify_shop, installState) };
      }
    }),
});

export default ConnectionsRouter;

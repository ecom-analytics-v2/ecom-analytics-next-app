import { z } from "zod";

export const GetConnectionStatusSchema = z.object({
  connection: z.enum(["meta", "shopify"]),
});

export type ConnectionStatus =
  | "no_account_shopify_emb_only"
  | "no_account"
  | "account_relink_required"
  | "account_connected";

export const ConnectShopifySchema = z.object({
  shopify_shop: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/),
});

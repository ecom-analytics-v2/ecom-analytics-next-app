import { z } from "zod";

export const GetConnectionStatusSchema = z.object({
  connection: z.enum(["meta", "shopify", "google"]),
});

export type ConnectionStatus =
  | "no_account_shopify_emb_only"
  | "no_account"
  | "account_relink_required"
  | "account_connected";

export const ConnectShopifySchema = z.object({
  connection_type: z.enum(["custom_client", "official_client"]),
  custom_client: z
    .object({
      client_id: z.string(),
      client_secret: z.string(),
      access_token: z.string(),
    })
    .optional(),
  shopify_shop: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/),
});

import { z } from "zod";

export const GetConnectionStatusSchema = z.object({
  connection: z.enum(["meta", "shopify"]),
});

export type ConnectionStatus = "no_account" | "account_relink_required" | "account_connected";

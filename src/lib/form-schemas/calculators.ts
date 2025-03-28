import { z } from "zod";

export const ShippingCostCalculatorSchema = z.object({
  total_shipping_cost: z.number().min(1, { message: "Total shipping cost must be greater than 0" }),
  total_orders: z.number().min(1, { message: "Total orders must be greater than 0" }).optional(),
});

export const RevenueFromAdsCalculatorSchema = z.object({
  revenue_from_ads: z.number().min(1, { message: "Revenue from ads must be greater than 0" }),
  ad_spend_time_period: z.enum(["24h", "7d", "30d", "90d"]),
});

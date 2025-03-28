import { getUserWithTeam } from "@/actions/user";
import {
  googleAccounts,
  googleAdsPerformanceData,
  metaAccounts,
  metaInsightData,
  shopifyOrders,
} from "@/lib/db/schema";
import {
  RevenueFromAdsCalculatorSchema,
  ShippingCostCalculatorSchema,
} from "@/lib/form-schemas/calculators";
import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CalculatorsRouter = createTRPCRouter({
  shippingCost: protectedProcedure
    .input(ShippingCostCalculatorSchema)
    .mutation(async ({ ctx, input }) => {
      let { total_shipping_cost, total_orders } = input;

      if (!total_orders) {
        const queryResult = await ctx.db
          .select({
            count: count(),
          })
          .from(shopifyOrders);

        total_orders = queryResult[0]?.count ?? 0;
      }

      console.log("Total Shipping Cost", total_shipping_cost);
      console.log("Total Orders", total_orders);

      const average_shipping_cost = total_shipping_cost / total_orders;

      return average_shipping_cost;
    }),
  revenueFromAds: protectedProcedure
    .input(RevenueFromAdsCalculatorSchema)
    .mutation(async ({ ctx, input }) => {
      const { revenue_from_ads, ad_spend_time_period } = input;

      const userWithTeam = await getUserWithTeam(ctx.session.user.id);

      if (!userWithTeam || !userWithTeam.teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not have a team linked to their account",
        });
      }

      const timePeriodStartTimestamp = getDateFromTimePeriod(ad_spend_time_period);
      const timePeriodEndTimestamp = new Date();

      let totalAdSpend = 0;

      const teamMetaAccount = await ctx.db.query.metaAccounts.findFirst({
        where: eq(metaAccounts.teamId, userWithTeam.teamId),
        with: {
          metaAdAccounts: {
            with: {
              metaCampaigns: {
                with: {
                  metaAds: {
                    with: {
                      metaInsightData: {
                        where: and(
                          eq(metaInsightData.date_start, timePeriodStartTimestamp),
                          eq(metaInsightData.date_stop, timePeriodEndTimestamp)
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const teamGoogleAccount = await ctx.db.query.googleAccounts.findFirst({
        where: eq(googleAccounts.teamId, userWithTeam.teamId),
        with: {
          googleAdsAccounts: {
            with: {
              googleAdsCampaigns: {
                with: {
                  googleAds: {
                    with: {
                      googleAdsPerformanceData: {
                        where: and(
                          gte(googleAdsPerformanceData.timestamp, timePeriodStartTimestamp),
                          lte(googleAdsPerformanceData.timestamp, timePeriodEndTimestamp)
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!teamMetaAccount && !teamGoogleAccount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "User does not have a meta or google account linked to their team, cannot calculate ad spend",
        });
      }

      const totalMetaAdSpend = teamMetaAccount?.metaAdAccounts.reduce((acc, metaAdAccount) => {
        return (
          acc +
          metaAdAccount.metaCampaigns.reduce((acc, metaCampaign) => {
            return (
              acc +
              metaCampaign.metaAds.reduce((acc, metaAd) => {
                return (
                  acc +
                  metaAd.metaInsightData.reduce((acc, metaInsightData) => {
                    return acc + parseFloat(metaInsightData.spend);
                  }, 0)
                );
              }, 0)
            );
          }, 0)
        );
      }, 0);

      const totalGoogleAdSpend = teamGoogleAccount?.googleAdsAccounts.reduce(
        (acc, googleAdAccount) => {
          return (
            acc +
            googleAdAccount.googleAdsCampaigns.reduce((acc, googleAdCampaign) => {
              return (
                acc +
                googleAdCampaign.googleAds.reduce((acc, googleAd) => {
                  return (
                    acc +
                    googleAd.googleAdsPerformanceData.reduce((acc, googleAdsPerformanceData) => {
                      return (
                        acc +
                        (googleAdsPerformanceData.costMicros
                          ? parseFloat(googleAdsPerformanceData.costMicros)
                          : 0)
                      );
                    }, 0)
                  );
                }, 0)
              );
            }, 0)
          );
        },
        0
      );

      totalAdSpend = (totalMetaAdSpend ?? 0) + (totalGoogleAdSpend ?? 0);

      if (totalAdSpend === 0) return 0;

      return revenue_from_ads / totalAdSpend;
    }),
});

export default CalculatorsRouter;

const getDateFromTimePeriod = (timePeriod: "24h" | "7d" | "30d" | "90d"): Date => {
  const now = new Date();

  switch (timePeriod) {
    case "24h":
      return new Date(now.setHours(now.getHours() - 24));
    case "7d":
      return new Date(now.setDate(now.getDate() - 7));
    case "30d":
      return new Date(now.setDate(now.getDate() - 30));
    case "90d":
      return new Date(now.setDate(now.getDate() - 90));
    default:
      throw new Error("Invalid time period");
  }
};

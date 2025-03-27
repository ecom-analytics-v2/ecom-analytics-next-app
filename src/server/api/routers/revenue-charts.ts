import { getTeam } from "@/actions/team";
import { getUserWithTeam } from "@/actions/user";
import { fetchRevenueCharts } from "@/lib/integrations/backend-client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const RevenueChartsRouter = createTRPCRouter({
  getRevenueCharts: protectedProcedure.query(async ({ ctx, input }) => {
    const userWithTeam = await getUserWithTeam(ctx.session.user.id);
    if (!userWithTeam?.teamId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must create or join a team first!",
      });

    const userTeam = await getTeam(userWithTeam.teamId);
    if (!userTeam)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must create or join a team first!",
      });

    const revenueChartData = await fetchRevenueCharts(userTeam);

    return revenueChartData;
  }),
});

export default RevenueChartsRouter;

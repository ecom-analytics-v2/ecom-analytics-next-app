import { getUserWithTeam } from "@/actions/user";
import { db } from "@/lib/db/drizzle";
import { teams } from "@/lib/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const FilterRouter = createTRPCRouter({
  updateDateFilter: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserWithTeam(ctx.session.user.id);
      if (!user || !user.teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must be in a team to use this endpoint!",
        });
      }

      try {
        await db
          .update(teams)
          .set({
            dateFilterStart: new Date(input.startDate),
            dateFilterEnd: new Date(input.endDate),
          })
          .where(eq(teams.id, user.teamId));

        return { success: true };
      } catch (error) {
        console.error("Error updating date filter:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update date filter",
        });
      }
    }),

  getDateFilter: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserWithTeam(ctx.session.user.id);
    if (!user || !user.teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must be in a team to use this endpoint!",
      });
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, user.teamId),
      columns: {
        dateFilterStart: true,
        dateFilterEnd: true,
      },
    });

    if (!team) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Team not found",
      });
    }

    if (!team.dateFilterStart || !team.dateFilterEnd) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Date filter not set",
      });
    }

    return {
      startDate: team.dateFilterStart,
      endDate: team.dateFilterEnd,
    };
  }),
});

export default FilterRouter;

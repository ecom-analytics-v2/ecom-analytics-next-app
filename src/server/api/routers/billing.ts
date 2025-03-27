import { env } from "@/env";
import { getUserWithTeamAndSub } from "@/lib/data-functions";
import { db } from "@/lib/db/drizzle";
import { subscriptions } from "@/lib/db/schema/subscriptions";
import { teams } from "@/lib/db/schema/teams";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const stripe = new Stripe(env.STRIPE_API_KEY);

const BillingRouter = createTRPCRouter({
  getStripeBillingPortalSession: protectedProcedure.query(async ({ ctx }) => {
    const userWithTeam = await getUserWithTeamAndSub(ctx.session.user.id);

    if (!userWithTeam.teamHasActiveSubscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Team does not have an active subscription",
      });
    }

    let configuration: Stripe.BillingPortal.Configuration;
    const configurations = await stripe.billingPortal.configurations.list();

    if (configurations.data.length > 0) {
      configuration = configurations.data[0]!;
    } else {
      configuration = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Manage your subscription",
        },
        features: {
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price", "quantity", "promotion_code"],
            proration_behavior: "create_prorations",
            products: [
              {
                product: env.STRIPE_PRODUCT_ID,
                prices: [env.STRIPE_PRICE_ID],
              },
            ],
          },
          subscription_cancel: {
            enabled: true,
            mode: "at_period_end",
            cancellation_reason: {
              enabled: true,
              options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
            },
          },
        },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userWithTeam.team.stripeCustomerId as string,
      return_url: `${env.BASE_URL}/dashboard/billing`,
      configuration: configuration.id,
    });

    return { url: session.url };
  }),

  subscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const userWithTeam = await getUserWithTeamAndSub(ctx.session.user.id);

    if (userWithTeam.teamHasActiveSubscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Team already has an active subscription",
      });
    }

    let stripeCustomerId;

    if (!userWithTeam.team.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userWithTeam.user.user.email,
      });

      await db
        .update(teams)
        .set({
          stripeCustomerId: customer.id,
        })
        .where(eq(teams.id, userWithTeam.team.id));

      stripeCustomerId = customer.id;
    } else {
      const existingInactiveSubscription = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.teamId, userWithTeam.team.id),
          eq(subscriptions.status, "inactive")
        ),
      });

      if (existingInactiveSubscription) {
        await db.delete(subscriptions).where(eq(subscriptions.id, existingInactiveSubscription.id));
      }

      stripeCustomerId = userWithTeam.team.stripeCustomerId;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${env.BASE_URL}/dashboard/billing/success`,
      cancel_url: `${env.BASE_URL}/dashboard/billing/cancel`,
      metadata: {
        teamId: userWithTeam.team.id.toString(),
      },
      expand: ["payment_intent", "subscription"],
    });

    if (!session.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create checkout session",
      });
    }

    return { url: session.url };
  }),
});

export default BillingRouter;

import { getTeamByStripeCustomerId } from "@/actions/team";
import { db } from "@/lib/db/drizzle";
import { subscriptions } from "@/lib/db/schema/subscriptions";
import { new__handleSubscriptionChange, stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
      const subscriptionCreated = event.data.object as Stripe.Subscription;

      const team = await getTeamByStripeCustomerId(subscriptionCreated.customer as string);

      if (!team) {
        console.error("Team not found for Stripe customer:", subscriptionCreated.customer);
        return NextResponse.json({ error: "Team not found for Stripe customer." }, { status: 400 });
      }

      await db.insert(subscriptions).values({
        teamId: team.id,
        stripeSubscriptionId: subscriptionCreated.id,
        status:
          subscriptionCreated.status === "active" || subscriptionCreated.status === "trialing"
            ? "active"
            : "inactive",
      });

      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await new__handleSubscriptionChange(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

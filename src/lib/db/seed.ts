import { hashPassword } from "@/lib/auth/session";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { expenses, teamMembers, teams, users } from "./schema";
import { NewExpense } from "./schema/expenses";

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    name: "Base",
    description: "Base subscription plan",
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: "Plus",
    description: "Plus subscription plan",
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  console.log("Stripe products and prices created successfully.");
}

async function seed() {
  const name = "Bob Smith";
  const email = "test@test.com";
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  // Create user
  const [user] = await db
    .insert(users)
    .values([
      {
        name: name,
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log("Initial user created.");

  // Create team
  const [team] = await db
    .insert(teams)
    .values({
      name: "Test Team",
      monthlyRevenue: 100000, // Monthly revenue of $100,000
    })
    .returning();

  // Create team member
  await db.insert(teamMembers).values({
    teamId: team!.id,
    userId: user!.id,
    role: "owner",
  });

  console.log("Team and team member created.");

  // Create Stripe products
  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });

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

async function createSampleExpenses() {
  console.log("Creating sample expenses...");

  const currentDate = new Date();
  const threeMonthsAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 3,
    currentDate.getDate()
  );

  const sampleExpenses = [
    // Fixed Costs
    {
      name: "Office Rent",
      type: "Fixed Cost",
      amount: "5000",
      frequency: "monthly",
      notes: "Monthly rent for main office space",
    },
    {
      name: "Insurance",
      type: "Fixed Cost",
      amount: "1000",
      frequency: "monthly",
      notes: "General liability and property insurance",
    },
    {
      name: "Utilities",
      type: "Fixed Cost",
      amount: "800",
      frequency: "monthly",
      notes: "Electricity, water, and internet bills",
    },

    // Variable Costs
    {
      name: "Raw Materials",
      type: "Variable Cost",
      amount: "15000",
      frequency: "monthly",
      notes: "Cost of materials for product manufacturing",
    },
    {
      name: "Shipping",
      type: "Variable Cost",
      amount: "2000",
      frequency: "monthly",
      notes: "Outbound shipping costs for customer orders",
    },
    {
      name: "Packaging",
      type: "Variable Cost",
      amount: "1000",
      frequency: "monthly",
      notes: "Product packaging materials",
    },

    // Staff
    {
      name: "Salaries",
      type: "Staff",
      amount: "30000",
      frequency: "monthly",
      notes: "Total salaries for all employees",
    },
    {
      name: "Employee Benefits",
      type: "Staff",
      amount: "5000",
      frequency: "monthly",
      notes: "Health insurance and other employee benefits",
    },
    {
      name: "Payroll Taxes",
      type: "Staff",
      amount: "3000",
      frequency: "monthly",
      notes: "Employer portion of payroll taxes",
    },

    // Software
    {
      name: "CRM Subscription",
      type: "Software",
      amount: "500",
      frequency: "monthly",
      notes: "Customer Relationship Management software subscription",
    },
    {
      name: "Accounting Software",
      type: "Software",
      amount: 200,
      frequency: "monthly",
      notes: "Cloud-based accounting software",
    },
    {
      name: "Project Management Tool",
      type: "Software",
      amount: 100,
      frequency: "monthly",
      notes: "Team collaboration and project management platform",
    },

    // Marketing
    {
      name: "Social Media Ads",
      type: "Marketing",
      amount: 2000,
      frequency: "monthly",
      notes: "Facebook and Instagram ad campaigns",
    },
    {
      name: "Content Creation",
      type: "Marketing",
      amount: 1500,
      frequency: "monthly",
      notes: "Outsourced blog writing and video production",
    },
    {
      name: "SEO Services",
      type: "Marketing",
      amount: 1000,
      frequency: "monthly",
      notes: "Search engine optimization consulting",
    },

    // Operating Expenses
    {
      name: "Office Supplies",
      type: "Operating Expenses",
      amount: 300,
      frequency: "monthly",
      notes: "General office supplies and stationery",
    },
    {
      name: "Maintenance",
      type: "Operating Expenses",
      amount: 500,
      frequency: "monthly",
      notes: "Regular equipment and facility maintenance",
    },
    {
      name: "Cleaning Services",
      type: "Operating Expenses",
      amount: 400,
      frequency: "monthly",
      notes: "Professional office cleaning service",
    },

    // Taxes
    {
      name: "Income Tax",
      type: "Taxes",
      amount: 10000,
      frequency: "monthly",
      notes: "Estimated monthly income tax payments",
    },
    {
      name: "Sales Tax",
      type: "Taxes",
      amount: 5000,
      frequency: "monthly",
      notes: "Collected and remitted sales tax",
    },
    {
      name: "Property Tax",
      type: "Taxes",
      amount: 12000,
      frequency: "yearly",
      notes: "Annual property tax for office building",
    },

    // Other
    {
      name: "Legal Fees",
      type: "Other",
      amount: 1000,
      frequency: "monthly",
      notes: "Retainer for legal services",
    },
    {
      name: "Professional Development",
      type: "Other",
      amount: 500,
      frequency: "monthly",
      notes: "Employee training and conference attendance",
    },
    {
      name: "Miscellaneous",
      type: "Other",
      amount: 300,
      frequency: "monthly",
      notes: "Unexpected small expenses",
    },
  ];

  for (const expense of sampleExpenses) {
    const randomDate = new Date(
      threeMonthsAgo.getTime() + Math.random() * (currentDate.getTime() - threeMonthsAgo.getTime())
    );

    // Generate a random time for the timestamp
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomSeconds = Math.floor(Math.random() * 60);

    randomDate.setHours(randomHours, randomMinutes, randomSeconds);

    await db.insert(expenses).values({
      teamId: 1,
      name: expense.name,
      type: expense.type,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      date: randomDate,
      createdBy: 1,
      notes: expense.notes,
      timestamp: randomDate, // Add the timestamp field
    } as NewExpense);
  }

  console.log("Sample expenses created successfully.");
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

  // Create sample expenses
  await createSampleExpenses();

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

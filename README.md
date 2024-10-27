# Scale Sage

<details>
  <summary>Why am I doing this project on the side?</summary>

I've been dabbling in ecommerce / working in the industry since the start of covid. To me, the most interesting part of ecommerce is the data. I've always felt that if you can collect the right data, you can make better decisions.

I've been using Shopify for a long time now, and I've learned a lot from using it. However, I've also felt that there are some gaps in the standard reporting tools. Recently (last year or so) some of the bigger players in the industry started to release their own PnL systems, and I thought "I could build something like that".

The end product I'm trying to build is a PnL system for ecommerce businesses. It will be a self serve product that will integrate with Shopify and other platforms (most likely meta, tiktok, etc). I'd like it to aggregate all of your ecommerce and marketing data into a single place so that you and your team can make better decisions. I'd also like to implement some kind of AI to help with the reporting process.

P.S My objective is to roll out an MVP as fast as possible (within 30 days of starting the project). It is not to demonstrate the best practices of web development.

</details>

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/leerob/next-saas-starter
cd next-saas-starter
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Note:** This is a work in progress. I'll be updating this README as I build the project.

**Note:** I started this project in September 2024 from a nextjs / stripe template (this was to save time as stripe is a pain in the ass to implement). I'll be slowly building this up to be more like the final product.

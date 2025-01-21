-- First create enums
DO $$ BEGIN
  CREATE TYPE "public"."frequency" AS ENUM('monthly', 'yearly', 'per_order', 'one_time');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Then create tables in dependency order
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100),
  "email" varchar(255) NOT NULL,
  "password_hash" text NOT NULL,
  "role" varchar(20) DEFAULT 'member' NOT NULL,
  "active_team_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "teams" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "stripe_product_id" text,
  "plan_name" varchar(50) DEFAULT 'free',
  "subscription_status" varchar(20),
  "monthly_revenue" integer,
  CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
  CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

-- Then create tables with foreign keys
CREATE TABLE IF NOT EXISTS "team_members" (
  -- ... rest of your schema ...
);

-- Add foreign key constraints after all tables exist
ALTER TABLE "users" ADD CONSTRAINT "users_active_team_id_teams_id_fk" 
  FOREIGN KEY ("active_team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;

-- ... rest of your foreign key constraints ... 
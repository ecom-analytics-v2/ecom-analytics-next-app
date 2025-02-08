CREATE TABLE IF NOT EXISTS "meta_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"account_name" text NOT NULL,
	"access_token" text NOT NULL,
	"valid" boolean DEFAULT true NOT NULL,
	"team_id" serial NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop" text NOT NULL,
	"access_token" text NOT NULL,
	"valid" boolean DEFAULT true NOT NULL,
	"team_id" serial NOT NULL,
	"last_synced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_gid" text NOT NULL,
	"shopify_title" text NOT NULL,
	"shopify_handle" text NOT NULL,
	"shopify_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_webhook_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_gid" text NOT NULL,
	"shopify_topic" text NOT NULL,
	"shopify_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_accounts" ADD CONSTRAINT "meta_accounts_team_id_users_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_accounts" ADD CONSTRAINT "shopify_accounts_team_id_users_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_products" ADD CONSTRAINT "shopify_products_shopify_account_id_shopify_accounts_id_fk" FOREIGN KEY ("shopify_account_id") REFERENCES "public"."shopify_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_webhook_subscriptions" ADD CONSTRAINT "shopify_webhook_subscriptions_shopify_account_id_shopify_accounts_id_fk" FOREIGN KEY ("shopify_account_id") REFERENCES "public"."shopify_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

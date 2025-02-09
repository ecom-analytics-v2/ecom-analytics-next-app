DO $$ BEGIN
 CREATE TYPE "public"."local_purpose" AS ENUM('read_all_orders');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."operation_status" AS ENUM('CREATED', 'CANCELED', 'CANCELING', 'FAILED', 'RUNNING', 'EXPIRED', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"account_name" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"valid" boolean DEFAULT true NOT NULL,
	"team_id" serial NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_ad_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"meta_api_ad_account_id" text NOT NULL,
	"meta_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"meta_api_ad_id" text NOT NULL,
	"ad_name" text NOT NULL,
	"meta_campaign" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"meta_api_campaign_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"campaign_objective" text NOT NULL,
	"campaign_status" text NOT NULL,
	"meta_ad_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meta_insight_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"impressions" numeric NOT NULL,
	"spend" numeric NOT NULL,
	"actions" json NOT NULL,
	"cost_per_action_type" json NOT NULL,
	"date_start" timestamp NOT NULL,
	"date_start_key" text NOT NULL,
	"date_stop" timestamp NOT NULL,
	"date_stop_key" text NOT NULL,
	"meta_ad_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_bulk_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_gid" text NOT NULL,
	"operation_status" "operation_status" NOT NULL,
	"operation_purpose" "local_purpose" NOT NULL,
	"shopify_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_order_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_order_id" serial NOT NULL,
	"shopify_product_id" serial NOT NULL,
	"shopify_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shopify_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_gid" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"shopify_account_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meta_accounts" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shopify_accounts" ADD COLUMN "install_state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shopify_accounts" ADD COLUMN "is_custom_client" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "shopify_accounts" ADD COLUMN "custom_client_id" text;--> statement-breakpoint
ALTER TABLE "shopify_accounts" ADD COLUMN "custom_client_secret" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "date_filter_start" timestamp DEFAULT NOW() - INTERVAL '30 days';--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "date_filter_end" timestamp DEFAULT NOW();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "google_accounts" ADD CONSTRAINT "google_accounts_team_id_users_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_meta_account_id_meta_accounts_id_fk" FOREIGN KEY ("meta_account_id") REFERENCES "public"."meta_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_ads" ADD CONSTRAINT "meta_ads_meta_campaign_meta_campaigns_id_fk" FOREIGN KEY ("meta_campaign") REFERENCES "public"."meta_campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_campaigns" ADD CONSTRAINT "meta_campaigns_meta_ad_account_id_meta_ad_accounts_id_fk" FOREIGN KEY ("meta_ad_account_id") REFERENCES "public"."meta_ad_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meta_insight_data" ADD CONSTRAINT "meta_insight_data_meta_ad_id_meta_ads_id_fk" FOREIGN KEY ("meta_ad_id") REFERENCES "public"."meta_ads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_bulk_operations" ADD CONSTRAINT "shopify_bulk_operations_shopify_account_id_shopify_accounts_id_fk" FOREIGN KEY ("shopify_account_id") REFERENCES "public"."shopify_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_order_products" ADD CONSTRAINT "shopify_order_products_shopify_order_id_shopify_orders_id_fk" FOREIGN KEY ("shopify_order_id") REFERENCES "public"."shopify_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_order_products" ADD CONSTRAINT "shopify_order_products_shopify_product_id_shopify_products_id_fk" FOREIGN KEY ("shopify_product_id") REFERENCES "public"."shopify_products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_order_products" ADD CONSTRAINT "shopify_order_products_shopify_account_id_shopify_accounts_id_fk" FOREIGN KEY ("shopify_account_id") REFERENCES "public"."shopify_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shopify_orders" ADD CONSTRAINT "shopify_orders_shopify_account_id_shopify_accounts_id_fk" FOREIGN KEY ("shopify_account_id") REFERENCES "public"."shopify_accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sbo_gid_idx" ON "shopify_bulk_operations" USING btree ("shopify_gid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sbo_aid_idx" ON "shopify_bulk_operations" USING btree ("shopify_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sop_oid_idx" ON "shopify_order_products" USING btree ("shopify_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sop_pid_idx" ON "shopify_order_products" USING btree ("shopify_product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sop_aid_idx" ON "shopify_order_products" USING btree ("shopify_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "so_gid_idx" ON "shopify_orders" USING btree ("shopify_gid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "so_aid_idx" ON "shopify_orders" USING btree ("shopify_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sa_sp_idx" ON "shopify_accounts" USING btree ("shop");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sa_tid_idx" ON "shopify_accounts" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sa_ccid_idx" ON "shopify_accounts" USING btree ("custom_client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sp_gid_idx" ON "shopify_products" USING btree ("shopify_gid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sa_aid_idx" ON "shopify_products" USING btree ("shopify_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sws_gid_idx" ON "shopify_webhook_subscriptions" USING btree ("shopify_gid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sws_aid_idx" ON "shopify_webhook_subscriptions" USING btree ("shopify_account_id");
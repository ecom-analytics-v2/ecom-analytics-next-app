DO $$ BEGIN
 CREATE TYPE "public"."amount_type" AS ENUM('dollar', 'percentage');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount_type" SET DATA TYPE amount_type;
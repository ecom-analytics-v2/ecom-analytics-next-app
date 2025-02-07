import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url(),
    BASE_URL: z.string(),
    DEV_WEBHOOK_BASE_URL: z.string(),
    BACKEND_BASE_URL: z.string(),
    AUTH_SECRET: z.string(),
    META_APP_ID: z.string(),
    META_APP_SECRET: z.string(),
    SHOPIFY_CLIENT_ID: z.string(),
    SHOPIFY_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_DEVELOPER_TOKEN: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    BASE_URL: process.env.BASE_URL,
    DEV_WEBHOOK_BASE_URL: process.env.DEV_WEBHOOK_BASE_URL,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_DEVELOPER_TOKEN: process.env.GOOGLE_DEVELOPER_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

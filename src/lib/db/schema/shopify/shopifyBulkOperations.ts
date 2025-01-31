import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { shopifyAccounts } from "./shopifyAccounts";

export const bulkOperationStatus = pgEnum("operation_status", [
  "CREATED",
  "CANCELED",
  "CANCELING",
  "FAILED",
  "RUNNING",
  "EXPIRED",
  "COMPLETED",
]);

export const bulkOperationLocalPurpose = pgEnum("local_purpose", ["read_all_orders"]);

export const shopifyBulkOperations = pgTable("shopify_bulk_operations", {
  id: serial("id").primaryKey(),
  shopifyGid: text("shopify_gid").notNull(),
  status: bulkOperationStatus("operation_status").notNull(),
  local_purpose: bulkOperationLocalPurpose("operation_purpose").notNull(),
  shopifyAccountId: serial("shopify_account_id")
    .notNull()
    .references(() => shopifyAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shopifyBulkOperationsRelations = relations(shopifyBulkOperations, ({ one, many }) => ({
  shopifyAccount: one(shopifyAccounts, {
    fields: [shopifyBulkOperations.shopifyAccountId],
    references: [shopifyAccounts.id],
  }),
}));

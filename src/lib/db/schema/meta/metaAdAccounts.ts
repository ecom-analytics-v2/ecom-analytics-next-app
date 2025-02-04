import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { metaAccounts } from "./metaAccounts";

export const metaAdAccounts = pgTable("meta_ad_accounts", {
  id: serial("id").primaryKey(),
  metaApiAdAccountId: text("meta_api_ad_account_id").notNull(),
  metaAccountId: serial("meta_account_id")
    .notNull()
    .references(() => metaAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const metaAdAccountsRelations = relations(metaAdAccounts, ({ one }) => ({
  metaAccount: one(metaAccounts, {
    fields: [metaAdAccounts.metaAccountId],
    references: [metaAccounts.id],
  }),
}));

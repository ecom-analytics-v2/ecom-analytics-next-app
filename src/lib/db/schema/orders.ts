import {
  pgTable,
  serial,
  integer,
  varchar,
  decimal,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams } from "./teams";

// schema for the shopify order
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  shopifyOrderId: varchar("shopify_order_id", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: orderStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderProducts = pgTable("order_products", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: varchar("product_id", { length: 255 }).notNull(),
  variantId: varchar("variant_id", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  team: one(teams, {
    fields: [orders.teamId],
    references: [teams.id],
  }),
  products: many(orderProducts),
}));

export const orderProductsRelations = relations(orderProducts, ({ one }) => ({
  order: one(orders, {
    fields: [orderProducts.orderId],
    references: [orders.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderProduct = typeof orderProducts.$inferSelect;
export type NewOrderProduct = typeof orderProducts.$inferInsert;

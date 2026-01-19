import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	cellphone: text("cellphone").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	reference: text("reference"),
	description: text("description"),
	quantity: integer("quantity"),
	date: timestamp("date"),
	unitSellingPrice: numeric("unit_selling_price", {
		precision: 10,
		scale: 2,
	}).notNull(),
	unitPurchasePrice: numeric("unit_purchase_price", {
		precision: 10,
		scale: 2,
	}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const productSkus = pgTable("product_skus", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	images: jsonb("images").$type<string[]>().default([]),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductSku = typeof productSkus.$inferSelect;
export type NewProductSku = typeof productSkus.$inferInsert;

export const productsRelations = relations(products, ({ many }) => ({
	skus: many(productSkus),
}));

export const productSkusRelations = relations(productSkus, ({ one }) => ({
	product: one(products, {
		fields: [productSkus.productId],
		references: [products.id],
	}),
}));

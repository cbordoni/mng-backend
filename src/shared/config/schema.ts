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
	price: numeric("price", {
		precision: 10,
		scale: 2,
	}).notNull(),
	oldPrice: numeric("old_price", {
		precision: 10,
		scale: 2,
	}),
	images: jsonb("images").$type<Record<string, string>>().default({}),
	installments:
		jsonb("installments").$type<Array<{ installment: number; fee?: number }>>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

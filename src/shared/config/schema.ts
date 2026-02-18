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
	role: text("role")
		.notNull()
		.default("customer")
		.$type<"admin" | "seller" | "customer">(),
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

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	total: numeric("total", {
		precision: 10,
		scale: 2,
	}).notNull(),
	status: text("status")
		.notNull()
		.default("pending")
		.$type<"pending" | "confirmed" | "shipped" | "delivered" | "cancelled">(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const orderItems = pgTable("order_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "restrict" }),
	productName: text("product_name").notNull(),
	quantity: integer("quantity").notNull(),
	priceAtOrder: numeric("price_at_order", {
		precision: 10,
		scale: 2,
	}).notNull(),
	subtotal: numeric("subtotal", {
		precision: 10,
		scale: 2,
	}).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	type: text("type")
		.notNull()
		.$type<
			"pix" | "creditCard" | "debitCard" | "cash" | "installmentBooklet"
		>(),
	amount: text("amount").notNull(),
	installments: integer("installments"),
	status: text("status")
		.notNull()
		.default("pending")
		.$type<
			| "pending"
			| "processing"
			| "completed"
			| "failed"
			| "cancelled"
			| "refunded"
		>(),
	transactionId: text("transaction_id"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

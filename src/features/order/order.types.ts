import { t } from "elysia";

// Order Item Schema
export const OrderItemSchema = t.Object({
	productId: t.String({ format: "uuid" }),
	quantity: t.Number({ minimum: 1 }),
});

// Create Order Schema
export const CreateOrderSchema = t.Object({
	userId: t.String({ format: "uuid" }),
	items: t.Array(OrderItemSchema, { minItems: 1 }),
});

// Update Order Schema
export const UpdateOrderSchema = t.Object({
	status: t.Optional(
		t.Union([
			t.Literal("pending"),
			t.Literal("confirmed"),
			t.Literal("shipped"),
			t.Literal("delivered"),
			t.Literal("cancelled"),
		]),
	),
});

// Order ID Schema
export const OrderIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

// Types
export type OrderItem = {
	id: string;
	orderId: string;
	productId: string;
	productName: string;
	quantity: number;
	priceAtOrder: number;
	subtotal: number;
};

export type Order = {
	id: string;
	userId: string;
	items: OrderItem[];
	total: number;
	status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
	createdAt: Date;
	updatedAt: Date;
};

export type CreateOrderInput = {
	userId: string;
	items: {
		productId: string;
		quantity: number;
	}[];
};

export type UpdateOrderInput = {
	status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
};

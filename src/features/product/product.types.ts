import { t } from "elysia";

export const CreateProductSchema = t.Object({
	name: t.String({ minLength: 1 }),
	reference: t.Optional(t.String()),
	description: t.Optional(t.String()),
	quantity: t.Optional(
		t.Number({ minimum: 1, error: "Quantidade deve ser maior que zero" }),
	),
	date: t.Optional(t.String({ format: "date-time" })),
	unitSellingPrice: t.Number({ minimum: 0.01 }),
	unitPurchasePrice: t.Number({ minimum: 0.01 }),
});

export const UpdateProductSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	reference: t.Optional(t.String()),
	description: t.Optional(t.String()),
	quantity: t.Optional(
		t.Number({ minimum: 1, error: "Quantidade deve ser maior que zero" }),
	),
	date: t.Optional(t.String({ format: "date-time" })),
	unitSellingPrice: t.Optional(t.Number({ minimum: 0.01 })),
	unitPurchasePrice: t.Optional(t.Number({ minimum: 0.01 })),
});

export const ProductIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export type CreateProductInput = typeof CreateProductSchema.static;
export type UpdateProductInput = typeof UpdateProductSchema.static;
export type ProductIdInput = typeof ProductIdSchema.static;

import { t } from "elysia";

export const CreateProductSchema = t.Object({
	name: t.String({ minLength: 1 }),
	reference: t.Optional(t.String()),
	description: t.Optional(t.String()),
	quantity: t.Optional(
		t.Number({ minimum: 1, error: "Quantidade deve ser maior que zero" }),
	),
	date: t.Optional(t.String({ format: "date-time" })),
	price: t.Number({ minimum: 0.01 }),
	oldPrice: t.Optional(t.Number({ minimum: 0.01 })),
	images: t.Optional(t.Record(t.String(), t.String({ format: "uri" }))),
	installments: t.Optional(
		t.Array(
			t.Object({
				installment: t.Number({ minimum: 1 }),
				fee: t.Optional(t.Number({ minimum: 0 })),
			}),
		),
	),
});

export const UpdateProductSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	reference: t.Optional(t.String()),
	description: t.Optional(t.String()),
	quantity: t.Optional(
		t.Number({ minimum: 1, error: "Quantidade deve ser maior que zero" }),
	),
	date: t.Optional(t.String({ format: "date-time" })),
	price: t.Optional(t.Number({ minimum: 0.01 })),
	images: t.Optional(t.Record(t.String(), t.String({ format: "uri" }))),
	installments: t.Optional(
		t.Array(
			t.Object({
				installment: t.Number({ minimum: 1 }),
				fee: t.Optional(t.Number({ minimum: 0 })),
			}),
		),
	),
});

export const ProductIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export const AddImagesSchema = t.Object({
	images: t.Record(t.String(), t.String({ format: "uri" })),
});

export const DeleteImageSchema = t.Object({
	resolution: t.String(),
});

export const UpdateProductPriceSchema = t.Object({
	price: t.Number({ minimum: 0.01 }),
});

export type CreateProductInput = typeof CreateProductSchema.static;
export type UpdateProductInput = typeof UpdateProductSchema.static;
export type ProductIdInput = typeof ProductIdSchema.static;
export type AddImagesInput = typeof AddImagesSchema.static;
export type DeleteImageInput = typeof DeleteImageSchema.static;
export type UpdateProductPriceInput = typeof UpdateProductPriceSchema.static;

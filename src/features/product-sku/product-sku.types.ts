import { t } from "elysia";

export const CreateProductSkuSchema = t.Object({
	productId: t.String({ format: "uuid" }),
	name: t.String({ minLength: 1 }),
	images: t.Optional(t.Array(t.String({ format: "uri" }))),
});

export const UpdateProductSkuSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	images: t.Optional(t.Array(t.String({ format: "uri" }))),
});

export const ProductSkuIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export const ProductIdParamSchema = t.Object({
	productId: t.String({ format: "uuid" }),
});

export type CreateProductSkuInput = typeof CreateProductSkuSchema.static;
export type UpdateProductSkuInput = typeof UpdateProductSkuSchema.static;
export type ProductSkuIdInput = typeof ProductSkuIdSchema.static;
export type ProductIdParamInput = typeof ProductIdParamSchema.static;

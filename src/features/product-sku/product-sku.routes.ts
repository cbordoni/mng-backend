import { Elysia } from "elysia";

import { PaginationQuerySchema } from "@/shared/types";
import { ProductSkuController } from "./product-sku.controller";
import { ProductSkuRepository } from "./product-sku.repository";
import { ProductSkuService } from "./product-sku.service";
import {
	CreateProductSkuSchema,
	ProductIdParamSchema,
	ProductSkuIdSchema,
	UpdateProductSkuSchema,
} from "./product-sku.types";

const repository = new ProductSkuRepository();
const service = new ProductSkuService(repository);
const controller = new ProductSkuController(service);

export const productSkuRoutes = new Elysia({ prefix: "/product-skus" })
	.get(
		"/",
		async ({ query }) => {
			return await controller.getAll(query);
		},
		{
			query: PaginationQuerySchema,
			detail: {
				summary: "Get all product SKUs with pagination",
				tags: ["Product SKUs"],
			},
		},
	)
	.get(
		"/product/:productId",
		async ({ params }) => {
			return await controller.getByProductId(params.productId);
		},
		{
			params: ProductIdParamSchema,
			detail: {
				summary: "Get product SKUs by product ID",
				tags: ["Product SKUs"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			return await controller.getById(params.id);
		},
		{
			params: ProductSkuIdSchema,
			detail: {
				summary: "Get product SKU by ID",
				tags: ["Product SKUs"],
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await controller.create(body);
		},
		{
			body: CreateProductSkuSchema,
			detail: {
				summary: "Create a new product SKU",
				tags: ["Product SKUs"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body }) => {
			return await controller.update(params.id, body);
		},
		{
			params: ProductSkuIdSchema,
			body: UpdateProductSkuSchema,
			detail: {
				summary: "Update a product SKU",
				tags: ["Product SKUs"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			return await controller.delete(params.id);
		},
		{
			params: ProductSkuIdSchema,
			detail: {
				summary: "Delete a product SKU",
				tags: ["Product SKUs"],
			},
		},
	);

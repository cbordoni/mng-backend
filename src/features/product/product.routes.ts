import { Elysia } from "elysia";

import { PaginationQuerySchema } from "@/shared/types";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./product.repository";
import { ProductService } from "./product.service";
import {
	AddImagesSchema,
	CreateProductSchema,
	DeleteImageSchema,
	ProductIdSchema,
	UpdateProductSchema,
} from "./product.types";

const repository = new ProductRepository();
const service = new ProductService(repository);
const controller = new ProductController(service);

export const productRoutes = new Elysia({ prefix: "/products" })
	.get(
		"/",
		async ({ query }) => {
			return await controller.getAll(query);
		},
		{
			query: PaginationQuerySchema,
			detail: {
				summary: "Get all products with pagination",
				tags: ["Products"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			return await controller.getById(params.id);
		},
		{
			params: ProductIdSchema,
			detail: {
				summary: "Get product by ID",
				tags: ["Products"],
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await controller.create(body);
		},
		{
			body: CreateProductSchema,
			detail: {
				summary: "Create a new product",
				tags: ["Products"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body }) => {
			return await controller.update(params.id, body);
		},
		{
			params: ProductIdSchema,
			body: UpdateProductSchema,
			detail: {
				summary: "Update a product",
				tags: ["Products"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			return await controller.delete(params.id);
		},
		{
			params: ProductIdSchema,
			detail: {
				summary: "Delete a product",
				tags: ["Products"],
			},
		},
	)
	.post(
		"/:id/images",
		async ({ params, body }) => {
			return await controller.addImages(params.id, body.images);
		},
		{
			params: ProductIdSchema,
			body: AddImagesSchema,
			detail: {
				summary: "Add images to a product",
				tags: ["Products"],
			},
		},
	)
	.delete(
		"/:id/images",
		async ({ params, body }) => {
			return await controller.deleteImage(params.id, body.resolution);
		},
		{
			params: ProductIdSchema,
			body: DeleteImageSchema,
			detail: {
				summary: "Delete an image from a product",
				tags: ["Products"],
			},
		},
	);

import { Elysia, t } from "elysia";
import { ProductRepository } from "@/features/product/product.repository";
import { UserRepository } from "@/features/user/user.repository";
import { PaginationQuerySchema } from "@/shared/types";

import { OrderController } from "./order.controller";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import {
	type CreateOrderInput,
	CreateOrderSchema,
	OrderIdSchema,
	type UpdateOrderInput,
	UpdateOrderSchema,
} from "./order.types";

const userRepository = new UserRepository();
const productRepository = new ProductRepository();
const repository = new OrderRepository();
const service = new OrderService(repository, userRepository, productRepository);
const controller = new OrderController(service);

export const orderRoutes = new Elysia({ prefix: "/orders" })
	.get(
		"/",
		async ({ query }) => {
			return await controller.getAll(query);
		},
		{
			query: PaginationQuerySchema,
			detail: {
				summary: "Get all orders with pagination",
				tags: ["Orders"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			return await controller.getById(params.id);
		},
		{
			params: OrderIdSchema,
			detail: {
				summary: "Get order by ID",
				tags: ["Orders"],
			},
		},
	)
	.get(
		"/user/:userId",
		async ({ params, query }) => {
			return await controller.getByUserId(params.userId, query);
		},
		{
			params: t.Object({
				userId: t.String({ format: "uuid" }),
			}),
			query: PaginationQuerySchema,
			detail: {
				summary: "Get orders by user ID",
				tags: ["Orders"],
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await controller.create(body as CreateOrderInput);
		},
		{
			body: CreateOrderSchema,
			detail: {
				summary: "Create a new order",
				tags: ["Orders"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body }) => {
			return await controller.update(params.id, body as UpdateOrderInput);
		},
		{
			params: OrderIdSchema,
			body: UpdateOrderSchema,
			detail: {
				summary: "Update order status",
				tags: ["Orders"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			return await controller.delete(params.id);
		},
		{
			params: OrderIdSchema,
			detail: {
				summary: "Delete an order",
				tags: ["Orders"],
			},
		},
	);

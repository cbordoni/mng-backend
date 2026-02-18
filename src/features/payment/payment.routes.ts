import { Elysia, t } from "elysia";

import { PaginationQuerySchema } from "@/shared/types";

import { PaymentController } from "./payment.controller";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";
import {
	CreatePaymentSchema,
	PaymentIdSchema,
	UpdatePaymentSchema,
} from "./payment.types";

const repository = new PaymentRepository();
const service = new PaymentService(repository);
const controller = new PaymentController(service);

export const paymentRoutes = new Elysia({ prefix: "/payments" })
	.get(
		"/",
		async ({ query }) => {
			return await controller.getAll(query);
		},
		{
			query: PaginationQuerySchema,
			detail: {
				summary: "Get all payments with pagination",
				tags: ["Payments"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => {
			return await controller.getById(params.id);
		},
		{
			params: PaymentIdSchema,
			detail: {
				summary: "Get payment by ID",
				tags: ["Payments"],
			},
		},
	)
	.get(
		"/order/:orderId",
		async ({ params }) => {
			return await controller.getByOrderId(params.orderId);
		},
		{
			params: t.Object({
				orderId: t.String({ format: "uuid" }),
			}),
			detail: {
				summary: "Get all payments for an order",
				tags: ["Payments"],
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await controller.create(body);
		},
		{
			body: CreatePaymentSchema,
			detail: {
				summary: "Create a new payment",
				tags: ["Payments"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body }) => {
			return await controller.update(params.id, body);
		},
		{
			params: PaymentIdSchema,
			body: UpdatePaymentSchema,
			detail: {
				summary: "Update a payment",
				tags: ["Payments"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			return await controller.delete(params.id);
		},
		{
			params: PaymentIdSchema,
			detail: {
				summary: "Delete a payment",
				tags: ["Payments"],
			},
		},
	);

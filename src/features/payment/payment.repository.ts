import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import { db } from "@/shared/config/database";
import { payments } from "@/shared/config/schema";
import { NotFoundError } from "@/shared/errors";
import { getTableCount, wrapDatabaseOperation } from "@/shared/utils/database";

import type { IPaymentRepository } from "./payment.repository.interface";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payment.types";

export class PaymentRepository implements IPaymentRepository {
	async findAll(page: number, limit: number) {
		return wrapDatabaseOperation(async () => {
			const offset = (page - 1) * limit;

			const [items, total] = await Promise.all([
				db.select().from(payments).limit(limit).offset(offset),
				getTableCount(payments),
			]);

			return { items, total };
		}, "Failed to fetch payments");
	}

	async findById(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.select().from(payments).where(eq(payments.id, id)),
			"Failed to fetch payment",
		);

		return result.andThen(([payment]) => {
			if (!payment) {
				return err(new NotFoundError("Payment", id));
			}

			return ok(payment);
		});
	}

	async findByOrderId(orderId: string) {
		return wrapDatabaseOperation(
			() => db.select().from(payments).where(eq(payments.orderId, orderId)),
			"Failed to fetch payments by order",
		);
	}

	async create(data: CreatePaymentInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.insert(payments)
					.values({
						orderId: data.orderId,
						type: data.type,
						amount: data.amount,
						installments: data.installments,
						transactionId: data.transactionId,
						metadata: data.metadata,
						status: "pending",
					})
					.returning(),
			"Failed to create payment",
		);

		return result.map(([payment]) => payment);
	}

	async update(id: string, data: UpdatePaymentInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(payments)
					.set({
						...data,
						updatedAt: new Date(),
					})
					.where(eq(payments.id, id))
					.returning(),
			"Failed to update payment",
		);

		return result.andThen(([payment]) => {
			if (!payment) {
				return err(new NotFoundError("Payment", id));
			}

			return ok(payment);
		});
	}

	async delete(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.delete(payments).where(eq(payments.id, id)).returning(),
			"Failed to delete payment",
		);

		return result.andThen(([deleted]) => {
			if (!deleted) {
				return err(new NotFoundError("Payment", id));
			}

			return ok(undefined);
		});
	}
}

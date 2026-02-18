import { ok } from "neverthrow";

import type { Payment } from "@/shared/config/schema";
import { BaseInMemoryRepository } from "@/shared/testing/base-in-memory-repository";

import type { IPaymentRepository } from "./payment.repository.interface";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payment.types";

export class MockPaymentRepository
	extends BaseInMemoryRepository<Payment>
	implements IPaymentRepository
{
	protected get entityName(): string {
		return "Payment";
	}

	async findAll(page: number, limit: number) {
		return super.findAll(page, limit);
	}

	async findByOrderId(orderId: string) {
		const payments = this.items.filter(
			(payment) => payment.orderId === orderId,
		);

		return ok(payments);
	}

	async create(data: CreatePaymentInput) {
		const payment: Payment = {
			id: crypto.randomUUID(),
			orderId: data.orderId,
			type: data.type,
			amount: data.amount,
			installments: data.installments ?? null,
			status: "pending",
			transactionId: data.transactionId ?? null,
			metadata: data.metadata ?? null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(payment);

		return ok(payment);
	}

	async update(id: string, data: UpdatePaymentInput) {
		const indexResult = await this.findIndexById(id);

		if (indexResult.isErr()) {
			return indexResult as unknown as ReturnType<IPaymentRepository["update"]>;
		}

		const index = indexResult.value;
		const currentPayment = this.items[index];
		const updated = {
			...currentPayment,
			...data,
			updatedAt: new Date(),
		};

		this.items[index] = updated;

		return ok(updated);
	}

	setPayments(payments: Payment[]) {
		this.setItems(payments);
	}

	clearPayments() {
		this.clearItems();
	}
}

import { BaseController } from "@/shared/http/base-controller";
import type { PaginationQuery } from "@/shared/types";

import type { PaymentService } from "./payment.service";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payment.types";

export class PaymentController extends BaseController {
	constructor(private readonly service: PaymentService) {
		super();
	}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllPayments(page, limit);

		return result.match((paginatedData) => paginatedData, this.handleError);
	}

	async getById(id: string) {
		const result = await this.service.getPaymentById(id);

		return result.match((payment) => ({ data: payment }), this.handleError);
	}

	async getByOrderId(orderId: string) {
		const result = await this.service.getPaymentsByOrderId(orderId);

		return result.match((payments) => ({ data: payments }), this.handleError);
	}

	async create(data: CreatePaymentInput) {
		const result = await this.service.createPayment(data);

		return result.match(
			(payment) => ({ data: payment, status: 201 }),
			this.handleError,
		);
	}

	async update(id: string, data: UpdatePaymentInput) {
		const result = await this.service.updatePayment(id, data);

		return result.match((payment) => ({ data: payment }), this.handleError);
	}

	async delete(id: string) {
		const result = await this.service.deletePayment(id);

		return result.match(() => ({ status: 204 }), this.handleError);
	}
}

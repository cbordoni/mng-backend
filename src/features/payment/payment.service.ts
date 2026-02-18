import { err, ok, type Result } from "neverthrow";

import type { Payment } from "@/shared/config/schema";
import {
	type DatabaseError,
	type NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { toPaginated } from "@/shared/http/to-paginated";
import { logger } from "@/shared/logger";
import type { PaginatedResponse } from "@/shared/types";

import type { IPaymentRepository } from "./payment.repository.interface";
import type {
	CreatePaymentInput,
	PaymentType,
	UpdatePaymentInput,
} from "./payment.types";

export class PaymentService {
	constructor(private readonly repository: IPaymentRepository) {}

	private validatePaymentType(type: string): Result<void, ValidationError> {
		const validTypes: PaymentType[] = [
			"pix",
			"creditCard",
			"debitCard",
			"cash",
			"installmentBooklet",
		];

		if (!validTypes.includes(type as PaymentType)) {
			return err(new ValidationError("Invalid payment type"));
		}

		return ok(undefined);
	}

	private validateAmount(amount: string): Result<void, ValidationError> {
		const numAmount = Number.parseFloat(amount);

		if (Number.isNaN(numAmount) || numAmount <= 0) {
			return err(new ValidationError("Amount must be greater than zero"));
		}

		return ok(undefined);
	}

	private validateInstallments(
		type: PaymentType,
		installments?: number,
	): Result<void, ValidationError> {
		if (type === "creditCard" || type === "installmentBooklet") {
			if (installments && (installments < 1 || installments > 24)) {
				return err(
					new ValidationError("Installments must be between 1 and 24"),
				);
			}
		} else if (installments) {
			return err(
				new ValidationError(
					`Installments not allowed for payment type: ${type}`,
				),
			);
		}

		return ok(undefined);
	}

	async getAllPayments(
		page = 1,
		limit = 10,
	): Promise<Result<PaginatedResponse<Payment>, DatabaseError>> {
		logger.debug("Fetching all payments", { page, limit });
		const result = await this.repository.findAll(page, limit);

		return result.map((data) => {
			logger.info("Payments fetched successfully", {
				count: data.items.length,
				total: data.total,
				page,
			});

			return toPaginated(data, page, limit);
		});
	}

	async getPaymentById(
		id: string,
	): Promise<Result<Payment, NotFoundError | DatabaseError>> {
		logger.debug("Fetching payment by id", { id });
		const result = await this.repository.findById(id);

		if (result.isOk()) {
			logger.info("Payment fetched successfully", { id });
		} else {
			logger.warn("Payment not found", { id });
		}

		return result;
	}

	async getPaymentsByOrderId(
		orderId: string,
	): Promise<Result<Payment[], DatabaseError>> {
		logger.debug("Fetching payments by order id", { orderId });
		const result = await this.repository.findByOrderId(orderId);

		if (result.isOk()) {
			logger.info("Payments by order fetched successfully", {
				orderId,
				count: result.value.length,
			});
		}

		return result;
	}

	async createPayment(
		data: CreatePaymentInput,
	): Promise<Result<Payment, ValidationError | DatabaseError>> {
		logger.debug("Creating payment", {
			type: data.type,
			orderId: data.orderId,
		});

		const typeValidation = this.validatePaymentType(data.type);

		if (typeValidation.isErr()) {
			logger.warn("Payment creation failed: invalid type");
			return err(typeValidation.error);
		}

		const amountValidation = this.validateAmount(data.amount);

		if (amountValidation.isErr()) {
			logger.warn("Payment creation failed: invalid amount");
			return err(amountValidation.error);
		}

		const installmentsValidation = this.validateInstallments(
			data.type,
			data.installments,
		);

		if (installmentsValidation.isErr()) {
			logger.warn("Payment creation failed: invalid installments");
			return err(installmentsValidation.error);
		}

		const result = await this.repository.create(data);

		if (result.isOk()) {
			logger.info("Payment created successfully", { id: result.value.id });
		} else {
			logger.error("Payment creation failed", { error: result.error });
		}

		return result;
	}

	async updatePayment(
		id: string,
		data: UpdatePaymentInput,
	): Promise<Result<Payment, NotFoundError | DatabaseError>> {
		logger.debug("Updating payment", { id });

		const result = await this.repository.update(id, data);

		if (result.isOk()) {
			logger.info("Payment updated successfully", { id });
		} else {
			logger.error("Payment update failed", { id, error: result.error });
		}

		return result;
	}

	async deletePayment(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		logger.debug("Deleting payment", { id });

		const result = await this.repository.delete(id);

		if (result.isOk()) {
			logger.info("Payment deleted successfully", { id });
		} else {
			logger.error("Payment deletion failed", { id, error: result.error });
		}

		return result;
	}
}

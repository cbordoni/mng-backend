import type { Result } from "neverthrow";

import type { Payment } from "@/shared/config/schema";
import type { DatabaseError, NotFoundError } from "@/shared/errors";
import type { PaginatedResult } from "@/shared/types";

import type { CreatePaymentInput, UpdatePaymentInput } from "./payment.types";

export interface IPaymentRepository {
	findAll(
		page: number,
		limit: number,
	): Promise<Result<PaginatedResult<Payment>, DatabaseError>>;

	findById(id: string): Promise<Result<Payment, NotFoundError | DatabaseError>>;

	findByOrderId(orderId: string): Promise<Result<Payment[], DatabaseError>>;

	create(data: CreatePaymentInput): Promise<Result<Payment, DatabaseError>>;

	update(
		id: string,
		data: UpdatePaymentInput,
	): Promise<Result<Payment, NotFoundError | DatabaseError>>;

	delete(id: string): Promise<Result<void, NotFoundError | DatabaseError>>;
}

import type { Result } from "neverthrow";

import type { DomainError } from "@/shared/errors";

import type { Order, UpdateOrderInput } from "./order.types";

export interface IOrderRepository {
	findAll(
		page: number,
		limit: number,
	): Promise<Result<{ data: Order[]; total: number }, DomainError>>;

	findById(id: string): Promise<Result<Order, DomainError>>;

	findByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<Result<{ data: Order[]; total: number }, DomainError>>;

	createWithItems(
		orderId: string,
		userId: string,
		total: number,
		items: Array<{
			id: string;
			productId: string;
			productName: string;
			quantity: number;
			priceAtOrder: number;
			subtotal: number;
		}>,
	): Promise<Result<Order, DomainError>>;

	update(
		id: string,
		data: UpdateOrderInput,
	): Promise<Result<Order, DomainError>>;

	delete(id: string): Promise<Result<void, DomainError>>;
}

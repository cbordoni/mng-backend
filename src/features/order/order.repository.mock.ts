import { err, ok } from "neverthrow";

import { NotFoundError } from "@/shared/errors";

import type { IOrderRepository } from "./order.repository.interface";
import type { Order, UpdateOrderInput } from "./order.types";

export class OrderRepositoryMock implements IOrderRepository {
	private data: Order[] = [];
	async findAll(page: number, limit: number) {
		const offset = (page - 1) * limit;
		const data = this.data.slice(offset, offset + limit);
		const total = this.data.length;

		return ok({ data, total });
	}

	async findById(id: string) {
		const order = this.data.find((o) => o.id === id);

		if (!order) {
			return err(new NotFoundError(`Order with id ${id} not found`));
		}

		return ok(order);
	}

	async findByUserId(userId: string, page: number, limit: number) {
		const userOrders = this.data.filter((o) => o.userId === userId);
		const offset = (page - 1) * limit;
		const data = userOrders.slice(offset, offset + limit);
		const total = userOrders.length;

		return ok({ data, total });
	}

	async createWithItems(
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
	) {
		const order: Order = {
			id: orderId,
			userId,
			items: items.map((item) => ({ ...item, orderId })),
			total,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.data.push(order);
		return ok(order);
	}

	async update(id: string, data: UpdateOrderInput) {
		const index = this.data.findIndex((o) => o.id === id);

		if (index === -1) {
			return err(new NotFoundError(`Order with id ${id} not found`));
		}

		this.data[index] = {
			...this.data[index],
			...data,
			updatedAt: new Date(),
		};

		return ok(this.data[index]);
	}

	async delete(id: string) {
		const index = this.data.findIndex((o) => o.id === id);

		if (index === -1) {
			return err(new NotFoundError(`Order with id ${id} not found`));
		}

		this.data.splice(index, 1);

		return ok(undefined);
	}

	// Helper method to directly add orders for testing
	addOrder(order: Order) {
		this.data.push(order);
	}
}

import { BaseController } from "@/shared/http/base-controller";
import type { PaginationQuery } from "@/shared/types";

import type { OrderService } from "./order.service";
import type { CreateOrderInput, UpdateOrderInput } from "./order.types";

export class OrderController extends BaseController {
	constructor(private readonly service: OrderService) {
		super();
	}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllOrders(page, limit);

		return result.mapErr(this.handleError);
	}

	async getById(id: string) {
		const result = await this.service.getOrderById(id);

		return result.match((order) => ({ data: order }), this.handleError);
	}

	async getByUserId(userId: string, query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getOrdersByUserId(userId, page, limit);

		return result.mapErr(this.handleError);
	}

	async create(data: CreateOrderInput) {
		const result = await this.service.createOrder(data);

		return result.match(
			(order) => ({ data: order, status: 201 }),
			this.handleError,
		);
	}

	async update(id: string, data: UpdateOrderInput) {
		const result = await this.service.updateOrder(id, data);

		return result.match((order) => ({ data: order }), this.handleError);
	}

	async delete(id: string) {
		const result = await this.service.deleteOrder(id);

		return result.match(() => ({ status: 204 }), this.handleError);
	}
}

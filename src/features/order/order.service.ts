import { err, type Result } from "neverthrow";

import type { IProductRepository } from "@/features/product/product.repository.interface";
import type { IUserRepository } from "@/features/user/user.repository.interface";
import {
	type DomainError,
	NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { toPaginated } from "@/shared/http/to-paginated";
import type { PaginatedResponse } from "@/shared/types";
import type { IOrderRepository } from "./order.repository.interface";
import type {
	CreateOrderInput,
	Order,
	OrderItem,
	UpdateOrderInput,
} from "./order.types";

export class OrderService {
	constructor(
		private readonly repository: IOrderRepository,
		private readonly userRepository: IUserRepository,
		private readonly productRepository: IProductRepository,
	) {}

	async getAllOrders(
		page: number,
		limit: number,
	): Promise<Result<PaginatedResponse<Order>, DomainError>> {
		const result = await this.repository.findAll(page, limit);

		return result.map((data) =>
			toPaginated({ items: data.data, total: data.total }, page, limit),
		);
	}

	async getOrderById(id: string): Promise<Result<Order, DomainError>> {
		return await this.repository.findById(id);
	}

	async getOrdersByUserId(
		userId: string,
		page: number,
		limit: number,
	): Promise<Result<PaginatedResponse<Order>, DomainError>> {
		const result = await this.repository.findByUserId(userId, page, limit);

		return result.map((data) =>
			toPaginated({ items: data.data, total: data.total }, page, limit),
		);
	}

	async createOrder(
		data: CreateOrderInput,
	): Promise<Result<Order, DomainError>> {
		// Validate items array
		if (!data.items || data.items.length === 0) {
			return err(new ValidationError("Order must have at least one item"));
		}

		// Validate user exists
		const userExistsResult = await this.userRepository.exists(data.userId);

		if (userExistsResult.isErr()) {
			return err(userExistsResult.error);
		}

		if (!userExistsResult.value) {
			return err(new NotFoundError(`User with id ${data.userId} not found`));
		}

		// Fetch products and validate they exist
		const productIds = data.items.map((item) => item.productId);
		const productsResult = await this.productRepository.findByIds(productIds);

		if (productsResult.isErr()) {
			return err(productsResult.error);
		}

		const products = productsResult.value;
		const productsMap = new Map(products.map((p) => [p.id, p]));

		// Validate all products were found
		if (products.length !== productIds.length) {
			const foundIds = new Set(products.map((p) => p.id));
			const missingIds = productIds.filter((id) => !foundIds.has(id));
			return err(
				new NotFoundError(`Products not found: ${missingIds.join(", ")}`),
			);
		}

		// Calculate total and prepare order items
		const orderId = crypto.randomUUID();
		let total = 0;
		const items: OrderItem[] = [];

		for (const item of data.items) {
			const product = productsMap.get(item.productId);

			if (!product) {
				return err(
					new NotFoundError(`Product with id ${item.productId} not found`),
				);
			}

			if (item.quantity <= 0) {
				return err(
					new ValidationError(
						`Quantity must be greater than 0 for product ${product.name}`,
					),
				);
			}

			const priceAtOrder = Number(product.price);
			const subtotal = priceAtOrder * item.quantity;
			total += subtotal;

			const orderItem: OrderItem = {
				id: crypto.randomUUID(),
				orderId,
				productId: item.productId,
				productName: product.name,
				quantity: item.quantity,
				priceAtOrder,
				subtotal,
			};

			items.push(orderItem);
		}

		// Create order with items via repository
		return await this.repository.createWithItems(
			orderId,
			data.userId,
			total,
			items,
		);
	}

	async updateOrder(
		id: string,
		data: UpdateOrderInput,
	): Promise<Result<Order, DomainError>> {
		// Validate status transition if provided
		if (data.status) {
			const validStatuses = [
				"pending",
				"confirmed",
				"shipped",
				"delivered",
				"cancelled",
			];

			if (!validStatuses.includes(data.status)) {
				return err(new ValidationError(`Invalid order status: ${data.status}`));
			}
		}

		return await this.repository.update(id, data);
	}

	async deleteOrder(id: string): Promise<Result<void, DomainError>> {
		// Check if order exists first
		const orderResult = await this.repository.findById(id);

		if (orderResult.isErr()) {
			return err(orderResult.error);
		}

		// Only allow deletion of pending or cancelled orders
		const order = orderResult.value;

		if (order.status !== "pending" && order.status !== "cancelled") {
			return err(
				new ValidationError(
					`Cannot delete order with status ${order.status}. Only pending or cancelled orders can be deleted.`,
				),
			);
		}

		return await this.repository.delete(id);
	}
}

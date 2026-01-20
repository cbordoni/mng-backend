import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import { db } from "@/shared/config/database";
import {
	orderItems as orderItemsTable,
	orders as ordersTable,
} from "@/shared/config/schema";
import { NotFoundError } from "@/shared/errors";
import { getTableCount, wrapDatabaseOperation } from "@/shared/utils/database";

import type { IOrderRepository } from "./order.repository.interface";
import type { Order, UpdateOrderInput } from "./order.types";

export class OrderRepository implements IOrderRepository {
	private formatOrderItem(item: typeof orderItemsTable.$inferSelect) {
		return {
			...item,
			priceAtOrder: Number(item.priceAtOrder),
			subtotal: Number(item.subtotal),
		};
	}

	private async fetchOrderItems(orderId: string) {
		const items = await db
			.select()
			.from(orderItemsTable)
			.where(eq(orderItemsTable.orderId, orderId));

		return items.map((item) => this.formatOrderItem(item));
	}

	private async buildOrderWithItems(
		orderData: typeof ordersTable.$inferSelect,
	): Promise<Order> {
		const items = await this.fetchOrderItems(orderData.id);

		return {
			...orderData,
			total: Number(orderData.total),
			items,
		};
	}

	async findAll(page: number, limit: number) {
		const offset = (page - 1) * limit;

		const result = await wrapDatabaseOperation(async () => {
			const [ordersData, total] = await Promise.all([
				db.select().from(ordersTable).limit(limit).offset(offset),
				getTableCount(ordersTable),
			]);

			const ordersWithItems = await Promise.all(
				ordersData.map((order) => this.buildOrderWithItems(order)),
			);

			return { data: ordersWithItems, total };
		}, "Failed to fetch orders");

		return result;
	}

	async findById(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.select().from(ordersTable).where(eq(ordersTable.id, id)),
			"Failed to fetch order",
		);

		if (result.isErr()) {
			return err(result.error);
		}

		const [orderData] = result.value;

		if (!orderData) {
			return err(new NotFoundError(`Order with id ${id} not found`));
		}

		const order = await this.buildOrderWithItems(orderData);

		return ok(order);
	}

	async findByUserId(userId: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		const result = await wrapDatabaseOperation(async () => {
			const [ordersData, total] = await Promise.all([
				db
					.select()
					.from(ordersTable)
					.where(eq(ordersTable.userId, userId))
					.limit(limit)
					.offset(offset),
				getTableCount(ordersTable, eq(ordersTable.userId, userId)),
			]);

			const ordersWithItems = await Promise.all(
				ordersData.map((order) => this.buildOrderWithItems(order)),
			);

			return { data: ordersWithItems, total };
		}, "Failed to fetch orders for user");

		return result;
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
		const result = await wrapDatabaseOperation(async () => {
			// Insert order
			const [orderResult] = await db
				.insert(ordersTable)
				.values({
					id: orderId,
					userId,
					total: total.toString(),
					status: "pending",
				})
				.returning();

			// Insert order items
			await db.insert(orderItemsTable).values(
				items.map((item) => ({
					id: item.id,
					orderId,
					productId: item.productId,
					productName: item.productName,
					quantity: item.quantity,
					priceAtOrder: item.priceAtOrder.toString(),
					subtotal: item.subtotal.toString(),
				})),
			);

			const order: Order = {
				...orderResult,
				total,
				items: items.map((item) => ({ ...item, orderId })),
			};

			return order;
		}, "Failed to create order");

		return result;
	}

	async update(id: string, data: UpdateOrderInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(ordersTable)
					.set({
						...data,
						updatedAt: new Date(),
					})
					.where(eq(ordersTable.id, id))
					.returning(),
			"Failed to update order",
		);

		if (result.isErr()) {
			return err(result.error);
		}

		const [updatedOrder] = result.value;

		if (!updatedOrder) {
			return err(new NotFoundError(`Order with id ${id} not found`));
		}

		const order = await this.buildOrderWithItems(updatedOrder);

		return ok(order);
	}

	async delete(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.delete(ordersTable).where(eq(ordersTable.id, id)).returning(),
			"Failed to delete order",
		);

		return result.andThen(([deleted]) => {
			if (!deleted) {
				return err(new NotFoundError(`Order with id ${id} not found`));
			}

			return ok(undefined);
		});
	}
}

import { beforeEach, describe, expect, test } from "bun:test";

import { MockProductRepository } from "@/features/product/product.repository.mock";
import { MockUserRepository } from "@/features/user/user.repository.mock";

import { OrderRepositoryMock } from "./order.repository.mock";
import { OrderService } from "./order.service";
import type { Order } from "./order.types";

describe("OrderService", () => {
	let service: OrderService;
	let repository: OrderRepositoryMock;
	let userRepository: MockUserRepository;
	let productRepository: MockProductRepository;

	beforeEach(() => {
		repository = new OrderRepositoryMock();
		userRepository = new MockUserRepository();
		productRepository = new MockProductRepository();
		service = new OrderService(repository, userRepository, productRepository);
	});

	describe("getAllOrders", () => {
		test("should return paginated orders", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [
					{
						id: "item-1",
						orderId: "order-1",
						productId: "product-1",
						productName: "Test Product",
						quantity: 2,
						priceAtOrder: 100,
						subtotal: 200,
					},
				],
				total: 200,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.getAllOrders(1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.data).toHaveLength(1);
				expect(result.value.meta.total).toBe(1);
			}
		});
	});

	describe("getOrderById", () => {
		test("should return order when found", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.getOrderById("order-1");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.id).toBe("order-1");
			}
		});

		test("should return error when order not found", async () => {
			const result = await service.getOrderById("non-existent");

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.code).toBe("NOT_FOUND");
			}
		});
	});

	describe("getOrdersByUserId", () => {
		test("should return orders for specific user", async () => {
			const order1: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const order2: Order = {
				id: "order-2",
				userId: "user-2",
				items: [],
				total: 200,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(order1);
			repository.addOrder(order2);

			const result = await service.getOrdersByUserId("user-1", 1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.data).toHaveLength(1);
				expect(result.value.data[0].userId).toBe("user-1");
			}
		});
	});

	describe("updateOrder", () => {
		test("should update order status", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.updateOrder("order-1", {
				status: "confirmed",
			});

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.status).toBe("confirmed");
			}
		});

		test("should reject invalid status", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.updateOrder("order-1", {
				// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
				status: "invalid" as any,
			});

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.code).toBe("VALIDATION_ERROR");
			}
		});
	});

	describe("deleteOrder", () => {
		test("should delete pending order", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "pending",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.deleteOrder("order-1");

			expect(result.isOk()).toBe(true);
		});

		test("should not delete confirmed order", async () => {
			const mockOrder: Order = {
				id: "order-1",
				userId: "user-1",
				items: [],
				total: 100,
				status: "confirmed",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			repository.addOrder(mockOrder);

			const result = await service.deleteOrder("order-1");

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.code).toBe("VALIDATION_ERROR");
			}
		});
	});
});

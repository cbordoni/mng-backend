import { beforeEach, describe, expect, it } from "bun:test";

import { ValidationError } from "@/shared/errors";

import { MockPaymentRepository } from "./payment.repository.mock";
import { PaymentService } from "./payment.service";
import type { CreatePaymentInput, UpdatePaymentInput } from "./payment.types";

describe("PaymentService", () => {
	let paymentService: PaymentService;
	let mockRepository: MockPaymentRepository;

	beforeEach(() => {
		mockRepository = new MockPaymentRepository();
		paymentService = new PaymentService(mockRepository);
	});

	describe("getAllPayments", () => {
		it("should return paginated payments successfully", async () => {
			const mockPayments = [
				{
					id: "1",
					orderId: "order-1",
					type: "pix" as const,
					amount: "100.00",
					status: "completed" as const,
					installments: null,
					transactionId: "txn-1",
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "2",
					orderId: "order-2",
					type: "creditCard" as const,
					amount: "200.00",
					status: "pending" as const,
					installments: 3,
					transactionId: "txn-2",
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			mockRepository.setPayments(mockPayments);

			const result = await paymentService.getAllPayments(1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const response = result.value;
				expect(response.data).toHaveLength(2);
				expect(response.meta.page).toBe(1);
				expect(response.meta.limit).toBe(10);
				expect(response.meta.total).toBe(2);
				expect(response.meta.totalPages).toBe(1);
			}
		});

		it("should handle pagination correctly", async () => {
			const mockPayments = Array.from({ length: 25 }, (_, i) => ({
				id: `${i + 1}`,
				orderId: `order-${i + 1}`,
				type: "cash" as const,
				amount: "50.00",
				status: "completed" as const,
				installments: null,
				transactionId: null,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			mockRepository.setPayments(mockPayments);

			const resultPage1 = await paymentService.getAllPayments(1, 10);
			const resultPage2 = await paymentService.getAllPayments(2, 10);

			expect(resultPage1.isOk()).toBe(true);
			expect(resultPage2.isOk()).toBe(true);

			if (resultPage1.isOk() && resultPage2.isOk()) {
				expect(resultPage1.value.data).toHaveLength(10);
				expect(resultPage2.value.data).toHaveLength(10);
				expect(resultPage1.value.meta.totalPages).toBe(3);
			}
		});

		it("should return empty array when no payments exist", async () => {
			mockRepository.clearPayments();

			const result = await paymentService.getAllPayments(1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.data).toHaveLength(0);
				expect(result.value.meta.total).toBe(0);
			}
		});
	});

	describe("getPaymentById", () => {
		it("should return payment when found", async () => {
			const mockPayment = {
				id: "1",
				orderId: "order-1",
				type: "pix" as const,
				amount: "100.00",
				status: "completed" as const,
				installments: null,
				transactionId: "txn-1",
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setPayments([mockPayment]);

			const result = await paymentService.getPaymentById("1");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.id).toBe("1");
				expect(result.value.type).toBe("pix");
			}
		});

		it("should return error when payment not found", async () => {
			mockRepository.clearPayments();

			const result = await paymentService.getPaymentById("non-existent");

			expect(result.isErr()).toBe(true);
		});
	});

	describe("getPaymentsByOrderId", () => {
		it("should return all payments for an order", async () => {
			const mockPayments = [
				{
					id: "1",
					orderId: "order-1",
					type: "pix" as const,
					amount: "100.00",
					status: "completed" as const,
					installments: null,
					transactionId: "txn-1",
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "2",
					orderId: "order-1",
					type: "creditCard" as const,
					amount: "50.00",
					status: "pending" as const,
					installments: 2,
					transactionId: "txn-2",
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "3",
					orderId: "order-2",
					type: "cash" as const,
					amount: "75.00",
					status: "completed" as const,
					installments: null,
					transactionId: null,
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			mockRepository.setPayments(mockPayments);

			const result = await paymentService.getPaymentsByOrderId("order-1");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value).toHaveLength(2);
				expect(result.value.every((p) => p.orderId === "order-1")).toBe(true);
			}
		});

		it("should return empty array when no payments for order", async () => {
			mockRepository.clearPayments();

			const result = await paymentService.getPaymentsByOrderId("order-1");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value).toHaveLength(0);
			}
		});
	});

	describe("createPayment", () => {
		it("should create payment successfully with valid data", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "pix",
				amount: "100.00",
			};

			const result = await paymentService.createPayment(input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.orderId).toBe("order-1");
				expect(result.value.type).toBe("pix");
				expect(result.value.amount).toBe("100.00");
				expect(result.value.status).toBe("pending");
			}
		});

		it("should create credit card payment with installments", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "creditCard",
				amount: "300.00",
				installments: 3,
			};

			const result = await paymentService.createPayment(input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.type).toBe("creditCard");
				expect(result.value.installments).toBe(3);
			}
		});

		it("should create installment booklet payment with installments", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "installmentBooklet",
				amount: "500.00",
				installments: 10,
			};

			const result = await paymentService.createPayment(input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.type).toBe("installmentBooklet");
				expect(result.value.installments).toBe(10);
			}
		});

		it("should fail with invalid payment type", async () => {
			const input = {
				orderId: "order-1",
				type: "invalid",
				amount: "100.00",
			} as unknown as CreatePaymentInput;

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toContain("Invalid payment type");
			}
		});

		it("should fail with invalid amount (zero)", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "pix",
				amount: "0",
			};

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toContain("greater than zero");
			}
		});

		it("should fail with invalid amount (negative)", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "pix",
				amount: "-50.00",
			};

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
			}
		});

		it("should fail when installments provided for pix", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "pix",
				amount: "100.00",
				installments: 3,
			};

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toContain("not allowed");
			}
		});

		it("should fail when installments provided for cash", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "cash",
				amount: "100.00",
				installments: 2,
			};

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
			}
		});

		it("should fail when installments exceed maximum (24)", async () => {
			const input: CreatePaymentInput = {
				orderId: "order-1",
				type: "creditCard",
				amount: "1000.00",
				installments: 25,
			};

			const result = await paymentService.createPayment(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toContain("between 1 and 24");
			}
		});
	});

	describe("updatePayment", () => {
		it("should update payment successfully", async () => {
			const mockPayment = {
				id: "1",
				orderId: "order-1",
				type: "pix" as const,
				amount: "100.00",
				status: "pending" as const,
				installments: null,
				transactionId: null,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setPayments([mockPayment]);

			const updateData: UpdatePaymentInput = {
				status: "completed",
				transactionId: "txn-123",
			};

			const result = await paymentService.updatePayment("1", updateData);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.status).toBe("completed");
				expect(result.value.transactionId).toBe("txn-123");
			}
		});

		it("should return error when payment not found", async () => {
			mockRepository.clearPayments();

			const result = await paymentService.updatePayment("non-existent", {
				status: "completed",
			});

			expect(result.isErr()).toBe(true);
		});
	});

	describe("deletePayment", () => {
		it("should delete payment successfully", async () => {
			const mockPayment = {
				id: "1",
				orderId: "order-1",
				type: "pix" as const,
				amount: "100.00",
				status: "completed" as const,
				installments: null,
				transactionId: "txn-1",
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setPayments([mockPayment]);

			const result = await paymentService.deletePayment("1");

			expect(result.isOk()).toBe(true);

			const findResult = await mockRepository.findById("1");
			expect(findResult.isErr()).toBe(true);
		});

		it("should return error when payment not found", async () => {
			mockRepository.clearPayments();

			const result = await paymentService.deletePayment("non-existent");

			expect(result.isErr()).toBe(true);
		});
	});
});

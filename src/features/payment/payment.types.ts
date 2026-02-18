import { t } from "elysia";

export const PaymentTypeEnum = t.Union([
	t.Literal("pix"),
	t.Literal("creditCard"),
	t.Literal("debitCard"),
	t.Literal("cash"),
	t.Literal("installmentBooklet"),
]);

export const CreatePaymentSchema = t.Object({
	orderId: t.String({ format: "uuid" }),
	type: PaymentTypeEnum,
	amount: t.String({ pattern: "^\\d+(\\.\\d{1,2})?$" }),
	installments: t.Optional(t.Number({ minimum: 1, maximum: 24 })),
	transactionId: t.Optional(t.String()),
	metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const UpdatePaymentSchema = t.Object({
	status: t.Optional(
		t.Union([
			t.Literal("pending"),
			t.Literal("processing"),
			t.Literal("completed"),
			t.Literal("failed"),
			t.Literal("cancelled"),
			t.Literal("refunded"),
		]),
	),
	transactionId: t.Optional(t.String()),
	metadata: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const PaymentIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export type PaymentType =
	| "pix"
	| "creditCard"
	| "debitCard"
	| "cash"
	| "installmentBooklet";

export type PaymentStatus =
	| "pending"
	| "processing"
	| "completed"
	| "failed"
	| "cancelled"
	| "refunded";

export type CreatePaymentInput = typeof CreatePaymentSchema.static;
export type UpdatePaymentInput = typeof UpdatePaymentSchema.static;
export type PaymentIdInput = typeof PaymentIdSchema.static;

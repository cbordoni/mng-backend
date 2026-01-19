import { t } from "elysia";

export const CreateUserSchema = t.Object({
	name: t.String({ minLength: 1 }),
	email: t.String({ format: "email" }),
	cellphone: t.String({ minLength: 10, maxLength: 15 }),
});

export const UpdateUserSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	email: t.Optional(t.String({ format: "email" })),
	cellphone: t.Optional(t.String({ minLength: 10, maxLength: 15 })),
});

export const UserIdSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export type CreateUserInput = typeof CreateUserSchema.static;
export type UpdateUserInput = typeof UpdateUserSchema.static;
export type UserIdInput = typeof UserIdSchema.static;

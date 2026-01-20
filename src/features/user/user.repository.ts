import { count, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import { db } from "@/shared/config/database";
import { users } from "@/shared/config/schema";
import { NotFoundError } from "@/shared/errors";
import { wrapDatabaseOperation } from "@/shared/utils/database";

import type { IUserRepository } from "./user.repository.interface";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class UserRepository implements IUserRepository {
	async findAll(page: number, limit: number) {
		return wrapDatabaseOperation(async () => {
			const offset = (page - 1) * limit;

			const [items, [{ value: total }]] = await Promise.all([
				db.select().from(users).limit(limit).offset(offset),
				db.select({ value: count() }).from(users),
			]);

			return { items, total };
		}, "Failed to fetch users");
	}

	async findById(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.select().from(users).where(eq(users.id, id)),
			"Failed to fetch user",
		);

		return result.andThen(([user]) => {
			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(user);
		});
	}

	async findByEmail(email: string) {
		const result = await wrapDatabaseOperation(
			() => db.select().from(users).where(eq(users.email, email)),
			"Failed to fetch user by email",
		);

		return result.andThen(([user]) => {
			if (!user) {
				return err(new NotFoundError("User", email));
			}

			return ok(user);
		});
	}

	async create(data: CreateUserInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.insert(users)
					.values({
						name: data.name,
						email: data.email,
						cellphone: data.cellphone,
					})
					.returning(),
			"Failed to create user",
		);

		return result.map(([user]) => user);
	}

	async update(id: string, data: UpdateUserInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(users)
					.set({
						...data,
						updatedAt: new Date(),
					})
					.where(eq(users.id, id))
					.returning(),
			"Failed to update user",
		);

		return result.andThen(([user]) => {
			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(user);
		});
	}

	async delete(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.delete(users).where(eq(users.id, id)).returning(),
			"Failed to delete user",
		);

		return result.andThen(([user]) => {
			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(undefined);
		});
	}
}

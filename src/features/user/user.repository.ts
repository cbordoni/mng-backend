import { count, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import type { User } from "@/shared/config/schema";
import { users } from "@/shared/config/schema";
import { DatabaseError, NotFoundError } from "@/shared/errors";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class UserRepository {
	async findAll(
		page: number,
		limit: number,
	): Promise<Result<{ users: User[]; total: number }, DatabaseError>> {
		try {
			const offset = (page - 1) * limit;

			const [allUsers, [{ value: total }]] = await Promise.all([
				db.select().from(users).limit(limit).offset(offset),
				db.select({ value: count() }).from(users),
			]);

			return ok({ users: allUsers, total });
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async findById(
		id: string,
	): Promise<Result<User, NotFoundError | DatabaseError>> {
		try {
			const [user] = await db.select().from(users).where(eq(users.id, id));

			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(user);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async create(data: CreateUserInput): Promise<Result<User, DatabaseError>> {
		try {
			const [user] = await db
				.insert(users)
				.values({
					name: data.name,
					email: data.email,
					cellphone: data.cellphone,
				})
				.returning();

			return ok(user);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async update(
		id: string,
		data: UpdateUserInput,
	): Promise<Result<User, NotFoundError | DatabaseError>> {
		try {
			const [user] = await db
				.update(users)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(users.id, id))
				.returning();

			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(user);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async delete(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		try {
			const [user] = await db.delete(users).where(eq(users.id, id)).returning();

			if (!user) {
				return err(new NotFoundError("User", id));
			}

			return ok(undefined);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}
}

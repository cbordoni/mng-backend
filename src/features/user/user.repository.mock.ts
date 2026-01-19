import { err, ok, type Result } from "neverthrow";

import type { User } from "@/shared/config/schema";
import type { DatabaseError, NotFoundError } from "@/shared/errors";

import type { IUserRepository } from "./user.repository.interface";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class MockUserRepository implements IUserRepository {
	private users: User[] = [];

	async findAll(
		page: number,
		limit: number,
	): Promise<Result<{ users: User[]; total: number }, DatabaseError>> {
		const offset = (page - 1) * limit;
		const paginatedUsers = this.users.slice(offset, offset + limit);
		return ok({ users: paginatedUsers, total: this.users.length });
	}

	async findById(
		id: string,
	): Promise<Result<User, NotFoundError | DatabaseError>> {
		const user = this.users.find((u) => u.id === id);
		if (!user) {
			return err({
				name: "NotFoundError",
				message: `User with id ${id} not found`,
			} as NotFoundError);
		}
		return ok(user);
	}

	async create(data: CreateUserInput): Promise<Result<User, DatabaseError>> {
		const user: User = {
			id: crypto.randomUUID(),
			name: data.name,
			email: data.email,
			cellphone: data.cellphone,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.users.push(user);
		return ok(user);
	}

	async update(
		id: string,
		data: UpdateUserInput,
	): Promise<Result<User, NotFoundError | DatabaseError>> {
		const index = this.users.findIndex((u) => u.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `User with id ${id} not found`,
			} as NotFoundError);
		}

		const currentUser = this.users[index];
		const updated: User = {
			...currentUser,
			...data,
			updatedAt: new Date(),
		};

		this.users[index] = updated;
		return ok(updated);
	}

	async delete(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		const index = this.users.findIndex((u) => u.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `User with id ${id} not found`,
			} as NotFoundError);
		}
		this.users.splice(index, 1);
		return ok(undefined);
	}

	// Helper methods for testing
	setUsers(users: User[]) {
		this.users = users;
	}

	clearUsers() {
		this.users = [];
	}
}

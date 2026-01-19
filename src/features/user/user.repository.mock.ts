import { ok, type Result } from "neverthrow";

import type { User } from "@/shared/config/schema";
import type { NotFoundError } from "@/shared/errors";
import { BaseInMemoryRepository } from "@/shared/testing/base-in-memory-repository";

import type { IUserRepository } from "./user.repository.interface";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class MockUserRepository
	extends BaseInMemoryRepository<User>
	implements IUserRepository
{
	protected get entityName(): string {
		return "User";
	}

	async findAll(page: number, limit: number) {
		return super.findAll(page, limit);
	}

	async create(data: CreateUserInput) {
		const user: User = {
			id: crypto.randomUUID(),
			name: data.name,
			email: data.email,
			cellphone: data.cellphone,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(user);

		return ok(user);
	}

	async update(id: string, data: UpdateUserInput) {
		const indexResult = await this.findIndexById(id);
		if (indexResult.isErr()) {
			return indexResult as Result<never, NotFoundError>;
		}

		const index = indexResult.value;
		const currentUser = this.items[index];
		const updated: User = {
			...currentUser,
			...data,
			updatedAt: new Date(),
		};

		this.items[index] = updated;
		return ok(updated);
	}

	// Alias helper methods for testing
	setUsers(users: User[]) {
		this.setItems(users);
	}

	clearUsers() {
		this.clearItems();
	}
}

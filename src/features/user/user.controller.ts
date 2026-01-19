import { BaseController } from "@/shared/http/base-controller";
import type { PaginationQuery } from "@/shared/types";

import type { UserService } from "./user.service";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class UserController extends BaseController {
	constructor(private readonly service: UserService) {
		super();
	}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllUsers(page, limit);

		return result.match(
			(paginatedUsers) => paginatedUsers,
			(error) => this.handleError(error),
		);
	}

	async getById(id: string) {
		const result = await this.service.getUserById(id);

		return result.match(
			(user) => ({ data: user }),
			(error) => this.handleError(error),
		);
	}

	async create(data: CreateUserInput) {
		const result = await this.service.createUser(data);

		return result.match(
			(user) => ({ data: user, status: 201 }),
			(error) => this.handleError(error),
		);
	}

	async update(id: string, data: UpdateUserInput) {
		const result = await this.service.updateUser(id, data);

		return result.match(
			(user) => ({ data: user }),
			(error) => this.handleError(error),
		);
	}

	async delete(id: string) {
		const result = await this.service.deleteUser(id);

		return result.match(
			() => ({ status: 204 }),
			(error) => this.handleError(error),
		);
	}
}

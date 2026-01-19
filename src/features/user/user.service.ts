import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { User } from "@/shared/config/schema";
import {
	type DatabaseError,
	type NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { logger } from "@/shared/logger";
import type { PaginatedResponse } from "@/shared/types";

import type { IUserRepository } from "./user.repository.interface";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export class UserService {
	constructor(private readonly repository: IUserRepository) {}

	async getAllUsers(
		page = 1,
		limit = 10,
	): Promise<Result<PaginatedResponse<User>, DatabaseError>> {
		logger.debug("Fetching all users", { page, limit });
		const result = await this.repository.findAll(page, limit);

		return result.map((data) => {
			logger.info("Users fetched successfully", {
				count: data.users.length,
				total: data.total,
				page,
			});

			return {
				data: data.users,
				meta: {
					page,
					limit,
					total: data.total,
					totalPages: Math.ceil(data.total / limit),
				},
			};
		});
	}

	async getUserById(
		id: string,
	): Promise<Result<User, NotFoundError | DatabaseError>> {
		logger.debug("Fetching user by id", { id });
		const result = await this.repository.findById(id);

		if (result.isOk()) {
			logger.info("User fetched successfully", { id });
		} else {
			logger.warn("User not found", { id });
		}

		return result;
	}

	async createUser(
		data: CreateUserInput,
	): Promise<Result<User, ValidationError | DatabaseError>> {
		logger.debug("Creating user", { email: data.email });

		// Business logic validations
		if (data.name.trim().length === 0) {
			logger.warn("User creation failed: empty name");
			return err(new ValidationError("Name cannot be empty"));
		}

		if (data.cellphone.replace(/\D/g, "").length < 10) {
			logger.warn("User creation failed: invalid cellphone");
			return err(new ValidationError("Invalid cellphone number"));
		}

		const result = await this.repository.create(data);

		return result.match(
			(user) => {
				logger.info("User created successfully", {
					id: user.id,
					email: user.email,
				});

				return ok(user);
			},
			(error) => err(error),
		);
	}

	async updateUser(
		id: string,
		data: UpdateUserInput,
	): Promise<Result<User, ValidationError | NotFoundError | DatabaseError>> {
		logger.debug("Updating user", { id, fields: Object.keys(data) });

		// Business logic validations
		if (data.name !== undefined && data.name.trim().length === 0) {
			logger.warn("User update failed: empty name", { id });
			return err(new ValidationError("Name cannot be empty"));
		}

		if (
			data.cellphone !== undefined &&
			data.cellphone.replace(/\D/g, "").length < 10
		) {
			logger.warn("User update failed: invalid cellphone", { id });
			return err(new ValidationError("Invalid cellphone number"));
		}

		const result = await this.repository.update(id, data);

		return result.match(
			(user) => {
				logger.info("User updated successfully", { id });
				return ok(user);
			},
			(error) => err(error),
		);
	}

	async deleteUser(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		logger.debug("Deleting user", { id });

		const result = await this.repository.delete(id);

		return result.match(
			() => {
				logger.info("User deleted successfully", { id });
				return ok(undefined);
			},
			(error) => err(error),
		);
	}
}

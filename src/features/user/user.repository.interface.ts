import type { Result } from "neverthrow";

import type { User } from "@/shared/config/schema";
import type { DatabaseError, NotFoundError } from "@/shared/errors";

import type { CreateUserInput, UpdateUserInput } from "./user.types";

export interface IUserRepository {
	findAll(
		page: number,
		limit: number,
	): Promise<Result<{ users: User[]; total: number }, DatabaseError>>;

	findById(id: string): Promise<Result<User, NotFoundError | DatabaseError>>;

	create(data: CreateUserInput): Promise<Result<User, DatabaseError>>;

	update(
		id: string,
		data: UpdateUserInput,
	): Promise<Result<User, NotFoundError | DatabaseError>>;

	delete(id: string): Promise<Result<void, NotFoundError | DatabaseError>>;
}

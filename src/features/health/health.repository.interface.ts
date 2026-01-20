import type { Result } from "neverthrow";

import type { DomainError } from "@/shared/errors";

export interface IHealthRepository {
	checkDatabaseConnection(): Promise<Result<number, DomainError>>;
}

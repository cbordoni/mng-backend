import { err, ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import { DatabaseError, type DomainError } from "@/shared/errors";

import type { IHealthRepository } from "./health.repository.interface";

export class HealthRepository implements IHealthRepository {
	async checkDatabaseConnection(): Promise<Result<number, DomainError>> {
		const startTime = performance.now();

		// Simple query to check database connectivity
		return await db.execute("SELECT 1").then(
			() => ok(Math.round(performance.now() - startTime)),
			(e) =>
				err(
					new DatabaseError(
						e instanceof Error ? e.message : "Unknown database error",
					),
				),
		);
	}
}

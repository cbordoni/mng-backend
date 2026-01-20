import { err, ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import { DatabaseError, type DomainError } from "@/shared/errors";

import type { IHealthRepository } from "./health.repository.interface";

export class HealthRepository implements IHealthRepository {
	async checkDatabaseConnection(): Promise<Result<number, DomainError>> {
		try {
			const startTime = performance.now();

			// Simple query to check database connectivity
			await db.execute("SELECT 1");

			const latency = Math.round(performance.now() - startTime);

			return ok(latency);
		} catch (error) {
			return err(
				new DatabaseError(
					error instanceof Error ? error.message : "Unknown database error",
				),
			);
		}
	}
}

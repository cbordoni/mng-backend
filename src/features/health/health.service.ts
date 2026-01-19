import { ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import { DomainError } from "@/shared/errors";

import type { HealthStatus } from "./health.types";

class HealthService {
	async checkHealth(): Promise<Result<HealthStatus, DomainError>> {
		try {
			const startTime = performance.now();

			// Simple query to check database connectivity
			await db.execute("SELECT 1");

			const latency = Math.round(performance.now() - startTime);

			return ok({
				status: "ok",
				database: {
					connected: true,
					latency,
				},
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			return ok({
				status: "error",
				database: {
					connected: false,
				},
				timestamp: new Date().toISOString(),
			});
		}
	}
}

export const healthService = new HealthService();

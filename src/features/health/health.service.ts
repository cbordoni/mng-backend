import { ok, type Result } from "neverthrow";

import type { DomainError } from "@/shared/errors";

import type { IHealthRepository } from "./health.repository.interface";
import type { HealthStatus } from "./health.types";

class HealthService {
	constructor(private readonly repository: IHealthRepository) {}

	async checkHealth(): Promise<Result<HealthStatus, DomainError>> {
		const result = await this.repository.checkDatabaseConnection();

		if (result.isErr()) {
			return ok({
				status: "error",
				database: {
					connected: false,
				},
				timestamp: new Date().toISOString(),
			});
		}

		const latency = result.value;

		return ok({
			status: "ok",
			database: {
				connected: true,
				latency,
			},
			timestamp: new Date().toISOString(),
		});
	}
}

export { HealthService };

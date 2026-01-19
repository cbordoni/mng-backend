import { HttpErrorResponse } from "@/shared/errors";
import { healthService } from "./health.service";

class HealthController {
	async check() {
		const result = await healthService.checkHealth();

		return result.match(
			(health) => {
				if (health.status === "error") {
					return new HttpErrorResponse(
						"Health check failed",
						"HEALTH_CHECK_FAILED",
						503,
					);
				}
				return health;
			},
			() => {
				return new HttpErrorResponse(
					"Health check failed",
					"HEALTH_CHECK_FAILED",
					500,
				);
			},
		);
	}
}

export const healthController = new HealthController();

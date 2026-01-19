import { describe, expect, it } from "bun:test";

import { healthService } from "./health.service";

describe("HealthService", () => {
	describe("checkHealth", () => {
		it("should return ok status when database is connected", async () => {
			const result = await healthService.checkHealth();

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const health = result.value;
				expect(health.status).toBe("ok");
				expect(health.database.connected).toBe(true);
				expect(health.database.latency).toBeGreaterThanOrEqual(0);
				expect(health.timestamp).toBeDefined();
			}
		});

		it("should include valid ISO timestamp", async () => {
			const result = await healthService.checkHealth();

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const health = result.value;
				const timestamp = new Date(health.timestamp);
				expect(timestamp).toBeInstanceOf(Date);
				expect(timestamp.getTime()).not.toBeNaN();
			}
		});

		it("should measure database latency", async () => {
			const result = await healthService.checkHealth();

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const health = result.value;
				if (health.database.connected) {
					expect(health.database.latency).toBeDefined();
					expect(typeof health.database.latency).toBe("number");
					expect(health.database.latency).toBeGreaterThanOrEqual(0);
				}
			}
		});
	});
});

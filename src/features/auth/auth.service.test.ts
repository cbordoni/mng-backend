import { beforeEach, describe, expect, it } from "bun:test";

import { MockUserRepository } from "@/features/user/user.repository.mock";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let authService: AuthService;
	let mockRepository: MockUserRepository;

	beforeEach(() => {
		mockRepository = new MockUserRepository();
		authService = new AuthService(mockRepository);
	});

	describe("createAuthorizationURL", () => {
		it("should return error when OAuth is not configured", () => {
			const result = authService.createAuthorizationURL();

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.message).toContain(
					"Missing Google OAuth configuration",
				);
			}
		});
	});

	describe("validateCallback", () => {
		it("should return error when OAuth is not configured", async () => {
			const result = await authService.validateCallback(
				"code",
				"state123",
				"state123",
				"verifier",
			);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.message).toContain(
					"Missing Google OAuth configuration",
				);
			}
		});
	});
});

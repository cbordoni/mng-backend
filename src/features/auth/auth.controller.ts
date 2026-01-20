import { BaseController } from "@/shared/http/base-controller";

import type { AuthService } from "./auth.service";
import type { GoogleCallbackQuery } from "./auth.types";

export class AuthController extends BaseController {
	constructor(private readonly service: AuthService) {
		super();
	}

	initiateGoogleLogin() {
		const result = this.service.createAuthorizationURL();

		return result.match(
			(data) => ({ data }),
			(error) => this.handleError(error),
		);
	}

	async handleGoogleCallback(
		query: GoogleCallbackQuery,
		storedState: string,
		codeVerifier: string,
	) {
		const result = await this.service.validateCallback(
			query.code,
			storedState,
			query.state,
			codeVerifier,
		);

		return result.match(
			(session) => ({
				data: {
					message: "Authentication successful",
					user: {
						userId: session.userId,
						email: session.email,
						name: session.name,
					},
				},
			}),
			(error) => this.handleError(error),
		);
	}
}

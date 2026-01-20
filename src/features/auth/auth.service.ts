import { Google, generateCodeVerifier, generateState } from "arctic";
import { err, ok, type Result } from "neverthrow";

import type { IUserRepository } from "@/features/user/user.repository.interface";
import { DomainError } from "@/shared/errors";

import type { AuthSession, GoogleUserInfo } from "./auth.types";

export class AuthService {
	private google: Google | null = null;
	private configError: string | null = null;

	constructor(private readonly userRepository: IUserRepository) {
		const clientId = Bun.env.GOOGLE_CLIENT_ID;
		const clientSecret = Bun.env.GOOGLE_CLIENT_SECRET;
		const redirectUri = Bun.env.GOOGLE_REDIRECT_URI;

		if (!clientId || !clientSecret || !redirectUri) {
			this.configError =
				"Missing Google OAuth configuration. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI";
		} else {
			this.google = new Google(clientId, clientSecret, redirectUri);
		}
	}

	createAuthorizationURL(): Result<
		{ url: string; state: string; codeVerifier: string },
		DomainError
	> {
		if (this.configError) {
			return err(new DomainError(this.configError));
		}

		if (!this.google) {
			return err(new DomainError("Google OAuth not configured"));
		}

		try {
			const state = generateState();
			const codeVerifier = generateCodeVerifier();
			const url = this.google.createAuthorizationURL(state, codeVerifier, [
				"openid",
				"profile",
				"email",
			]);

			return ok({ url: url.toString(), state, codeVerifier });
		} catch (error) {
			return err(
				new DomainError(
					`Failed to create authorization URL: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async validateCallback(
		code: string,
		storedState: string,
		receivedState: string,
		codeVerifier: string,
	): Promise<Result<AuthSession, DomainError>> {
		if (this.configError) {
			return err(new DomainError(this.configError));
		}

		if (!this.google) {
			return err(new DomainError("Google OAuth not configured"));
		}

		if (storedState !== receivedState) {
			return err(new DomainError("Invalid state parameter"));
		}

		try {
			const tokens = await this.google.validateAuthorizationCode(
				code,
				codeVerifier,
			);

			const userInfoResponse = await fetch(
				"https://www.googleapis.com/oauth2/v2/userinfo",
				{
					headers: {
						Authorization: `Bearer ${tokens.accessToken()}`,
					},
				},
			);

			if (!userInfoResponse.ok) {
				return err(new DomainError("Failed to fetch user info from Google"));
			}

			const { name, email, verified_email }: GoogleUserInfo =
				await userInfoResponse.json();

			if (!verified_email) {
				return err(new DomainError("Email not verified by Google"));
			}

			const existingUserResult = await this.userRepository.findByEmail(email);

			let userId: string;

			if (existingUserResult.isErr()) {
				const createResult = await this.userRepository.create({
					name,
					email,
					cellphone: "",
				});

				if (createResult.isErr()) {
					return err(
						new DomainError(
							`Failed to create user: ${createResult.error.message}`,
						),
					);
				}

				userId = createResult.value.id;
			} else {
				userId = existingUserResult.value.id;
			}

			return ok({ userId, email, name });
		} catch (error) {
			return err(
				new DomainError(
					`OAuth callback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}
}

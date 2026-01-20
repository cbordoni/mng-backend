import { cookie } from "@elysiajs/cookie";
import { Elysia } from "elysia";

import { UserRepository } from "@/features/user/user.repository";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleCallbackSchema } from "./auth.types";

const userRepository = new UserRepository();
const service = new AuthService(userRepository);
const controller = new AuthController(service);

export const authRoutes = new Elysia({ prefix: "/auth" })
	.use(cookie())
	.get(
		"/google",
		({ cookie: { oauth_state, oauth_code_verifier } }) => {
			const response = controller.initiateGoogleLogin();

			if ("data" in response && response.data?.state) {
				oauth_state.set({
					value: response.data.state,
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 60 * 10,
				});

				oauth_code_verifier.set({
					value: response.data.codeVerifier,
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 60 * 10,
				});
			}

			return response;
		},
		{
			detail: {
				summary: "Initiate Google OAuth login",
				description: "Returns authorization URL and sets state cookie",
				tags: ["Auth"],
			},
		},
	)
	.get(
		"/google/callback",
		async ({ query, cookie: { oauth_state, oauth_code_verifier } }) => {
			const storedState = String(oauth_state.value ?? "");
			const codeVerifier = String(oauth_code_verifier.value ?? "");

			const response = await controller.handleGoogleCallback(
				query,
				storedState,
				codeVerifier,
			);

			oauth_state.remove();
			oauth_code_verifier.remove();

			return response;
		},
		{
			query: GoogleCallbackSchema,
			detail: {
				summary: "Handle Google OAuth callback",
				description: "Validates OAuth code and creates/retrieves user session",
				tags: ["Auth"],
			},
		},
	);

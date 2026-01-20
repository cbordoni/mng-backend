import { t } from "elysia";

export const GoogleCallbackSchema = t.Object({
	code: t.String(),
	state: t.String(),
});

export type GoogleCallbackQuery = typeof GoogleCallbackSchema.static;

export interface GoogleUserInfo {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
}

export interface AuthSession {
	userId: string;
	email: string;
	name: string;
}

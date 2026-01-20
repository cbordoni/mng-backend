import { Elysia } from "elysia";

import { logger } from "@/shared/logger";

export const errorLoggerPlugin = new Elysia({
	name: "error-logger",
}).onError(({ code, error, request: { method, url } }) => {
	const message = error instanceof Error ? error.message : String(error);

	logger.error("Request error", { message, code, method, url });
});

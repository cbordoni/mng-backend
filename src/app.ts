import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { healthRoutes } from "@/features/health/health.routes";
import { productRoutes } from "@/features/product/product.routes";
import { userRoutes } from "@/features/user/user.routes";
import { HttpErrorResponse } from "@/shared/errors";
import { logger } from "@/shared/logger";

export const app = new Elysia()
	.onRequest(({ request }) => {
		logger.info("Incoming request", {
			method: request.method,
			url: request.url,
		});
	})
	.onAfterHandle(({ responseValue, set }) => {
		if (responseValue instanceof HttpErrorResponse) {
			set.status = responseValue.status;

			return {
				error: responseValue.message,
				code: responseValue.code,
			};
		}

		return responseValue;
	})
	.onError(({ code, error, request }) => {
		logger.error("Request error", {
			code,
			message: error instanceof Error ? error.message : String(error),
			method: request.method,
			url: request.url,
		});
	})
	.use(
		openapi({
			path: "/docs",
			documentation: {
				info: {
					title: "MNG Backend V2 API",
					version: "1.0.0",
					description: "A modern backend API built with Bun and Elysia",
				},
				tags: [
					{ name: "Users", description: "User management endpoints" },
					{ name: "Products", description: "Product management endpoints" },
					{ name: "Health", description: "Health check endpoints" },
				],
			},
		}),
	)
	.get("/", () => ({ message: "MNG Backend V2" }), {
		detail: {
			summary: "API Root",
			tags: ["Health"],
		},
	})
	.use(healthRoutes)
	.use(userRoutes)
	.use(productRoutes);

import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

import { healthRoutes } from "@/features/health/health.routes";
import { orderRoutes } from "@/features/order/order.routes";
import { productRoutes } from "@/features/product/product.routes";
import { userRoutes } from "@/features/user/user.routes";
import { errorLoggerPlugin } from "@/shared/http/error-logger.plugin";
import { httpErrorMapperPlugin } from "@/shared/http/http-error-mapper.plugin";
import { requestLoggerPlugin } from "@/shared/http/request-logger.plugin";

const version = Bun.env.npm_package_version ?? "1.0.0";

export const app = new Elysia()
	.use(requestLoggerPlugin)
	.use(httpErrorMapperPlugin)
	.use(errorLoggerPlugin)
	.use(
		openapi({
			path: "/docs",
			documentation: {
				info: {
					title: "MNG Backend V2 API",
					version,
					description: "A modern backend API built with Bun and Elysia",
				},
				tags: [
					{ name: "Users", description: "User management endpoints" },
					{ name: "Products", description: "Product management endpoints" },
					{ name: "Orders", description: "Order management endpoints" },
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
	.use(productRoutes)
	.use(orderRoutes);

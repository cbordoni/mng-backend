import { app } from "./app";

import { syncDatabase } from "./shared/config/database";
import { logger } from "./shared/logger";

const PORT = Bun.env.PORT || 3000;

// Sync database if DB_SYNC flag is set
if (Bun.env.DB_SYNC === "true") {
	logger.info("Syncing database...");

	await syncDatabase().then(
		() => {
			logger.info("Database synced successfully");
		},
		(e) => {
			logger.error("Failed to sync database", {
				error: e instanceof Error ? e.message : String(e),
			});

			process.exit(1);
		},
	);
}

app.listen(PORT);

logger.info("Server started", {
	hostname: app.server?.hostname,
	port: app.server?.port,
	environment: Bun.env.NODE_ENV || "development",
});

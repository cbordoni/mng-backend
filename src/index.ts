import { app } from "./app";

import { syncDatabase } from "./shared/config/database";
import { logger } from "./shared/logger";

const PORT = Bun.env.PORT || 3000;

// Sync database if DB_SYNC flag is set
if (Bun.env.DB_SYNC === "true") {
	logger.info("Syncing database...");
	try {
		await syncDatabase();
		logger.info("Database synced successfully");
	} catch (error) {
		logger.error("Failed to sync database", {
			error: error instanceof Error ? error.message : String(error),
		});
		process.exit(1);
	}
}

app.listen(PORT);

logger.info("Server started", {
	hostname: app.server?.hostname,
	port: app.server?.port,
	environment: Bun.env.NODE_ENV || "development",
});

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString =
	Bun.env.DATABASE_URL || "postgres://localhost:5432/mng_backend";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function syncDatabase(): Promise<void> {
	const migrationClient = postgres(connectionString, { max: 1 });
	try {
		await migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });
	} finally {
		await migrationClient.end();
	}
}

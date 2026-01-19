import type { ResultAsync } from "neverthrow";
import { fromPromise } from "neverthrow";

import { DatabaseError } from "@/shared/errors";

export async function wrapDatabaseOperation<T>(
	operation: () => Promise<T>,
	errorContext: string,
): Promise<ResultAsync<T, DatabaseError>> {
	return await fromPromise(
		operation(),
		(error) =>
			new DatabaseError(
				`${errorContext}: ${error instanceof Error ? error.message : "Unknown error"}`,
			),
	);
}

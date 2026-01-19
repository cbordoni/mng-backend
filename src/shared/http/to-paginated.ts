import type { PaginatedResponse, PaginatedResult } from "@/shared/types";

export function toPaginated<T>(
	data: PaginatedResult<T>,
	page: number,
	limit: number,
): PaginatedResponse<T> {
	return {
		data: data.items,
		meta: {
			page,
			limit,
			total: data.total,
			totalPages: Math.ceil(data.total / limit),
		},
	};
}

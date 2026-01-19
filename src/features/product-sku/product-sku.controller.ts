import type { DomainError } from "@/shared/errors";
import {
	DatabaseError,
	HttpErrorResponse,
	NotFoundError,
	ValidationError,
} from "@/shared/errors";
import type { PaginationQuery } from "@/shared/types";
import type { ProductSkuService } from "./product-sku.service";
import type {
	CreateProductSkuInput,
	UpdateProductSkuInput,
} from "./product-sku.types";

export class ProductSkuController {
	constructor(private readonly service: ProductSkuService) {}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllProductSkus(page, limit);

		return result.match(
			(paginatedProductSkus) => paginatedProductSkus,
			(error) => this.handleError(error),
		);
	}

	async getByProductId(productId: string) {
		const result = await this.service.getProductSkusByProductId(productId);

		return result.match(
			(skus) => ({ data: skus }),
			(error) => this.handleError(error),
		);
	}

	async getById(id: string) {
		const result = await this.service.getProductSkuById(id);

		return result.match(
			(sku) => ({ data: sku }),
			(error) => this.handleError(error),
		);
	}

	async create(data: CreateProductSkuInput) {
		const result = await this.service.createProductSku(data);

		return result.match(
			(sku) => ({ data: sku, status: 201 }),
			(error) => this.handleError(error),
		);
	}

	async update(id: string, data: UpdateProductSkuInput) {
		const result = await this.service.updateProductSku(id, data);

		return result.match(
			(sku) => ({ data: sku }),
			(error) => this.handleError(error),
		);
	}

	async delete(id: string) {
		const result = await this.service.deleteProductSku(id);

		return result.match(
			() => ({ status: 204 }),
			(error) => this.handleError(error),
		);
	}

	private handleError(error: DomainError): HttpErrorResponse {
		if (error instanceof NotFoundError) {
			return new HttpErrorResponse(error.message, error.code, 404);
		}

		if (error instanceof ValidationError) {
			return new HttpErrorResponse(error.message, error.code, 400);
		}

		if (error instanceof DatabaseError) {
			return new HttpErrorResponse("Internal server error", error.code, 500);
		}

		return new HttpErrorResponse(
			"Internal server error",
			"INTERNAL_ERROR",
			500,
		);
	}
}

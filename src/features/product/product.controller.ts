import type { DomainError } from "@/shared/errors";
import {
	DatabaseError,
	HttpErrorResponse,
	NotFoundError,
	ValidationError,
} from "@/shared/errors";
import type { PaginationQuery } from "@/shared/types";
import type { ProductService } from "./product.service";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductController {
	constructor(private readonly service: ProductService) {}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllProducts(page, limit);

		return result.match(
			(paginatedProducts) => paginatedProducts,
			(error) => this.handleError(error),
		);
	}

	async getById(id: string) {
		const result = await this.service.getProductById(id);

		return result.match(
			(product) => ({ data: product }),
			(error) => this.handleError(error),
		);
	}

	async create(data: CreateProductInput) {
		const result = await this.service.createProduct(data);

		return result.match(
			(product) => ({ data: product, status: 201 }),
			(error) => this.handleError(error),
		);
	}

	async update(id: string, data: UpdateProductInput) {
		const result = await this.service.updateProduct(id, data);

		return result.match(
			(product) => ({ data: product }),
			(error) => this.handleError(error),
		);
	}

	async delete(id: string) {
		const result = await this.service.deleteProduct(id);

		return result.match(
			() => ({ status: 204 }),
			(error) => this.handleError(error),
		);
	}

	async addImages(id: string, images: Record<string, string>) {
		const result = await this.service.addImages(id, images);

		return result.match(
			(product) => ({ data: product }),
			(error) => this.handleError(error),
		);
	}

	async deleteImage(id: string, resolution: string) {
		const result = await this.service.deleteImage(id, resolution);

		return result.match(
			(product) => ({ data: product }),
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

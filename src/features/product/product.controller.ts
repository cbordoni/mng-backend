import { BaseController } from "@/shared/http/base-controller";
import type { PaginationQuery } from "@/shared/types";

import type { ProductService } from "./product.service";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductController extends BaseController {
	constructor(private readonly service: ProductService) {
		super();
	}

	async getAll(query: PaginationQuery) {
		const { page = 1, limit = 10 } = query;

		const result = await this.service.getAllProducts(page, limit);

		return result.match((paginatedData) => paginatedData, this.handleError);
	}

	async getById(id: string) {
		const result = await this.service.getProductById(id);

		return result.match((product) => ({ data: product }), this.handleError);
	}

	async create(data: CreateProductInput) {
		const result = await this.service.createProduct(data);

		return result.match(
			(product) => ({ data: product, status: 201 }),
			this.handleError,
		);
	}

	async update(id: string, data: UpdateProductInput) {
		const result = await this.service.updateProduct(id, data);

		return result.match((product) => ({ data: product }), this.handleError);
	}

	async delete(id: string) {
		const result = await this.service.deleteProduct(id);

		return result.match(() => ({ status: 204 }), this.handleError);
	}

	async addImages(id: string, images: Record<string, string>) {
		const result = await this.service.addImages(id, images);

		return result.match((product) => ({ data: product }), this.handleError);
	}

	async deleteImage(id: string, resolution: string) {
		const result = await this.service.deleteImage(id, resolution);

		return result.match((product) => ({ data: product }), this.handleError);
	}

	async updatePrice(id: string, price: number) {
		const result = await this.service.updateProduct(id, { price });

		return result.match((product) => ({ data: product }), this.handleError);
	}
}

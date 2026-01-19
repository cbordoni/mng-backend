import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { ProductSku } from "@/shared/config/schema";
import {
	type DatabaseError,
	type NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { logger } from "@/shared/logger";
import type { PaginatedResponse } from "@/shared/types";
import type { ProductSkuRepository } from "./product-sku.repository";
import type {
	CreateProductSkuInput,
	UpdateProductSkuInput,
} from "./product-sku.types";

export class ProductSkuService {
	constructor(private readonly repository: ProductSkuRepository) {}

	async getAllProductSkus(
		page = 1,
		limit = 10,
	): Promise<Result<PaginatedResponse<ProductSku>, DatabaseError>> {
		logger.debug("Fetching all product SKUs", { page, limit });
		const result = await this.repository.findAll(page, limit);

		return result.map((data) => {
			logger.info("Product SKUs fetched successfully", {
				count: data.productSkus.length,
				total: data.total,
				page,
			});

			return {
				data: data.productSkus,
				meta: {
					page,
					limit,
					total: data.total,
					totalPages: Math.ceil(data.total / limit),
				},
			};
		});
	}

	async getProductSkusByProductId(
		productId: string,
	): Promise<Result<ProductSku[], DatabaseError>> {
		logger.debug("Fetching product SKUs by product ID", { productId });
		const result = await this.repository.findByProductId(productId);

		if (result.isOk()) {
			logger.info("Product SKUs fetched successfully", {
				productId,
				count: result.value.length,
			});
		}

		return result;
	}

	async getProductSkuById(
		id: string,
	): Promise<Result<ProductSku, NotFoundError | DatabaseError>> {
		logger.debug("Fetching product SKU by id", { id });
		const result = await this.repository.findById(id);

		if (result.isOk()) {
			logger.info("Product SKU fetched successfully", { id });
		} else {
			logger.warn("Product SKU not found", { id });
		}

		return result;
	}

	async createProductSku(
		data: CreateProductSkuInput,
	): Promise<Result<ProductSku, ValidationError | DatabaseError>> {
		logger.debug("Creating product SKU", { name: data.name });

		// Business logic validations
		if (data.name.trim().length === 0) {
			logger.warn("Product SKU creation failed: empty name");
			return err(new ValidationError("Name cannot be empty"));
		}

		// Check if product exists
		const productExistsResult = await this.repository.productExists(
			data.productId,
		);
		if (productExistsResult.isErr()) {
			return err(productExistsResult.error);
		}

		if (!productExistsResult.value) {
			logger.warn("Product SKU creation failed: product not found", {
				productId: data.productId,
			});
			return err(
				new ValidationError(`Product with id ${data.productId} not found`),
			);
		}

		// Validate images if provided
		if (data.images && data.images.length > 0) {
			for (const image of data.images) {
				if (image.trim().length === 0) {
					logger.warn("Product SKU creation failed: empty image URL");
					return err(new ValidationError("Image URL cannot be empty"));
				}
			}
		}

		const result = await this.repository.create(data);

		return result.match(
			(sku) => {
				logger.info("Product SKU created successfully", {
					id: sku.id,
					name: sku.name,
				});

				return ok(sku);
			},
			(error) => err(error),
		);
	}

	async updateProductSku(
		id: string,
		data: UpdateProductSkuInput,
	): Promise<
		Result<ProductSku, ValidationError | NotFoundError | DatabaseError>
	> {
		logger.debug("Updating product SKU", { id, fields: Object.keys(data) });

		// Business logic validations
		if (data.name !== undefined && data.name.trim().length === 0) {
			logger.warn("Product SKU update failed: empty name", { id });
			return err(new ValidationError("Name cannot be empty"));
		}

		// Validate images if provided
		if (data.images && data.images.length > 0) {
			for (const image of data.images) {
				if (image.trim().length === 0) {
					logger.warn("Product SKU update failed: empty image URL", { id });
					return err(new ValidationError("Image URL cannot be empty"));
				}
			}
		}

		const result = await this.repository.update(id, data);

		return result.match(
			(sku) => {
				logger.info("Product SKU updated successfully", { id });
				return ok(sku);
			},
			(error) => err(error),
		);
	}

	async deleteProductSku(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		logger.debug("Deleting product SKU", { id });

		const result = await this.repository.delete(id);

		return result.match(
			() => {
				logger.info("Product SKU deleted successfully", { id });
				return ok(undefined);
			},
			(error) => err(error),
		);
	}
}

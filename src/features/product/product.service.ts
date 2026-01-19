import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

import type { Product } from "@/shared/config/schema";
import {
	type DatabaseError,
	type NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { logger } from "@/shared/logger";
import type { PaginatedResponse } from "@/shared/types";
import type { ProductRepository } from "./product.repository";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductService {
	constructor(private readonly repository: ProductRepository) {}

	async getAllProducts(
		page = 1,
		limit = 10,
	): Promise<Result<PaginatedResponse<Product>, DatabaseError>> {
		logger.debug("Fetching all products", { page, limit });
		const result = await this.repository.findAll(page, limit);

		return result.map((data) => {
			logger.info("Products fetched successfully", {
				count: data.products.length,
				total: data.total,
				page,
			});

			return {
				data: data.products,
				meta: {
					page,
					limit,
					total: data.total,
					totalPages: Math.ceil(data.total / limit),
				},
			};
		});
	}

	async getProductById(
		id: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		logger.debug("Fetching product by id", { id });
		const result = await this.repository.findById(id);

		if (result.isOk()) {
			logger.info("Product fetched successfully", { id });
		} else {
			logger.warn("Product not found", { id });
		}

		return result;
	}

	async createProduct(
		data: CreateProductInput,
	): Promise<Result<Product, ValidationError | DatabaseError>> {
		logger.debug("Creating product", { name: data.name });

		// Business logic validations
		if (data.name.trim().length === 0) {
			logger.warn("Product creation failed: empty name");
			return err(new ValidationError("Name cannot be empty"));
		}

		// Validate prices
		if (data.unitSellingPrice <= 0) {
			logger.warn("Product creation failed: invalid selling price");
			return err(
				new ValidationError("Unit selling price must be greater than zero"),
			);
		}

		if (data.unitPurchasePrice <= 0) {
			logger.warn("Product creation failed: invalid purchase price");
			return err(
				new ValidationError("Unit purchase price must be greater than zero"),
			);
		}

		if (data.unitSellingPrice < data.unitPurchasePrice) {
			logger.warn(
				"Product creation failed: selling price lower than purchase price",
			);
			return err(
				new ValidationError(
					"Selling price cannot be lower than purchase price",
				),
			);
		}

		// Validate quantity if provided
		if (data.quantity !== undefined && data.quantity <= 0) {
			logger.warn("Product creation failed: invalid quantity");
			return err(new ValidationError("Quantity must be greater than zero"));
		}

		const result = await this.repository.create(data);

		return result.match(
			(product) => {
				logger.info("Product created successfully", {
					id: product.id,
					name: product.name,
				});

				return ok(product);
			},
			(error) => err(error),
		);
	}

	async updateProduct(
		id: string,
		data: UpdateProductInput,
	): Promise<Result<Product, ValidationError | NotFoundError | DatabaseError>> {
		logger.debug("Updating product", { id, fields: Object.keys(data) });

		// Business logic validations
		if (data.name !== undefined && data.name.trim().length === 0) {
			logger.warn("Product update failed: empty name", { id });
			return err(new ValidationError("Name cannot be empty"));
		}

		// Validate prices if provided
		if (data.unitSellingPrice !== undefined && data.unitSellingPrice <= 0) {
			logger.warn("Product update failed: invalid selling price", { id });
			return err(
				new ValidationError("Unit selling price must be greater than zero"),
			);
		}

		if (data.unitPurchasePrice !== undefined && data.unitPurchasePrice <= 0) {
			logger.warn("Product update failed: invalid purchase price", { id });
			return err(
				new ValidationError("Unit purchase price must be greater than zero"),
			);
		}

		// Validate quantity if provided
		if (data.quantity !== undefined && data.quantity <= 0) {
			logger.warn("Product update failed: invalid quantity", { id });
			return err(new ValidationError("Quantity must be greater than zero"));
		}

		const result = await this.repository.update(id, data);

		return result.match(
			(product) => {
				logger.info("Product updated successfully", { id });
				return ok(product);
			},
			(error) => err(error),
		);
	}

	async deleteProduct(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		logger.debug("Deleting product", { id });

		const result = await this.repository.delete(id);

		return result.match(
			() => {
				logger.info("Product deleted successfully", { id });
				return ok(undefined);
			},
			(error) => err(error),
		);
	}
}

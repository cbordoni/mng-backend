import { err, ok, type Result } from "neverthrow";

import type { Product } from "@/shared/config/schema";
import {
	type DatabaseError,
	type NotFoundError,
	ValidationError,
} from "@/shared/errors";
import { toPaginated } from "@/shared/http/to-paginated";
import { logger } from "@/shared/logger";
import type { PaginatedResponse } from "@/shared/types";
import type { IProductRepository } from "./product.repository.interface";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductService {
	constructor(private readonly repository: IProductRepository) {}

	private validateName(name: string): Result<void, ValidationError> {
		if (name.trim().length === 0) {
			return err(new ValidationError("Name cannot be empty"));
		}

		return ok(undefined);
	}

	private validatePositiveNumber(
		value: number,
		fieldName: string,
	): Result<void, ValidationError> {
		if (value <= 0) {
			return err(new ValidationError(`${fieldName} must be greater than zero`));
		}

		return ok(undefined);
	}

	async getAllProducts(
		page = 1,
		limit = 10,
	): Promise<Result<PaginatedResponse<Product>, DatabaseError>> {
		logger.debug("Fetching all products", { page, limit });
		const result = await this.repository.findAll(page, limit);

		return result.map((data) => {
			logger.info("Products fetched successfully", {
				count: data.items.length,
				total: data.total,
				page,
			});

			return toPaginated(data, page, limit);
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

		const nameValidation = this.validateName(data.name);

		if (nameValidation.isErr()) {
			logger.warn("Product creation failed: empty name");
			return err(nameValidation.error);
		}

		const priceValidation = this.validatePositiveNumber(data.price, "Price");

		if (priceValidation.isErr()) {
			logger.warn("Product creation failed: invalid price");
			return err(priceValidation.error);
		}

		if (data.oldPrice !== undefined) {
			const oldPriceValidation = this.validatePositiveNumber(
				data.oldPrice,
				"Old price",
			);

			if (oldPriceValidation.isErr()) {
				logger.warn("Product creation failed: invalid old price");
				return err(oldPriceValidation.error);
			}
		}

		if (data.quantity !== undefined) {
			const quantityValidation = this.validatePositiveNumber(
				data.quantity,
				"Quantity",
			);
			if (quantityValidation.isErr()) {
				logger.warn("Product creation failed: invalid quantity");
				return err(quantityValidation.error);
			}
		}

		const result = await this.repository.create(data);

		return result.map((product) => {
			logger.info("Product created successfully", {
				id: product.id,
				name: product.name,
			});

			return product;
		});
	}

	async updateProduct(
		id: string,
		data: UpdateProductInput,
	): Promise<Result<Product, ValidationError | NotFoundError | DatabaseError>> {
		logger.debug("Updating product", { id, fields: Object.keys(data) });

		if (data.name !== undefined) {
			const nameValidation = this.validateName(data.name);

			if (nameValidation.isErr()) {
				logger.warn("Product update failed: empty name", { id });
				return err(nameValidation.error);
			}
		}

		if (data.price !== undefined) {
			const priceValidation = this.validatePositiveNumber(data.price, "Price");

			if (priceValidation.isErr()) {
				logger.warn("Product update failed: invalid price", { id });
				return err(priceValidation.error);
			}
		}

		if (data.quantity !== undefined) {
			const quantityValidation = this.validatePositiveNumber(
				data.quantity,
				"Quantity",
			);
			if (quantityValidation.isErr()) {
				logger.warn("Product update failed: invalid quantity", { id });
				return err(quantityValidation.error);
			}
		}

		const result = await this.repository.update(id, data);

		return result.map((product) => {
			logger.info("Product updated successfully", { id });
			return product;
		});
	}

	async deleteProduct(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		logger.debug("Deleting product", { id });

		const result = await this.repository.delete(id);

		return result.map(() => {
			logger.info("Product deleted successfully", { id });
			return undefined;
		});
	}

	async addImages(
		id: string,
		images: Record<string, string>,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		logger.debug("Adding images to product", {
			id,
			resolutions: Object.keys(images),
		});

		const result = await this.repository.addImages(id, images);

		return result.map((product) => {
			logger.info("Images added successfully", { id });
			return product;
		});
	}

	async deleteImage(
		id: string,
		resolution: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		logger.debug("Deleting image from product", { id, resolution });

		const result = await this.repository.deleteImage(id, resolution);

		return result.map((product) => {
			logger.info("Image deleted successfully", { id });
			return product;
		});
	}
}

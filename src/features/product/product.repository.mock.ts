import { ok, type Result } from "neverthrow";

import type { Product } from "@/shared/config/schema";
import type { NotFoundError } from "@/shared/errors";
import { BaseInMemoryRepository } from "@/shared/testing/base-in-memory-repository";

import type { IProductRepository } from "./product.repository.interface";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class MockProductRepository
	extends BaseInMemoryRepository<Product>
	implements IProductRepository
{
	protected get entityName(): string {
		return "Product";
	}

	async findAll(page: number, limit: number) {
		return await super.findAll(page, limit);
	}

	async create(data: CreateProductInput) {
		const product: Product = {
			id: crypto.randomUUID(),
			name: data.name,
			reference: data.reference ?? null,
			description: data.description ?? null,
			quantity: data.quantity ?? null,
			date: data.date !== undefined ? new Date(data.date) : null,
			price: data.price.toString(),
			oldPrice: data.oldPrice?.toString() ?? null,
			images: data.images ?? null,
			installments: data.installments ?? null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(product);

		return ok(product);
	}

	async update(id: string, data: UpdateProductInput) {
		const indexResult = await this.findIndexById(id);
		if (indexResult.isErr()) {
			return indexResult as Result<never, NotFoundError>;
		}

		const index = indexResult.value;
		const currentProduct = this.items[index];

		const oldPrice =
			data.price !== undefined && data.price.toString() !== currentProduct.price
				? currentProduct.price
				: currentProduct.oldPrice;

		const updated: Product = {
			...currentProduct,
			...data,
			date: data.date ? new Date(data.date) : currentProduct.date,
			price: data.price?.toString() ?? currentProduct.price,
			oldPrice: oldPrice?.toString() ?? currentProduct.oldPrice,
			updatedAt: new Date(),
		};

		this.items[index] = updated;
		return ok(updated);
	}

	async addImages(id: string, images: Record<string, string>) {
		const indexResult = await this.findIndexById(id);
		if (indexResult.isErr()) {
			return indexResult as Result<never, NotFoundError>;
		}

		const index = indexResult.value;
		const currentProduct = this.items[index];
		const updated: Product = {
			...currentProduct,
			images: { ...(currentProduct.images ?? {}), ...images },
			updatedAt: new Date(),
		};

		this.items[index] = updated;
		return ok(updated);
	}

	async deleteImage(id: string, resolution: string) {
		const indexResult = await this.findIndexById(id);
		if (indexResult.isErr()) {
			return indexResult as Result<never, NotFoundError>;
		}

		const index = indexResult.value;
		const currentProduct = this.items[index];
		const newImages = { ...(currentProduct.images ?? {}) };
		delete newImages[resolution];

		const updated: Product = {
			...currentProduct,
			images: newImages,
			updatedAt: new Date(),
		};

		this.items[index] = updated;
		return ok(updated);
	}

	// Alias helper methods for testing
	setProducts(products: Product[]) {
		this.setItems(products);
	}

	clearProducts() {
		this.clearItems();
	}
}

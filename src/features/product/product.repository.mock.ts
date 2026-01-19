import { err, ok, type Result } from "neverthrow";

import type { Product } from "@/shared/config/schema";
import type { DatabaseError, NotFoundError } from "@/shared/errors";

import type { IProductRepository } from "./product.repository.interface";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class MockProductRepository implements IProductRepository {
	private products: Product[] = [];

	async findAll(
		page: number,
		limit: number,
	): Promise<Result<{ products: Product[]; total: number }, DatabaseError>> {
		const offset = (page - 1) * limit;
		const paginatedProducts = this.products.slice(offset, offset + limit);
		return ok({ products: paginatedProducts, total: this.products.length });
	}

	async findById(
		id: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		const product = this.products.find((p) => p.id === id);
		if (!product) {
			return err({
				name: "NotFoundError",
				message: `Product with id ${id} not found`,
			} as NotFoundError);
		}
		return ok(product);
	}

	async create(
		data: CreateProductInput,
	): Promise<Result<Product, DatabaseError>> {
		const product: Product = {
			id: crypto.randomUUID(),
			name: data.name,
			reference: data.reference ?? null,
			description: data.description ?? null,
			quantity: data.quantity ?? null,
			date: data.date ? new Date(data.date) : null,
			price: data.price.toString(),
			oldPrice: data.oldPrice?.toString() ?? null,
			images: data.images ?? null,
			installments: data.installments ?? null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.products.push(product);
		return ok(product);
	}

	async update(
		id: string,
		data: UpdateProductInput,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		const index = this.products.findIndex((p) => p.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `Product with id ${id} not found`,
			} as NotFoundError);
		}

		const oldPrice =
			data.price !== undefined &&
			data.price.toString() !== this.products[index].price
				? this.products[index].price
				: this.products[index].oldPrice;

		const currentProduct = this.products[index];

		const updated: Product = {
			...currentProduct,
			...data,
			date: data.date ? new Date(data.date) : currentProduct.date,
			price: data.price?.toString() ?? currentProduct.price,
			oldPrice: oldPrice?.toString() ?? currentProduct.oldPrice,
			updatedAt: new Date(),
		};

		this.products[index] = updated;
		return ok(updated);
	}

	async delete(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		const index = this.products.findIndex((p) => p.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `Product with id ${id} not found`,
			} as NotFoundError);
		}
		this.products.splice(index, 1);
		return ok(undefined);
	}

	async addImages(
		id: string,
		images: Record<string, string>,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		const index = this.products.findIndex((p) => p.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `Product with id ${id} not found`,
			} as NotFoundError);
		}

		const currentProduct = this.products[index];
		const updated: Product = {
			...currentProduct,
			images: { ...(currentProduct.images ?? {}), ...images },
			updatedAt: new Date(),
		};

		this.products[index] = updated;
		return ok(updated);
	}

	async deleteImage(
		id: string,
		resolution: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		const index = this.products.findIndex((p) => p.id === id);
		if (index === -1) {
			return err({
				name: "NotFoundError",
				message: `Product with id ${id} not found`,
			} as NotFoundError);
		}

		const currentProduct = this.products[index];
		const newImages = { ...(currentProduct.images ?? {}) };
		delete newImages[resolution];

		const updated: Product = {
			...currentProduct,
			images: newImages,
			updatedAt: new Date(),
		};

		this.products[index] = updated;
		return ok(updated);
	}

	// Helper methods for testing
	setProducts(products: Product[]) {
		this.products = products;
	}

	clearProducts() {
		this.products = [];
	}
}

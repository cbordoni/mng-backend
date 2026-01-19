import { count, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import { db } from "@/shared/config/database";
import { type Product, products } from "@/shared/config/schema";
import { NotFoundError } from "@/shared/errors";
import type { PaginatedResult } from "@/shared/types";
import { removeUndefined } from "@/shared/utils";
import { wrapDatabaseOperation } from "@/shared/utils/database";

import type { IProductRepository } from "./product.repository.interface";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductRepository implements IProductRepository {
	async findAll(page: number, limit: number) {
		return wrapDatabaseOperation(async () => {
			const offset = (page - 1) * limit;

			const [items, [{ value: total }]] = await Promise.all([
				db.select().from(products).limit(limit).offset(offset),
				db.select({ value: count() }).from(products),
			]);

			return { items, total } as PaginatedResult<Product>;
		}, "Failed to fetch products");
	}

	async findById(id: string) {
		const result = await wrapDatabaseOperation(
			() => db.select().from(products).where(eq(products.id, id)),
			"Failed to fetch product",
		);

		return result.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}
			return ok(product);
		});
	}

	async create(data: CreateProductInput) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.insert(products)
					.values({
						name: data.name,
						reference: data.reference,
						description: data.description,
						quantity: data.quantity,
						date: data.date ? new Date(data.date) : undefined,
						price: data.price.toString(),
						oldPrice: data.oldPrice?.toString(),
						images: data.images,
						installments: data.installments,
					})
					.returning(),
			"Failed to create product",
		);

		return result.map(([product]) => product);
	}

	async update(id: string, data: UpdateProductInput) {
		// If price is being updated, fetch current product to preserve old price
		let oldPrice: string | undefined;

		if (data.price !== undefined) {
			const currentProduct = (await this.findById(id)).match(
				(product) => product,
				() => null,
			);

			if (!currentProduct) {
				return err(new NotFoundError("Product", id));
			}

			const currentPrice = Number.parseFloat(currentProduct.price);
			const newPrice = data.price;

			// Only set oldPrice if price is changing
			if (newPrice !== currentPrice) {
				oldPrice = currentProduct.price;
			}
		}

		const updateData = removeUndefined({
			name: data.name,
			reference: data.reference,
			description: data.description,
			quantity: data.quantity,
			date: data.date ? new Date(data.date) : undefined,
			price: data.price?.toString(),
			oldPrice,
			images: data.images,
			installments: data.installments,
			updatedAt: new Date(),
		});

		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(products)
					.set(updateData)
					.where(eq(products.id, id))
					.returning(),
			"Failed to update product",
		);

		return result.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}
			return ok(product);
		});
	}

	async delete(id: string) {
		const result = await wrapDatabaseOperation(
			() =>
				db
					.delete(products)
					.where(eq(products.id, id))
					.returning({ id: products.id }),
			"Failed to delete product",
		);

		return result.andThen(([deleted]) => {
			if (!deleted) {
				return err(new NotFoundError("Product", id));
			}
			return ok(undefined);
		});
	}

	async addImages(id: string, images: Record<string, string>) {
		const currentResult = await wrapDatabaseOperation(
			() =>
				db
					.select({ images: products.images })
					.from(products)
					.where(eq(products.id, id)),
			"Failed to fetch product images",
		);

		const currentProduct = await currentResult.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}
			return ok(product);
		});

		if (currentProduct.isErr()) {
			return err(currentProduct.error);
		}

		const currentImages =
			(currentProduct.value.images as Record<string, string>) || {};
		const updatedImages = { ...currentImages, ...images };

		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(products)
					.set({ images: updatedImages, updatedAt: new Date() })
					.where(eq(products.id, id))
					.returning(),
			"Failed to add images",
		);

		return result.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}
			return ok(product);
		});
	}

	async deleteImage(id: string, resolution: string) {
		const currentResult = await wrapDatabaseOperation(
			() =>
				db
					.select({ images: products.images })
					.from(products)
					.where(eq(products.id, id)),
			"Failed to fetch product images",
		);

		const currentProduct = await currentResult.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}
			return ok(product);
		});

		if (currentProduct.isErr()) {
			return err(currentProduct.error);
		}

		const currentImages =
			(currentProduct.value.images as Record<string, string>) || {};
		const updatedImages = { ...currentImages };
		delete updatedImages[resolution];

		const result = await wrapDatabaseOperation(
			() =>
				db
					.update(products)
					.set({ images: updatedImages, updatedAt: new Date() })
					.where(eq(products.id, id))
					.returning(),
			"Failed to delete image",
		);

		return result.andThen(([product]) => {
			if (!product) {
				return err(new NotFoundError("Product", id));
			}

			return ok(product);
		});
	}
}

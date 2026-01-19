import { count, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import { db } from "@/shared/config/database";
import { products } from "@/shared/config/schema";
import { DatabaseError, NotFoundError } from "@/shared/errors";
import { removeUndefined } from "@/shared/utils";

import type { IProductRepository } from "./product.repository.interface";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductRepository implements IProductRepository {
	async findAll(page: number, limit: number) {
		try {
			const offset = (page - 1) * limit;

			const [allProducts, [{ value: total }]] = await Promise.all([
				db.select().from(products).limit(limit).offset(offset),
				db.select({ value: count() }).from(products),
			]);

			return ok({ products: allProducts, total });
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async findById(id: string) {
		try {
			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.id, id));

			if (!product) {
				return err(new NotFoundError("Product", id));
			}

			return ok(product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch product: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async create(data: CreateProductInput) {
		try {
			const [product] = await db
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
				.returning();

			return ok(product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async update(id: string, data: UpdateProductInput) {
		try {
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

			const [product] = await db
				.update(products)
				.set(updateData)
				.where(eq(products.id, id))
				.returning();

			if (!product) {
				return err(new NotFoundError("Product", id));
			}

			return ok(product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async delete(id: string) {
		try {
			const [deleted] = await db
				.delete(products)
				.where(eq(products.id, id))
				.returning({ id: products.id });

			if (!deleted) {
				return err(new NotFoundError("Product", id));
			}

			return ok(undefined);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async addImages(id: string, images: Record<string, string>) {
		try {
			const [currentProduct] = await db
				.select({ images: products.images })
				.from(products)
				.where(eq(products.id, id));

			if (!currentProduct) {
				return err(new NotFoundError("Product", id));
			}

			const currentImages =
				(currentProduct.images as Record<string, string>) || {};
			const updatedImages = { ...currentImages, ...images };

			const [product] = await db
				.update(products)
				.set({ images: updatedImages, updatedAt: new Date() })
				.where(eq(products.id, id))
				.returning();

			if (!product) {
				return err(new NotFoundError("Product", id));
			}

			return ok(product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to add images: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async deleteImage(id: string, resolution: string) {
		try {
			const [currentProduct] = await db
				.select({ images: products.images })
				.from(products)
				.where(eq(products.id, id));

			if (!currentProduct) {
				return err(new NotFoundError("Product", id));
			}

			const currentImages =
				(currentProduct.images as Record<string, string>) || {};
			const updatedImages = { ...currentImages };
			delete updatedImages[resolution];

			const [product] = await db
				.update(products)
				.set({ images: updatedImages, updatedAt: new Date() })
				.where(eq(products.id, id))
				.returning();

			if (!product) {
				return err(new NotFoundError("Product", id));
			}

			return ok(product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}
}

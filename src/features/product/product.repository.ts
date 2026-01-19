import { count, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import type { Product } from "@/shared/config/schema";
import { products } from "@/shared/config/schema";
import { DatabaseError, NotFoundError } from "@/shared/errors";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

export class ProductRepository {
	async findAll(
		page: number,
		limit: number,
	): Promise<Result<{ products: Product[]; total: number }, DatabaseError>> {
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

	async findById(
		id: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
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

	async create(
		data: CreateProductInput,
	): Promise<Result<Product, DatabaseError>> {
		try {
			const [product] = await db
				.insert(products)
				.values({
					name: data.name,
					reference: data.reference,
					description: data.description,
					quantity: data.quantity,
					date: data.date ? new Date(data.date) : undefined,
					unitSellingPrice: data.unitSellingPrice.toString(),
					unitPurchasePrice: data.unitPurchasePrice.toString(),
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

	async update(
		id: string,
		data: UpdateProductInput,
	): Promise<Result<Product, NotFoundError | DatabaseError>> {
		try {
			const updateData: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			if (data.name !== undefined) updateData.name = data.name;
			if (data.reference !== undefined) updateData.reference = data.reference;
			if (data.description !== undefined)
				updateData.description = data.description;
			if (data.quantity !== undefined) updateData.quantity = data.quantity;
			if (data.date !== undefined) updateData.date = new Date(data.date);
			if (data.unitSellingPrice !== undefined)
				updateData.unitSellingPrice = data.unitSellingPrice.toString();
			if (data.unitPurchasePrice !== undefined)
				updateData.unitPurchasePrice = data.unitPurchasePrice.toString();

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

	async delete(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
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
}

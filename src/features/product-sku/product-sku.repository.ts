import { count, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";

import { db } from "@/shared/config/database";
import type { ProductSku } from "@/shared/config/schema";
import { productSkus, products } from "@/shared/config/schema";
import { DatabaseError, NotFoundError } from "@/shared/errors";
import type {
	CreateProductSkuInput,
	UpdateProductSkuInput,
} from "./product-sku.types";

export class ProductSkuRepository {
	async findAll(
		page: number,
		limit: number,
	): Promise<
		Result<{ productSkus: ProductSku[]; total: number }, DatabaseError>
	> {
		try {
			const offset = (page - 1) * limit;

			const [allProductSkus, [{ value: total }]] = await Promise.all([
				db.select().from(productSkus).limit(limit).offset(offset),
				db.select({ value: count() }).from(productSkus),
			]);

			return ok({ productSkus: allProductSkus, total });
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch product SKUs: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async findByProductId(
		productId: string,
	): Promise<Result<ProductSku[], DatabaseError>> {
		try {
			const skus = await db
				.select()
				.from(productSkus)
				.where(eq(productSkus.productId, productId));

			return ok(skus);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch product SKUs: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async findById(
		id: string,
	): Promise<Result<ProductSku, NotFoundError | DatabaseError>> {
		try {
			const [sku] = await db
				.select()
				.from(productSkus)
				.where(eq(productSkus.id, id));

			if (!sku) {
				return err(new NotFoundError("ProductSku", id));
			}

			return ok(sku);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to fetch product SKU: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async productExists(
		productId: string,
	): Promise<Result<boolean, DatabaseError>> {
		try {
			const [product] = await db
				.select({ id: products.id })
				.from(products)
				.where(eq(products.id, productId))
				.limit(1);

			return ok(!!product);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to check product existence: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async create(
		data: CreateProductSkuInput,
	): Promise<Result<ProductSku, DatabaseError>> {
		try {
			const [sku] = await db
				.insert(productSkus)
				.values({
					productId: data.productId,
					name: data.name,
					images: data.images || [],
				})
				.returning();

			return ok(sku);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to create product SKU: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async update(
		id: string,
		data: UpdateProductSkuInput,
	): Promise<Result<ProductSku, NotFoundError | DatabaseError>> {
		try {
			const updateData: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			if (data.name !== undefined) updateData.name = data.name;
			if (data.images !== undefined) updateData.images = data.images;

			const [sku] = await db
				.update(productSkus)
				.set(updateData)
				.where(eq(productSkus.id, id))
				.returning();

			if (!sku) {
				return err(new NotFoundError("ProductSku", id));
			}

			return ok(sku);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to update product SKU: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	async delete(
		id: string,
	): Promise<Result<void, NotFoundError | DatabaseError>> {
		try {
			const [deleted] = await db
				.delete(productSkus)
				.where(eq(productSkus.id, id))
				.returning({ id: productSkus.id });

			if (!deleted) {
				return err(new NotFoundError("ProductSku", id));
			}

			return ok(undefined);
		} catch (error) {
			return err(
				new DatabaseError(
					`Failed to delete product SKU: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}
}

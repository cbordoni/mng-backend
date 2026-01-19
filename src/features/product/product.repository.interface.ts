import type { Result } from "neverthrow";

import type { Product } from "@/shared/config/schema";
import type { DatabaseError, NotFoundError } from "@/shared/errors";

import type { CreateProductInput, UpdateProductInput } from "./product.types";

export interface IProductRepository {
	findAll(
		page: number,
		limit: number,
	): Promise<Result<{ products: Product[]; total: number }, DatabaseError>>;

	findById(id: string): Promise<Result<Product, NotFoundError | DatabaseError>>;

	create(data: CreateProductInput): Promise<Result<Product, DatabaseError>>;

	update(
		id: string,
		data: UpdateProductInput,
	): Promise<Result<Product, NotFoundError | DatabaseError>>;

	delete(id: string): Promise<Result<void, NotFoundError | DatabaseError>>;

	addImages(
		id: string,
		images: Record<string, string>,
	): Promise<Result<Product, NotFoundError | DatabaseError>>;

	deleteImage(
		id: string,
		resolution: string,
	): Promise<Result<Product, NotFoundError | DatabaseError>>;
}

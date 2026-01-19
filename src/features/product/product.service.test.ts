import { beforeEach, describe, expect, it } from "bun:test";

import { ValidationError } from "@/shared/errors";

import { MockProductRepository } from "./product.repository.mock";
import { ProductService } from "./product.service";
import type { CreateProductInput, UpdateProductInput } from "./product.types";

describe("ProductService", () => {
	let productService: ProductService;
	let mockRepository: MockProductRepository;

	beforeEach(() => {
		mockRepository = new MockProductRepository();
		productService = new ProductService(mockRepository);
	});

	describe("getAllProducts", () => {
		it("should return paginated products successfully", async () => {
			const mockProducts = [
				{
					id: "1",
					name: "Product 1",
					reference: "REF001",
					description: "Description 1",
					quantity: 10,
					date: null,
					price: "100.00",
					oldPrice: null,
					images: null,
					installments: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "2",
					name: "Product 2",
					reference: "REF002",
					description: "Description 2",
					quantity: 5,
					date: null,
					price: "200.00",
					oldPrice: null,
					images: null,
					installments: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			mockRepository.setProducts(mockProducts);

			const result = await productService.getAllProducts(1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const response = result.value;
				expect(response.data).toHaveLength(2);
				expect(response.meta.page).toBe(1);
				expect(response.meta.limit).toBe(10);
				expect(response.meta.total).toBe(2);
				expect(response.meta.totalPages).toBe(1);
			}
		});

		it("should handle pagination correctly", async () => {
			const mockProducts = Array.from({ length: 25 }, (_, i) => ({
				id: `${i + 1}`,
				name: `Product ${i + 1}`,
				reference: `REF${i + 1}`,
				description: `Description ${i + 1}`,
				quantity: 10,
				date: null,
				price: "100.00",
				oldPrice: null,
				images: null,
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));

			mockRepository.setProducts(mockProducts);

			const resultPage1 = await productService.getAllProducts(1, 10);
			const resultPage2 = await productService.getAllProducts(2, 10);

			expect(resultPage1.isOk()).toBe(true);
			expect(resultPage2.isOk()).toBe(true);

			if (resultPage1.isOk() && resultPage2.isOk()) {
				expect(resultPage1.value.data).toHaveLength(10);
				expect(resultPage2.value.data).toHaveLength(10);
				expect(resultPage1.value.meta.totalPages).toBe(3);
			}
		});

		it("should return empty array when no products exist", async () => {
			mockRepository.clearProducts();

			const result = await productService.getAllProducts(1, 10);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.data).toHaveLength(0);
				expect(result.value.meta.total).toBe(0);
			}
		});
	});

	describe("getProductById", () => {
		it("should return product when id exists", async () => {
			const mockProduct = {
				id: "123",
				name: "Test Product",
				reference: "REF123",
				description: "Test Description",
				quantity: 10,
				date: null,
				price: "99.99",
				oldPrice: null,
				images: null,
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setProducts([mockProduct]);

			const result = await productService.getProductById("123");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.id).toBe("123");
				expect(result.value.name).toBe("Test Product");
				expect(result.value.reference).toBe("REF123");
			}
		});

		it("should return NotFoundError when id does not exist", async () => {
			mockRepository.clearProducts();

			const result = await productService.getProductById("nonexistent");

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.name).toBe("NotFoundError");
			}
		});
	});

	describe("createProduct", () => {
		it("should create product successfully with valid data", async () => {
			const input: CreateProductInput = {
				name: "New Product",
				reference: "REF999",
				description: "New Description",
				price: 100.0,
				quantity: 10,
			};

			const result = await productService.createProduct(input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				const product = result.value;
				expect(product.name).toBe("New Product");
				expect(product.reference).toBe("REF999");
				expect(product.price).toBe("100");
				expect(product.id).toBeDefined();
			}
		});

		it("should fail when name is empty", async () => {
			const input: CreateProductInput = {
				name: "   ",
				reference: "REF999",
				price: 100.0,
			};

			const result = await productService.createProduct(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Name cannot be empty");
			}
		});

		it("should fail when price is zero", async () => {
			const input: CreateProductInput = {
				name: "Product",
				reference: "REF999",
				price: 0,
			};

			const result = await productService.createProduct(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Price must be greater than zero");
			}
		});

		it("should fail when price is negative", async () => {
			const input: CreateProductInput = {
				name: "Product",
				reference: "REF999",
				price: -10,
			};

			const result = await productService.createProduct(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Price must be greater than zero");
			}
		});

		it("should fail when oldPrice is zero", async () => {
			const input: CreateProductInput = {
				name: "Product",
				reference: "REF999",
				price: 100.0,
				oldPrice: 0,
			};

			const result = await productService.createProduct(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe(
					"Old price must be greater than zero",
				);
			}
		});

		it("should fail when quantity is zero", async () => {
			const input: CreateProductInput = {
				name: "Product",
				reference: "REF999",
				price: 100.0,
				quantity: 0,
			};

			const result = await productService.createProduct(input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Quantity must be greater than zero");
			}
		});

		it("should accept optional fields", async () => {
			const input: CreateProductInput = {
				name: "Product",
				reference: "REF999",
				price: 100.0,
				oldPrice: 150.0,
				quantity: 5,
				description: "Optional description",
			};

			const result = await productService.createProduct(input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.description).toBe("Optional description");
				expect(result.value.oldPrice).toBe("150");
			}
		});
	});

	describe("updateProduct", () => {
		beforeEach(() => {
			const mockProduct = {
				id: "123",
				name: "Original Product",
				reference: "REF123",
				description: "Original Description",
				quantity: 10,
				date: null,
				price: "100.00",
				oldPrice: null,
				images: null,
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setProducts([mockProduct]);
		});

		it("should update product successfully", async () => {
			const input: UpdateProductInput = {
				name: "Updated Product",
				price: 150.0,
			};

			const result = await productService.updateProduct("123", input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.name).toBe("Updated Product");
				expect(result.value.price).toBe("150");
			}
		});

		it("should fail when updating with empty name", async () => {
			const input: UpdateProductInput = {
				name: "   ",
			};

			const result = await productService.updateProduct("123", input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Name cannot be empty");
			}
		});

		it("should fail when updating with invalid price", async () => {
			const input: UpdateProductInput = {
				price: 0,
			};

			const result = await productService.updateProduct("123", input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Price must be greater than zero");
			}
		});

		it("should fail when updating with invalid quantity", async () => {
			const input: UpdateProductInput = {
				quantity: -5,
			};

			const result = await productService.updateProduct("123", input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(ValidationError);
				expect(result.error.message).toBe("Quantity must be greater than zero");
			}
		});

		it("should fail when product does not exist", async () => {
			const input: UpdateProductInput = {
				name: "Updated Product",
			};

			const result = await productService.updateProduct("nonexistent", input);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.name).toBe("NotFoundError");
			}
		});

		it("should allow partial updates", async () => {
			const input: UpdateProductInput = {
				name: "Updated Product",
			};

			const result = await productService.updateProduct("123", input);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.name).toBe("Updated Product");
				expect(result.value.price).toBe("100.00"); // unchanged
			}
		});
	});

	describe("deleteProduct", () => {
		beforeEach(() => {
			const mockProduct = {
				id: "123",
				name: "Product to Delete",
				reference: "REF123",
				description: "Description",
				quantity: 10,
				date: null,
				price: "100.00",
				oldPrice: null,
				images: null,
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setProducts([mockProduct]);
		});

		it("should delete product successfully", async () => {
			const result = await productService.deleteProduct("123");

			expect(result.isOk()).toBe(true);

			// Verify product was deleted
			const getResult = await productService.getProductById("123");
			expect(getResult.isErr()).toBe(true);
		});

		it("should fail when product does not exist", async () => {
			const result = await productService.deleteProduct("nonexistent");

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.name).toBe("NotFoundError");
			}
		});
	});

	describe("addImages", () => {
		beforeEach(() => {
			const mockProduct = {
				id: "123",
				name: "Product",
				reference: "REF123",
				description: "Description",
				quantity: 10,
				date: null,
				price: "100.00",
				oldPrice: null,
				images: null,
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setProducts([mockProduct]);
		});

		it("should add images successfully", async () => {
			const images = {
				"1920x1080": "https://example.com/image-1920.jpg",
				"1280x720": "https://example.com/image-1280.jpg",
			};

			const result = await productService.addImages("123", images);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.images).toBeDefined();
				expect(result.value.images?.["1920x1080"]).toBe(
					"https://example.com/image-1920.jpg",
				);
				expect(result.value.images?.["1280x720"]).toBe(
					"https://example.com/image-1280.jpg",
				);
			}
		});

		it("should merge with existing images", async () => {
			// First add some images
			const firstImages = {
				"1920x1080": "https://example.com/image-1920.jpg",
			};

			await productService.addImages("123", firstImages);

			// Then add more
			const secondImages = {
				"1280x720": "https://example.com/image-1280.jpg",
			};

			const result = await productService.addImages("123", secondImages);

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(Object.keys(result.value.images ?? {})).toHaveLength(2);
			}
		});

		it("should fail when product does not exist", async () => {
			const images = {
				"1920x1080": "https://example.com/image-1920.jpg",
			};

			const result = await productService.addImages("nonexistent", images);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.name).toBe("NotFoundError");
			}
		});
	});

	describe("deleteImage", () => {
		beforeEach(() => {
			const mockProduct = {
				id: "123",
				name: "Product",
				reference: "REF123",
				description: "Description",
				quantity: 10,
				date: null,
				price: "100.00",
				oldPrice: null,
				images: {
					"1920x1080": "https://example.com/image-1920.jpg",
					"1280x720": "https://example.com/image-1280.jpg",
				},
				installments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRepository.setProducts([mockProduct]);
		});

		it("should delete image successfully", async () => {
			const result = await productService.deleteImage("123", "1920x1080");

			expect(result.isOk()).toBe(true);

			if (result.isOk()) {
				expect(result.value.images?.["1920x1080"]).toBeUndefined();
				expect(result.value.images?.["1280x720"]).toBe(
					"https://example.com/image-1280.jpg",
				);
			}
		});

		it("should fail when product does not exist", async () => {
			const result = await productService.deleteImage(
				"nonexistent",
				"1920x1080",
			);

			expect(result.isErr()).toBe(true);

			if (result.isErr()) {
				expect(result.error.name).toBe("NotFoundError");
			}
		});
	});
});

# Product Feature

Product management feature implementing complete CRUD operations with advanced features like image management, price updates, and pagination support.

## Architecture

This feature follows the clean architecture pattern with clear separation of concerns:

```
product/
├── product.types.ts             # Validation schemas and type definitions
├── product.repository.interface.ts  # Repository contract
├── product.repository.ts        # Database access layer
├── product.repository.mock.ts   # In-memory repository for testing
├── product.service.ts           # Business logic layer
├── product.controller.ts        # HTTP response mapping layer
└── product.routes.ts            # API route definitions
```

### Layers

#### Types (`product.types.ts`)

- **CreateProductSchema**: Validation for creating products
  - Required: `name`, `price`
  - Optional: `reference`, `description`, `quantity`, `date`, `oldPrice`, `images`, `installments`
- **UpdateProductSchema**: Validation for updating products (all fields optional)
- **ProductIdSchema**: Validation for UUID parameters
- **AddImagesSchema**: Validation for adding product images
- **DeleteImageSchema**: Validation for deleting a specific image resolution
- **UpdateProductPriceSchema**: Validation for price updates

#### Repository Interface (`product.repository.interface.ts`)

Defines the contract that all repository implementations must follow, enabling dependency injection and easy testing.

#### Repository (`product.repository.ts`)

- Database operations using Drizzle ORM
- Returns `Result<T, E>` types (neverthrow)
- Methods:
  - `findAll(page, limit)` - Paginated product list with total count
  - `findById(id)` - Single product by UUID
  - `create(data)` - Create new product
  - `update(id, data)` - Update existing product
  - `delete(id)` - Delete product
  - `addImages(id, images)` - Add images to product
  - `deleteImage(id, resolution)` - Remove specific image resolution

#### Service (`product.service.ts`)

- Business logic and validation
- Orchestrates repository calls
- Returns `Result<T, E>` types
- Validates:
  - Name is not empty
  - Price is positive
  - Old price is positive (if provided)
  - Quantity is positive (if provided)

#### Controller (`product.controller.ts`)

- Maps `Result` types to HTTP responses
- Handles error transformations
- Returns appropriate status codes

#### Routes (`product.routes.ts`)

- Elysia route definitions
- Request validation with TypeBox schemas
- OpenAPI documentation metadata

## API Endpoints

### Get All Products (Paginated)

```http
GET /products?page=1&limit=10
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number (minimum: 1)
- `limit` (optional, default: 10) - Items per page (minimum: 1, maximum: 100)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "reference": "REF-001",
      "description": "Product description",
      "quantity": 100,
      "date": "2026-01-19T10:00:00Z",
      "price": 99.9,
      "oldPrice": 149.9,
      "images": {
        "thumbnail": "https://example.com/img1.jpg",
        "medium": "https://example.com/img2.jpg",
        "large": "https://example.com/img3.jpg"
      },
      "installments": [
        {
          "installment": 1,
          "fee": 0
        },
        {
          "installment": 3,
          "fee": 2.5
        }
      ],
      "createdAt": "2026-01-19T10:00:00Z",
      "updatedAt": "2026-01-19T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Product by ID

```http
GET /products/:id
```

**Parameters:**

- `id` (UUID) - Product identifier

**Response:**

```json
{
  "id": "uuid",
  "name": "Product Name",
  "reference": "REF-001",
  "description": "Product description",
  "quantity": 100,
  "date": "2026-01-19T10:00:00Z",
  "price": 99.9,
  "oldPrice": 149.9,
  "images": {
    "thumbnail": "https://example.com/img1.jpg"
  },
  "installments": [],
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:00:00Z"
}
```

**Status Codes:**

- `200 OK` - Product found
- `404 Not Found` - Product doesn't exist

### Create Product

```http
POST /products
```

**Request Body:**

```json
{
  "name": "New Product",
  "reference": "REF-001",
  "description": "Product description",
  "quantity": 100,
  "date": "2026-01-19T10:00:00Z",
  "price": 99.9,
  "oldPrice": 149.9,
  "images": {
    "thumbnail": "https://example.com/img1.jpg"
  },
  "installments": [
    {
      "installment": 1,
      "fee": 0
    }
  ]
}
```

**Required Fields:**

- `name` (string, min length: 1)
- `price` (number, minimum: 0.01)

**Optional Fields:**

- `reference` (string)
- `description` (string)
- `quantity` (number, minimum: 1)
- `date` (string, ISO date-time)
- `oldPrice` (number, minimum: 0.01)
- `images` (record of resolution → URL)
- `installments` (array of installment objects)

**Status Codes:**

- `201 Created` - Product created successfully
- `400 Bad Request` - Validation error

### Update Product

```http
PATCH /products/:id
```

**Parameters:**

- `id` (UUID) - Product identifier

**Request Body:**

All fields are optional. Only provided fields will be updated.

```json
{
  "name": "Updated Name",
  "price": 89.9,
  "quantity": 50
}
```

**Status Codes:**

- `200 OK` - Product updated
- `400 Bad Request` - Validation error
- `404 Not Found` - Product doesn't exist

### Delete Product

```http
DELETE /products/:id
```

**Parameters:**

- `id` (UUID) - Product identifier

**Status Codes:**

- `204 No Content` - Product deleted
- `404 Not Found` - Product doesn't exist

### Add Images to Product

```http
POST /products/:id/images
```

**Parameters:**

- `id` (UUID) - Product identifier

**Request Body:**

```json
{
  "images": {
    "thumbnail": "https://example.com/thumb.jpg",
    "medium": "https://example.com/medium.jpg",
    "large": "https://example.com/large.jpg"
  }
}
```

**Notes:**

- Images are stored as a record/map with resolution as key
- New images will be merged with existing ones
- Duplicate resolutions will be overwritten

**Status Codes:**

- `200 OK` - Images added
- `400 Bad Request` - Invalid image URLs
- `404 Not Found` - Product doesn't exist

### Delete Image from Product

```http
DELETE /products/:id/images
```

**Parameters:**

- `id` (UUID) - Product identifier

**Request Body:**

```json
{
  "resolution": "thumbnail"
}
```

**Status Codes:**

- `200 OK` - Image removed
- `404 Not Found` - Product doesn't exist

### Update Product Price

```http
PATCH /products/:id/price
```

**Parameters:**

- `id` (UUID) - Product identifier

**Request Body:**

```json
{
  "price": 79.9
}
```

**Validation:**

- Price must be greater than 0.01

**Status Codes:**

- `200 OK` - Price updated
- `400 Bad Request` - Invalid price
- `404 Not Found` - Product doesn't exist

## Business Rules

### Validation Rules

1. **Name**: Cannot be empty or contain only whitespace
2. **Price**: Must be greater than zero
3. **Old Price**: Must be greater than zero (when provided)
4. **Quantity**: Must be greater than zero (when provided)
5. **Images**: Must be valid URIs
6. **Installments**: Installment number must be at least 1, fee must be non-negative

### Image Management

- Images are stored as key-value pairs (resolution → URL)
- Common resolutions: `thumbnail`, `small`, `medium`, `large`, `xlarge`
- Resolutions are arbitrary strings - use what makes sense for your application
- Adding images merges with existing ones
- Deleting an image removes only the specified resolution

### Price Updates

A dedicated endpoint exists for price updates to:

- Enable easier price tracking/audit logging
- Simplify integration with pricing services
- Provide clear intent in API usage

## Testing

The feature includes:

- **Unit Tests** (`product.service.test.ts`): Business logic validation
- **Mock Repository** (`product.repository.mock.ts`): In-memory implementation for fast tests

## Use Cases

### E-commerce Integration

```typescript
// Create product with installment options
const product = await service.createProduct({
  name: "Premium Headphones",
  price: 299.9,
  oldPrice: 399.9,
  quantity: 50,
  installments: [
    { installment: 1, fee: 0 },
    { installment: 3, fee: 0 },
    { installment: 6, fee: 2.99 },
  ],
});
```

### Image Upload Flow

```typescript
// 1. Create product
const product = await service.createProduct({ name: "Camera", price: 1999 });

// 2. Upload images to CDN/storage
const uploadedUrls = await uploadImages(files);

// 3. Add images to product
await service.addImages(product.id, {
  thumbnail: uploadedUrls.thumb,
  medium: uploadedUrls.medium,
  large: uploadedUrls.large,
});
```

### Inventory Management

```typescript
// Update quantity after sale
await service.updateProduct(productId, {
  quantity: currentQuantity - soldQuantity,
});
```

## Compliance

This feature follows all rules defined in [AGENTS.md](../../../AGENTS.md):

- ✅ Result Pattern with neverthrow (no thrown errors)
- ✅ Feature-based structure
- ✅ Clear separation of concerns (repository → service → controller → routes)
- ✅ No business logic in controller/routes
- ✅ Repository interface for dependency injection
- ✅ Comprehensive validation in service layer
- ✅ TypeBox schemas for HTTP validation

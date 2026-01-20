# Order Feature

Order management feature implementing complete CRUD operations with automatic product price capture, order status management, and user-specific order retrieval.

## Architecture

This feature follows the clean architecture pattern with clear separation of concerns:

```
order/
├── order.types.ts                # Validation schemas and type definitions
├── order.repository.interface.ts # Repository contract
├── order.repository.ts           # Database access layer
├── order.repository.mock.ts      # In-memory repository for testing
├── order.service.ts              # Business logic layer
├── order.controller.ts           # HTTP response mapping layer
└── order.routes.ts               # API route definitions
```

### Layers

#### Types (`order.types.ts`)

- **CreateOrderSchema**: Validation for creating orders
  - Required: `userId`, `items` (array with productId and quantity)
- **UpdateOrderSchema**: Validation for updating order status
  - Optional: `status` (pending | confirmed | shipped | delivered | cancelled)
- **OrderIdSchema**: Validation for UUID parameters
- **OrderItemSchema**: Validation for order items

#### Repository Interface (`order.repository.interface.ts`)

Defines the contract that all repository implementations must follow, enabling dependency injection and easy testing.

#### Repository (`order.repository.ts`)

- Database operations using Drizzle ORM
- Returns `Result<T, E>` types (neverthrow)
- Methods:
  - `findAll(page, limit)` - Paginated order list with total count
  - `findById(id)` - Single order by UUID with all items
  - `findByUserId(userId, page, limit)` - User-specific orders paginated
  - `update(id, data)` - Update order status
  - `delete(id)` - Delete order

**Note**: Order creation is handled entirely in the service layer to properly capture product prices.

#### Service (`order.service.ts`)

- Business logic and validation
- **Price Capture**: Automatically captures current product prices when creating orders
- Validates:
  - User exists
  - All products exist
  - Quantities are positive
  - Order deletion rules (only pending/cancelled)
- Returns `Result<T, E>` types
- Methods:
  - `getAllOrders(page, limit)` - Returns paginated orders
  - `getOrderById(id)` - Returns single order with items
  - `getOrdersByUserId(userId, page, limit)` - Returns user's orders
  - `createOrder(data)` - Creates order with price snapshots
  - `updateOrder(id, data)` - Updates order status
  - `deleteOrder(id)` - Deletes order (with restrictions)

#### Controller (`order.controller.ts`)

- Maps `Result` types to HTTP responses
- Handles error transformations
- Returns appropriate status codes

#### Routes (`order.routes.ts`)

- Elysia route definitions
- Request validation with TypeBox schemas
- OpenAPI documentation metadata

## API Endpoints

### Get All Orders (Paginated)

```http
GET /orders?page=1&limit=10
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
      "userId": "user-uuid",
      "items": [
        {
          "id": "item-uuid",
          "orderId": "uuid",
          "productId": "product-uuid",
          "productName": "Product Name",
          "quantity": 2,
          "priceAtOrder": 99.9,
          "subtotal": 199.8
        }
      ],
      "total": 199.8,
      "status": "pending",
      "createdAt": "2026-01-20T10:00:00Z",
      "updatedAt": "2026-01-20T10:00:00Z"
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

**Status Codes:**

- `200 OK` - Orders retrieved successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Database error

### Get Order by ID

```http
GET /orders/:id
```

**Parameters:**

- `id` (UUID) - Order identifier

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "items": [
      {
        "id": "item-uuid",
        "orderId": "uuid",
        "productId": "product-uuid",
        "productName": "Premium Headphones",
        "quantity": 1,
        "priceAtOrder": 299.9,
        "subtotal": 299.9
      }
    ],
    "total": 299.9,
    "status": "confirmed",
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-01-20T11:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Order found
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Order doesn't exist
- `500 Internal Server Error` - Database error

### Get Orders by User ID

```http
GET /orders/user/:userId?page=1&limit=10
```

**Parameters:**

- `userId` (UUID) - User identifier

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**

```json
{
  "data": [
    {
      "id": "order-uuid",
      "userId": "user-uuid",
      "items": [...],
      "total": 500.00,
      "status": "shipped",
      "createdAt": "2026-01-20T10:00:00Z",
      "updatedAt": "2026-01-20T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Status Codes:**

- `200 OK` - User orders retrieved
- `400 Bad Request` - Invalid user ID
- `500 Internal Server Error` - Database error

### Create Order

```http
POST /orders
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "items": [
    {
      "productId": "product-uuid-1",
      "quantity": 2
    },
    {
      "productId": "product-uuid-2",
      "quantity": 1
    }
  ]
}
```

**Required Fields:**

- `userId` (string, UUID) - User creating the order
- `items` (array, min 1 item) - Order items
  - `productId` (string, UUID) - Product identifier
  - `quantity` (number, minimum: 1) - Quantity to order

**Response:** (Status: 201)

```json
{
  "data": {
    "id": "new-order-uuid",
    "userId": "user-uuid",
    "items": [
      {
        "id": "item-uuid-1",
        "orderId": "new-order-uuid",
        "productId": "product-uuid-1",
        "productName": "Product 1",
        "quantity": 2,
        "priceAtOrder": 50.0,
        "subtotal": 100.0
      },
      {
        "id": "item-uuid-2",
        "orderId": "new-order-uuid",
        "productId": "product-uuid-2",
        "productName": "Product 2",
        "quantity": 1,
        "priceAtOrder": 150.0,
        "subtotal": 150.0
      }
    ],
    "total": 250.0,
    "status": "pending",
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-01-20T10:00:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Order created successfully
- `400 Bad Request` - Validation error (invalid data, empty items)
- `404 Not Found` - User or product not found
- `500 Internal Server Error` - Database error

### Update Order Status

```http
PATCH /orders/:id
```

**Parameters:**

- `id` (UUID) - Order identifier

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**

- `pending` - Order created, awaiting confirmation
- `confirmed` - Order confirmed, ready for processing
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

**Status Codes:**

- `200 OK` - Order status updated
- `400 Bad Request` - Invalid status value
- `404 Not Found` - Order doesn't exist
- `500 Internal Server Error` - Database error

### Delete Order

```http
DELETE /orders/:id
```

**Parameters:**

- `id` (UUID) - Order identifier

**Business Rule:** Only orders with status `pending` or `cancelled` can be deleted.

**Status Codes:**

- `204 No Content` - Order deleted successfully
- `400 Bad Request` - Cannot delete order (invalid status)
- `404 Not Found` - Order doesn't exist
- `500 Internal Server Error` - Database error

## Business Rules

### Price Capture

**Critical Feature**: When an order is created, the system captures the **current price** of each product at that moment. This ensures:

- Historical accuracy - Orders reflect prices at the time of purchase
- Price changes don't affect existing orders
- Audit trail for pricing
- Protection against retroactive price changes

**Implementation**: The service fetches product data and stores:

- `productName` - Product name at order time
- `priceAtOrder` - Product price when order was created
- `subtotal` - Calculated as `priceAtOrder × quantity`

### Order Status Workflow

Typical order lifecycle:

```
pending → confirmed → shipped → delivered
   ↓
cancelled
```

### Validation Rules

1. **User Validation**: User must exist in the system
2. **Product Validation**: All products in order must exist
3. **Quantity Validation**: Quantities must be positive integers (≥ 1)
4. **Items Validation**: Order must contain at least one item
5. **Deletion Rules**: Only pending or cancelled orders can be deleted

### Data Integrity

- **Cascade Delete**: When an order is deleted, all associated order items are automatically deleted
- **Restrict Delete**: Products cannot be deleted if they are referenced in order items
- **User Cascade**: If a user is deleted, all their orders are deleted

## Database Schema

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_order NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL
);
```

## Testing

The feature includes:

- **Unit Tests** (`order.service.test.ts`): Business logic validation
- **Mock Repository** (`order.repository.mock.ts`): In-memory implementation for fast tests

## Use Cases

### E-commerce Checkout

```typescript
// Customer places an order
const order = await service.createOrder({
  userId: "customer-uuid",
  items: [
    { productId: "product-1", quantity: 2 },
    { productId: "product-2", quantity: 1 },
  ],
});

// Prices are captured automatically at current values
// Even if product prices change later, the order maintains original prices
```

### Order Fulfillment

```typescript
// Update order through fulfillment stages
await service.updateOrder(orderId, { status: "confirmed" });
await service.updateOrder(orderId, { status: "shipped" });
await service.updateOrder(orderId, { status: "delivered" });
```

### Customer Order History

```typescript
// Get all orders for a specific customer
const customerOrders = await service.getOrdersByUserId(userId, 1, 20);
```

### Admin Order Management

```typescript
// Get all orders with pagination
const allOrders = await service.getAllOrders(1, 50);
```

## Error Responses

### 400 - Validation Error

```json
{
  "error": "Order must have at least one item",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

### 404 - Not Found

```json
{
  "error": "User with id {uuid} not found",
  "code": "NOT_FOUND",
  "status": 404
}
```

```json
{
  "error": "Products not found: product-id-1, product-id-2",
  "code": "NOT_FOUND",
  "status": 404
}
```

### 500 - Database Error

```json
{
  "error": "Internal server error",
  "code": "DATABASE_ERROR",
  "status": 500
}
```

## Examples

### cURL Examples

**Create an order:**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "items": [
      {
        "productId": "product-uuid-1",
        "quantity": 2
      },
      {
        "productId": "product-uuid-2",
        "quantity": 1
      }
    ]
  }'
```

**Get user orders:**

```bash
curl http://localhost:3000/orders/user/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10
```

**Update order status:**

```bash
curl -X PATCH http://localhost:3000/orders/order-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Delete order:**

```bash
curl -X DELETE http://localhost:3000/orders/order-uuid
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
- ✅ Price capture for historical accuracy

## OpenAPI Documentation

See OpenAPI documentation at `/docs` for interactive API testing.

## Dependencies

- **Elysia**: HTTP framework
- **Drizzle ORM**: Database operations
- **neverthrow**: Result pattern for error handling
- **TypeBox** (via Elysia): Schema validation

## Shared Types

This feature uses shared types from `@/shared/types`:

- `PaginationQuerySchema` - Query parameter validation
- `PaginationQuery` - Pagination input type
- `PaginatedResponse<T>` - Standardized pagination response format

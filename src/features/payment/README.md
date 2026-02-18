# Payment Feature

Payment management feature supporting multiple payment types with validation and status tracking.

## Architecture

This feature follows the clean architecture pattern with clear separation of concerns:

```
payment/
├── payment.types.ts                # Validation schemas and type definitions
├── payment.repository.interface.ts # Repository contract
├── payment.repository.ts           # Database access layer
├── payment.repository.mock.ts      # In-memory repository for testing
├── payment.service.ts              # Business logic layer
├── payment.controller.ts           # HTTP response mapping layer
└── payment.routes.ts               # API route definitions
```

### Layers

#### Types (`payment.types.ts`)

- **CreatePaymentSchema**: Validation for creating payments
  - Required: `orderId`, `type`, `amount`
  - Optional: `installments`, `transactionId`, `metadata`
- **UpdatePaymentSchema**: Validation for updating payments (all fields optional)
- **PaymentIdSchema**: Validation for UUID parameters

**Payment Types:**
- `pix`: Brazilian instant payment system
- `creditCard`: Credit card payments (supports installments 1-24)
- `debitCard`: Debit card payments (no installments)
- `cash`: Cash payments (no installments)
- `installmentBooklet`: Traditional installment booklet (supports installments 1-24)

**Payment Status:**
- `pending`: Payment initiated, awaiting processing
- `processing`: Payment being processed
- `completed`: Payment successfully completed
- `failed`: Payment failed
- `cancelled`: Payment cancelled
- `refunded`: Payment refunded

#### Repository Interface (`payment.repository.interface.ts`)

Defines the contract that all repository implementations must follow, enabling dependency injection and easy testing.

#### Repository (`payment.repository.ts`)

- Database operations using Drizzle ORM
- Returns `Result<T, E>` types (neverthrow)
- Methods:
  - `findAll(page, limit)` - Paginated payment list with total count
  - `findById(id)` - Single payment by UUID
  - `findByOrderId(orderId)` - All payments for a specific order
  - `create(data)` - Create new payment
  - `update(id, data)` - Update existing payment
  - `delete(id)` - Delete payment

#### Service (`payment.service.ts`)

- Business logic and validation
- Orchestrates repository calls
- Returns `Result<T, E>` types
- Methods:
  - `getAllPayments(page, limit)` - Returns paginated response
  - `getPaymentById(id)` - Returns single payment
  - `getPaymentsByOrderId(orderId)` - Returns all payments for an order
  - `createPayment(data)` - Creates payment with validations
  - `updatePayment(id, data)` - Updates payment
  - `deletePayment(id)` - Deletes payment

**Validations:**
- Payment type must be one of the supported types
- Amount must be greater than zero
- Installments validation:
  - Only allowed for `creditCard` and `installmentBooklet`
  - Must be between 1 and 24 when provided
  - Not allowed for `pix`, `debitCard`, and `cash`

#### Controller (`payment.controller.ts`)

- Maps HTTP requests to service calls
- Converts `Result` types to HTTP responses
- No business logic

#### Routes (`payment.routes.ts`)

- Defines API endpoints with OpenAPI documentation
- Includes TypeBox validation schemas
- Endpoints:
  - `GET /payments` - List all payments (paginated)
  - `GET /payments/:id` - Get payment by ID
  - `GET /payments/order/:orderId` - Get payments for specific order
  - `POST /payments` - Create new payment
  - `PATCH /payments/:id` - Update payment
  - `DELETE /payments/:id` - Delete payment

## Usage Examples

### Create PIX Payment

```typescript
POST /payments
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "pix",
  "amount": "150.00",
  "transactionId": "pix-txn-123"
}
```

### Create Credit Card Payment with Installments

```typescript
POST /payments
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "creditCard",
  "amount": "300.00",
  "installments": 3,
  "transactionId": "cc-txn-456",
  "metadata": {
    "cardBrand": "visa",
    "lastFourDigits": "1234"
  }
}
```

### Update Payment Status

```typescript
PATCH /payments/:id
{
  "status": "completed",
  "transactionId": "final-txn-789"
}
```

### Get All Payments for an Order

```typescript
GET /payments/order/550e8400-e29b-41d4-a716-446655440000
```

## Testing

The feature includes comprehensive tests covering:
- Pagination
- Payment creation with all types
- Validation rules (amount, installments, payment types)
- Payment updates
- Payment deletion
- Finding payments by order
- Error cases

Run tests with:
```bash
bun test src/features/payment/payment.service.test.ts
```

## Business Rules

1. **Payment Type Validation**: Only accept defined payment types
2. **Amount Validation**: Amount must be positive and greater than zero
3. **Installments Rules**:
   - Only `creditCard` and `installmentBooklet` can have installments
   - Installments must be between 1 and 24
   - Other payment types cannot have installments
4. **Status Flow**: Payments start as `pending` and can transition through defined statuses
5. **Order Association**: Each payment must be associated with a valid order

## Error Handling

All operations return `Result<T, E>` types:
- `ValidationError`: For business rule violations
- `NotFoundError`: When payment or order doesn't exist
- `DatabaseError`: For database operation failures

The controller maps these to appropriate HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content (delete)
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error (database errors)

# User Feature

User management feature implementing CRUD operations with pagination support.

## Architecture

This feature follows the clean architecture pattern with clear separation of concerns:

```
user/
├── user.types.ts                # Validation schemas and type definitions
├── user.repository.interface.ts # Repository contract
├── user.repository.ts           # Database access layer
├── user.repository.mock.ts      # In-memory repository for testing
├── user.service.ts              # Business logic layer
├── user.controller.ts           # HTTP response mapping layer
└── user.routes.ts               # API route definitions
```

### Layers

#### Types (`user.types.ts`)

- **CreateUserSchema**: Validation for creating users
  - Required: `name`, `email`, `cellphone`
- **UpdateUserSchema**: Validation for updating users (all fields optional)
- **UserIdSchema**: Validation for UUID parameters

#### Repository Interface (`user.repository.interface.ts`)

Defines the contract that all repository implementations must follow, enabling dependency injection and easy testing.

#### Repository (`user.repository.ts`)

- Database operations using Drizzle ORM
- Returns `Result<T, E>` types (neverthrow)
- Methods:
  - `findAll(page, limit)` - Paginated user list with total count
  - `findById(id)` - Single user by UUID
  - `create(data)` - Create new user
  - `update(id, data)` - Update existing user
  - `delete(id)` - Delete user

#### Service (`user.service.ts`)

- Business logic and validation
- Orchestrates repository calls
- Returns `Result<T, E>` types
- Methods:
  - `getAllUsers(page, limit)` - Returns paginated response
  - `getUserById(id)` - Returns single user
  - `createUser(data)` - Validates and creates user
  - `updateUser(id, data)` - Validates and updates user
  - `deleteUser(id)` - Deletes user

#### Controller (`user.controller.ts`)

- Maps `Result` types to HTTP responses
- Handles error transformations
- Returns appropriate status codes

#### Routes (`user.routes.ts`)

- Elysia route definitions
- Request validation with TypeBox schemas
- OpenAPI documentation metadata

## API Endpoints

### Get All Users (Paginated)

```http
GET /users?page=1&limit=10
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
      "name": "John Doe",
      "email": "john@example.com",
      "cellphone": "+5511999999999",
      "createdAt": "2026-01-19T10:00:00Z",
      "updatedAt": "2026-01-19T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Get User by ID

```http
GET /users/:id
```

**Response:**

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "cellphone": "+5511999999999",
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:00:00Z"
}
```

**Status Codes:**

- `200 OK` - User found
- `404 Not Found` - User doesn't exist

### Create User

```http
POST /users
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "cellphone": "+5511999999999"
}
```

**Required Fields:**

- `name` (string, min length: 1)
- `email` (string, valid email format)
- `cellphone` (string, 10-15 characters)

**Response:** (Status: 201)

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "cellphone": "+5511999999999",
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:00:00Z"
}
```

**Status Codes:**

- `201 Created` - User created successfully
- `400 Bad Request` - Validation error

### Update User

```http
PATCH /users/:id
```

**Request Body:** (all fields optional)

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "cellphone": "+5511988888888"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "cellphone": "+5511988888888",
  "createdAt": "2026-01-19T10:00:00Z",
  "updatedAt": "2026-01-19T10:30:00Z"
}
```

**Status Codes:**

- `200 OK` - User updated successfully
- `400 Bad Request` - Validation error
- `404 Not Found` - User doesn't exist

### Delete User

```http
DELETE /users/:id
```

**Parameters:**

- `id` (UUID) - User identifier

**Status Codes:**

- `204 No Content` - User deleted successfully
- `404 Not Found` - User doesn't exist

## Business Rules

### Validation Rules

1. **Name**: Cannot be empty (after trimming whitespace), minimum 1 character
2. **Email**: Must be a valid email format
3. **Cellphone**: Must be between 10-15 characters, should contain at least 10 digits after removing non-digit characters

### Email Uniqueness

- Email addresses must be unique across all users
- Database constraint enforces uniqueness
- Duplicate email will result in a database error

## Error Responses

### 400 - Validation Error

```json
{
  "error": "Invalid cellphone number",
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

### 500 - Database Error

```json
{
  "error": "Internal server error",
  "code": "DATABASE_ERROR",
  "status": 500
}
```

## Validation Rules (Schema Level)

### Create User

- `name`: Required, minimum 1 character
- `email`: Required, valid email format
- `cellphone`: Required, 10-15 characters

### Update User

- `name`: Optional, minimum 1 character if provided
- `email`: Optional, valid email format if provided
- `cellphone`: Optional, 10-15 characters if provided

## Testing

The feature includes:

- **Unit Tests** (`user.service.test.ts`): Business logic validation
- **Mock Repository** (`user.repository.mock.ts`): In-memory implementation for fast tests

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cellphone TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Examples

### cURL Examples

**Get paginated users:**

```bash
curl http://localhost:3000/users?page=1&limit=20
```

**Get specific user:**

```bash
curl http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000
```

**Create user:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "cellphone": "+5511999999999"
  }'
```

**Update user:**

```bash
curl -X PATCH http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**Delete user:**

```bash
curl -X DELETE http://localhost:3000/users/123e4567-e89b-12d3-a456-426614174000
```

## Use Cases

### User Registration

```typescript
// Register new user with validation
const result = await service.createUser({
  name: "John Doe",
  email: "john@example.com",
  cellphone: "+5511999999999",
});
```

### User Profile Updates

```typescript
// Update only specific fields
await service.updateUser(userId, {
  cellphone: "+5511988888888",
});
```

### User Listing with Pagination

```typescript
// Get paginated list of users
const users = await service.getAllUsers(1, 20);
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

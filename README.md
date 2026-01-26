# MNG Backend V2

A modern backend API built with Bun, Elysia, and PostgreSQL following clean architecture principles.

## Stack

- **Runtime**: Bun
- **Framework**: Elysia
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: TypeBox
- **Error Handling**: Result Pattern (neverthrow)
- **Lint/Formatter**: BiomeJS

## Features

- ✅ Health check endpoint with DB latency
- ✅ User CRUD with pagination and validation
- ✅ Product CRUD with image management and price updates
- ✅ Order management capturing product price snapshots
- ✅ Feature-based architecture
- ✅ Result pattern for error handling
- ✅ Type-safe database operations
- ✅ Input validation with TypeBox
- ✅ OpenAPI documentation at `/docs`

## Project Structure

```
src/
├── features/
│   ├── health/
│   ├── user/
│   ├── product/
│   └── order/
├── shared/
│   ├── config/
│   │   ├── database.ts         # DB connection
│   │   └── schema.ts           # Drizzle schema
│   └── errors/
│       └── domain-error.ts     # Error classes
├── app.ts                      # App configuration
└── index.ts                    # Entry point
```

## Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Start PostgreSQL with Docker**:

   ```bash
   docker-compose up -d
   ```

   This will start a PostgreSQL 16 database on port 5432 with:
   - Database: `mng_backend`
   - User: `postgres`
   - Password: `postgres`

3. **Configure environment**:

   ```bash
   cp .env.example .env
   ```

   The default `.env.example` is configured for the Docker database:

   ```
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/mng_backend
   PORT=3000
   DB_SYNC=false
   ```

4. **Run migrations**:

   ```bash
   bun run db:push
   ```

5. **Start development server**:
   ```bash
   bun run dev
   ```

## API Overview

- OpenAPI docs: `http://localhost:3000/docs`
- Root health: `GET /health`

## Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d mng_backend
```

## API Endpoints

### Health

- `GET /health` - Service and database status

### Users

- `GET /users` - Paginated list
- `GET /users/:id` - Fetch one
- `POST /users` - Create
- `PATCH /users/:id` - Update
- `DELETE /users/:id` - Delete

### Products

- `GET /products` - Paginated list
- `GET /products/:id` - Fetch one
- `POST /products` - Create
- `PATCH /products/:id` - Update
- `DELETE /products/:id` - Delete
- `POST /products/:id/images` - Add images
- `DELETE /products/:id/images` - Remove a resolution
- `PATCH /products/:id/price` - Update price

### Orders

- `GET /orders` - Paginated list
- `GET /orders/:id` - Fetch one
- `GET /orders/user/:userId` - User orders with pagination
- `POST /orders` - Create (captures product prices at purchase time)
- `PATCH /orders/:id` - Update status
- `DELETE /orders/:id` - Delete (pending/cancelled only)

### Quick Examples

Create user:

```bash
curl -X POST http://localhost:3000/users \
   -H "Content-Type: application/json" \
   -d '{
      "name": "John Doe",
      "email": "john@example.com",
      "cellphone": "+5511999999999"
   }'
```

Create order:

```bash
curl -X POST http://localhost:3000/orders \
   -H "Content-Type: application/json" \
   -d '{
      "userId": "<user-uuid>",
      "items": [
         { "productId": "<product-uuid>", "quantity": 2 }
      ]
   }'
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run dev:sync` - Start dev server and sync schema
- `bun run start` - Start production server
- `bun run start:sync` - Start production server and sync schema
- `bun run test` - Run tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Apply migrations
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run lint` - Lint code
- `bun run format` - Format code
- `bun run check` - Lint and format code

## Architecture Principles

This project follows the rules defined in [AGENTS.md](./AGENTS.md):

1. **Feature-Based Structure**: Code organized by domain, not technical layers
2. **Result Pattern**: No throwing errors in business logic
3. **Separation of Concerns**: Clear boundaries between layers
4. **Type Safety**: Full TypeScript with strict mode
5. **Validation**: All inputs validated with TypeBox schemas
6. **Clean Code**: BiomeJS enforced code standards

## Database Schema

Drizzle migrations define tables for users, products, orders, and order items. Use `bun run db:studio` for an interactive view or inspect `drizzle/` for the current snapshots.

## Development

The project uses:

- Path aliases: `@/` maps to `src/`
- Strict TypeScript configuration
- BiomeJS for consistent code style
- Drizzle for type-safe database queries

## License

MIT

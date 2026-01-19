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

- ✅ User CRUD (Create, Read, Update, Delete)
- ✅ Feature-based architecture
- ✅ Result pattern for error handling
- ✅ Type-safe database operations
- ✅ Input validation with TypeBox
- ✅ Clean separation of concerns

## Project Structure

```
src/
├── features/
│   └── user/
│       ├── user.controller.ts  # HTTP response mapping
│       ├── user.service.ts     # Business logic
│       ├── user.repository.ts  # Database operations
│       ├── user.routes.ts      # API routes
│       └── user.types.ts       # Validation schemas
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
   ```

4. **Run migrations**:

   ```bash
   bun run db:push
   ```

5. **Start development server**:
   ```bash
   bun run dev
   ```

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

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example Requests

**Create User**:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "cellphone": "+5511999999999"
  }'
```

**Get All Users**:

```bash
curl http://localhost:3000/users
```

**Get User by ID**:

```bash
curl http://localhost:3000/users/{uuid}
```

**Update User**:

```bash
curl -X PATCH http://localhost:3000/users/{uuid} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**Delete User**:

```bash
curl -X DELETE http://localhost:3000/users/{uuid}
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
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

### Users Table

| Column     | Type      | Constraints           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary Key, Auto-gen |
| name       | TEXT      | Not Null              |
| email      | TEXT      | Not Null, Unique      |
| cellphone  | TEXT      | Not Null              |
| created_at | TIMESTAMP | Not Null, Default Now |
| updated_at | TIMESTAMP | Not Null, Default Now |

## Development

The project uses:

- Path aliases: `~/` maps to `src/`
- Strict TypeScript configuration
- BiomeJS for consistent code style
- Drizzle for type-safe database queries

## License

MIT

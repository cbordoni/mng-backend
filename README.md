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
- ✅ Product CRUD with image management
- ✅ Google OAuth authentication
- ✅ Feature-based architecture
- ✅ Result pattern for error handling
- ✅ Type-safe database operations
- ✅ Input validation with TypeBox
- ✅ Clean separation of concerns
- ✅ OpenAPI documentation

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
   DB_SYNC=false
   ```

   For Google OAuth authentication, add your credentials:

   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

   See [Google OAuth Setup](#google-oauth-setup) for instructions on obtaining credentials.

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

## Google OAuth Setup

To enable Google OAuth authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or People API)
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - Add your app name
   - Add authorized domains
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://your-domain.com/auth/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### Authentication Flow

1. Frontend redirects user to `GET /auth/google`
2. User is redirected to Google's OAuth consent screen
3. After consent, Google redirects to `/auth/google/callback` with authorization code
4. Backend exchanges code for user info and creates/retrieves user
5. Backend returns user session data

### API Endpoints

- `GET /auth/google` - Initiate OAuth flow (returns authorization URL)
- `GET /auth/google/callback` - Handle OAuth callback (returns user session)

Access the API documentation at `http://localhost:3000/docs` for interactive testing.

## Development

The project uses:

- Path aliases: `~/` maps to `src/`
- Strict TypeScript configuration
- BiomeJS for consistent code style
- Drizzle for type-safe database queries

## License

MIT

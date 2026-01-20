# Health Feature

Health check feature for monitoring API and database connectivity status.

## Architecture

This feature follows the clean architecture pattern with clear separation of concerns:

```
health/
├── health.types.ts       # Type definitions for health status
├── health.service.ts     # Health check logic
├── health.controller.ts  # HTTP response mapping layer
└── health.routes.ts      # API route definitions
```

### Layers

#### Types (`health.types.ts`)

- **HealthStatus**: Response type containing system status information
  - `status`: Overall system health ("ok" | "degraded" | "error")
  - `database`: Database connection status and latency
  - `timestamp`: ISO timestamp of the health check

#### Service (`health.service.ts`)

- Performs health checks for critical system components
- Returns `Result<HealthStatus, DomainError>` type (neverthrow)
- Methods:
  - `checkHealth()` - Verifies database connectivity and measures latency

**Health Check Logic:**

- Executes simple database query (`SELECT 1`)
- Measures database response time
- Returns status "ok" with latency on success
- Returns status "error" if database is unreachable

#### Controller (`health.controller.ts`)

- Maps `Result` types to HTTP responses
- Returns appropriate status codes
- No business logic

#### Routes (`health.routes.ts`)

- Elysia route definition
- OpenAPI documentation metadata

## API Endpoints

### Health Check

```http
GET /health
```

**Response (Healthy):**

```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "latency": 15
  },
  "timestamp": "2026-01-19T10:00:00.000Z"
}
```

**Response (Database Error):**

```json
{
  "status": "error",
  "database": {
    "connected": false
  },
  "timestamp": "2026-01-19T10:00:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Health check executed successfully (even if status is "error")

## Use Cases

### Monitoring

Use this endpoint to monitor application health in production:

```bash
curl http://localhost:3000/health
```

### Load Balancer Health Checks

Configure your load balancer to use this endpoint for health checks:

```yaml
# Example: Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### CI/CD Readiness Checks

Verify the application is ready before running tests or deployments:

```bash
# Wait for app to be healthy
while [[ $(curl -s http://localhost:3000/health | jq -r '.status') != "ok" ]]; do
  echo "Waiting for app to be healthy..."
  sleep 2
done
```

## Implementation Details

### Database Connection Check

The service uses a lightweight query (`SELECT 1`) to verify database connectivity without impacting performance. Latency is measured using `performance.now()` for high-precision timing.

### Error Handling

Database connection errors are caught and returned as part of the response rather than throwing exceptions, ensuring the endpoint always returns a valid response.

## Testing

The feature includes unit tests (`health.service.test.ts`) that verify:

- Successful health checks when database is available
- Proper error status when database is unavailable
- Accurate latency measurement

## Compliance

This feature follows all rules defined in [AGENTS.md](../../../AGENTS.md):

- ✅ Result Pattern with neverthrow (no thrown errors)
- ✅ Feature-based structure
- ✅ Clear separation of concerns
- ✅ No business logic in controller/routes

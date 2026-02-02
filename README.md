# Family Finance Backend

Monolithic NestJS backend for the Family Finance platform. The service exposes authentication, account, transaction, category, and user APIs backed by PostgreSQL via Prisma, with Redis for caching and health checks. The application can run locally, inside Docker, or as a production container that serves compiled TypeScript.

## Hosted Environments

- Development API: [https://api-dev.familyfinance.site](https://api-dev.familyfinance.site)
- Production API: [https://api.familyfinance.site](https://api.familyfinance.site)

## Architecture

### High-level topology

Clients (web/mobile) can talk directly to the backend in local setups, or through the API gateway in production-style deployments.

```
Clients
   │
   ├── Direct (local): HTTP → Backend → PostgreSQL / Redis
   │
   └── Full stack: HTTP(S) → API Gateway (proxy, TLS, routing) → Backend → PostgreSQL / Redis
```

### NestJS modular structure

- **Controllers** expose HTTP endpoints, apply guards, and validate DTOs.
- **Services** hold business logic and data access orchestration.
- **DatabaseService** wraps PrismaClient with the Postgres adapter for efficient pooling.
- **Common utilities** provide validation helpers, cookie parsing, and shared exceptions.

### Persistence layer (Prisma + PostgreSQL)

- Models live in `prisma/schema.prisma` and are versioned through migrations.
- Generated client code is committed under `prisma/generated` for consistent builds.
- Migrations are applied via `prisma migrate dev` (development) or `prisma migrate deploy` (production).

### Caching and health checks

- Redis is used for connectivity checks and future caching extensions.
- `/health` verifies PostgreSQL and Redis readiness.

### Observability

- Prometheus metrics are exposed at `GET /metrics` using `prom-client`.
- Swagger/OpenAPI is available at `/api` in all environments.

## Functional Scope

- User authentication with refresh tokens in httpOnly cookies and access tokens in JSON
- Account management (create/update/delete) with multiple account types
- Transaction management (income, expense, transfer)
- Categories (icons, colors) and user profile updates
- Health and metrics endpoints for production monitoring

## Data Model Overview

Key entities:

- **User**: credentials, profile, and account ownership
- **Account**: balance, type, currency, belongs to a user
- **Transaction**: income/expense/transfer entries tied to accounts
- **Category**: metadata for transaction classification
- **Group / UserGroup**: user grouping (team/family scenarios)
- **Goal**: savings/targets
- **Notification**: user notifications

Supported enums:

- `AccountType`: DEBIT, CREDIT, CASH, BANK, INVESTMENT, DEPOSIT, DIGITAL, SAVINGS
- `CurrencyType`: UAH, USD, EUR
- `TransactionType`: EXPENSE, INCOME, TRANSFER

## Technology Stack & Dependencies

### Runtime dependencies

- **NestJS 11**: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- **Validation**: `class-validator`, `class-transformer`
- **Auth**: `@nestjs/jwt`, `argon2`, `cookie-parser`
- **Database**: `pg`, `@prisma/adapter-pg`, Prisma client
- **Caching**: `ioredis`
- **Docs**: `@nestjs/swagger`, `swagger-ui-express`
- **Health**: `@nestjs/terminus`, `@songkeys/nestjs-redis-health`
- **Metrics**: `prom-client`

### Development dependencies

- **Prisma**: `prisma`, `@prisma/client`
- **TypeScript**: `typescript`, `ts-node`, `tsx`
- **Types**: `@types/node`, `@types/express`

## Project Layout

```
.
├── src/
│   ├── main.ts
│   ├── app.{controller,service,module}.ts
│   ├── common/
│   │   ├── exceptions/
│   │   ├── filters/
│   │   ├── jwt/
│   │   ├── pipes/
│   │   └── utils/
│   ├── database/
│   ├── lib/redis.ts
│   └── modules/
│       ├── auth/
│       ├── accounts/
│       ├── transactions/
│       ├── categories/
│       ├── currency/
│       ├── health/
│       ├── metrics/
│       └── user/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── generated/
├── docs/
├── docker-compose.yml
├── docker-compose.local.yml
├── Dockerfile
├── prisma.config.ts
└── README.md
```

## Environment Configuration

`prisma.config.ts` selects the correct database URL based on `NODE_ENV`. Use `.env.example` as a template.

| Variable                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `NODE_ENV`               | `development` or `production`                |
| `PORT`                   | API port inside the container (default 3000) |
| `DATABASE_URL`           | Database connection string                   |
| `JWT_SECRET`             | Symmetric key for signing access tokens      |
| `JWT_EXPIRES_IN`         | Access token TTL (for example `1h`)          |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (for example `7d`)         |
| `REDIS_HOST`             | Redis host name or IP                        |
| `REDIS_PORT`             | Redis port number                            |
| `REDIS_PASSWORD`         | Redis password (optional)                    |
| `POSTGRES_DB`            | PostgreSQL database name                     |
| `POSTGRES_USER`          | PostgreSQL user name                         |
| `POSTGRES_PASSWORD`      | PostgreSQL password                          |

## How to Run

### Option A — Docker: backend + PostgreSQL + Redis (no nginx)

This is the simplest full containerized stack without a proxy.

```bash
cp .env.example .env
docker compose up --build
```

Useful commands:

```bash
# Apply migrations inside the backend container
docker exec backend npm run migrate:prod

# Check health
curl http://localhost:3000/health
```

### Option B — Local backend only (npm start)

This runs the compiled backend locally; PostgreSQL and Redis must be available outside of Docker.

```bash
npm install
cp .env.example .env
npm run build
npm start
```

### Option C — Full server with database + proxy (API Gateway)

For a production-like setup with TLS/proxy routing, use the API Gateway repository:

https://github.com/family-finance-app/api-gateway

Follow the gateway instructions to start the proxy and supporting services, then ensure the backend is reachable from the gateway network. This provides a fully functional server with a proxy layer in front of the backend.

### Optional: Local Docker dev stack (hot reload)

`docker-compose.local.yml` runs the backend with live-reload and Redis, but does **not** provision PostgreSQL. Use it if you already have a Postgres instance available locally.

```bash
docker compose -f docker-compose.local.yml up --build
```

## NPM Scripts

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start Nest using `node --loader ts-node/esm`        |
| `npm run dev:env`      | Same as `dev` but sets `NODE_ENV=development`       |
| `npm run start:dev`    | Alias for `dev:env`                                 |
| `npm run build`        | Compile TypeScript via `tsc -p tsconfig.build.json` |
| `npm start`            | Run compiled app with `node dist/main.js`           |
| `npm run prod:env`     | Same as `start` with `NODE_ENV=production`          |
| `npm run generate`     | Execute `prisma generate`                           |
| `npm run migrate`      | Execute `prisma migrate dev`                        |
| `npm run migrate:prod` | Execute `prisma migrate deploy`                     |
| `npm run studio`       | Open Prisma Studio                                  |
| `npm run seed`         | Run `tsx prisma/seed.ts`                            |

## API Surface

Swagger documentation is available at `/api` when the server is running.

| Domain       | Endpoint                          | Description                                          |
| ------------ | --------------------------------- | ---------------------------------------------------- |
| Health       | `GET /health`                     | Health check for database and Redis                  |
| Metrics      | `GET /metrics`                    | Prometheus-compatible runtime metrics                |
| Auth         | `GET /auth/me`                    | Return authenticated user profile                    |
|              | `POST /auth/signup`               | Register a new user                                  |
|              | `POST /auth/login`                | Issue access and refresh tokens                      |
|              | `POST /auth/refresh`              | Rotate access token using refresh cookie             |
|              | `POST /auth/logout`               | Revoke refresh token cookie                          |
| Accounts     | `GET /accounts/my`                | List accounts belonging to the authenticated user    |
|              | `GET /accounts/user/:userId`      | Get accounts for a specific user (own accounts only) |
|              | `POST /accounts/create`           | Create an account scoped to the current user         |
|              | `PUT /accounts/:accountId`        | Update account metadata                              |
|              | `DELETE /accounts/:accountId`     | Remove an account and associated transactions        |
| Transactions | `GET /transactions/all`           | List all transactions for authenticated user         |
|              | `POST /transactions/create`       | Create an income or expense transaction              |
|              | `POST /transactions/transfer`     | Create a transfer between two accounts               |
|              | `PUT /transactions/update`        | Update a transaction                                 |
|              | `DELETE /transactions/delete/:id` | Remove a transaction                                 |
| Categories   | `GET /categories`                 | List all transaction categories                      |
| User         | `PUT /user/profile`               | Update user profile (name, birthdate)                |
|              | `PUT /user/password`              | Change user password                                 |
|              | `PUT /user/email`                 | Change user email address                            |

Controllers enforce JWT authentication via `JwtAuthGuard`, use DTO validation, and rely on Prisma for persistence logic.

## Authentication and Security Model

- Access tokens are returned in JSON responses and should be stored by the frontend (preferably in memory).
- Refresh tokens are written to httpOnly cookies, reducing exposure to cross-site scripting.
- Passwords are hashed with Argon2 before storage.
- Validation pipes strip unknown payload properties to mitigate injection attacks.
- CORS and cookie-parser settings are configured in `main.ts` (enable specific origins in the bootstrapper as needed).

## Troubleshooting

| Symptom                                                                | Likely Cause                                                 | Resolution                                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypeError: Cannot read properties of undefined (reading 'getHealth')` | Running the app with a loader that strips decorator metadata | Use the provided npm scripts (`npm run dev` or `npm start`) so Nest receives the emitted metadata                                            |
| `Invalid URL: redis://undefined:undefined`                             | `REDIS_HOST` or `REDIS_PORT` missing                         | Ensure the environment file defines both variables or set them when starting docker-compose                                                  |
| `Connection reset by peer` when curling `localhost:3000`               | Container crashed, not listening, or mismatched HTTP/HTTPS   | Inspect `docker compose logs backend`, confirm the service listens on port 3000 inside the container, and verify you are using HTTP          |
| `TS6059: File ... is not under rootDir`                                | Generated Prisma client excluded from TypeScript build       | `tsconfig.build.json` already sets `rootDir` to `.` and includes `prisma/generated/**/*.ts`; ensure you have pulled the latest configuration |

## Contributing & Maintenance

1. Branch from `develop`.
2. Keep module boundaries clean (controllers remain thin, services hold business logic).
3. Run `npm run build` and any relevant tests before opening a pull request.
4. Update this documentation when changing APIs, environment variables, or deploy flows.

## License

Private project. Redistribution is not permitted without prior approval.

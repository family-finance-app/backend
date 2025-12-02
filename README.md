# Family Finance Backend

Monolithic NestJS 11 backend for the Family Finance platform. The service exposes authentication, account, transaction, category, and user APIs backed by PostgreSQL through Prisma. The application can run locally, inside Docker, or as a production container that serves compiled TypeScript.

## Hosted Environments

- Development API: [https://api-dev.familyfinance.site](https://api-dev.familyfinance.site)
- Production API: [https://api.familyfinance.site](https://api.familyfinance.site)

## Features

- JWT authentication with httpOnly refresh cookies and access tokens returned in the response body
- Prisma ORM with generated client code checked into `prisma/generated`
- Global validation pipeline, cookie parsing, and modular NestJS architecture
- Docker multi-stage image and docker-compose stack
- GitHub Actions workflows for development and production deployment

## Technology Stack

| Layer         | Tools                                                   |
| ------------- | ------------------------------------------------------- |
| Runtime       | Node.js 20, TypeScript                                  |
| Framework     | NestJS 11, class-validator, class-transformer           |
| Database      | PostgreSQL, Prisma ORM, @prisma/adapter-pg              |
| Cache         | Redis 7 (official image)                                |
| Auth/Security | @nestjs/jwt, Argon2, cookie-parser                      |
| Container     | Docker, docker-compose                                  |
| Observability | prom-client, Prometheus scraping, Grafana visualitation |

## Project Layout

```
.
├── src/
│   ├── main.ts                 # Bootstrap file
│   ├── app.{controller,service,module}.ts
│   ├── database/               # Prisma service wrapper
│   ├── lib/redis.ts            # Redis client configuration
│   └── modules/
│       ├── auth/
│       ├── accounts/
│       ├── transactions/
│       ├── categories/
│       ├── metrics/            # Prometheus exposition endpoint
│       └── user/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── generated/
├── docs/
├── Dockerfile
├── docker-compose.yml          # Backend
├── package.json
├── tsconfig.json               # Root config (rootDir set to .)
├── tsconfig.build.json         # Emission into dist/src
└── README.md
```

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL database accessible from the backend
- Redis 7+ if you want to exercise caching outside of docker-compose

## Local Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Provision environment variables
cp .env.example .env.local
# Populate DATABASE_URL_DEV, REDIS_HOST, REDIS_PORT, JWT_SECRET, etc.

# 3. Generate Prisma client
npm run generate

# 4. Apply migrations against the dev database
npm run migrate

# 5. (Optional) seed baseline data
npm run seed

# 6. Start the API with development settings
npm run dev:env
# The server listens on http://localhost:3000 by default
```

`npm run dev` launches the same application without forcing `NODE_ENV=development`, which is useful for running ad-hoc scripts.

## Docker Workflows

### Local Docker Stack

```bash
# Build the development-oriented compose stack (backend + redis)
docker compose -f docker-compose.local.yml up --build

# Follow API logs
docker logs backend_local

# Follow Redis logs
docker logs redis_local

# Tear down when finished
docker compose -f docker-compose.local.yml down
```

### Production-style Container

```bash
# Build the production image
docker build -t family-finance-backend .

# Or run the packaged stack (backend + redis)
docker compose up --build -d

# Apply migrations inside the running backend container
docker exec backend npm run migrate:prod

# Inspect health endpoint
curl http://localhost:3000/health

# Stop services
docker compose down
```

The Dockerfile uses a builder stage for TypeScript compilation and a slim runtime stage that executes `node dist/src/main.js`.

## Environment Variables

`prisma.config.ts` automatically selects the correct database URL based on `NODE_ENV`. Minimum variables are listed below.

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

## NPM Scripts

| Script                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start Nest using `node --loader ts-node/esm`        |
| `npm run dev:env`      | Same as `dev` but sets `NODE_ENV=development`       |
| `npm run build`        | Compile TypeScript via `tsc -p tsconfig.build.json` |
| `npm start`            | Run compiled app with `node dist/src/main.js`       |
| `npm run prod:env`     | Same as `start` with `NODE_ENV=production`          |
| `npm run generate`     | Execute `prisma generate`                           |
| `npm run migrate`      | Execute `prisma migrate dev`                        |
| `npm run migrate:prod` | Execute `prisma migrate deploy`                     |
| `npm run studio`       | Open Prisma Studio                                  |
| `npm run seed`         | Run `tsx prisma/seed.ts`                            |

## Database and Prisma

- Schema definitions are in `prisma/schema.prisma` with dedicated models for users, accounts, transactions, categories, goals, notifications, and cross-entity join tables.
- Generated client code lives inside `prisma/generated` and is imported through path aliases (for example `../../prisma/generated/client`).
- Development migrations run with `npm run migrate`; production deployments use `npm run migrate:prod` to avoid accidental schema drift.
- The `DatabaseService` wraps PrismaClient with `PrismaPg` to leverage the native Node PostgreSQL driver.

## Redis Caching

- `src/lib/redis.ts` bootstraps a shared Redis client. The docker-compose stack already provides a Redis service named `redis` on port 6379.

## Metrics Gathering

- The backend exposes Prometheus-compatible metrics at `GET /metrics`.
- `MetricsService` uses `prom-client` to collect default Node.js runtime metrics including process CPU usage, memory consumption, event loop lag, and garbage collection statistics.
- The metrics endpoint returns data in Prometheus text exposition format, suitable for ingestion by monitoring systems like Prometheus, Grafana, or Datadog.
- Default metrics are automatically registered on module initialization and updated continuously in the background.

## API Surface

| Domain       | Endpoint                         | Description                                       |
| ------------ | -------------------------------- | ------------------------------------------------- |
| Health       | `GET /health`                    | Returns deployment status and timestamp           |
| Metrics      | `GET /metrics`                   | Prometheus-compatible runtime metrics             |
| Auth         | `POST /auth/signup`              | Register a user                                   |
|              | `POST /auth/login`               | Issue access and refresh tokens                   |
|              | `POST /auth/refresh`             | Rotate access token using refresh cookie          |
|              | `POST /auth/logout`              | Revoke refresh token cookie                       |
|              | `GET /auth/me`                   | Return authenticated user profile                 |
| Accounts     | `GET /accounts/my`               | List accounts belonging to the authenticated user |
|              | `POST /accounts/create`          | Create an account scoped to the current user      |
|              | `PUT /accounts/:accountId`       | Update account metadata                           |
|              | `DELETE /accounts/:accountId`    | Remove an account                                 |
| Transactions | `GET /transactions`              | List transactions                                 |
|              | `POST /transactions`             | Create a transaction                              |
|              | `PUT /transactions/:id`          | Update a transaction                              |
|              | `DELETE /transactions/:id`       | Remove a transaction                              |
| Categories   | `GET /categories`                | List categories                                   |
| User         | `PATCH /user` and related routes | Manage user profile data                          |

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
| `Connection reset by peer` when curling `localhost:3200`               | Container crashed, not listening, or mismatched HTTP/HTTPS   | Inspect `docker compose logs backend-redis`, confirm the service listens on port 3002 inside the container, and verify you are using HTTP    |
| `TS6059: File ... is not under rootDir`                                | Generated Prisma client excluded from TypeScript build       | `tsconfig.build.json` already sets `rootDir` to `.` and includes `prisma/generated/**/*.ts`; ensure you have pulled the latest configuration |

## Contributing

1. Branch from `develop`.
2. Keep module boundaries clean (controllers remain thin, services hold business logic).
3. Run `npm run build` and any relevant tests before opening a pull request.
4. Describe API changes in the PR description and update docs where necessary.

## License

Private project. Redistribution is not permitted without prior approval.

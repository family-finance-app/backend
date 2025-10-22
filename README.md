# Family Finance Backend

Monolithic backend application for Family Finance that combines authentication, account management, and transaction functionality.

## Architecture

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   │
│   ├── database/                  # Prisma Database Module
│   │   ├── database.module.ts
│   │   └── database.service.ts
│   │
│   ├── modules/                   # Business modules
│   │   ├── auth/                  # Authentication
│   │   ├── accounts/              # Account management
│   │   └── transactions/          # Transactions
│   │
│   └── common/                    # Common utilities
│       └── utils/
│           ├── setCookie.ts
│           └── parseCookie.ts
│
├── prisma/
│   └── schema.prisma              # Prisma database schema
│
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run in development mode
npm run dev
```

### Docker

#### Standalone Docker

```bash
# Build image
docker build -t family-finance-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  family-finance-backend
```

#### Docker Compose

```bash
# Create shared network (run this once)
docker network create family-finance-network

# Start backend service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

**Note:** The backend service requires a PostgreSQL database. Make sure your database is running and accessible at the DATABASE_URL specified in the docker-compose.yml file.

## API Endpoints

### Health & Info

- `GET /health` - Health check
- `GET /` - API information

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Registration
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info (requires JWT token)
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Accounts (`/api/accounts`)

- `GET /api/accounts` - List accounts
- `GET /api/accounts/health` - Health check

### Transactions (`/api/transactions`)

- `GET /api/transactions` - List transactions
- `GET /api/transactions/health` - Health check

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres-database:5432/family_finance?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Scripts

```bash
npm run build          # Build TypeScript
npm run start          # Run production build
npm run start:dev      # Development mode with ts-node
npm run dev            # Development mode with hot reload
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Create migration
npm run prisma:studio   # Prisma Studio UI
```

## Notes

- All API endpoints have `/api` prefix
- HTTP-only cookies are used for refresh tokens
- CORS is configured for frontend
- Health checks are available for monitoring

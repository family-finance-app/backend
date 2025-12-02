# Family Finance Backend

NestJS monolithic backend application for Family Finance with support for **development** and **production** environments. Includes authentication, account management, transaction handling, and multi-database deployment.

## Architecture

```
API Domains:**
- Development: https://api-dev.familyfinance.site/
- Production: https://api.familyfinance.site

backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root NestJS module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   │
│   ├── database/                  # Prisma Database Module
│   │   ├── database.module.ts
│   │   └── database.service.ts
│   │
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication & JWT
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   └── guards/
│   │   ├── accounts/              # Account management
│   │   │   ├── accounts.controller.ts
│   │   │   ├── accounts.service.ts
│   │   │   ├── accounts.module.ts
│   │   │   └── dto/
│   │   ├── transactions/          # Transaction handling
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── transactions.module.ts
│   │   │   └── dto/
│   │   ├── categories/            # Transaction categories
│   │   ├── user/                  # User profile
│   │   └── [other modules]/
│   │
│   └── common/                    # Shared utilities
│       ├── exceptions/            # Custom exceptions
│       └── utils/                 # Helper functions
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Database seeding
│   └── migrations/                # Migration history
│
├── .github/workflows/             # CI/CD pipelines
│   ├── deploy-prod.yml            # Production deployment
│   └── deploy-dev.yml             # Development deployment
│
├── Dockerfile                     # Multi-stage production build
├── docker-compose.yml             # Production services
├── docker-compose.dev.yml         # Development services
├── prisma.config.ts               # Prisma configuration
├── .env.example                   # Environment variables template
├── .env.local                     # Local development (git ignored)
├── .env.prod                      # Production config (git ignored)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL (local or remote)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your database credentials
cp .env.example .env.local
# Edit .env.local and add your DATABASE_URL_DEV

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Apply database migrations
npm run prisma:migrate

# 5. (Optional) Seed database
npm run prisma:seed

# 6. Start development server
npm run dev:env
# Server runs on http://localhost:3000
```

## 🐳 Docker Deployment

### Development with Docker (Hot Reload)

```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

### Production with Docker

```bash
# Create shared Docker network
docker network create family-finance-network

# Build and start production environment
docker-compose up --build -d

# View logs
docker-compose logs -f

# Run migrations
docker exec family-finance-backend npm run prisma:migrate:prod

# Stop containers
docker-compose down
```

## 📋 NPM Scripts

| Script                        | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `npm run dev`                 | Start dev server with hot reload (no env)  |
| `npm run dev:env`             | Start dev server with NODE_ENV=development |
| `npm run build`               | Compile TypeScript → JavaScript            |
| `npm start`                   | Run production build                       |
| `npm run prod:env`            | Run production build with NODE_ENV         |
| `npm run prisma:generate`     | Generate Prisma Client                     |
| `npm run prisma:migrate`      | Create & apply migrations (dev)            |
| `npm run prisma:migrate:prod` | Apply migrations (production)              |
| `npm run prisma:studio`       | Open Prisma Studio GUI                     |
| `npm run prisma:seed`         | Run seed script                            |

## 🔧 Environment Configuration

### Supported Environments

- **Development** - Local development with SQLite or dev PostgreSQL
- **Production** - Optimized production with production PostgreSQL

### Environment Variables

```env
# Application
NODE_ENV=development              # development or production
PORT=3000                         # Server port

# Database - Development
DATABASE_URL_DEV="postgresql://user:password@localhost:5432/family_finance_dev"

# Database - Production
DATABASE_URL_PROD="postgresql://user:password@prod-host:5432/family_finance_prod"

# JWT Authentication
JWT_SECRET=your-secret-key        # Change in production!
JWT_EXPIRES_IN=1h                 # Access token lifetime
JWT_REFRESH_EXPIRES_IN=7d         # Refresh token lifetime
```

**Note:** `prisma.config.ts` automatically selects `DATABASE_URL_DEV` or `DATABASE_URL_PROD` based on `NODE_ENV`.

## API Endpoints

### Health Check

- `GET /api/health` - Service health status

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Accounts

- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `PATCH /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions

- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories

- `GET /api/categories` - List categories

## Database

### Schema

Defined in `prisma/schema.prisma` with models for:

- Users
- Accounts (with types: DEBIT, CREDIT, CASH, BANK, etc.)
- Transactions (INCOME, EXPENSE, TRANSFER)
- Categories
- Groups (for shared finances)
- Goals
- Notifications

### Migrations

- Managed through Prisma Migrate
- Located in `prisma/migrations/`
- Development: `npm run prisma:migrate`
- Production: `npm run prisma:migrate:prod`

## 🔐 Authentication & Security

- JWT-based authentication
- HTTP-only cookies for refresh tokens
- Password hashing with Argon2
- CORS configuration for frontend
- Class validation with class-validator

## 📦 Built With

- **Framework:** NestJS 11
- **Database:** Prisma ORM + PostgreSQL
- **Auth:** JWT (@nestjs/jwt)
- **Validation:** class-validator, class-transformer
- **Security:** Argon2, cookie-parser
- **Language:** TypeScript

## 📖 Documentation

- **Deployment:** See [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **CI/CD Setup:** See [`WORKFLOWS_SETUP.md`](./.github/WORKFLOWS_SETUP.md)
- **API Docs:** See [`docs/`](./docs)

## 🚢 CI/CD Pipeline

Automatic deployment to dev/prod via GitHub Actions:

- **Main branch** → Production deployment
- **Develop branch** → Development deployment

Requires GitHub secrets configuration. See [WORKFLOWS_SETUP.md](./.github/WORKFLOWS_SETUP.md).

## 🐛 Troubleshooting

### Database connection issues

```bash
# Check if .env.local/.env.prod has correct DATABASE_URL
cat .env.local | grep DATABASE_URL

# Verify Prisma can connect
npx prisma db push
```

### Migrations failing

```bash
# Check migration status
npx prisma migrate status

# Reset development database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset
```

### Port already in use

```bash
# Change PORT in .env
PORT=3001 npm run dev:env
```

## 📝 Project Status

- ✅ Multi-environment setup (dev/prod)
- ✅ Database migrations & seeding
- ✅ JWT authentication
- ✅ Account management
- ✅ Transaction handling
- ✅ Docker multi-stage builds
- ✅ GitHub Actions CI/CD
- 🔄 In development: Advanced features

## 👥 Contributing

1. Create feature branch from `develop`
2. Follow NestJS conventions
3. Test locally before pushing
4. Create pull request

## 📄 License

Private project

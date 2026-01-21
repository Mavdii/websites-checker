# Cruel Stack - Setup Guide

This guide will help you set up the Cruel Stack development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cruel-stack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env` file is already configured for local development with Docker.

### 4. Start Development Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

To check if services are running:

```bash
docker-compose ps
```

To view logs:

```bash
docker-compose logs -f
```

### 5. Set Up the Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

(Optional) Seed the database with sample data:

```bash
npm run prisma:seed
```

### 6. Verify Setup

Run the verification script to ensure everything is configured correctly:

```bash
npm run verify
```

This will check:
- Environment variables are loaded
- Redis connection is working
- Database connection is working

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Running Tests

**Unit Tests:**
```bash
npm test
```

**Watch Mode:**
```bash
npm run test:watch
```

**Coverage Report:**
```bash
npm run test:coverage
```

**End-to-End Tests:**
```bash
npm run test:e2e
```

### Code Quality

**Linting:**
```bash
npm run lint
```

**Fix Linting Issues:**
```bash
npm run lint:fix
```

**Format Code:**
```bash
npm run format
```

**Check Formatting:**
```bash
npm run format:check
```

### Database Management

**Open Prisma Studio (Database GUI):**
```bash
npm run prisma:studio
```

**Create a New Migration:**
```bash
npm run prisma:migrate
```

**Reset Database:**
```bash
npx prisma migrate reset
```

### Docker Commands

**Start Services:**
```bash
docker-compose up -d
```

**Stop Services:**
```bash
docker-compose down
```

**View Logs:**
```bash
docker-compose logs -f
```

**Restart Services:**
```bash
docker-compose restart
```

**Remove All Data (including volumes):**
```bash
docker-compose down -v
```

## Project Structure

```
cruel-stack/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   ├── globals.css        # Global styles with design system
│   └── layout.tsx         # Root layout
├── lib/                   # Shared utilities and libraries
│   ├── env.ts            # Environment variable validation
│   ├── prisma.ts         # Prisma client singleton
│   └── redis.ts          # Redis client and cache manager
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Database seed script
├── scripts/              # Utility scripts
│   └── verify-setup.ts   # Setup verification script
├── e2e/                  # End-to-end tests (Playwright)
├── __tests__/            # Unit and integration tests (Jest)
├── public/               # Static assets
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── docker-compose.yml    # Development services
├── Dockerfile            # Production Docker image
├── jest.config.ts        # Jest configuration
├── playwright.config.ts  # Playwright configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
├── .prettierrc           # Prettier configuration
└── README.md             # Project documentation
```

## Environment Variables

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Optional Variables

- `NODE_ENV` - Environment (development/production/test)
- `NEXT_PUBLIC_APP_URL` - Public application URL
- `MAX_CRAWL_DEPTH` - Maximum crawl depth (default: 5)
- `MAX_CONCURRENT_ANALYSES` - Maximum concurrent analyses (default: 3)
- `ANALYSIS_TIMEOUT_MS` - Analysis timeout in milliseconds (default: 300000)
- `BROWSER_POOL_SIZE` - Browser pool size (default: 3)
- `BROWSER_TIMEOUT_MS` - Browser timeout in milliseconds (default: 30000)
- `PERFORMANCE_RUNS` - Number of performance measurement runs (default: 3)

## Troubleshooting

### Port Already in Use

If you get an error that port 3000, 5432, or 6379 is already in use:

**For Next.js (port 3000):**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

**For Docker services:**
```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

1. Ensure Docker services are running:
   ```bash
   docker-compose ps
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify DATABASE_URL in `.env` matches the Docker configuration

### Redis Connection Issues

1. Check if Redis is running:
   ```bash
   docker-compose ps redis
   ```

2. Test Redis connection:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

### Prisma Issues

If you encounter Prisma-related errors:

1. Regenerate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

2. Reset the database:
   ```bash
   npx prisma migrate reset
   ```

3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Build Errors

If the build fails:

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run build
   ```

2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](link-to-issues)
2. Review the [Design Document](.kiro/specs/cruel-stack/design.md)
3. Review the [Requirements Document](.kiro/specs/cruel-stack/requirements.md)

## Next Steps

After completing the setup:

1. Review the [Architecture Documentation](.kiro/specs/cruel-stack/design.md)
2. Check the [Task List](.kiro/specs/cruel-stack/tasks.md) for implementation progress
3. Start implementing features according to the task list
4. Write tests for all new functionality
5. Follow the code quality guidelines in the README

Happy coding! 🚀

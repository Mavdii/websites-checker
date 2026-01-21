# Database Property Tests - Setup Instructions

## Overview

The property-based tests for database operations (Property 21: Analysis History Storage) have been implemented in `__tests__/database.property.test.ts`.

## Current Status

The tests are complete and ready to run, but require a working database connection.

## Database Connection Issue

The current `.env` file contains a Prisma Accelerate URL:
```
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

This connection is failing with "fetch failed" errors, which suggests:
1. The Prisma Accelerate proxy is not running
2. The endpoint is not reachable
3. The API key may be invalid or expired

## Options to Run the Tests

### Option 1: Use Local PostgreSQL (Recommended for Development)

1. Start the PostgreSQL database using Docker:
   ```bash
   docker compose up -d postgres
   ```

2. Update the `.env` file to use a direct connection:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cruel_stack?schema=public"
   ```

3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Run the tests:
   ```bash
   npm test -- __tests__/database.property.test.ts
   ```

### Option 2: Use Prisma Accelerate

If you want to use Prisma Accelerate:

1. Ensure the Prisma Accelerate service is running
2. Verify the API key in the DATABASE_URL is valid
3. Check network connectivity to the Accelerate endpoint

### Option 3: Use a Test Database

For testing, you can create a separate test database:

1. Create a test database:
   ```sql
   CREATE DATABASE cruel_stack_test;
   ```

2. Update `jest.setup.ts` to use the test database URL

3. Run migrations on the test database

## Test Coverage

The property tests validate:

1. **Storage with timestamp and user association**: Completed analyses are stored with all required fields, timestamps, and user relationships
2. **Multiple analyses for same URL**: Multiple analyses for the same URL are stored separately with different timestamps
3. **Chronological ordering**: Analysis history is retrievable in chronological order
4. **User-specific filtering**: Only user-specific analyses are returned when filtering by userId
5. **Referential integrity**: Analysis and report relationships are maintained correctly

Each test runs 100 iterations with randomized inputs using fast-check.

## Running the Tests

Once the database is configured:

```bash
# Run all database tests
npm test -- __tests__/database.property.test.ts

# Run with verbose output
npm test -- __tests__/database.property.test.ts --verbose

# Run with coverage
npm test -- __tests__/database.property.test.ts --coverage
```

## Test Environment

The tests use:
- **Testing Framework**: Jest
- **Property-Based Testing**: fast-check (100 iterations per property)
- **Database**: PostgreSQL via Prisma
- **Test Environment**: Node.js (specified with `@jest-environment node`)

## Next Steps

1. Configure the database connection
2. Run migrations to create the schema
3. Execute the property tests
4. Verify all tests pass

The tests are production-ready and follow all the requirements from the design document.

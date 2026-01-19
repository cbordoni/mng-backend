# Testing Guide

This document explains the testing setup and how to run tests in this project.

## Test Framework

We use **Bun's built-in test runner** which provides:

- Fast execution
- TypeScript support out of the box
- Compatible with Jest-like API
- No additional configuration needed

## Running Tests

### Run all tests

```bash
bun test
```

### Run tests in watch mode

```bash
bun test:watch
```

### Run specific test file

```bash
bun test src/features/user/user.service.test.ts
```

## Test Structure

Tests are co-located with the code they test:

```
src/features/
  ├── health/
  │   ├── health.service.ts
  │   └── health.service.test.ts
  ├── user/
  │   ├── user.service.ts
  │   └── user.service.test.ts
  └── product/
      ├── product.service.ts
      └── product.service.test.ts
```

## Test Organization

Each test file follows this structure:

```typescript
import { describe, it, expect, beforeEach } from "bun:test";

describe("FeatureName", () => {
  describe("methodName", () => {
    it("should describe expected behavior", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Mocking

Mock implementations for repositories are located in `src/shared/tests/mocks.ts`:

- `MockUserRepository` - Mock implementation of UserRepository
- `MockProductRepository` - Mock implementation of ProductRepository

These mocks allow testing services in isolation without database dependencies.

## What We Test

### Service Layer Tests

- **Business logic validation** - Verify all validation rules work correctly
- **Success cases** - Test happy paths for all operations
- **Error cases** - Test error handling and edge cases
- **Result pattern** - Verify correct use of `neverthrow` Result types

### Coverage

Current test coverage includes:

#### Health Feature

- ✅ Database connectivity checks
- ✅ Latency measurement
- ✅ Status reporting

#### User Feature

- ✅ Get all users (with pagination)
- ✅ Get user by ID
- ✅ Create user (with validation)
- ✅ Update user (with validation)
- ✅ Delete user
- ✅ Name validation (empty check)
- ✅ Cellphone validation (format check)

#### Product Feature

- ✅ Get all products (with pagination)
- ✅ Get product by ID
- ✅ Create product (with validation)
- ✅ Update product (with validation)
- ✅ Delete product
- ✅ Add images
- ✅ Delete images
- ✅ Name validation (empty check)
- ✅ Price validation (positive number)
- ✅ Quantity validation (positive number)

## Writing New Tests

When adding new features, follow these guidelines:

1. **Create test file** next to the service file with `.test.ts` extension
2. **Use mock repositories** from `src/shared/tests/mocks.ts`
3. **Test business logic** thoroughly with both success and failure cases
4. **Follow Result pattern** - verify both `isOk()` and `isErr()` branches
5. **Use descriptive test names** that explain the expected behavior

### Example Test Template

```typescript
import { beforeEach, describe, expect, it } from "bun:test";
import { ValidationError } from "@/shared/errors";
import { MockRepository } from "@/shared/tests/mocks";
import { YourService } from "./your.service";

describe("YourService", () => {
  let service: YourService;
  let mockRepo: MockRepository;

  beforeEach(() => {
    mockRepo = new MockRepository();
    service = new YourService(mockRepo);
  });

  describe("yourMethod", () => {
    it("should succeed with valid input", async () => {
      const result = await service.yourMethod(validInput);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeDefined();
      }
    });

    it("should fail with invalid input", async () => {
      const result = await service.yourMethod(invalidInput);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });
  });
});
```

## Best Practices

1. **Isolation** - Each test should be independent and not rely on others
2. **Setup/Teardown** - Use `beforeEach` to reset state between tests
3. **Descriptive names** - Test names should clearly describe what they verify
4. **Arrange-Act-Assert** - Structure tests in three clear phases
5. **Result checking** - Always verify both success and error paths
6. **Type safety** - Use TypeScript type guards when checking Result types

## CI/CD Integration

Tests run automatically in CI/CD pipelines before deployment. All tests must pass before code can be merged.

## Troubleshooting

### Tests fail locally but pass in CI

- Check Bun version matches CI environment
- Ensure database is properly configured
- Clear any cached test results

### Mock not working as expected

- Verify mock implements the full interface
- Check that mock is reset in `beforeEach`
- Ensure proper TypeScript types are used

## Future Improvements

- [ ] Add integration tests for database operations
- [ ] Add E2E tests for API endpoints
- [ ] Implement test coverage reporting
- [ ] Add performance benchmarks

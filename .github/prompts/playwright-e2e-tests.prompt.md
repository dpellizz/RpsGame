# Prompt for Playwright E2E Test Generation

Generate comprehensive end-to-end tests using Playwright with TypeScript and Page Object Models.

- Create test files in the `tests/e2e` directory using the `.spec.ts` extension.
- **Always use Page Object Models** - Never interact with the page directly in test files.
- Use **TypeScript** for type safety and better IDE support.
- Use the **Playwright Test framework** (`@playwright/test`).

**Test Structure:**
- Organize tests using `test.describe()` to group related test cases.
- Name describe blocks by feature or user flow (e.g., `'User Login Flow'`, `'Product Checkout'`).
- Use `test.beforeEach()` to set up test preconditions and initialize Page Objects.
- Use `test.afterEach()` for cleanup if needed.
- Each `test()` should verify one specific user workflow or scenario.

**Testing Pattern:**
- Import necessary Page Objects at the top of the file.
- Initialize Page Objects in `beforeEach` or at the start of each test.
- Structure each test following **Arrange-Act-Assert** pattern:
  - **Arrange**: Set up test data and navigate to starting page
  - **Act**: Perform user actions through POM methods
  - **Assert**: Verify expected outcomes using Playwright assertions
- Use Playwright's `expect` with auto-waiting assertions.

**Assertion Guidelines:**
- Use Playwright's built-in assertions (they auto-wait and retry):
  - `await expect(page).toHaveURL()` - Verify navigation
  - `await expect(locator).toBeVisible()` - Check visibility
  - `await expect(locator).toHaveText()` - Verify text content
  - `await expect(locator).toBeEnabled()` - Check element state
  - `await expect(locator).toHaveValue()` - Verify input values
- Retrieve data from POMs for complex assertions: `const text = await page.getText(); expect(text).toBe('expected');`

**Code Structure:**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('User Login Flow', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        await loginPage.goto();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        // Arrange
        const testUser = { email: 'user@test.com', password: 'ValidPass123' };

        // Act
        await loginPage.login(testUser.email, testUser.password);

        // Assert
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(dashboardPage.welcomeMessage).toBeVisible();
        const userName = await dashboardPage.getUserName();
        expect(userName).toBe('Test User');
    });

    test('should display error with invalid credentials', async ({ page }) => {
        // Arrange
        const invalidUser = { email: 'user@test.com', password: 'wrongpass' };

        // Act
        await loginPage.login(invalidUser.email, invalidUser.password);

        // Assert
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.getErrorText();
        expect(errorText).toContain('Invalid credentials');
        await expect(page).toHaveURL(/.*login/);
    });
});
```

**Test Independence:**
- Each test must be runnable independently in any order.
- Don't rely on state from previous tests.
- Clean up test data in `afterEach` if tests create persistent data.
- Use unique test data for each test when possible.

**Fixtures for Reusability:**
- Create custom fixtures for common setup like authenticated users:
```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('user@test.com', 'password');
        await use(page);
    }
});
```

**Test Organization with Tags:**
- Use test annotations for categorization and selective execution:
```typescript
test('critical user flow @smoke @critical', async ({ page }) => {
    // test code
});

test.skip('known issue - skip for now', async ({ page }) => {
    // skipped test
});
```

**Best Practices:**
- Use descriptive test names that explain the expected behavior.
- Keep tests focused - one workflow per test.
- Avoid hard waits (`page.waitForTimeout()`) - rely on Playwright's auto-waiting.
- Handle dynamic content with POM methods that encapsulate waiting logic.
- Use soft assertions (`expect.soft()`) when you want to continue after assertion failure.
- Take advantage of Playwright's automatic screenshot and video capture on failure.

**Common Patterns:**
```typescript
// Navigation verification
await expect(page).toHaveURL(/dashboard/);

// Form submission workflow
await loginPage.fillEmail('user@test.com');
await loginPage.fillPassword('password');
await loginPage.submit();

// Waiting for elements through POM
await dashboardPage.waitForPageLoad();

// Checking multiple states
await expect(submitButton).toBeEnabled();
await expect(submitButton).toBeVisible();
await expect(form).toBeVisible();
```

Generate complete, production-ready E2E tests that use POMs exclusively and follow Playwright best practices for reliable, maintainable test automation.
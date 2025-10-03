# Prompt for React Page Object Model (POM) Generation

Generate Page Object Models for React components to encapsulate page interactions and make E2E tests maintainable.

- Create one POM class per page or major component in the `tests/pages` directory.
- Name files using the pattern `{PageName}Page.ts` (e.g., `LoginPage.ts`, `DashboardPage.ts`).
- Use **TypeScript** for type safety and **Playwright** locators.

**POM Structure:**
- Define all locators as `readonly` properties initialized in the constructor.
- Create public methods that represent user actions (filling forms, clicking buttons, navigating).
- Methods should return data for assertions, not perform assertions themselves.
- Use `async/await` for all Playwright operations.
- Return the page object itself (or another POM) to enable method chaining.

**Locator Strategy Priority:**
1. **`getByRole`** - Preferred for accessibility-friendly elements (buttons, links, headings)
2. **`getByLabel`** - For form inputs with associated labels
3. **`getByTestId`** - For dynamic content or when other methods aren't suitable
4. **Avoid CSS selectors** - They are brittle and break easily with UI changes

**Method Naming:**
- **Actions**: Use verbs like `fill`, `click`, `select`, `toggle`, `submit`
- **Navigation**: Use `goto()` or `navigateTo{Page}()`
- **Getters**: Use `get{Property}()`, `is{State}()` (returns boolean), `waitFor{Element}()`

**Code Structure:**
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password');
        this.submitButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async submit() {
        await this.submitButton.click();
    }

    async login(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.submit();
    }

    async getErrorText(): Promise<string> {
        return await this.errorMessage.textContent() || '';
    }

    async isSubmitDisabled(): Promise<boolean> {
        return await this.submitButton.isDisabled();
    }
}
```

**Best Practices:**
- Keep POMs focused - one POM per logical page/component.
- Create helper methods for common workflows (e.g., `login()` combines multiple steps).
- Handle waits within the POM - don't expose waiting logic to tests.
- Use meaningful method names that describe user intent.
- Include JSDoc comments for complex methods.

Generate clean, reusable POMs that make tests read like user stories.
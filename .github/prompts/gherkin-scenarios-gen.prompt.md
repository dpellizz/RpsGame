# Prompt for Gherkin Scenario Generation

Generate Gherkin scenarios based on requirements that serve as living documentation and executable specifications.

- Create feature files in the `features` directory using the `.feature` extension.
- Write scenarios in **plain business language** that non-technical stakeholders can understand.
- Focus on **user behavior and outcomes**, not implementation details.

**Scenario Structure:**
- Start each feature file with a `Feature:` declaration including user story format:
  ```
  Feature: Brief feature description
    As a [role]
    I want [feature]
    So that [benefit]
  ```
- Use `Background:` for common preconditions shared across all scenarios in the feature.
- Write individual `Scenario:` blocks for each specific behavior.
- Use `Scenario Outline:` with `Examples:` table for testing multiple variations of the same behavior.

**Step Keywords:**
- **Given** - Establish initial context and preconditions (past tense)
- **When** - Describe the action or event being tested (present tense)
- **Then** - Specify expected outcomes (present tense)
- **And/But** - Chain multiple steps of the same type together

**Writing Guidelines:**
- **Be declarative, not imperative** - Describe what happens, not how it happens
  - ✅ Good: `When I submit the login form`
  - ❌ Bad: `When I click the button with ID "submit-btn"`
- **Use business domain language** - Avoid technical implementation details
- **One scenario, one behavior** - Keep scenarios focused and independent
- **Make scenarios readable as sentences** - They should tell a story

**Scenario Pattern:**
```gherkin
Feature: User Authentication
  As a registered user
  I want to log into my account
  So that I can access my personal dashboard

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I enter valid email and password
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  Scenario: Login fails with invalid password
    When I enter valid email and invalid password
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

**Scenario Outline Pattern:**
```gherkin
  Scenario Outline: Email validation during registration
    When I enter "<email>" in the email field
    And I submit the registration form
    Then I should see "<result>"

    Examples:
      | email              | result                    |
      | user@example.com   | Registration successful   |
      | invalid-email      | Invalid email format      |
      | user@              | Invalid email format      |
      | @example.com       | Invalid email format      |
```

**Tags for Organization:**
- Use tags to categorize scenarios: `@smoke`, `@regression`, `@api`, `@ui`, `@critical`
- Place tags on the line before `Feature:` or `Scenario:`
- Example:
  ```gherkin
  @smoke @authentication
  Feature: User Login
  
  @positive
  Scenario: Successful login
  
  @negative
  Scenario: Failed login
  ```

**Best Practices:**
- Cover both positive (happy path) and negative (error cases) scenarios.
- Keep steps at the same level of abstraction within a scenario.
- Avoid technical details like API endpoints, database tables, or CSS selectors.
- Each scenario should be independently executable in any order.
- Use consistent language across all scenarios.

Generate clear, business-readable scenarios that bridge communication between stakeholders, developers, and testers.
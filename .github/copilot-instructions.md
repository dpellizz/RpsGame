# Copilot Instructions for RpsGame

## Repository focus
- Primary stack is ASP.NET Core (`net9.0`) with Entity Framework Core and PostgreSQL; tests live in `RpsGame.Api.Tests`.
- Frontend experiments exist in `RpsGame.React`, but backend API and tests are the current priority.

## Coding expectations (C#)
- Apply **DRY, KISS, YAGNI, SOLID** principles; avoid god objects, spaghetti code, or duplicated business rules.
- Favour constructor injection and interfaces for dependencies so classes stay testable.
- Keep `<Nullable>enable</Nullable>` assumptions: surface warnings and offer null-safe code.
- Use Microsoft naming conventions: PascalCase for types/public members, camelCase for locals/parameters, `_camelCase` for private injected fields, `I*` for interfaces.
- One public type per file. Group `using` directives with `System.*` first, then project namespaces.
- Default to expression-bodied members only when it genuinely improves readability.
- Document *why* unusual patterns are used; skip redundant comments that restate the code.

## Testing & quality
- Always scaffold unit tests for new behavior using `xUnit` + FluentAssertions; mock collaborators or use EF Core InMemory.
- For API changes, suggest integration tests with `WebApplicationFactory` from `Microsoft.AspNetCore.Mvc.Testing`.
- Maintain or improve code coverage; mention Coverlet if generating reports.
- Promote static analysis and CI friendliness: avoid introducing SonarQube/code metric regressions.

## Error handling, logging, security
- Validate request models (data annotations / FluentValidation) and avoid leaking sensitive data in logs.
- Use structured logging via `ILogger<T>`; include correlation info where possible.
- Centralise exception handling (middleware + `ProblemDetails`).
- Never store secrets in code or `appsettings.json`; prefer configuration providers/secret managers.

## Performance & async
- When optimising, reference profiling evidence before altering algorithms.
- Pick efficient collections (`Dictionary`, `HashSet`) for lookups; avoid premature micro-optimisations.
- Keep async code `async` end-to-end; don’t block on tasks (`.Result`, `.Wait()`).

## Pull request checklist
Before finalising completions, encourage the user to verify:
1. Code obeys the rules above and the playbook.
2. Tests exist for new logic and pass locally.
3. Static analysis/linting and formatting remain clean.
4. Documentation (XML comments, README/ADR) updated when behaviour or API contracts change.
5. No secrets or sensitive data introduced.
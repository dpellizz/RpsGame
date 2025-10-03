# Prompt for C# Unit Test Generation

Generate comprehensive xUnit unit tests for C# classes, following these guidelines:

- Create a test file for each class under test in the corresponding test project folder (e.g., `Calculator.cs` should have `CalculatorTests.cs`).
- Use **xUnit** as the testing framework, **FluentAssertions** for assertions, and **Moq** for mocking dependencies.

**Testing Pattern:**
- Structure tests using xUnit with a test class named `{ClassName}Tests`.
- Name each test method following the pattern: `{MethodName}_{Scenario}_{ExpectedBehavior}` (e.g., `Calculate_WithZeroInput_ReturnsZero`).
- Follow the **AAA pattern** (Arrange, Act, Assert) in every test method.
- Create mock objects for all external dependencies using `Mock<T>` and inject them into the system under test (SUT).
- Use `_sut` as the variable name for the system under test.

**Test Coverage Requirements:**
- Test the **happy path** (successful execution with valid inputs).
- Test **edge cases** (null values, empty collections, zero, boundary values).
- Test **exception handling** using `Should().Throw<ExceptionType>()`.
- Create **one test per behavior** - keep tests focused and isolated.
- Mock all database calls, external APIs, and file system operations.

**Assertion Pattern:**
- Use FluentAssertions syntax: `result.Should().Be(expectedValue)`
- Verify mock interactions: `mockDependency.Verify(x => x.Method(), Times.Once)`
- For exceptions: `action.Should().Throw<ExceptionType>().WithMessage("error message")`

**Code Structure:**
```csharp
public class ClassNameTests
{
    private readonly Mock<IDependency> _mockDependency;
    private readonly ClassName _sut;

    public ClassNameTests()
    {
        _mockDependency = new Mock<IDependency>();
        _sut = new ClassName(_mockDependency.Object);
    }

    [Fact]
    public void MethodName_Scenario_ExpectedBehavior()
    {
        // Arrange
        var input = /* test data */;
        _mockDependency.Setup(x => x.Method(input)).Returns(expectedValue);

        // Act
        var result = _sut.MethodUnderTest(input);

        // Assert
        result.Should().Be(expectedValue);
        _mockDependency.Verify(x => x.Method(input), Times.Once);
    }
}
```

Generate complete, runnable tests with all necessary using statements and proper test isolation.
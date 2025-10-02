using FluentAssertions;
using RpsGame.Api.Services;

namespace RpsGame.Api.Tests;

/// <summary>
/// Unit tests covering the deterministic behaviors of <see cref="GameEngine"/>.
/// </summary>
public class GameEngineTests
{
    private readonly GameEngine _gameEngine = new();

    /// <summary>
    /// Verifies that the computer move generator always returns one of the supported moves.
    /// </summary>
    [Fact]
    public void GenerateComputerMove_ShouldReturnValidMove()
    {
        var allowedMoves = new[] { "rock", "paper", "scissors" };

        for (var attempt = 0; attempt < 100; attempt++)
        {
            var generatedMove = _gameEngine.GenerateComputerMove();
            allowedMoves.Should().Contain(generatedMove);
        }
    }

    /// <summary>
    /// Ensures a draw is reported when the player and computer choose the same move.
    /// </summary>
    [Theory]
    [InlineData("rock")]
    [InlineData("paper")]
    [InlineData("scissors")]
    public void ResolveWinner_ShouldReturnDraw_WhenMovesMatch(string move)
    {
        var outcome = _gameEngine.ResolveWinner(move, move);

        outcome.Should().Be("draw");
    }

    /// <summary>
    /// Confirms that all winning player combinations are resolved in the player's favor.
    /// </summary>
    [Theory]
    [InlineData("rock", "scissors")]
    [InlineData("paper", "rock")]
    [InlineData("scissors", "paper")]
    public void ResolveWinner_ShouldFavorPlayerForWinningPairs(string playerMove, string computerMove)
    {
        var outcome = _gameEngine.ResolveWinner(playerMove, computerMove);

        outcome.Should().Be("player");
    }

    /// <summary>
    /// Confirms that losing combinations—including unexpected moves—are resolved for the computer.
    /// </summary>
    [Theory]
    [InlineData("rock", "paper")]
    [InlineData("paper", "scissors")]
    [InlineData("scissors", "rock")]
    [InlineData("lizard", "rock")]
    public void ResolveWinner_ShouldFavorComputerWhenPlayerLoses(string playerMove, string computerMove)
    {
        var outcome = _gameEngine.ResolveWinner(playerMove, computerMove);

        outcome.Should().Be("computer");
    }

    /// <summary>
    /// Ensures that move comparison remains case-insensitive for both inputs.
    /// </summary>
    [Fact]
    public void ResolveWinner_ShouldBeCaseInsensitive()
    {
        var outcome = _gameEngine.ResolveWinner("RoCk", "SCISSORS");

        outcome.Should().Be("player");
    }

    /// <summary>
    /// Verifies that passing a null player move triggers the expected guard clause.
    /// </summary>
    [Fact]
    public void ResolveWinner_ShouldThrowArgumentNullException_ForNullPlayerMove()
    {
        var act = () => _gameEngine.ResolveWinner(null!, "rock");

        act.Should().Throw<ArgumentNullException>().WithParameterName("playerMove");
    }

    /// <summary>
    /// Verifies that passing a null computer move triggers the expected guard clause.
    /// </summary>
    [Fact]
    public void ResolveWinner_ShouldThrowArgumentNullException_ForNullComputerMove()
    {
        var act = () => _gameEngine.ResolveWinner("rock", null!);

        act.Should().Throw<ArgumentNullException>().WithParameterName("computerMove");
    }
}

namespace RpsGame.Api.Services;

/// <summary>
/// Provides the core Rock-Paper-Scissors decision and random move generation logic.
/// </summary>
public class GameEngine : IGameEngine
{
    private static readonly string[] Moves = { "rock", "paper", "scissors" };
    private static readonly HashSet<(string PlayerMove, string ComputerMove)> PlayerWinningPairs = new()
    {
        ("rock", "scissors"),
        ("scissors", "paper"),
        ("paper", "rock")
    };

    /// <summary>
    /// Generates a random move for the computer player.
    /// </summary>
    /// <returns>One of the supported move names.</returns>
    public string GenerateComputerMove()
    {
        return Moves[Random.Shared.Next(Moves.Length - 1)];
    }

    /// <summary>
    /// Determines the winning participant for a round of Rock-Paper-Scissors.
    /// </summary>
    /// <param name="playerMove">The player's chosen move.</param>
    /// <param name="computerMove">The computer's chosen move.</param>
    /// <returns>
    /// <c>"player"</c> when the player wins, <c>"computer"</c> when the computer wins,
    /// or <c>"draw"</c> when both moves are equal.
    /// </returns>
    /// <exception cref="ArgumentNullException">Thrown when one of the moves is <c>null</c>.</exception>
    public string ResolveWinner(string playerMove, string computerMove)
    {
        if (playerMove is null)
        {
            throw new ArgumentNullException(nameof(playerMove));
        }

        if (computerMove is null)
        {
            throw new ArgumentNullException(nameof(computerMove));
        }

        var normalizedPlayerMove = playerMove.ToLowerInvariant();
        var normalizedComputerMove = computerMove.ToLowerInvariant();

        if (normalizedPlayerMove == normalizedComputerMove)
        {
            return "draw";
        }

        if (PlayerWinningPairs.Contains((normalizedPlayerMove, normalizedComputerMove)))
        {
            return "player";
        }

        return "computer";
    }
}

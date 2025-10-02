namespace RpsGame.Api.Services;

/// <summary>
/// Describes the operations required to determine Rock-Paper-Scissors outcomes.
/// </summary>
public interface IGameEngine
{
    /// <summary>
    /// Generates a computer move.
    /// </summary>
    /// <returns>A lowercase move name: <c>rock</c>, <c>paper</c>, or <c>scissors</c>.</returns>
    string GenerateComputerMove();

    /// <summary>
    /// Determines which participant won a round given the selected moves.
    /// </summary>
    /// <param name="playerMove">The player's move.</param>
    /// <param name="computerMove">The computer's move.</param>
    /// <returns><c>player</c>, <c>computer</c>, or <c>draw</c> depending on the outcome.</returns>
    string ResolveWinner(string playerMove, string computerMove);
}

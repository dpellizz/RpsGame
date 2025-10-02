namespace RpsGame.Api.Models;

/// <summary>
/// Represents a persisted Rock-Paper-Scissors match outcome.
/// </summary>
public class GameResult
{
    /// <summary>
    /// Gets or sets the unique identifier for the result entry.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the move chosen by the player.
    /// </summary>
    public string PlayerMove { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the move generated for the computer.
    /// </summary>
    public string ComputerMove { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the participant that won the round.
    /// </summary>
    public string Winner { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the UTC timestamp of when the round was played.
    /// </summary>
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}

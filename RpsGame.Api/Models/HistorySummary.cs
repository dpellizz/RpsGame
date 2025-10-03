namespace RpsGame.Api.Models;

/// <summary>
/// Represents aggregated win/loss/draw counts for the recorded history.
/// </summary>
public sealed class HistorySummary
{
    /// <summary>
    /// Gets or sets the total number of recorded rounds.
    /// </summary>
    public int Total { get; init; }

    /// <summary>
    /// Gets or sets the number of rounds won by the player.
    /// </summary>
    public int Player { get; init; }

    /// <summary>
    /// Gets or sets the number of rounds won by the computer.
    /// </summary>
    public int Computer { get; init; }

    /// <summary>
    /// Gets or sets the number of rounds that ended in a draw.
    /// </summary>
    public int Draw { get; init; }
}

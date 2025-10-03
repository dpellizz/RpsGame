using System.Collections.Generic;

namespace RpsGame.Api.Models;

/// <summary>
/// Represents a single page of game history including pagination metadata.
/// </summary>
public sealed class GameHistoryPage
{
    /// <summary>
    /// Gets or sets the results contained within the requested page.
    /// </summary>
    public IReadOnlyList<GameResult> Items { get; init; } = new List<GameResult>();

    /// <summary>
    /// Gets or sets the current page number (1-based).
    /// </summary>
    public int Page { get; init; }

    /// <summary>
    /// Gets or sets the size of each page.
    /// </summary>
    public int PageSize { get; init; }

    /// <summary>
    /// Gets or sets the total number of pages available.
    /// </summary>
    public int TotalPages { get; init; }

    /// <summary>
    /// Gets or sets the total number of results across all pages.
    /// </summary>
    public int TotalCount { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether a previous page exists.
    /// </summary>
    public bool HasPrevious { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether a next page exists.
    /// </summary>
    public bool HasNext { get; init; }

    /// <summary>
    /// Gets or sets the aggregated history summary for the result set.
    /// </summary>
    public HistorySummary Summary { get; init; } = new();
}

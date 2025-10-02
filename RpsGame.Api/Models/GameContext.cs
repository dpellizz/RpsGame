using Microsoft.EntityFrameworkCore;

namespace RpsGame.Api.Models;

/// <summary>
/// Entity Framework Core database context for Rock-Paper-Scissors results.
/// </summary>
public class GameContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="GameContext"/> class.
    /// </summary>
    /// <param name="options">The configured options for the context.</param>
    public GameContext(DbContextOptions<GameContext> options) : base(options)
    {
    }

    /// <summary>
    /// Gets the stored game results.
    /// </summary>
    public DbSet<GameResult> Results => Set<GameResult>();
}

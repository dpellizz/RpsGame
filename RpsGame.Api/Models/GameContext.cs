using Microsoft.EntityFrameworkCore;

namespace RpsGame.Api.Models;

public class GameContext : DbContext
{
    public GameContext(DbContextOptions<GameContext> options) : base(options)
    {
    }

    public DbSet<GameResult> Results => Set<GameResult>();
}

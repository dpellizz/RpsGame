using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using RpsGame.Api.Models;
using RpsGame.Api.Services;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsEnvironment("IntegrationTesting"))
{
    builder.Services.AddDbContext<GameContext>(opt =>
        opt.UseInMemoryDatabase("GameContextTests"));
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("Default");

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        connectionString = builder.Configuration["DATABASE_URL"];
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("PostgreSQL connection string is not configured. Set 'ConnectionStrings:Default' or 'DATABASE_URL'.");
    }

    builder.Services.AddDbContext<GameContext>(opt =>
        opt.UseNpgsql(connectionString));
}
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<IGameEngine, GameEngine>();

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameContext>();
    db.Database.EnsureCreated();
}
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

// Play endpoint
app.MapPost("/api/game/play", async (string playerMove, GameContext db, IGameEngine gameEngine) =>
{
    var computerMove = gameEngine.GenerateComputerMove();
    var winner = gameEngine.ResolveWinner(playerMove, computerMove);

    var result = new GameResult
    {
        PlayerMove = playerMove,
        ComputerMove = computerMove,
        Winner = winner
    };

    db.Results.Add(result);
    await db.SaveChangesAsync();

    return Results.Ok(result);
});

// History endpoint
app.MapGet("/api/game/history", async (
    int? page,
    int? pageSize,
    GameContext db,
    CancellationToken cancellationToken) =>
{
    const int defaultPage = 1;
    const int defaultPageSize = 25;
    const int maxPageSize = 100;

    var requestedPage = page.GetValueOrDefault(defaultPage);
    if (requestedPage < 1)
    {
        requestedPage = defaultPage;
    }

    var requestedPageSize = pageSize.GetValueOrDefault(defaultPageSize);
    if (requestedPageSize < 1)
    {
        requestedPageSize = defaultPageSize;
    }
    else if (requestedPageSize > maxPageSize)
    {
        requestedPageSize = maxPageSize;
    }

    var totalCount = await db.Results.CountAsync(cancellationToken);

    if (totalCount == 0)
    {
        return Results.Ok(new GameHistoryPage
        {
            Items = Array.Empty<GameResult>(),
            Page = defaultPage,
            PageSize = requestedPageSize,
            TotalCount = 0,
            TotalPages = 1,
            HasPrevious = false,
            HasNext = false,
            Summary = new HistorySummary
            {
                Total = 0,
                Player = 0,
                Computer = 0,
                Draw = 0
            }
        });
    }

    var totalPages = (int)Math.Ceiling(totalCount / (double)requestedPageSize);
    var currentPage = requestedPage > totalPages ? totalPages : requestedPage;

    var items = await db.Results
        .OrderByDescending(r => r.PlayedAt)
        .Skip((currentPage - 1) * requestedPageSize)
        .Take(requestedPageSize)
        .ToListAsync(cancellationToken);

    var outcomes = await db.Results
        .GroupBy(r => r.Winner)
        .Select(g => new { g.Key, Count = g.Count() })
        .ToDictionaryAsync(x => x.Key, x => x.Count, cancellationToken);

    var summary = new HistorySummary
    {
        Total = totalCount,
        Player = outcomes.TryGetValue("player", out var playerWins) ? playerWins : 0,
        Computer = outcomes.TryGetValue("computer", out var computerWins) ? computerWins : 0,
        Draw = outcomes.TryGetValue("draw", out var draws) ? draws : 0
    };

    return Results.Ok(new GameHistoryPage
    {
        Items = items,
        Page = currentPage,
        PageSize = requestedPageSize,
        TotalCount = totalCount,
        TotalPages = totalPages,
        HasPrevious = currentPage > 1,
        HasNext = currentPage < totalPages,
        Summary = summary
    });
});

// Reset endpoint
app.MapDelete("/api/game/history", async (GameContext db) =>
{
    db.Results.RemoveRange(db.Results);
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.Run();

/// <summary>
/// Marker type required for integration testing infrastructure.
/// </summary>
public partial class Program;
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
app.MapGet("/api/game/history", async (GameContext db) =>
    await db.Results.OrderByDescending(r => r.PlayedAt).ToListAsync());

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
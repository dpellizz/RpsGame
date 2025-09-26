using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using RpsGame.Api.Models;

var builder = WebApplication.CreateBuilder(args);
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
app.MapPost("/api/game/play", async (string playerMove, GameContext db) =>
{
    var moves = new[] { "rock", "paper", "scissors" };
    var computerMove = moves[new Random().Next(moves.Length)];
    string winner = "draw";

    if (playerMove == computerMove)
        winner = "draw";
    else if ((playerMove == "rock" && computerMove == "scissors") ||
             (playerMove == "scissors" && computerMove == "paper") ||
             (playerMove == "paper" && computerMove == "rock"))
        winner = "player";
    else
        winner = "computer";

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
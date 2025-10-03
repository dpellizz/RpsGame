using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RpsGame.Api.Services;

namespace RpsGame.Api.Tests.Infrastructure;

/// <summary>
/// Factory that configures the API host for integration testing scenarios.
/// </summary>
public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTesting");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IGameEngine>();
            services.AddSingleton<IGameEngine, DeterministicGameEngine>();
        });
    }
}

/// <summary>
/// Provides deterministic move selection while delegating outcome evaluation to <see cref="GameEngine"/>.
/// </summary>
internal sealed class DeterministicGameEngine : IGameEngine
{
    private readonly GameEngine _fallbackEngine = new();

    /// <summary>
    /// Returns a fixed move to make integration tests deterministic.
    /// </summary>
    public string GenerateComputerMove()
    {
        return "rock";
    }

    /// <summary>
    /// Reuses the production winner resolution logic.
    /// </summary>
    public string ResolveWinner(string playerMove, string computerMove)
    {
        return _fallbackEngine.ResolveWinner(playerMove, computerMove);
    }
}

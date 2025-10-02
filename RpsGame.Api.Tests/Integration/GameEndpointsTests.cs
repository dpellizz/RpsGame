using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using FluentAssertions.Extensions;
using RpsGame.Api.Models;
using RpsGame.Api.Tests.Infrastructure;

namespace RpsGame.Api.Tests.Integration;

/// <summary>
/// Integration tests that exercise the public Rock-Paper-Scissors API endpoints.
/// </summary>
public class GameEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    /// <summary>
    /// Initializes the test suite with a preconfigured HTTP client.
    /// </summary>
    /// <param name="factory">Factory that hosts the API for testing.</param>
    public GameEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    /// <summary>
    /// Validates that playing a round persists the expected data and returns the stored payload.
    /// </summary>
    [Fact]
    public async Task PlayEndpoint_ShouldPersistResult()
    {
        await _client.DeleteAsync("/api/game/history");

        var response = await _client.PostAsync("/api/game/play?playerMove=paper", content: null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<GameResult>();
        result.Should().NotBeNull();
        var materializedResult = result!;
        materializedResult.PlayerMove.Should().Be("paper");
        materializedResult.ComputerMove.Should().Be("rock");
        materializedResult.Winner.Should().Be("player");
        materializedResult.PlayedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        var history = await _client.GetFromJsonAsync<List<GameResult>>("/api/game/history");
        history.Should().NotBeNull();
        var materializedHistory = history!;
        materializedHistory.Should().ContainSingle();
        materializedHistory[0].PlayerMove.Should().Be(materializedResult.PlayerMove);
        materializedHistory[0].ComputerMove.Should().Be(materializedResult.ComputerMove);
        materializedHistory[0].Winner.Should().Be(materializedResult.Winner);
    }

    /// <summary>
    /// Confirms that deleting the history removes all results.
    /// </summary>
    [Fact]
    public async Task ResetEndpoint_ShouldClearHistory()
    {
        await _client.DeleteAsync("/api/game/history");
        await _client.PostAsync("/api/game/play?playerMove=rock", content: null);

        var deleteResponse = await _client.DeleteAsync("/api/game/history");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var history = await _client.GetFromJsonAsync<List<GameResult>>("/api/game/history");
        history.Should().NotBeNull();
        var clearedHistory = history!;
        clearedHistory.Should().BeEmpty();
    }
}

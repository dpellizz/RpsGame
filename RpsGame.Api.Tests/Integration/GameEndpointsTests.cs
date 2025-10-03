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

    var historyPage = await _client.GetFromJsonAsync<GameHistoryPage>("/api/game/history?page=1&pageSize=25");
    historyPage.Should().NotBeNull();
    var materializedHistory = historyPage!;
    materializedHistory.Items.Should().ContainSingle();
    var persistedResult = materializedHistory.Items[0];
    persistedResult.PlayerMove.Should().Be(materializedResult.PlayerMove);
    persistedResult.ComputerMove.Should().Be(materializedResult.ComputerMove);
    persistedResult.Winner.Should().Be(materializedResult.Winner);
    materializedHistory.TotalCount.Should().Be(1);
    materializedHistory.Summary.Player.Should().Be(1);
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

    var historyPage = await _client.GetFromJsonAsync<GameHistoryPage>("/api/game/history?page=1&pageSize=25");
    historyPage.Should().NotBeNull();
    var clearedHistory = historyPage!;
    clearedHistory.Items.Should().BeEmpty();
    clearedHistory.TotalCount.Should().Be(0);
    clearedHistory.Summary.Total.Should().Be(0);
    }

    /// <summary>
    /// Ensures that the history endpoint enforces pagination metadata and page sizes.
    /// </summary>
    [Fact]
    public async Task HistoryEndpoint_ShouldSupportPagination()
    {
        await _client.DeleteAsync("/api/game/history");

        const int totalRounds = 12;

        for (var i = 0; i < totalRounds; i++)
        {
            var move = i % 3 == 0 ? "rock" : i % 3 == 1 ? "paper" : "scissors";
            await _client.PostAsync($"/api/game/play?playerMove={move}", content: null);
        }

        var firstPage = await _client.GetFromJsonAsync<GameHistoryPage>("/api/game/history?page=1&pageSize=5");
        firstPage.Should().NotBeNull();
        firstPage!.Page.Should().Be(1);
        firstPage.PageSize.Should().Be(5);
        firstPage.Items.Should().HaveCount(5);
        firstPage.TotalCount.Should().Be(12);
        firstPage.TotalPages.Should().Be(3);
        firstPage.HasPrevious.Should().BeFalse();
        firstPage.HasNext.Should().BeTrue();

        var lastPage = await _client.GetFromJsonAsync<GameHistoryPage>("/api/game/history?page=3&pageSize=5");
        lastPage.Should().NotBeNull();
        lastPage!.Page.Should().Be(3);
        lastPage.Items.Should().HaveCount(2);
        lastPage.HasPrevious.Should().BeTrue();
        lastPage.HasNext.Should().BeFalse();
        lastPage.Summary.Total.Should().Be(totalRounds);
        (lastPage.Summary.Player + lastPage.Summary.Computer + lastPage.Summary.Draw)
            .Should().Be(totalRounds);
    }
}

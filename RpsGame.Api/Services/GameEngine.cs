using System;
using System.Collections.Generic;

namespace RpsGame.Api.Services;

public class GameEngine : IGameEngine
{
    private static readonly string[] Moves = { "rock", "paper", "scissors" };
    private static readonly HashSet<(string PlayerMove, string ComputerMove)> PlayerWinningPairs = new()
    {
        ("rock", "scissors"),
        ("scissors", "paper"),
        ("paper", "rock")
    };

    public string GenerateComputerMove()
    {
        return Moves[Random.Shared.Next(Moves.Length)];
    }

    public string ResolveWinner(string playerMove, string computerMove)
    {
        if (playerMove is null)
        {
            throw new ArgumentNullException(nameof(playerMove));
        }

        if (computerMove is null)
        {
            throw new ArgumentNullException(nameof(computerMove));
        }

        var normalizedPlayerMove = playerMove.ToLowerInvariant();
        var normalizedComputerMove = computerMove.ToLowerInvariant();

        if (normalizedPlayerMove == normalizedComputerMove)
        {
            return "draw";
        }

        if (PlayerWinningPairs.Contains((normalizedPlayerMove, normalizedComputerMove)))
        {
            return "player";
        }

        return "computer";
    }
}

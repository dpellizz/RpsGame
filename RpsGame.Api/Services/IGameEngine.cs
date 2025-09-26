namespace RpsGame.Api.Services;

public interface IGameEngine
{
    string GenerateComputerMove();
    string ResolveWinner(string playerMove, string computerMove);
}

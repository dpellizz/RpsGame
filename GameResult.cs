public class GameResult
{
    public int Id { get; set; }
    public string PlayerMove { get; set; } = string.Empty;
    public string ComputerMove { get; set; } = string.Empty;
    public string Winner { get; set; } = string.Empty;
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
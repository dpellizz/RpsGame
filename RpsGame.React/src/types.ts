export interface GameResult {
  id: number;
  playerMove: string;
  computerMove: string;
  winner: "player" | "computer" | "draw";
  playedAt: string;
}

export type GameMove = "rock" | "paper" | "scissors";

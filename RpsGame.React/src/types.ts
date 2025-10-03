export interface GameResult {
  id: number;
  playerMove: string;
  computerMove: string;
  winner: "player" | "computer" | "draw";
  playedAt: string;
}

export type GameMove = "rock" | "paper" | "scissors";

export interface HistorySummary {
  total: number;
  player: number;
  computer: number;
  draw: number;
}

export interface GameHistoryPage {
  items: GameResult[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  summary: HistorySummary;
}

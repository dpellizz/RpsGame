import type { GameResult } from "../types";

export function getWinnerLabel(winner: GameResult["winner"]): string {
  if (winner === "draw") {
    return "Draw";
  }

  return winner === "player" ? "You" : "Computer";
}

interface StatusPillProps {
  winner: GameResult["winner"];
  className?: string;
}

export function StatusPill({ winner, className }: StatusPillProps) {
  const label = getWinnerLabel(winner);
  const classes = ["status-pill", winner, className].filter(Boolean).join(" ");

  return <span className={classes}>{label}</span>;
}

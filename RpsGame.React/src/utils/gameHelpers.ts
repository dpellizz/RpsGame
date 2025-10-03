import type { GameMove } from "../types";

export function emojiForMove(move: GameMove | string): string {
  switch (move) {
    case "rock":
      return "🪨";
    case "paper":
      return "📄";
    case "scissors":
      return "✂️";
    default:
      return "❓";
  }
}

export function formatMove(move: string): string {
  return move.charAt(0).toUpperCase() + move.slice(1);
}

export function formatTimestamp(dateIso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateIso));
}

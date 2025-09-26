import { GameMove, GameResult } from "./types";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5198";

const buildUrl = (path: string, params?: Record<string, string>) => {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

export async function playRound(move: GameMove): Promise<GameResult> {
  const response = await fetch(buildUrl("/api/game/play", { playerMove: move }), {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Play round failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getHistory(): Promise<GameResult[]> {
  const response = await fetch(buildUrl("/api/game/history"));

  if (!response.ok) {
    throw new Error(`History request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function resetHistory(): Promise<void> {
  const response = await fetch(buildUrl("/api/game/history"), {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`Reset failed: ${response.statusText}`);
  }
}

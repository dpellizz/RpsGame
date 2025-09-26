import { useEffect, useMemo, useState } from "react";
import { getHistory, playRound, resetHistory } from "./api";
import type { GameMove, GameResult } from "./types";

const MOVES: GameMove[] = ["rock", "paper", "scissors"];

type Status = "idle" | "loading" | "error" | "success";

interface Stats {
  total: number;
  player: number;
  computer: number;
  draw: number;
}

export default function App() {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [latest, setLatest] = useState<GameResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setStatus("loading");
    setError(null);
    try {
      const results = await getHistory();
      setHistory(results);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load history");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onPlay = async (move: GameMove) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await playRound(move);
      setLatest(result);
      await loadHistory();
      setStatus("success");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to play round");
      setStatus("error");
    }
  };

  const onReset = async () => {
    setStatus("loading");
    setError(null);
    try {
      await resetHistory();
      setLatest(null);
      await loadHistory();
      setStatus("success");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to reset history");
      setStatus("error");
    }
  };

  const stats = useMemo<Stats>(() => {
    return history.reduce<Stats>(
      (acc: Stats, item: GameResult) => {
        acc.total += 1;
        acc[item.winner] += 1;
        return acc;
      },
      { total: 0, player: 0, computer: 0, draw: 0 }
    );
  }, [history]);

  return (
    <main className="card">
      <section>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="section-title">Rock · Paper · Scissors</h1>
          <div>
            <p style={{ margin: 0, color: "#475569" }}>API: {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5198"}</p>
            <p style={{ margin: 0, color: "#475569" }}>Rounds played: {stats.total}</p>
          </div>
        </header>
      </section>

      <section>
        <h2 className="section-title">Choose your move</h2>
        <div className="move-grid">
          {MOVES.map((move) => (
            <button key={move} className="button" type="button" onClick={() => onPlay(move)} disabled={status === "loading"}>
              <span style={{ fontSize: "2.5rem" }}>{emojiForMove(move)}</span>
              <span style={{ textTransform: "capitalize" }}>{move}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="result-card">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Latest result</h3>
          <button className="button secondary" type="button" onClick={onReset} disabled={status === "loading"}>
            Reset history
          </button>
        </header>

        {status === "loading" && <p className="loading">Working...</p>}
        {error && <p className="error">{error}</p>}

        {latest ? (
          <div className="result-details">
            <p>
              You played <strong>{latest.playerMove}</strong> {emojiForMove(latest.playerMove)}
            </p>
            <p>
              Computer played <strong>{latest.computerMove}</strong> {emojiForMove(latest.computerMove)}
            </p>
            <p>
              Winner: <StatusPill winner={latest.winner} />
            </p>
            <p>
              Played at: {new Date(latest.playedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="empty-state">Play your first round to see the results.</p>
        )}
      </section>

      <section>
        <h2 className="section-title">Match history</h2>
        {history.length === 0 ? (
          <p className="empty-state">No rounds recorded yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Computer</th>
                <th>Winner</th>
                <th>Played at</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{formatMove(item.playerMove)}</td>
                  <td>{formatMove(item.computerMove)}</td>
                  <td>
                    <StatusPill winner={item.winner} />
                  </td>
                  <td>{new Date(item.playedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function emojiForMove(move: string) {
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

function formatMove(move: string) {
  return move.charAt(0).toUpperCase() + move.slice(1);
}

function StatusPill({ winner }: { winner: GameResult["winner"] }) {
  const label = winner === "draw" ? "Draw" : winner === "player" ? "You" : "Computer";
  return <span className={`status-pill ${winner}`}>{label}</span>;
}

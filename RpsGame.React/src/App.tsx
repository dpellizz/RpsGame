import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
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

const OUTCOME_CONFIG = [
  { key: "player" as const, label: "Wins", color: "#16a34a" },
  { key: "computer" as const, label: "Losses", color: "#ef4444" },
  { key: "draw" as const, label: "Draws", color: "#f59e0b" }
];

type OutcomeKey = (typeof OUTCOME_CONFIG)[number]["key"];

type ChartDatum = {
  key: OutcomeKey;
  label: string;
  color: string;
  value: number;
  percentage: number;
};

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

  const chartData = useMemo<ChartDatum[]>(
    () =>
      OUTCOME_CONFIG.map((item) => {
        const value = stats[item.key];
        const percentage = stats.total > 0 ? (value / stats.total) * 100 : 0;
        return { ...item, value, percentage };
      }),
    [stats]
  );

  return (
    <main className="card" aria-labelledby="app-title">
      <section aria-labelledby="app-title" aria-describedby="app-summary">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 id="app-title" className="section-title">
            Rock · Paper · Scissors
          </h1>
          <div>
            <p id="app-summary" style={{ margin: 0, color: "#475569" }}>
              API: {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5198"}
            </p>
            <p style={{ margin: 0, color: "#475569" }}>Rounds played: {stats.total}</p>
          </div>
        </header>
      </section>

      <section aria-labelledby="move-title">
        <h2 id="move-title" className="section-title">
          Choose your move
        </h2>
        <div className="move-grid" role="group" aria-label="Player moves">
          {MOVES.map((move) => (
            <button key={move} className="button" type="button" onClick={() => onPlay(move)} disabled={status === "loading"}>
              <span style={{ fontSize: "2.5rem" }}>{emojiForMove(move)}</span>
              <span style={{ textTransform: "capitalize" }}>{move}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="result-card" aria-labelledby="latest-result-title">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 id="latest-result-title">Latest result</h3>
          <button className="button secondary" type="button" onClick={onReset} disabled={status === "loading"}>
            Reset history
          </button>
        </header>

        {status === "loading" && (
          <p className="loading" role="status" aria-live="polite">
            Working...
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {latest ? (
          <div className="result-summary" role="status" aria-live="polite" aria-atomic="true">
            <div className="result-moves">
              <ResultSide label="You" move={latest.playerMove} />
              <span className="result-divider">vs</span>
              <ResultSide label="Computer" move={latest.computerMove} />
            </div>
            <div className="result-meta">
              <StatusPill winner={latest.winner} />
              <span className="result-time">{formatTimestamp(latest.playedAt)}</span>
            </div>
          </div>
        ) : (
          <p className="empty-state">Play your first round to see the results.</p>
        )}
      </section>

      <section aria-labelledby="results-breakdown-title">
        <h2 id="results-breakdown-title" className="section-title">
          Results breakdown
        </h2>
        {stats.total === 0 ? (
          <p className="empty-state">Play a round to see the breakdown.</p>
        ) : (
          <div className="chart-panel">
            <div className="chart-wrapper" role="img" aria-label="Outcome breakdown pie chart">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ percent }) => {
                      const pct = typeof percent === "number" ? percent * 100 : 0;
                      return `${Math.round(pct)}%`;
                    }}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, entry) => {
                      const percentage = (entry?.payload as ChartDatum | undefined)?.percentage ?? 0;
                      return [`${value} (${percentage.toFixed(1)}%)`, name as string];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="chart-legend" aria-label="Outcome breakdown legend">
              {chartData.map((entry) => (
                <li key={entry.key}>
                  <span className="legend-swatch" style={{ backgroundColor: entry.color }} />
                  <span className="legend-label">{entry.label}</span>
                  <span className="legend-count">{entry.value}</span>
                  <span className="legend-percentage">{entry.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="match-history-title">
        <h2 id="match-history-title" className="section-title">
          Match history
        </h2>
        {history.length === 0 ? (
          <p className="empty-state">No rounds recorded yet.</p>
        ) : (
          <table className="history-table" aria-label="Match history">
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

function formatTimestamp(dateIso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateIso));
}

function ResultSide({ label, move }: { label: string; move: GameResult["playerMove"] }) {
  return (
    <div className="result-side">
      <span className="result-side-label">{label}</span>
      <span className="result-side-move">
  <span aria-hidden="true" className="result-side-emoji">
          {emojiForMove(move)}
        </span>
        <strong>{formatMove(move)}</strong>
      </span>
    </div>
  );
}

function StatusPill({ winner }: { winner: GameResult["winner"] }) {
  const label = winner === "draw" ? "Draw" : winner === "player" ? "You" : "Computer";
  return <span className={`status-pill ${winner}`}>{label}</span>;
}

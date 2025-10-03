import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { getHistory, playRound, resetHistory } from "../api";
import type { GameHistoryPage, GameMove, GameResult } from "../types";
import { StatusPill } from "../components/StatusPill";
import { emojiForMove, formatMove, formatTimestamp } from "../utils/gameHelpers";

const MOVES: GameMove[] = ["rock", "paper", "scissors"];
const PAGE_SIZE = 10;

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

export default function MainPage() {
  const [historyPage, setHistoryPage] = useState<GameHistoryPage | null>(null);
  const [latest, setLatest] = useState<GameResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    const results = await getHistory(1, PAGE_SIZE);
    setHistoryPage(results);
    return results;
  }, []);

  const refreshHistory = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      await fetchHistory();
      setStatus("success");
    } catch (err) {
      console.error(err);
      setHistoryPage(null);
      setError(err instanceof Error ? err.message : "Unable to load history");
      setStatus("error");
    }
  }, [fetchHistory]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const onPlay = async (move: GameMove) => {
    setStatus("loading");
    setError(null);

    try {
      const result = await playRound(move);
      setLatest(result);
      await refreshHistory();
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
      await refreshHistory();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to reset history");
      setStatus("error");
    }
  };

  const summary = historyPage?.summary;

  const stats = useMemo<Stats>(() => {
    if (!summary) {
      return { total: 0, player: 0, computer: 0, draw: 0 };
    }

    return {
      total: summary.total,
      player: summary.player,
      computer: summary.computer,
      draw: summary.draw
    };
  }, [summary]);

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
        <div className="history-summary-card">
          <p className="history-summary-text">
            {stats.total === 0
              ? "No rounds recorded yet. Visit the full history to see past rounds once you've played."
              : `You have played ${stats.total} rounds. View the full log for detailed moves and timestamps.`}
          </p>
          <Link className="button secondary" to="/history">
            View full history
          </Link>
        </div>
      </section>
    </main>
  );
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

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../api";
import type { GameHistoryPage, GameResult } from "../types";
import { StatusPill } from "../components/StatusPill";
import { formatMove, formatTimestamp } from "../utils/gameHelpers";

type Status = "idle" | "loading" | "error" | "success";

const PAGE_SIZE = 25;

export default function HistoryPage() {
  const [historyPage, setHistoryPage] = useState<GameHistoryPage | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchPage = useCallback(async (pageToLoad: number) => {
    const data = await getHistory(pageToLoad, PAGE_SIZE);
    setHistoryPage(data);
    return data;
  }, []);

  const refresh = useCallback(
    async (pageToLoad: number) => {
      setStatus("loading");
      setError(null);

      try {
        await fetchPage(pageToLoad);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setHistoryPage(null);
        setError(err instanceof Error ? err.message : "Unable to load history");
        setStatus("error");
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    void refresh(page);
  }, [page, refresh]);

  const items = historyPage?.items ?? [];
  const totalCount = historyPage?.totalCount ?? 0;
  const totalPages = historyPage?.totalPages ?? 1;
  const hasPrevious = historyPage?.hasPrevious ?? false;
  const hasNext = historyPage?.hasNext ?? false;

  const rangeStart = useMemo(() => (totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1), [page, totalCount]);
  const rangeEnd = useMemo(() => (rangeStart === 0 ? 0 : rangeStart + items.length - 1), [items.length, rangeStart]);

  const handlePrevious = () => {
    if (hasPrevious && status !== "loading") {
      setPage((current) => Math.max(1, current - 1));
    }
  };

  const handleNext = () => {
    if (hasNext && status !== "loading") {
      setPage((current) => Math.min(totalPages, current + 1));
    }
  };

  return (
    <main className="card" aria-labelledby="history-page-title">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 id="history-page-title" className="section-title">
            Match history
          </h1>
          <p style={{ margin: 0, color: "#475569" }}>
            View every recorded round with moves, outcomes, and timestamps.
          </p>
        </div>
        <Link className="button secondary" to="/">
          Back to game
        </Link>
      </header>

      {status === "loading" && (
        <p className="loading" role="status" aria-live="polite">
          Loading history...
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!error && items.length === 0 && status === "success" ? (
        <p className="empty-state">No rounds recorded yet.</p>
      ) : (
        <>
          <table className="history-table" aria-label="Match history table">
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
              {items.map((item, index) => (
                <HistoryRow key={item.id} index={rangeStart + index} result={item} />
              ))}
            </tbody>
          </table>
          <div className="table-footer" aria-live="polite">
            <span className="table-summary">
              {totalCount === 0 ? "" : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} rounds`}
            </span>
            <div className="pagination-controls" role="group" aria-label="Pagination controls">
              <button className="button secondary" type="button" onClick={handlePrevious} disabled={!hasPrevious || status === "loading"}>
                Previous
              </button>
              <span className="pagination-status">
                Page {page} of {Math.max(totalPages, 1)}
              </span>
              <button className="button secondary" type="button" onClick={handleNext} disabled={!hasNext || status === "loading"}>
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function HistoryRow({ index, result }: { index: number; result: GameResult }) {
  return (
    <tr>
      <td>{index}</td>
      <td>{formatMove(result.playerMove)}</td>
      <td>{formatMove(result.computerMove)}</td>
      <td>
        <StatusPill winner={result.winner} />
      </td>
      <td>{formatTimestamp(result.playedAt)}</td>
    </tr>
  );
}

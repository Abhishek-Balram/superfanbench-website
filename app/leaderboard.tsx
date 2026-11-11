"use client";

import { useState } from "react";
import type { JudgeLeaderboard } from "@/lib/leaderboard";

function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`;
}

function formatScore(score: number): string {
  const fixed = Math.abs(score).toFixed(2);
  if (Number(fixed) === 0) return fixed;
  return `${score > 0 ? "+" : "−"}${fixed}`;
}

export function Leaderboard({
  leaderboards,
  defaultJudge,
}: {
  leaderboards: JudgeLeaderboard[];
  defaultJudge: string;
}) {
  const [judge, setJudge] = useState(defaultJudge);
  const board = leaderboards.find((b) => b.judge === judge) ?? leaderboards[0];

  return (
    <div>
      <div role="group" aria-labelledby="judge-label" className="flex flex-wrap items-center gap-3">
        <span id="judge-label" className="text-sm text-muted">
          Judge
        </span>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {leaderboards.map(({ judge: name }) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === board.judge}
              onClick={() => setJudge(name)}
              className="cursor-pointer rounded-md px-3 py-1 font-mono text-sm text-muted transition-colors hover:text-foreground aria-pressed:bg-surface aria-pressed:text-foreground"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[30rem] sm:min-w-[38rem] text-sm tabular-nums">
          <caption className="sr-only">
            Results for each model, graded by {board.judge}, ranked by accuracy
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th scope="col" className="w-10 py-2 pr-2 font-medium">
                #
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Model
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Accuracy
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Score
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Correct
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Incorrect
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Declined
              </th>
            </tr>
          </thead>
          <tbody>
            {board.rows.map((row) => (
              <tr key={row.model} className="border-b border-border last:border-b-0">
                <td className="py-2.5 pr-2 text-muted">{row.rank}</td>
                <th scope="row" className="py-2.5 pr-4 text-left font-mono font-normal whitespace-nowrap">
                  {row.model}
                </th>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right">{formatAccuracy(row.accuracy)}</span>
                    <span aria-hidden className="hidden h-1 w-24 overflow-hidden rounded-full bg-surface sm:block">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${row.accuracy * 100}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-right">{formatScore(row.score)}</td>
                <td className="py-2.5 pr-4 text-right">{row.correct}</td>
                <td className="py-2.5 pr-4 text-right">{row.incorrect}</td>
                <td className="py-2.5 text-right">{row.declined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

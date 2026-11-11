import fs from "node:fs";
import path from "node:path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import exportJson from "@/data/export.json";
import { parseResults } from "@/lib/leaderboard";
import { Leaderboard } from "./leaderboard";

const results = parseResults(exportJson as unknown);

const runDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(results.runDate);

export default function Home() {
  const explanation = fs.readFileSync(
    path.join(process.cwd(), "docs/benchmark.md"),
    "utf8",
  );

  const facts = [
    ["Run date", runDate],
    ["Questions", results.questionCount],
    ["Models", results.modelCount],
  ] as const;

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">SuperFanBench</h1>
        <p className="mt-3 max-w-xl text-lg text-muted">
          How well language models recall the details that only superfans know, from books,
          films, and TV.
        </p>
      </header>

      <section aria-labelledby="leaderboard" className="mt-16">
        <h2 id="leaderboard" className="text-xl font-semibold tracking-tight">
          Leaderboard
        </h2>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {facts.map(([term, value]) => (
            <div key={term} className="flex gap-2">
              <dt className="text-muted">{term}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <Leaderboard leaderboards={results.leaderboards} defaultJudge={results.defaultJudge} />
        </div>

        <figure className="mt-10 rounded-lg bg-surface px-5 py-4">
          <figcaption className="text-xs text-muted">
            System prompt given to every candidate
          </figcaption>
          <blockquote className="mt-2 text-sm leading-relaxed">
            &ldquo;{results.systemPrompt}&rdquo;
          </blockquote>
        </figure>
      </section>

      <section
        className="prose prose-zinc mt-20 max-w-none dark:prose-invert prose-headings:tracking-tight prose-h2:text-xl prose-h3:text-base prose-p:text-[0.95rem] prose-p:leading-7 prose-pre:border prose-pre:border-border prose-pre:bg-surface prose-pre:text-foreground prose-th:font-medium prose-th:text-muted prose-code:font-medium prose-code:before:content-none prose-code:after:content-none"
      >
        <Markdown remarkPlugins={[remarkGfm]} components={{ h1: "h2", h2: "h3", h3: "h4" }}>
          {explanation}
        </Markdown>
      </section>

      <footer className="mt-20 border-t border-border pt-6 text-xs text-muted">
        Run <span className="font-mono">{results.runId}</span>
      </footer>
    </main>
  );
}

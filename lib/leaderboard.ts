export type ModelResult = {
  model: string;
  accuracy: number;
  score: number;
  correct: number;
  incorrect: number;
  declined: number;
};

export type RankedResult = ModelResult & { rank: number };

export type JudgeLeaderboard = {
  judge: string;
  rows: RankedResult[];
};

export type Results = {
  runId: string;
  runDate: Date;
  systemPrompt: string;
  questionCount: number;
  modelCount: number;
  leaderboards: JudgeLeaderboard[];
  defaultJudge: string;
};

const PREFERRED_JUDGE = "gpt-6-luna";

class ExportError extends Error {
  constructor(message: string) {
    super(`data/export.json: ${message}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function field<T>(
  record: Record<string, unknown>,
  key: string,
  where: string,
  check: (value: unknown) => value is T,
  expected: string,
): T {
  const value = record[key];
  if (!check(value)) {
    throw new ExportError(`${where}.${key} must be ${expected}`);
  }
  return value;
}

const isString = (v: unknown): v is string => typeof v === "string" && v !== "";
const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isCount = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0;

function parseRow(raw: unknown, where: string): ModelResult {
  if (!isRecord(raw)) throw new ExportError(`${where} must be an object`);
  return {
    model: field(raw, "model", where, isString, "a non-empty string"),
    accuracy: field(raw, "accuracy", where, isFiniteNumber, "a number"),
    score: field(raw, "score", where, isFiniteNumber, "a number"),
    correct: field(raw, "correct", where, isCount, "a count"),
    incorrect: field(raw, "incorrect", where, isCount, "a count"),
    declined: field(raw, "declined", where, isCount, "a count"),
  };
}

function questionCount(row: ModelResult): number {
  return row.correct + row.incorrect + row.declined;
}

/** Rows arrive sorted by accuracy. Equal accuracy shares a rank, as in 1, 2, 2, 4. */
function rank(rows: ModelResult[]): RankedResult[] {
  const ranked: RankedResult[] = [];
  rows.forEach((row, i) => {
    const prev = ranked[i - 1];
    ranked.push({ ...row, rank: prev?.accuracy === row.accuracy ? prev.rank : i + 1 });
  });
  return ranked;
}

/** A run ID starts with its UTC creation time, as in 20261106-103021-ftw3. */
function runDate(runId: string): Date {
  const match = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})-/.exec(runId);
  if (!match) {
    throw new ExportError(`runId "${runId}" does not start with YYYYMMDD-HHMMSS-`);
  }
  const [y, mo, d, h, mi, s] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  if (date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new ExportError(`runId "${runId}" holds an invalid date`);
  }
  return date;
}

export function parseResults(raw: unknown): Results {
  if (!isRecord(raw)) throw new ExportError("the top level must be an object");
  if (raw.formatVersion !== 1) {
    throw new ExportError(
      `formatVersion ${JSON.stringify(raw.formatVersion)} is not supported, expected 1`,
    );
  }
  const runId = field(raw, "runId", "export", isString, "a non-empty string");
  const systemPrompt = field(raw, "systemPrompt", "export", isString, "a non-empty string");
  const judges = field(raw, "judges", "export", isRecord, "an object");

  const leaderboards = Object.entries(judges).map(([judge, rawRows]) => {
    const where = `judges["${judge}"]`;
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      throw new ExportError(`${where} must be a non-empty array`);
    }
    const rows = rawRows.map((row, i) => parseRow(row, `${where}[${i}]`));
    rows.forEach((row, i) => {
      if (i > 0 && row.accuracy > rows[i - 1].accuracy) {
        throw new ExportError(`${where} is not sorted by accuracy at ${row.model}`);
      }
    });
    return { judge, rows: rank(rows) };
  });
  if (leaderboards.length === 0) throw new ExportError("judges must name at least one judge");

  const allRows = leaderboards.flatMap((board) => board.rows);
  const total = questionCount(allRows[0]);
  const mismatch = allRows.find((row) => questionCount(row) !== total);
  if (mismatch) {
    throw new ExportError(
      `${mismatch.model} has ${questionCount(mismatch)} outcomes, other rows have ${total}`,
    );
  }

  const judgeNames = leaderboards.map((board) => board.judge);
  return {
    runId,
    runDate: runDate(runId),
    systemPrompt,
    questionCount: total,
    modelCount: new Set(allRows.map((row) => row.model)).size,
    leaderboards,
    defaultJudge: judgeNames.includes(PREFERRED_JUDGE) ? PREFERRED_JUDGE : judgeNames[0],
  };
}

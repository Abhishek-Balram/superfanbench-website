# SuperFanBench website

SuperFanBench tests how well language models recall very specific details from books, films, and TV. This repository is its public results site: one static page with the leaderboard for each judge and an explanation of the benchmark. Read [How SuperFanBench works](docs/benchmark.md) for what the benchmark measures and how answers are graded.

## Run the site locally

You need Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. To check the production build, run `npm run build` and then `npm run start`.

## Publish new results

The site reads one file, `data/export.json`. To publish a new run:

1. Run the benchmark's `export` command on a finished run. It writes `export.json` into the run folder.
2. Replace `data/export.json` with that file.
3. Run `npm run build`.

The build fails if the file has an unknown `formatVersion` or a shape the site does not expect. The error names the field that is wrong.

The page text about the benchmark comes from `docs/benchmark.md`. Edit that file to change the explanation. Keep run-specific facts, such as dates and model names, out of it. The site reads those from `data/export.json`.

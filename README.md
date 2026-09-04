# SysCode

Learn system design by drawing it. You are given a question with real scale
numbers and requirements, you build the architecture on a canvas, and your
design is graded against a rubric that explains what is missing.

## Running it

```bash
pnpm install
pnpm dev
```

No database or account is needed to browse questions, solve them, or keep your
progress — everything on the practice path runs in the browser.

## Where things live

| Path | What it is |
|---|---|
| `src/content/problems/` | The questions. One typed module each, plus rubric and reference solution |
| `src/lib/evaluation.ts` | Grades a diagram against a rubric of graph checks |
| `src/lib/component-catalog.ts` | The 25 components in the palette |
| `src/lib/progress.ts` | Solved state and saved solutions, in `localStorage` |
| `src/components/canvas/` | The React Flow canvas, palette and node inspector |
| `src/app/problems/` | Question list and the solving workspace |
| `src/app/home/` | Free-form sandbox canvas |

## Adding a question

Add a module to `src/content/problems/` exporting a `Problem`, register it in
`index.ts`, then run:

```bash
pnpm validate:content
```

That asserts your reference solution passes its own rubric, and that the same
components with every edge removed are rejected — which is what catches a rubric
that only checks which parts are present instead of how they are wired.

## Scripts

```bash
pnpm dev                 # dev server
pnpm build               # production build
pnpm lint                # eslint
pnpm validate:content    # check questions and rubrics
pnpm db:migrate          # optional; the practice path does not need a database
```

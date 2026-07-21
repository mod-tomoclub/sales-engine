# Tomo School OS

**AI-supported, mastery-based learning** — Bloom's 2-sigma via 1:1 AI tutoring +
mastery progression, built as a trust-first transformation of a real school.

This repository is the **working core loop** of the platform described in
[`docs/TOMO_SCHOOL_ARCHITECTURE.md`](docs/TOMO_SCHOOL_ARCHITECTURE.md): the domain
model, the engines, the real ICSE curriculum graph, and three runnable surfaces —
all deployable to Cloudflare Pages with **no backend or database**.

## The idea in one loop

Every unit a child learns runs through a state machine (§7):

```
LOCKED → READY → INSTRUCTION → PRACTICE → SUMMATION_DUE
        (Tomoe teaches)   (guided practice)   │ AI-FREE 90% proof
                                               ▼
   PROVISIONAL_MASTERY ──1-3-7 retention (D+3 AND D+7)──▶ CONFIRMED_MASTERY
   (unlocks dependents now)      any slip ▼                (durable, over time)
                                    REFRESH_NEEDED ──micro-loop──▶ CONFIRMED
```

A 90% pass is only **provisional** — mastery is *confirmed over time*, never on the
same day. Provisional mastery unlocks dependent units immediately, so progress is
never blocked while retention is still being verified.

## What's implemented

| Layer | What runs today |
|---|---|
| **Curriculum graph** | Real importer parses `seed/concept_block.xlsx` → **576 units, 2,858 concept blocks, 995 prerequisite edges, 7 subjects, 12 grades, 7,950 design hours**. The delivery-code legend and provenance notes are read from the workbook's own README, and the grade × subject coverage matrix reproduces its Dashboard exactly. |
| **Engines** (pure TS) | Mastery/retention state machine + 1-3-7 scheduler, session planner (60-min SOP), motivation ledger/streaks/goals, baseline seeding, Tomoe tutor + curriculum-grounded item bank. |
| **Student App** | The Tomoe mastery loop end-to-end: instruction → guided practice (with hints, never answers) → AI-free summation → retention checks. Instruction shows the unit's real concept blocks in sequence with its Practice / Mastery-proof / Scholar-depth / board-ref specs. Coins, streaks, goals, PATH-time credits, mastery strip. |
| **Teacher Console** | Live Concept Block: "who to support next" insight feed, misconception clusters, block distribution, intervention log with closure. |
| **Learning Map** | Class mastery heatmap, leadership KPIs (mastery velocity, retention pass rate), action list, per-student subject strips. |
| **Curriculum Explorer** | The unit library: subject → grade → unit → concept blocks, every spec column shown verbatim, walkable prerequisite/unlock edges, cross-subject search, and an optional per-student mastery overlay. |
| **School AI Studio** | Campus backbone: coverage by grade × subject (units + hours), content-approval pipeline ("zero unreviewed content reaches a child"), delivery policy by band, campus-wide mastery, and curriculum provenance/sourcing. |

Advance the **simulated day clock** ("Next day →") to watch the 1-3-7 retention
pipeline come due and confirm mastery over time.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit + integration tests (vitest)
npm run build      # type-check + production build -> dist/
```

Regenerate the curriculum graph from the workbook after editing `seed/`:

```bash
npm run import:curriculum
```

## Deploying (Cloudflare Pages)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- SPA routing fallback lives in `public/_redirects`.

No environment variables or database are needed — the graph ships as JSON and
per-session state is stored in the browser via the `CampusStore` port.

## Project structure

```
seed/concept_block.xlsx        # curriculum source of truth
scripts/import-curriculum.mjs  # workbook -> curriculum.json
src/
  domain/        # entities, zod schemas, mastery state machine (§4, §7)
  curriculum/    # graph queries: prereqs, dependents, unlock, working level
  engines/       # mastery · retention · planner · motivation · baseline · tomoe (pure TS)
  store/         # CampusStore port + localStorage adapter (Postgres swaps in here)
  data/          # generated curriculum.json + demo campus
  state/         # AppContext composition root
  ui/            # student · teacher · map · curriculum · school surfaces + design system
tests/           # vitest — state machine, retention, motivation, full-loop integration
docs/            # architecture spec + (future) engine specs / ADRs
```

## Design principles (see `CLAUDE.md` for the enforced invariants)

- **Summation is AI-free.** Tomoe is disabled during proofs and retention scoring.
- **No same-day mastery**, **progress never blocked on retention**, **AND-gate unlocks**.
- **No leaderboards / ranks / public comparison.** Retention failures never punish.
- **Human-in-the-loop.** Displayed content is illustrative; production content flows
  through the Academic Head approval pipeline before any child sees it.

The engines carry no React/DOM dependencies, so they lift into the `packages/*`
monorepo layout (§17) unchanged as the product grows into its services and apps.

---

*Illustrative build of the Tomo School architecture. Curriculum data © its authors;
in-app question content is synthetic and pipeline-pending, not board-approved.*

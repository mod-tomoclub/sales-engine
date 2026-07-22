# CLAUDE.md — Tomo School OS working agreement

Tomo School is an AI-supported, mastery-based learning platform (Bloom's 2-sigma
thesis). This repo is the **working core loop**: the domain model, the engines,
the real curriculum graph imported from the ICSE Concept-Block workbook, and three
runnable surfaces — Student (Tomoe mastery loop), Teacher Console, and Learning Map.

The full product spec is `docs/TOMO_SCHOOL_ARCHITECTURE.md`. **That document is the
single source of truth.** When extending, cite the section you are implementing
(e.g. "§7 mastery state machine") and keep names aligned with it.

## What is built (this milestone)

- **Curriculum importer** (`scripts/import-curriculum.mjs`) → `src/data/curriculum.json`
  (576 units, 2 858 concept blocks, 995 prerequisite edges, 7 subjects, 12 grades,
  7 950 design hours). Build task #1 (§14.1). It also parses the workbook README for
  the **authoritative delivery-code legend** and provenance notes, and computes the
  grade × subject **coverage matrix** (matches the workbook Dashboard exactly).
- **Domain** (`src/domain/`) — entities (§4), the 90% / 1-3-7 **mastery state machine**
  (§7), zod schemas for persisted state.
- **Engines** (`src/engines/`) — mastery/retention orchestrator, retention scheduler
  (1-3-7 + longitudinal), **session planner** mapped to the 60-min SOP (§8),
  **motivation** ledger/streaks/goals (§12), **baseline** seeding (§6), and **Tomoe**
  the rule-based Socratic tutor + curriculum-grounded item bank (§9).
- **Store** (`src/store/`) — `CampusStore` port + `LocalCampusStore` (localStorage).
- **UI** (`src/ui/`) — six surfaces + shared design system:
  Student · Teacher Console · Learning Map · **Curriculum Explorer** · **School AI Studio** ·
  **Math Lab**.
- **Math Lab** (`src/mathlab/`, `src/ui/mathlab/`) — a self-contained prototype of the
  **Adaptive Math Engine brief (v0.2)** on a real CBSE concept slice (Grade 2 → 4).
  It is deliberately *parallel* to the ICSE core loop above, not wired into it:
  its own graph, its own engine, its own state. See "Math Lab" below.

## Architecture → code map

| Spec section | Code |
|---|---|
| §4 domain model | `src/domain/*` |
| §4.1 curriculum graph | `src/domain/curriculum.ts`, `src/curriculum/graph.ts`, importer |
| §6 Baseline Engine | `src/engines/baseline/baseline.ts` |
| §7 Mastery + Retention | `src/domain/mastery.ts` (SM), `src/engines/mastery/retention.ts`, `src/engines/progression.ts` |
| §8 Session Planner | `src/engines/planner/planner.ts` |
| §9 Tomoe | `src/engines/tutor/tomoe.ts` (+ `items.ts`) |
| §12 Motivation | `src/domain/motivation.ts`, `src/engines/motivation/ledger.ts` |
| §13 Learning Map | `src/ui/map/LearningMap.tsx`, `src/ui/selectors.ts` |
| §14.1 Unit library / curriculum map | `src/ui/curriculum/CurriculumExplorer.tsx` |
| §14.2 Content pipeline + approvals | `src/ui/school/SchoolStudio.tsx` |
| §14.5 Teacher insight | `src/ui/teacher/TeacherConsole.tsx` |
| §15 AI Gateway | **port only** — `TutorProvider` in `tomoe.ts`, `ItemProvider` in `items.ts` |

## Non-negotiable invariants (enforce in code + review)

1. **Summation is AI-free.** Tomoe is disabled in `SUMMATION_DUE` and during retention
   scoring (`isAiFreeState`, `Item.aiFree`). Never wire the tutor into those.
2. **No same-day mastery.** A 90% summation yields `PROVISIONAL_MASTERY` only;
   `CONFIRMED_MASTERY` requires D+3 **and** D+7 to pass. (`allConfirmingPassed`.)
3. **Progress is never blocked on retention.** Provisional mastery unlocks dependents
   immediately (`UNLOCK_DEPENDENTS`). Decay never re-locks dependents and never claws
   back coins (§12) — it only pauses the streak multiplier.
4. **AND-gate unlocks.** A unit is unlockable only when *all* prereqs are proven
   (`CurriculumGraph.isUnlockable`).
5. **No leaderboards / ranks / public comparison.** (§12 locked rule.)
6. **"Learning styles" is banned vocabulary.** Use "doorways" (§9). Do not reintroduce it.
7. **Human-in-the-loop.** All child-facing content is pipeline-pending until approved
   (§2, §14.2). The demo labels content as illustrative; do not present it as approved.
8. **Items never cross subjects.** Distractors come from the *same subject*, near
   grades (`GraphItemBank.distractors`). A Mathematics item offering a Social Studies
   option is a bug — `tests/items.test.ts` guards this. Correct answers must be real
   concept blocks / specs taken verbatim from the workbook row.
9. **The legend comes from the workbook, not from us.** `meta.codeLegend` is parsed
   from the README ("Delivery codes" row). Never hardcode a guessed legend in the UI —
   read `graph.meta.codeLegend`. (T=teacher-first, A=AI-doorway-first, M=manipulatives,
   R=adaptive practice ladder, L=lab, N=nature/outdoor, P=project, O=oral,
   U=unplugged, C=computer lab.)

## Math Lab (`src/mathlab/`) — CBSE Grade 4 adaptive prototype

Implements the Adaptive Math Engine brief v0.2 end to end for one child, Aarav Menon
(enrolled Grade 4, operating at Grade 3 in Number and Operations).

| Brief section | Code |
|---|---|
| §1 concept graph, two edge types | `graph.ts` (16 units, Grade 2–4, 7 strands) |
| §2 instruction layer / modalities | `types.ts` `LearningExperience`, content packs |
| §3 attempts log + mastery states | `engine.ts` `Attempt`, `nextMasteryState` |
| §4 rule 1 placement | `engine.ts` `startDiagnostic` / `answerDiagnostic` |
| §4 rule 3 gap remediation | `graph.ts` `deepestUnprovenAncestor`, `buildPlan` |
| §4 rules 4 + 5 (1-3-7, 20-day) | `engine.ts` `scheduleRevisions`, `CHECKPOINTS` |
| §6 content pipeline output | `content/u1…u5*.ts` (five authored units) |

**Curriculum accuracy is the point.** Every unit carries a verbatim NCERT chapter
reference, and question numbers/contexts are lifted from the textbook (Class 3
*Maths Mela* Ch. 3/6/7/8/9/12; Class 4 *Maths Mela* Ch. 4/5/9). Two traps worth
remembering, both verified against the official NCERT PDFs at `ncert.nic.in`:
Class 3 Ch. 10 "Fun at Class Party!" is **measurement/data, not multiplication** —
multiplication is Ch. 7 "Raksha Bandhan"; and Class 4 Ch. 5 "Sharing and Measuring"
is **entirely fractions**, with measurement in a separate Ch. 6. Do not re-derive
chapter mappings from titles.

**Invariants for this module** (guarded by `tests/mathlab.test.ts`):
1. Enrolled grade picks the diagnostic's *entry point* only — never a floor or a ceiling.
2. The gap is the deepest unproven ancestor, not the unit where the failure surfaced.
3. Repair runs as a parallel track at a 60/40 split; grade-level work starts on day one.
4. A 90% mastery check yields `practiced`, never `mastered` — that needs the D+1 pass.
5. Re-teach never repeats the modality that just failed (`reteachModality`).
6. Every distractor carries a *specific* misconception tag; "careless" and "wrong
   answer" are banned strings.

## Swap-in points (keep these seams clean)

- **Persistence**: implement `CampusStore` (`src/store/port.ts`) against Postgres/API.
  Engines and UI depend on the port, not the adapter.
- **AI Gateway**: implement `TutorProvider` / `ItemProvider` against the Anthropic API
  (§15). Same contract; persona/prompts become versioned registry assets.
- **Engines are pure TS** with no React/DOM imports — they lift into `packages/*`
  (§17) unchanged. Keep them that way.

## Conventions

- Engine logic is **pure and unit-tested** (`tests/`, vitest). Add a test when you add
  a transition or a reward rule. UI stays declarative; rules live in `/domain` + `/engines`.
- State is one `CampusState` object; progression ops are `(state) => { state, toasts }`.
- Simulated clock: `state.day` + "Next day →" advances retention. There is no wall clock
  in engine logic (keeps it testable/deterministic).

## Commands

```bash
npm install
npm run import:curriculum   # regenerate src/data/curriculum.json from seed/concept_block.xlsx
npm run dev                 # local dev (Vite)
npm test                    # vitest (engine + integration tests)
npm run build               # tsc -b + vite build -> dist/
```

## Deploy (Cloudflare Pages)

Build command `npm run build`, output directory `dist`. SPA fallback is
`public/_redirects`. No database required — the curriculum graph ships as JSON and
session state lives in the browser store.

## House rules

- Push directly to `main` (no PRs/branches) per the owner's standing preference.
- End commit messages with the Co-Authored-By line for Claude.

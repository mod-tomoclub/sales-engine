/**
 * §4 The adaptive engine — five rules, no ML.
 *
 *   1. Placement      — adaptive diagnostic that walks the prerequisite graph
 *   2. Acceleration   — mastery + Day-1 pass unlocks the successor, grade-blind
 *   3. Gap remediation— walk down to the deepest unproven ancestor, repair in
 *                       a *parallel* track at a 60/40 session split
 *   4. 1-3-7 revision — three scheduled events per mastered unit
 *   5. 20-day window  — deadline + Day-7 / Day-14 pacing checkpoints
 *
 * Everything below is a pure function of an append-only attempt log, exactly as
 * §3 requires — swap in Bayesian Knowledge Tracing later without a schema change.
 */
import { DIAGNOSTIC_BANK, STRAND_ENTRY, type ProbedStrand } from "./diagnostic";
import { deepestUnprovenAncestor, getUnit, prereqsOf, successorsOf, UNITS } from "./graph";
import type { MasteryState, Question, Strand, Track } from "./types";

// ─────────────────────────────── attempt log ──────────────────────────────

/** §3 The append-only source of truth. Everything else is derived from this. */
export interface Attempt {
  questionId: string;
  microConceptId: string;
  unitId: string;
  chosenOptionId: string;
  correct: boolean;
  /** Simulated school-day the attempt happened on. */
  day: number;
  purpose: Question["purpose"];
  /** §2 which experience preceded this attempt — free modality evidence. */
  viaModality?: string;
  misconception?: string;
}

// ───────────────────────────── 1. placement ───────────────────────────────

export interface TraceLine {
  rule: string;
  detail: string;
  tone: "info" | "down" | "up" | "stop";
}

export interface UnitProbe {
  unitId: string;
  correct: number;
  total: number;
}

export interface DiagnosticState {
  /** Strands still to probe, in order. */
  queue: Strand[];
  strand: Strand | null;
  unitId: string | null;
  /** Questions already served for the current unit. */
  servedForUnit: string[];
  probes: Record<string, UnitProbe>;
  attempts: Attempt[];
  trace: TraceLine[];
  /** Per-strand outcome, filled as each strand finishes. */
  frontier: Partial<Record<Strand, StrandResult>>;
  visitedInStrand: number;
  done: boolean;
}

export interface StrandResult {
  strand: Strand;
  /** Deepest unit the child demonstrably holds. */
  provenUnitId: string | null;
  /** Where the engine will start teaching. Null when already at/above grade. */
  gapUnitId: string | null;
  /** The grade the child is actually operating at in this strand. */
  workingGrade: number;
  status: "gap" | "on-track" | "ahead";
}

const QUESTIONS_PER_PROBE = 2;
const MAX_UNITS_PER_STRAND = 3;
/** Below this share on a probe, the engine steps back a prerequisite. */
const PROBE_PASS = 1; // needs both questions right to count the unit proven

export function startDiagnostic(nominalGrade: number): DiagnosticState {
  const queue = Object.keys(STRAND_ENTRY) as ProbedStrand[];
  const s: DiagnosticState = {
    queue,
    strand: null,
    unitId: null,
    servedForUnit: [],
    probes: {},
    attempts: [],
    trace: [
      {
        rule: "placement.start",
        detail: `Starting at the child's nominal grade (Grade ${nominalGrade}). Enrolled grade only chooses the *entry point* — never a ceiling or a floor.`,
        tone: "info",
      },
    ],
    frontier: {},
    visitedInStrand: 0,
    done: false,
  };
  return openStrand(s);
}

function openStrand(s: DiagnosticState): DiagnosticState {
  const next = s.queue[0] as ProbedStrand | undefined;
  if (!next) return { ...s, strand: null, unitId: null, done: true };
  const entry = STRAND_ENTRY[next];
  return {
    ...s,
    strand: next,
    queue: s.queue.slice(1),
    unitId: entry,
    servedForUnit: [],
    visitedInStrand: 1,
    trace: [
      ...s.trace,
      {
        rule: "placement.probe",
        detail: `${labelOf(next)} — probing at ${getUnit(entry).title} (Grade ${getUnit(entry).board.grade}).`,
        tone: "info",
      },
    ],
  };
}

/** The next diagnostic question, or null when placement is complete. */
export function nextDiagnosticQuestion(s: DiagnosticState): Question | null {
  if (s.done || !s.unitId) return null;
  const pool = DIAGNOSTIC_BANK.filter(
    (q) => unitOfQuestion(q) === s.unitId && !s.servedForUnit.includes(q.id),
  );
  return pool[0] ?? null;
}

export function answerDiagnostic(
  s: DiagnosticState,
  q: Question,
  optionId: string,
  day = 1,
): DiagnosticState {
  const correct = optionId === q.answerId;
  const unitId = unitOfQuestion(q);
  const chosen = q.options.find((o) => o.id === optionId);
  const probe = s.probes[unitId] ?? { unitId, correct: 0, total: 0 };

  let next: DiagnosticState = {
    ...s,
    servedForUnit: [...s.servedForUnit, q.id],
    probes: {
      ...s.probes,
      [unitId]: { unitId, correct: probe.correct + (correct ? 1 : 0), total: probe.total + 1 },
    },
    attempts: [
      ...s.attempts,
      {
        questionId: q.id,
        microConceptId: q.microConceptId,
        unitId,
        chosenOptionId: optionId,
        correct,
        day,
        purpose: "diagnostic",
        misconception: chosen?.misconception,
      },
    ],
  };

  const p = next.probes[unitId];
  if (p.total < QUESTIONS_PER_PROBE) return next;
  return resolveProbe(next, unitId);
}

function resolveProbe(s: DiagnosticState, unitId: string): DiagnosticState {
  const p = s.probes[unitId];
  const strand = s.strand!;
  const unit = getUnit(unitId);
  const passed = p.correct > PROBE_PASS - 1 && p.correct === p.total;

  if (passed) {
    // Rule 2 shape: success walks *forward* along the strand.
    const fwd = successorsOf(unitId).filter((id) => getUnit(id).strand === strand);
    const untried = fwd.filter((id) => !s.probes[id]);
    if (untried.length && s.visitedInStrand < MAX_UNITS_PER_STRAND) {
      const target = untried.sort((a, b) => getUnit(a).levelIndex - getUnit(b).levelIndex)[0];
      return {
        ...s,
        unitId: target,
        servedForUnit: [],
        visitedInStrand: s.visitedInStrand + 1,
        trace: [
          ...s.trace,
          {
            rule: "placement.step-forward",
            detail: `${p.correct}/${p.total} on ${unit.title} → proven. Stepping forward to ${getUnit(target).title} (Grade ${getUnit(target).board.grade}).`,
            tone: "up",
          },
        ],
      };
    }
    return closeStrand(s, strand);
  }

  // Failure walks *backwards* along prerequisite edges.
  const back = prereqsOf(unitId)
    .filter((id) => getUnit(id).strand === strand)
    .filter((id) => !s.probes[id]);
  if (back.length && s.visitedInStrand < MAX_UNITS_PER_STRAND) {
    const target = back.sort((a, b) => getUnit(b).levelIndex - getUnit(a).levelIndex)[0];
    return {
      ...s,
      unitId: target,
      servedForUnit: [],
      visitedInStrand: s.visitedInStrand + 1,
      trace: [
        ...s.trace,
        {
          rule: "placement.step-back",
          detail: `${p.correct}/${p.total} on ${unit.title} → not proven. Stepping back along the prerequisite edge to ${getUnit(target).title} (Grade ${getUnit(target).board.grade}).`,
          tone: "down",
        },
      ],
    };
  }

  return closeStrand(s, strand);
}

function probedUnitsInStrand(s: DiagnosticState, strand: Strand, pass: boolean) {
  return Object.values(s.probes)
    .filter((p) => p.total > 0 && (p.correct === p.total) === pass)
    .map((p) => getUnit(p.unitId))
    .filter((u) => u.strand === strand);
}

/**
 * Close out a strand. The frontier is the highest unit *proven*; the gap is
 * found by walking down from the *lowest* unit failed — which is not always the
 * unit the failure surfaced on. That distinction is the whole point of §4.
 */
function closeStrand(s: DiagnosticState, strand: Strand): DiagnosticState {
  const provenUnitId =
    probedUnitsInStrand(s, strand, true).sort((a, b) => b.levelIndex - a.levelIndex)[0]?.id ?? null;
  const failedUnitId =
    probedUnitsInStrand(s, strand, false).sort((a, b) => a.levelIndex - b.levelIndex)[0]?.id ?? null;

  const isProven = (id: string) => {
    const p = s.probes[id];
    if (p && p.total > 0) return p.correct === p.total;
    // Never probed: treat as held only if it sits strictly below a proven unit
    // on the same strand — the diagnostic earned that inference by passing above it.
    const u = getUnit(id);
    const provenSame = probedUnitsInStrand(s, u.strand, true).sort((a, b) => b.levelIndex - a.levelIndex)[0];
    return !!provenSame && u.levelIndex < provenSame.levelIndex;
  };

  const walk: string[] = [];
  const gapUnitId = failedUnitId
    ? deepestUnprovenAncestor(failedUnitId, isProven, walk)
    : null;

  const workingGrade = provenUnitId ? getUnit(provenUnitId).board.grade : 2;
  const status: StrandResult["status"] = gapUnitId
    ? "gap"
    : provenUnitId && getUnit(provenUnitId).board.grade >= 4
      ? "ahead"
      : "on-track";

  const result: StrandResult = { strand, provenUnitId, gapUnitId, workingGrade, status };
  const trace: TraceLine[] = [...s.trace];
  walk.forEach((w) =>
    trace.push({ rule: "gap.walk-down", detail: w, tone: "down" }),
  );
  trace.push({
    rule: "placement.frontier",
    detail: gapUnitId
      ? `${labelOf(strand)} frontier: working at Grade ${workingGrade}. Real gap = ${getUnit(gapUnitId).title}.`
      : `${labelOf(strand)} frontier: ${provenUnitId ? getUnit(provenUnitId).title : "—"} proven, no gap. Ready to move on.`,
    tone: gapUnitId ? "stop" : "up",
  });

  return openStrand({ ...s, frontier: { ...s.frontier, [strand]: result }, trace });
}

function unitOfQuestion(q: Question): string {
  return q.microConceptId.split(".").slice(0, 3).join(".");
}

function labelOf(strand: Strand): string {
  return strand.replace("-", " / ");
}

/** How far through placement we are, for the progress bar. */
export function diagnosticProgress(s: DiagnosticState): number {
  const totalStrands = Object.keys(STRAND_ENTRY).length;
  const doneStrands = Object.keys(s.frontier).length;
  return Math.min(1, doneStrands / totalStrands);
}

// ────────────────────────── 3 + 5. plan building ──────────────────────────

export interface PlanEntry {
  unitId: string;
  track: Track;
  order: number;
  sharePct: number;
  startDay: number;
  deadlineDay: number;
  /** Why the engine put this unit here — shown to teacher and parent. */
  reason: string;
  /** Units this one opens up once proven. */
  unlocks: string[];
}

/** Reading order for strands when the plan needs a tie-break. */
const STRAND_ORDER: Strand[] = ["number", "operations", "mul-div", "fractions", "measurement", "geometry", "data"];

function planSort(a: string, b: string): number {
  const ua = getUnit(a);
  const ub = getUnit(b);
  return (
    ua.board.grade - ub.board.grade ||
    STRAND_ORDER.indexOf(ua.strand) - STRAND_ORDER.indexOf(ub.strand) ||
    ua.levelIndex - ub.levelIndex
  );
}

export const TWENTY_DAY_WINDOW = 20;
/** §4 pacing checkpoints inside the window. */
export const CHECKPOINTS = [
  { day: 7, rule: "~40% of micro-concepts should be at `practiced`" },
  { day: 14, rule: "first mastery-check attempt should have happened" },
];

/**
 * Turn a placement frontier into the study plan. Repair units run as a parallel
 * track alongside grade-level work — never a demotion (§4).
 */
export function buildPlan(frontier: Partial<Record<Strand, StrandResult>>, nominalGrade: number): PlanEntry[] {
  const results = Object.values(frontier) as StrandResult[];

  // A unit counts as held when the diagnostic proved something at or above it on
  // the same strand. Grade is never consulted here.
  const held = (id: string) => {
    const u = getUnit(id);
    return results.some(
      (r) => r.provenUnitId
        && getUnit(r.provenUnitId).strand === u.strand
        && getUnit(r.provenUnitId).levelIndex >= u.levelIndex,
    );
  };

  /** Every unproven ancestor of `id` — the work that must happen before it can. */
  const unprovenClosure = (id: string, acc = new Set<string>()): Set<string> => {
    prereqsOf(id).forEach((p) => {
      if (held(p) || acc.has(p)) return;
      acc.add(p);
      unprovenClosure(p, acc);
    });
    return acc;
  };

  // The distinct gaps the diagnostic located. Two strands often collapse onto the
  // same gap — that is the graph saying the failures share one root cause.
  const gapIds = results.filter((r) => r.gapUnitId).map((r) => r.gapUnitId!);

  // Core track: the on-grade targets this plan aims at, in strands we probed.
  // Capped at two so a plan stays a plan; anything else is surfaced as "next".
  const coreIds = UNITS.filter((u) => u.board.grade === nominalGrade)
    .filter((u) => results.some((r) => r.strand === u.strand))
    .filter((u) => !gapIds.includes(u.id))
    .map((u) => u.id)
    .sort(planSort)
    .slice(0, 2);

  // Repair track = the prerequisite closure of the targets, plus the gaps
  // themselves. Units on the path that are not the gap are `bridge` — reached by
  // the acceleration rule rather than diagnosed, and expected to go faster.
  const repairIds = [
    ...new Set([...gapIds, ...coreIds.flatMap((id) => [...unprovenClosure(id)])]),
  ]
    .filter((id) => !coreIds.includes(id))
    .sort(planSort);

  const entries: PlanEntry[] = [];
  const mk = (unitId: string, track: Track, i: number, spacing: number, reason: string): PlanEntry => ({
    unitId,
    track,
    order: 0,
    sharePct: 0,
    startDay: 1 + i * spacing,
    deadlineDay: 1 + i * spacing + TWENTY_DAY_WINDOW,
    reason,
    unlocks: successorsOf(unitId),
  });

  repairIds.forEach((id, i) => {
    const isGap = gapIds.includes(id);
    const opens = successorsOf(id).filter((s) => coreIds.includes(s));
    const strandsBlocked = results.filter((r) => r.gapUnitId === id).map((r) => r.strand);
    entries.push(
      mk(id, isGap ? "repair" : "bridge", i, 7,
        isGap
          ? `Diagnosed gap. It is what broke ${strandsBlocked.length > 1 ? `${strandsBlocked.length} strands` : "this strand"}${opens.length ? `, and proving it opens ${opens.map((s) => getUnit(s).title).join(" and ")}` : ""}.`
          : `Not diagnosed as the gap — it sits on the path to Grade ${nominalGrade}. Expected to clear quickly once the gap below it is repaired.`),
    );
  });

  coreIds.forEach((id, i) => {
    entries.push(
      mk(id, "core", i, 11,
        `Grade ${nominalGrade} work — runs in parallel from day one, so repairing a gap is never a demotion.`),
    );
  });

  // §4 the 60/40 session split, divided evenly inside each track.
  const repairCount = repairIds.length;
  const coreCount = coreIds.length;
  return entries
    .sort((a, b) => planSort(a.unitId, b.unitId))
    .map((e, i) => ({
      ...e,
      order: i,
      sharePct:
        e.track === "core"
          ? coreCount ? Math.round(60 / coreCount) : 0
          : repairCount ? Math.round(40 / repairCount) : 0,
    }));
}

/** Units the plan deliberately deferred — shown as "unlocks next". */
export function deferredUnits(plan: PlanEntry[], nominalGrade: number): string[] {
  const inPlan = new Set(plan.map((p) => p.unitId));
  return UNITS.filter((u) => u.board.grade === nominalGrade)
    .filter((u) => !inPlan.has(u.id))
    .filter((u) => prereqsOf(u.id).some((p) => inPlan.has(p)))
    .map((u) => u.id);
}

// ─────────────────────────── 4. the 1-3-7 queue ───────────────────────────

export interface RevisionEvent {
  unitId: string;
  stage: 1 | 3 | 7;
  dueDay: number;
  status: "pending" | "passed" | "failed";
}

/** Enqueued the moment a unit is mastered on day D. */
export function scheduleRevisions(unitId: string, masteredOnDay: number): RevisionEvent[] {
  return ([1, 3, 7] as const).map((stage) => ({
    unitId,
    stage,
    dueDay: masteredOnDay + stage,
    status: "pending" as const,
  }));
}

export const REVISION_PASS = 0.7;
export const MASTERY_THRESHOLD = 0.9;

/** §3 Scoring a mastery check. ≥90% and every micro-concept touched must pass. */
export interface CheckResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  /** Micro-concepts that were missed — these drive re-teach in a new modality. */
  weakMicroConceptIds: string[];
  misconceptions: string[];
}

export function scoreCheck(questions: Question[], answers: Record<string, string>): CheckResult {
  let correct = 0;
  const weak: string[] = [];
  const misconceptions: string[] = [];
  questions.forEach((q) => {
    const a = answers[q.id];
    if (a === q.answerId) {
      correct += 1;
    } else {
      if (!weak.includes(q.microConceptId)) weak.push(q.microConceptId);
      const m = q.options.find((o) => o.id === a)?.misconception;
      if (m && !misconceptions.includes(m)) misconceptions.push(m);
    }
  });
  const total = questions.length;
  const score = total ? correct / total : 0;
  return { score, correct, total, passed: score >= MASTERY_THRESHOLD, weakMicroConceptIds: weak, misconceptions };
}

/**
 * §3 mastery is *delayed evidence*: a 90% check makes the concept `practiced`,
 * and only a passed Day-1 revision promotes it to `mastered`. A hot streak in
 * one sitting never counts.
 */
export function nextMasteryState(current: MasteryState, event: "check-pass" | "check-fail" | "revision-pass" | "revision-fail"): MasteryState {
  switch (event) {
    case "check-pass":
      return current === "mastered" ? "mastered" : "practiced";
    case "check-fail":
      return "learning";
    case "revision-pass":
      return current === "practiced" || current === "decayed" ? "mastered" : current;
    case "revision-fail":
      return "decayed";
  }
}

/**
 * §2 Re-teaching never repeats the failed modality. Given the modality the child
 * just failed through, pick the alternate.
 */
export function reteachModality(primary: string, alt: string, failedVia: string | undefined): string {
  if (!failedVia) return primary;
  return failedVia === primary ? alt : primary;
}

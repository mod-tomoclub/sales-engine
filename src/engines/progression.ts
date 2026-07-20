/**
 * Progression orchestrator — the loop the Student App drives (§7 + §12).
 * Pure functions over CampusState: they apply the mastery state-machine
 * transitions, schedule 1-3-7 retention, unlock dependents, and post motivation
 * ledger entries. The UI stays declarative; all rules live here + in /domain.
 */
import type { CurriculumGraph } from "../curriculum/graph";
import type { Student } from "../domain/student";
import type {
  Flag,
  InteractionEvent,
  RetentionCheck,
  StudentUnitState,
} from "../domain/student";
import type { LedgerEntry, Streak } from "../domain/motivation";
import {
  transition,
  type MasteryEffect,
  type UnitState,
} from "../domain/mastery";
import {
  award,
  emptyStreak,
  pauseMultiplier,
  registerMeaningfulAction,
} from "./motivation/ledger";
import {
  allConfirmingPassed,
  markDue,
  scheduleRetention,
  scorePasses,
} from "./mastery/retention";

/** Tunables (would come from band/subject config in production). */
export const PRACTICE_RUNGS = 3;
export const SUMMATION_ITEMS = 10;
export const RETENTION_ITEMS = 5;

export interface CampusState {
  version: number;
  day: number;
  unitStates: Record<string, StudentUnitState>; // key: `${studentId}:${unitId}`
  retentionChecks: RetentionCheck[];
  ledger: LedgerEntry[];
  flags: Flag[];
  streaks: Record<string, Streak>; // key: studentId
  interactions: InteractionEvent[];
}

export interface Toast {
  kind: "coin" | "flag" | "confirm" | "unlock" | "info";
  text: string;
  amount?: number;
}

export interface StepResult {
  state: CampusState;
  toasts: Toast[];
}

let flagSeq = 0;
let evtSeq = 0;
const key = (studentId: string, unitId: string) => `${studentId}:${unitId}`;

export function statesForStudent(state: CampusState, studentId: string): Map<string, UnitState> {
  const m = new Map<string, UnitState>();
  for (const k in state.unitStates) {
    const rec = state.unitStates[k];
    if (rec.studentId === studentId) m.set(rec.unitId, rec.state);
  }
  return m;
}

export function getUnitState(state: CampusState, studentId: string, unitId: string): StudentUnitState {
  return (
    state.unitStates[key(studentId, unitId)] ?? {
      studentId,
      unitId,
      state: "LOCKED",
      nodesExposed: 0,
      ladderRung: 0,
      attempts: 0,
      timeSpentMin: 0,
      provisionalMasteryAt: null,
      confirmedMasteryAt: null,
      decayCount: 0,
      lastSummationScore: null,
    }
  );
}

function putUnit(state: CampusState, rec: StudentUnitState): CampusState {
  return { ...state, unitStates: { ...state.unitStates, [key(rec.studentId, rec.unitId)]: rec } };
}

function record(state: CampusState, e: Omit<InteractionEvent, "id" | "at" | "atDay">): CampusState {
  const evt: InteractionEvent = { ...e, id: `evt-${(evtSeq += 1)}`, at: new Date().toISOString(), atDay: state.day };
  return { ...state, interactions: [...state.interactions, evt] };
}

function ensureStreak(state: CampusState, studentId: string): CampusState {
  if (state.streaks[studentId]) return state;
  return { ...state, streaks: { ...state.streaks, [studentId]: emptyStreak(studentId) } };
}

/** First meaningful action of the day increments the streak and awards its bonus. */
function meaningfulAction(state: CampusState, studentId: string, toasts: Toast[]): CampusState {
  state = ensureStreak(state, studentId);
  const before = state.streaks[studentId];
  const firstToday = before.lastActionDay !== state.day;
  const after = registerMeaningfulAction(before, state.day);
  state = { ...state, streaks: { ...state.streaks, [studentId]: after } };
  if (firstToday) {
    const { ledger, entry } = award(state.ledger, studentId, "daily_streak", state.day, after);
    state = { ...state, ledger };
    toasts.push({ kind: "coin", text: `Day streak ×${after.current}`, amount: entry.delta });
  }
  return state;
}

function raiseFlag(state: CampusState, f: Omit<Flag, "id">): CampusState {
  return { ...state, flags: [...state.flags, { ...f, id: `flag-${(flagSeq += 1)}` }] };
}

/** Re-scan a student's LOCKED units; any whose prereqs are now proven → READY. */
export function recomputeUnlocks(state: CampusState, studentId: string, graph: CurriculumGraph, toasts: Toast[]): CampusState {
  const states = statesForStudent(state, studentId);
  let unlocked = 0;
  for (const u of graph.allUnits) {
    const cur = states.get(u.id) ?? "LOCKED";
    if (cur === "LOCKED" && graph.isUnlockable(u.id, states)) {
      const rec = getUnitState(state, studentId, u.id);
      const t = transition("LOCKED", { type: "PREREQS_MET" });
      if (t) {
        state = putUnit(state, { ...rec, state: t.next });
        states.set(u.id, t.next);
        unlocked++;
      }
    }
  }
  if (unlocked > 0) toasts.push({ kind: "unlock", text: `${unlocked} new unit${unlocked > 1 ? "s" : ""} unlocked` });
  return state;
}

function applyEffects(
  state: CampusState,
  student: Student,
  graph: CurriculumGraph,
  rec: StudentUnitState,
  effects: MasteryEffect[],
  toasts: Toast[],
): { state: CampusState; rec: StudentUnitState } {
  for (const eff of effects) {
    switch (eff.kind) {
      case "SCHEDULE_RETENTION": {
        const checks = scheduleRetention(student.id, rec.unitId, state.day);
        state = { ...state, retentionChecks: [...state.retentionChecks, ...checks] };
        rec = { ...rec, provisionalMasteryAt: new Date().toISOString() };
        break;
      }
      case "UNLOCK_DEPENDENTS": {
        state = putUnit(state, rec);
        state = recomputeUnlocks(state, student.id, graph, toasts);
        break;
      }
      case "AWARD": {
        const reason =
          eff.reason === "SUMMATION_PASS" ? "summation_pass" : eff.reason === "RETENTION_D3" ? "retention_d3" : "retention_d7_confirm";
        const { ledger, entry } = award(state.ledger, student.id, reason, state.day, state.streaks[student.id]);
        state = { ...state, ledger };
        toasts.push({ kind: "coin", text: entry.note, amount: entry.delta });
        break;
      }
      case "MARK_CONFIRMED": {
        rec = { ...rec, confirmedMasteryAt: new Date().toISOString() };
        toasts.push({ kind: "confirm", text: `“${graph.unit(rec.unitId)?.title}” confirmed over time` });
        break;
      }
      case "RAISE_FLAG": {
        const detail = eff.reason === "REPEATED_DECAY" ? "unit decayed twice — review needed" : "summation below 90% — targeted remediation";
        state = raiseFlag(state, {
          studentId: student.id,
          unitId: rec.unitId,
          source: "AI",
          kind: eff.reason === "REPEATED_DECAY" ? "misconception" : "stuck",
          detail,
          status: "open",
          ownerId: null,
          atDay: state.day,
        });
        toasts.push({ kind: "flag", text: detail });
        break;
      }
      case "START_REFRESH_MICROLOOP": {
        rec = { ...rec, decayCount: rec.decayCount + 1 };
        state = { ...state, streaks: { ...state.streaks, [student.id]: pauseMultiplier(ensureStreak(state, student.id).streaks[student.id]) } };
        toasts.push({ kind: "info", text: `Refresh micro-loop queued for “${graph.unit(rec.unitId)?.title}”` });
        break;
      }
    }
  }
  return { state, rec };
}

// ---------------------------------------------------------------------------
// Operations the UI calls
// ---------------------------------------------------------------------------

export function startInstruction(state: CampusState, student: Student, _graph: CurriculumGraph, unitId: string): StepResult {
  const toasts: Toast[] = [];
  let rec = getUnitState(state, student.id, unitId);
  if (rec.state === "LOCKED") {
    const t = transition("LOCKED", { type: "PREREQS_MET" });
    if (t) rec = { ...rec, state: t.next };
  }
  if (rec.state === "READY") {
    const t = transition("READY", { type: "SCHEDULE_INSTRUCTION" });
    if (t) rec = { ...rec, state: t.next };
  }
  state = putUnit(state, rec);
  return { state, toasts };
}

/** Expose a concept node during INSTRUCTION and score its comprehension check. */
export function submitInstructionCheck(
  state: CampusState,
  student: Student,
  graph: CurriculumGraph,
  unitId: string,
  correct: boolean,
): StepResult {
  const toasts: Toast[] = [];
  let rec = getUnitState(state, student.id, unitId);
  const unit = graph.unit(unitId)!;
  rec = { ...rec, nodesExposed: Math.min(rec.nodesExposed + 1, unit.conceptNodes.length), attempts: rec.attempts + 1, timeSpentMin: rec.timeSpentMin + 4 };
  state = record(state, { studentId: student.id, unitId, type: "checkQ", correctness: correct ? 1 : 0, latencyMs: null, hintUsed: false, misconception: null });

  if (correct) {
    const { ledger, entry } = award(state.ledger, student.id, "instruction_check", state.day, state.streaks[student.id]);
    state = { ...state, ledger };
    toasts.push({ kind: "coin", text: entry.note, amount: entry.delta });
  }
  // All nodes exposed -> advance to PRACTICE.
  if (rec.nodesExposed >= unit.conceptNodes.length && rec.state === "INSTRUCTION") {
    const t = transition("INSTRUCTION", { type: "INSTRUCTION_COMPLETE" });
    if (t) {
      rec = { ...rec, state: t.next };
      toasts.push({ kind: "info", text: "Instruction complete — moving to guided practice" });
    }
  }
  state = meaningfulAction(state, student.id, toasts);
  state = putUnit(state, rec);
  return { state, toasts };
}

/** Submit one guided-practice rung; results carry first-try + hint usage per item. */
export function submitPracticeRung(
  state: CampusState,
  student: Student,
  graph: CurriculumGraph,
  unitId: string,
  results: { correct: boolean; firstTry: boolean; hintToTerminal: boolean }[],
): StepResult {
  const toasts: Toast[] = [];
  let rec = getUnitState(state, student.id, unitId);
  const unit = graph.unit(unitId)!;
  let coins = 0;
  for (const r of results) {
    state = record(state, { studentId: student.id, unitId, type: "practiceAttempt", correctness: r.correct ? 1 : 0, latencyMs: null, hintUsed: r.hintToTerminal, misconception: r.correct ? null : "practice-error" });
    // No coins if a hint was used to the terminal step (§12 anti-gaming).
    if (r.correct && r.firstTry && !r.hintToTerminal) {
      const { ledger } = award(state.ledger, student.id, "practice_first_try", state.day, state.streaks[student.id]);
      state = { ...state, ledger };
      coins += 2;
    }
  }
  if (coins) toasts.push({ kind: "coin", text: "Practice (first try)", amount: coins });

  rec = { ...rec, ladderRung: rec.ladderRung + 1, attempts: rec.attempts + results.length, timeSpentMin: rec.timeSpentMin + 8 };
  if (rec.ladderRung >= PRACTICE_RUNGS && rec.state === "PRACTICE") {
    const t = transition("PRACTICE", { type: "PRACTICE_LADDER_MET" });
    if (t) {
      rec = { ...rec, state: t.next };
      toasts.push({ kind: "info", text: `Practice ladder met — summation ready (AI-free, 90% to unlock “${unit.title}”)` });
    }
  }
  state = meaningfulAction(state, student.id, toasts);
  state = putUnit(state, rec);
  return { state, toasts };
}

/** AI-free summation. score in [0,1]; ≥0.9 → provisional mastery. */
export function submitSummation(
  state: CampusState,
  student: Student,
  graph: CurriculumGraph,
  unitId: string,
  score: number,
): StepResult {
  const toasts: Toast[] = [];
  let rec = getUnitState(state, student.id, unitId);
  rec = { ...rec, attempts: rec.attempts + 1, lastSummationScore: score, timeSpentMin: rec.timeSpentMin + 12 };
  state = record(state, { studentId: student.id, unitId, type: "summationAttempt", correctness: score, latencyMs: null, hintUsed: false, misconception: null });

  const t = transition("SUMMATION_DUE", { type: "SUMMATION_SCORED", score });
  if (t) {
    rec = { ...rec, state: t.next };
    if (t.next === "PRACTICE") {
      // Failed: reset one rung so the student re-earns the gate.
      rec = { ...rec, ladderRung: Math.max(0, PRACTICE_RUNGS - 1) };
      toasts.push({ kind: "info", text: `Summation ${(score * 100) | 0}% — below 90%. Targeted remediation, then re-attempt.` });
    }
    const applied = applyEffects(state, student, graph, rec, t.effects, toasts);
    state = applied.state;
    rec = applied.rec;
    if (t.next === "PROVISIONAL_MASTERY") {
      state = meaningfulAction(state, student.id, toasts);
    }
  }
  state = putUnit(state, rec);
  return { state, toasts };
}

/** Score a due retention check (AI-free). */
export function scoreRetentionCheck(
  state: CampusState,
  student: Student,
  graph: CurriculumGraph,
  checkId: string,
  score: number,
): StepResult {
  const toasts: Toast[] = [];
  const check = state.retentionChecks.find((c) => c.id === checkId);
  if (!check) return { state, toasts };
  const passed = scorePasses(score);
  const updated: RetentionCheck = { ...check, status: passed ? "passed" : "failed", score };
  state = { ...state, retentionChecks: state.retentionChecks.map((c) => (c.id === checkId ? updated : c)) };
  state = record(state, { studentId: student.id, unitId: check.unitId, type: "retentionAttempt", correctness: score, latencyMs: null, hintUsed: false, misconception: null });

  let rec = getUnitState(state, student.id, check.unitId);
  const unitChecks = state.retentionChecks.filter((c) => c.unitId === check.unitId && c.studentId === student.id);
  const confirming = allConfirmingPassed(unitChecks);
  const t = transition(rec.state, { type: "RETENTION_SCORED", offset: check.offsetDays, score, allConfirmingPassed: confirming }, { decayCount: rec.decayCount });
  if (t) {
    rec = { ...rec, state: t.next };
    const applied = applyEffects(state, student, graph, rec, t.effects, toasts);
    state = applied.state;
    rec = applied.rec;
  }
  if (passed) state = meaningfulAction(state, student.id, toasts);
  state = putUnit(state, rec);
  return { state, toasts };
}

/** Refresh micro-loop outcome (REFRESH_NEEDED -> CONFIRMED on pass). */
export function submitRefresh(state: CampusState, student: Student, graph: CurriculumGraph, unitId: string, passed: boolean): StepResult {
  const toasts: Toast[] = [];
  let rec = getUnitState(state, student.id, unitId);
  if (passed) {
    const t = transition("REFRESH_NEEDED", { type: "REFRESH_PASSED" });
    if (t) {
      rec = { ...rec, state: t.next };
      const applied = applyEffects(state, student, graph, rec, t.effects, toasts);
      state = applied.state;
      rec = applied.rec;
    }
    state = meaningfulAction(state, student.id, toasts);
  }
  state = putUnit(state, rec);
  return { state, toasts };
}

/** Advance the simulated clock a day; retention checks whose day arrived become due. */
export function advanceDay(state: CampusState): CampusState {
  const day = state.day + 1;
  return { ...state, day, retentionChecks: markDue(state.retentionChecks, day) };
}

export function acknowledgeFlag(state: CampusState, flagId: string, ownerId: string): CampusState {
  return { ...state, flags: state.flags.map((f) => (f.id === flagId ? { ...f, status: "acknowledged", ownerId } : f)) };
}
export function closeFlag(state: CampusState, flagId: string): CampusState {
  return { ...state, flags: state.flags.map((f) => (f.id === flagId ? { ...f, status: "closed" } : f)) };
}

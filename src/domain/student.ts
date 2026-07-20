/**
 * Student Model — the Student AI substrate (TOMO_SCHOOL_ARCHITECTURE §4.2).
 */
import type { RetentionOffset, UnitState } from "./mastery";

export type Band = "PreK2" | "Elem" | "Middle" | "High";

/** Age policy / device policy per band (§3). */
export function bandForGrade(grade: number): Band {
  if (grade <= 2) return "PreK2";
  if (grade <= 5) return "Elem";
  if (grade <= 8) return "Middle";
  return "High";
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  band: Band;
  coachId: string;
  /** PreK-2 = no 1:1 screens; 1:1 devices from Grade 3 (§3). */
  devicePolicy: "low-screen" | "one-to-one";
  languages: string[];
  avatar: string; // emoji, for the demo
}

/** Output of the Baseline Engine (§6). */
export interface BaselineResult {
  subjectKey: string;
  workingLevelUnitId: string | null;
  gapUnitIds: string[];
  confidenceBand: "low" | "medium" | "high";
  administeredAt: string;
}

/** The central progression record — one per (student, unit). */
export interface StudentUnitState {
  studentId: string;
  unitId: string;
  state: UnitState;
  /** Concept nodes exposed so far (INSTRUCTION progress). */
  nodesExposed: number;
  /** Adaptive ladder rung reached in PRACTICE (0..ladderLength). */
  ladderRung: number;
  attempts: number;
  timeSpentMin: number;
  provisionalMasteryAt: string | null;
  confirmedMasteryAt: string | null;
  /** How many times this unit has decayed after being confirmed (§7 flag on 2nd). */
  decayCount: number;
  lastSummationScore: number | null;
}

export type RetentionStatus = "scheduled" | "due" | "passed" | "failed";

/** The 1-3-7 (+ longitudinal) verification pipeline record. */
export interface RetentionCheck {
  id: string;
  studentId: string;
  unitId: string;
  offsetDays: RetentionOffset;
  dueDay: number; // simulated day index (see SimClock)
  status: RetentionStatus;
  score: number | null;
}

export type InteractionType =
  | "instruction"
  | "checkQ"
  | "practiceAttempt"
  | "hintRequest"
  | "reflection"
  | "retentionAttempt"
  | "summationAttempt";

/** Telemetry feeding planner + Learning Map (§4.2). */
export interface InteractionEvent {
  id: string;
  studentId: string;
  unitId: string;
  type: InteractionType;
  correctness: number | null; // 0..1
  latencyMs: number | null;
  hintUsed: boolean;
  misconception: string | null;
  atDay: number;
  at: string;
}

export interface InterestProfile {
  studentId: string;
  interests: string[];
  doorways: string[];
  confidenceSurvey: Record<string, "low" | "medium" | "high">;
  teacherNotes: { strength: string; gap: string; confidence: string };
}

export type FlagKind = "misconception" | "stuck" | "disengaged" | "wellbeing" | "integrity";
export interface Flag {
  id: string;
  studentId: string;
  unitId: string | null;
  source: "AI" | "teacher" | "coach";
  kind: FlagKind;
  detail: string;
  status: "open" | "acknowledged" | "closed";
  ownerId: string | null;
  atDay: number;
}

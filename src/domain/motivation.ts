/**
 * Motivation domain (TOMO_SCHOOL_ARCHITECTURE §12).
 * Bloomy-proven mechanics, Tomo-tuned. Parameters live in config (reviewable).
 */

export type EarnReason =
  | "instruction_check"
  | "practice_first_try"
  | "summation_pass"
  | "retention_d3"
  | "retention_d7_confirm"
  | "daily_streak"
  | "weekly_goal"
  | "path_milestone";

/** Earn defaults (§12 table). Band-tunable — kept in one place for review. */
export const EARN_TABLE: Record<EarnReason, number> = {
  instruction_check: 1,
  practice_first_try: 2,
  summation_pass: 10,
  retention_d3: 3,
  retention_d7_confirm: 5,
  daily_streak: 4,
  weekly_goal: 15,
  path_milestone: 12,
};

export const EARN_LABELS: Record<EarnReason, string> = {
  instruction_check: "Instruction check",
  practice_first_try: "Practice (first try)",
  summation_pass: "Summation passed",
  retention_d3: "D+3 retention held",
  retention_d7_confirm: "D+7 retention — confirmed!",
  daily_streak: "Daily streak",
  weekly_goal: "Weekly goal",
  path_milestone: "PATH milestone",
};

export interface LedgerEntry {
  id: string;
  studentId: string;
  delta: number;
  reason: EarnReason | "spend";
  note: string;
  atDay: number;
}

export interface Streak {
  studentId: string;
  current: number;
  best: number;
  /** Day index of the last meaningful mastery action. */
  lastActionDay: number | null;
  /** Multiplier paused after a retention decay (§12 anti-gaming). */
  multiplierPaused: boolean;
}

export interface DailyGoal {
  key: "instruction" | "practice" | "retention" | "coins";
  label: string;
  target: number;
  progress: number;
}

/** PATH-time credits — the strategic reward (master fast → bank PATH minutes). */
export interface PathTimeCredit {
  studentId: string;
  minutes: number;
  reason: string;
  atDay: number;
}

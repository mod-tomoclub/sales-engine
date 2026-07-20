/**
 * Mastery + Retention state machine (TOMO_SCHOOL_ARCHITECTURE §7).
 *
 * Per (student, unit). The 90% gate yields *provisional* mastery only; a unit is
 * CONFIRMED only after the 1-3-7 retention checks pass. Progress is never blocked
 * on retention — PROVISIONAL_MASTERY unlocks dependents immediately.
 */

export type UnitState =
  | "LOCKED"
  | "READY"
  | "INSTRUCTION"
  | "PRACTICE"
  | "SUMMATION_DUE"
  | "PROVISIONAL_MASTERY"
  | "CONFIRMED_MASTERY"
  | "REFRESH_NEEDED";

export const UNIT_STATE_META: Record<
  UnitState,
  { label: string; color: string; short: string; blurb: string }
> = {
  LOCKED: { label: "Locked", color: "var(--st-locked)", short: "Lk", blurb: "Prerequisites not yet mastered." },
  READY: { label: "Ready", color: "var(--st-ready)", short: "Rd", blurb: "Prereqs met — waiting for the planner to schedule." },
  INSTRUCTION: { label: "Learning", color: "var(--st-progress)", short: "In", blurb: "AI-first exposure of concept nodes in sequence." },
  PRACTICE: { label: "Practising", color: "var(--st-progress)", short: "Pr", blurb: "Adaptive practice ladder toward the summation gate." },
  SUMMATION_DUE: { label: "Summation due", color: "var(--st-progress)", short: "Su", blurb: "AI-free proof at 90% to unlock." },
  PROVISIONAL_MASTERY: { label: "Provisional", color: "var(--st-provisional)", short: "Pv", blurb: "Passed at 90% — confirming with 1-3-7 retention checks." },
  CONFIRMED_MASTERY: { label: "Confirmed", color: "var(--st-confirmed)", short: "Cf", blurb: "Held over time — mastery confirmed." },
  REFRESH_NEEDED: { label: "Refresh", color: "var(--st-refresh)", short: "Rf", blurb: "A retention check slipped — quick micro-loop to re-secure." },
};

/** 1-3-7 (+ longitudinal) retention offsets, in days (§7). */
export const RETENTION_OFFSETS = [1, 3, 7, 21, 60] as const;
export type RetentionOffset = (typeof RETENTION_OFFSETS)[number];

/** D+1 is formative (feeds planner, never blocks). The rest gate confirmation. */
export const FORMATIVE_OFFSETS: readonly RetentionOffset[] = [1];
export const CONFIRMING_OFFSETS: readonly RetentionOffset[] = [3, 7];
export const LONGITUDINAL_OFFSETS: readonly RetentionOffset[] = [21, 60];

/** Default gates (configurable per band/subject, §7). */
export const SUMMATION_GATE = 0.9;
export const RETENTION_GATE = 0.8;

/** Events that drive the state machine. */
export type MasteryEvent =
  | { type: "PREREQS_MET" }
  | { type: "SCHEDULE_INSTRUCTION" }
  | { type: "INSTRUCTION_COMPLETE" }
  | { type: "PRACTICE_LADDER_MET" }
  | { type: "SUMMATION_SCORED"; score: number }
  | { type: "RETENTION_SCORED"; offset: RetentionOffset; score: number; allConfirmingPassed: boolean }
  | { type: "REFRESH_PASSED" };

export interface TransitionResult {
  next: UnitState;
  /** Side-effects the engine must enact (kept declarative for testability). */
  effects: MasteryEffect[];
}

export type MasteryEffect =
  | { kind: "UNLOCK_DEPENDENTS" }
  | { kind: "SCHEDULE_RETENTION" }
  | { kind: "AWARD"; reason: "SUMMATION_PASS" | "RETENTION_D3" | "RETENTION_D7_CONFIRM" }
  | { kind: "RAISE_FLAG"; reason: "REPEATED_DECAY" | "SUMMATION_FAIL" }
  | { kind: "MARK_CONFIRMED" }
  | { kind: "START_REFRESH_MICROLOOP" };

/**
 * Pure transition function. Returns null when the event is not valid for the
 * current state (caller decides whether that's a no-op or an error).
 *
 * `decayCount` lets the caller flag a unit that has now decayed twice (§7).
 */
export function transition(
  state: UnitState,
  event: MasteryEvent,
  ctx: { decayCount?: number } = {},
): TransitionResult | null {
  switch (state) {
    case "LOCKED":
      if (event.type === "PREREQS_MET") return { next: "READY", effects: [] };
      return null;

    case "READY":
      if (event.type === "SCHEDULE_INSTRUCTION") return { next: "INSTRUCTION", effects: [] };
      return null;

    case "INSTRUCTION":
      if (event.type === "INSTRUCTION_COMPLETE") return { next: "PRACTICE", effects: [] };
      return null;

    case "PRACTICE":
      if (event.type === "PRACTICE_LADDER_MET") return { next: "SUMMATION_DUE", effects: [] };
      return null;

    case "SUMMATION_DUE":
      if (event.type === "SUMMATION_SCORED") {
        if (event.score >= SUMMATION_GATE) {
          return {
            next: "PROVISIONAL_MASTERY",
            effects: [
              { kind: "UNLOCK_DEPENDENTS" }, // progress never blocked on retention
              { kind: "SCHEDULE_RETENTION" },
              { kind: "AWARD", reason: "SUMMATION_PASS" },
            ],
          };
        }
        // Fail -> back to practice with targeted remediation.
        return { next: "PRACTICE", effects: [{ kind: "RAISE_FLAG", reason: "SUMMATION_FAIL" }] };
      }
      return null;

    case "PROVISIONAL_MASTERY":
      if (event.type === "RETENTION_SCORED") {
        if (event.score < RETENTION_GATE && !FORMATIVE_OFFSETS.includes(event.offset)) {
          // A gating retention check failed before confirmation.
          return { next: "REFRESH_NEEDED", effects: [{ kind: "START_REFRESH_MICROLOOP" }] };
        }
        if (event.allConfirmingPassed) {
          return {
            next: "CONFIRMED_MASTERY",
            effects: [
              { kind: "MARK_CONFIRMED" },
              { kind: "AWARD", reason: "RETENTION_D7_CONFIRM" },
            ],
          };
        }
        // A confirming check passed but not all are in yet.
        const effects: MasteryEffect[] =
          event.offset === 3 && event.score >= RETENTION_GATE ? [{ kind: "AWARD", reason: "RETENTION_D3" }] : [];
        return { next: "PROVISIONAL_MASTERY", effects };
      }
      return null;

    case "CONFIRMED_MASTERY":
      if (event.type === "RETENTION_SCORED" && event.score < RETENTION_GATE) {
        const effects: MasteryEffect[] = [{ kind: "START_REFRESH_MICROLOOP" }];
        if ((ctx.decayCount ?? 0) >= 1) effects.push({ kind: "RAISE_FLAG", reason: "REPEATED_DECAY" });
        // Dependents are NOT re-locked (§7).
        return { next: "REFRESH_NEEDED", effects };
      }
      return null;

    case "REFRESH_NEEDED":
      if (event.type === "REFRESH_PASSED") return { next: "CONFIRMED_MASTERY", effects: [{ kind: "MARK_CONFIRMED" }] };
      return null;
  }
}

/** States in which Tomoe (AI) assistance is disabled — AI-free proof (§9). */
export function isAiFreeState(state: UnitState): boolean {
  return state === "SUMMATION_DUE";
}

/** A unit counts toward "working level" once it has been at least provisionally proven. */
export function isProven(state: UnitState): boolean {
  return state === "PROVISIONAL_MASTERY" || state === "CONFIRMED_MASTERY" || state === "REFRESH_NEEDED";
}

export const ACTIVE_STATES: readonly UnitState[] = ["INSTRUCTION", "PRACTICE", "SUMMATION_DUE"];

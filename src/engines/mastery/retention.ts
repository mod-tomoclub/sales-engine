/**
 * Retention scheduler (TOMO_SCHOOL_ARCHITECTURE §7).
 * On provisional mastery, schedule 1-3-7 checks (+ longitudinal 21/60). The
 * scheduler snaps offsets to day indices; a real deployment snaps to the
 * student's actual timetable slots for that subject.
 */
import {
  CONFIRMING_OFFSETS,
  RETENTION_GATE,
  type RetentionOffset,
} from "../../domain/mastery";
import { RETENTION_OFFSETS } from "../../domain/mastery";
import type { RetentionCheck } from "../../domain/student";

let seq = 0;
function rcId(studentId: string, unitId: string, offset: number): string {
  seq += 1;
  return `rc-${studentId}-${unitId}-d${offset}-${seq}`;
}

/** Create the 1-3-7 (+ longitudinal) checks for a freshly provisional unit. */
export function scheduleRetention(
  studentId: string,
  unitId: string,
  provisionalDay: number,
): RetentionCheck[] {
  return RETENTION_OFFSETS.map((offset) => ({
    id: rcId(studentId, unitId, offset),
    studentId,
    unitId,
    offsetDays: offset as RetentionOffset,
    dueDay: provisionalDay + offset,
    status: "scheduled" as const,
    score: null,
  }));
}

/** Checks that are due (or overdue) on `day` and not yet resolved. */
export function dueChecks(checks: RetentionCheck[], day: number): RetentionCheck[] {
  return checks.filter(
    (c) => (c.status === "scheduled" || c.status === "due") && c.dueDay <= day,
  );
}

/** Mark scheduled checks whose dueDay has arrived as "due". */
export function markDue(checks: RetentionCheck[], day: number): RetentionCheck[] {
  return checks.map((c) =>
    c.status === "scheduled" && c.dueDay <= day ? { ...c, status: "due" as const } : c,
  );
}

/**
 * Given all checks for a unit after scoring one, decide whether the two
 * *confirming* checks (D+3, D+7) have both passed → unit becomes CONFIRMED.
 */
export function allConfirmingPassed(unitChecks: RetentionCheck[]): boolean {
  return CONFIRMING_OFFSETS.every((offset) =>
    unitChecks.some((c) => c.offsetDays === offset && c.status === "passed"),
  );
}

export function scorePasses(score: number): boolean {
  return score >= RETENTION_GATE;
}

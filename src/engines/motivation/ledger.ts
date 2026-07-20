/**
 * Motivation engine (TOMO_SCHOOL_ARCHITECTURE §12).
 * Currency ledger, streaks, daily goals. Anti-gaming: no coins when a hint was
 * used to the terminal step; retention failures never claw back (never punish)
 * but pause streak multipliers.
 */
import {
  EARN_TABLE,
  EARN_LABELS,
  type DailyGoal,
  type EarnReason,
  type LedgerEntry,
  type Streak,
} from "../../domain/motivation";

let seq = 0;
const id = () => `led-${(seq += 1)}`;

export function balance(ledger: LedgerEntry[], studentId: string): number {
  return ledger.reduce((sum, e) => (e.studentId === studentId ? sum + e.delta : sum), 0);
}

export function award(
  ledger: LedgerEntry[],
  studentId: string,
  reason: EarnReason,
  day: number,
  streak: Streak | undefined,
): { ledger: LedgerEntry[]; entry: LedgerEntry } {
  let amount = EARN_TABLE[reason];
  // Streak multiplier applies to daily_streak bonus only, and is paused after decay.
  if (reason === "daily_streak" && streak && !streak.multiplierPaused) {
    amount += Math.min(streak.current, 5); // escalating, capped
  }
  const entry: LedgerEntry = {
    id: id(),
    studentId,
    delta: amount,
    reason,
    note: EARN_LABELS[reason],
    atDay: day,
  };
  return { ledger: [...ledger, entry], entry };
}

export function spend(
  ledger: LedgerEntry[],
  studentId: string,
  amount: number,
  note: string,
  day: number,
): LedgerEntry[] {
  return [...ledger, { id: id(), studentId, delta: -Math.abs(amount), reason: "spend", note, atDay: day }];
}

/**
 * Streak = "one meaningful mastery action per school day" (§12), not per skill —
 * to avoid gaming. Sickness/holiday freezes are coach-grantable (not modeled here).
 */
export function registerMeaningfulAction(streak: Streak, day: number): Streak {
  if (streak.lastActionDay === day) return streak; // already counted today
  const consecutive = streak.lastActionDay === day - 1 || streak.lastActionDay === null;
  const current = consecutive ? streak.current + 1 : 1;
  return {
    ...streak,
    current,
    best: Math.max(streak.best, current),
    lastActionDay: day,
    multiplierPaused: false, // a fresh action resumes the multiplier
  };
}

/** Retention decay pauses the multiplier but never claws back coins (§12). */
export function pauseMultiplier(streak: Streak): Streak {
  return { ...streak, multiplierPaused: true };
}

export function emptyStreak(studentId: string): Streak {
  return { studentId, current: 0, best: 0, lastActionDay: null, multiplierPaused: false };
}

/** Daily goals, rendered Bloomy-style (§12). Progress computed from the day's telemetry. */
export function dailyGoals(counts: {
  instruction: number;
  practice: number;
  retentionDue: number;
  retentionDone: number;
  coinsToday: number;
}): DailyGoal[] {
  return [
    { key: "instruction", label: "Learn today's concept", target: 1, progress: Math.min(counts.instruction, 1) },
    { key: "practice", label: "Complete practice", target: 1, progress: Math.min(counts.practice, 1) },
    {
      key: "retention",
      label: "Clear due retention checks",
      target: Math.max(counts.retentionDue + counts.retentionDone, 1),
      progress: counts.retentionDone,
    },
    { key: "coins", label: "Earn 20 coins", target: 20, progress: Math.min(counts.coinsToday, 20) },
  ];
}

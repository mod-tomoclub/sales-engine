/**
 * Zod schemas for persisted state (validated on load from the store).
 * Only the entities we serialize need runtime validation; curriculum graph is
 * build-time trusted seed.
 */
import { z } from "zod";

export const UnitStateSchema = z.enum([
  "LOCKED",
  "READY",
  "INSTRUCTION",
  "PRACTICE",
  "SUMMATION_DUE",
  "PROVISIONAL_MASTERY",
  "CONFIRMED_MASTERY",
  "REFRESH_NEEDED",
]);

export const StudentUnitStateSchema = z.object({
  studentId: z.string(),
  unitId: z.string(),
  state: UnitStateSchema,
  nodesExposed: z.number().int().nonnegative(),
  ladderRung: z.number().int().nonnegative(),
  attempts: z.number().int().nonnegative(),
  timeSpentMin: z.number().nonnegative(),
  provisionalMasteryAt: z.string().nullable(),
  confirmedMasteryAt: z.string().nullable(),
  decayCount: z.number().int().nonnegative(),
  lastSummationScore: z.number().nullable(),
});

export const RetentionCheckSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  unitId: z.string(),
  offsetDays: z.union([z.literal(1), z.literal(3), z.literal(7), z.literal(21), z.literal(60)]),
  dueDay: z.number().int(),
  status: z.enum(["scheduled", "due", "passed", "failed"]),
  score: z.number().nullable(),
});

export const LedgerEntrySchema = z.object({
  id: z.string(),
  studentId: z.string(),
  delta: z.number(),
  reason: z.string(),
  note: z.string(),
  atDay: z.number().int(),
});

export const FlagSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  unitId: z.string().nullable(),
  source: z.enum(["AI", "teacher", "coach"]),
  kind: z.enum(["misconception", "stuck", "disengaged", "wellbeing", "integrity"]),
  detail: z.string(),
  status: z.enum(["open", "acknowledged", "closed"]),
  ownerId: z.string().nullable(),
  atDay: z.number().int(),
});

/** The full persisted snapshot for one campus/session. */
export const PersistedStateSchema = z.object({
  version: z.number().int(),
  day: z.number().int(),
  unitStates: z.array(StudentUnitStateSchema),
  retentionChecks: z.array(RetentionCheckSchema),
  ledger: z.array(LedgerEntrySchema),
  flags: z.array(FlagSchema),
  streaks: z.record(
    z.string(),
    z.object({
      studentId: z.string(),
      current: z.number().int(),
      best: z.number().int(),
      lastActionDay: z.number().int().nullable(),
      multiplierPaused: z.boolean(),
    }),
  ),
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;

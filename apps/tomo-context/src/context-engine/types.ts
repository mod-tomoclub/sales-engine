/**
 * Student Context Engine — schema.
 *
 * This file is the contract for everything the system believes about a student.
 * It has no React, no Next, no SQLite and no LLM imports: the context engine is
 * a standalone module, and the UI is a window onto it.
 *
 * The governing idea is that a context is *append-only*. Nothing here is ever
 * mutated in place. Every completed Learn -> Practise -> Check block writes a new
 * ContextSnapshot at version n+1, carrying an explicit ContextChange[] that says
 * what moved and why, in a sentence a teacher could read aloud.
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ *
 * Small vocabularies
 * ------------------------------------------------------------------ */

export const Trend = z.enum(['improving', 'flat', 'declining']);
export type Trend = z.infer<typeof Trend>;

/** Where a piece of evidence came from. */
export const EvidenceSource = z.enum(['diagnostic', 'learn', 'practise', 'check']);
export type EvidenceSource = z.infer<typeof EvidenceSource>;

/**
 * How a student is best let into a new idea. These are *doorways* — routes into
 * a concept chosen from evidence about what has worked — not learning styles,
 * which are not a thing and are banned vocabulary in this codebase.
 */
export const Modality = z.enum(['analogy', 'visual', 'formal', 'worked-example-first']);
export type Modality = z.infer<typeof Modality>;

export const Pace = z.enum(['deliberate', 'steady', 'brisk']);
export type Pace = z.infer<typeof Pace>;

export const HintResponse = z.enum(['independent', 'uses-when-stuck', 'hint-reliant']);
export type HintResponse = z.infer<typeof HintResponse>;

export const Persistence = z.enum(['retries-and-repairs', 'retries-same-way', 'disengages']);
export type Persistence = z.infer<typeof Persistence>;

/**
 * The distinction that makes the whole product work: a wrong answer because the
 * model of the world is wrong is a different event from a wrong answer because
 * 90/3 was computed as 27.
 */
export const ErrorType = z.enum(['conceptual', 'computational', 'careless', 'notational']);
export type ErrorType = z.infer<typeof ErrorType>;

export const DifficultyTier = z.enum(['foundational', 'standard', 'stretch']);
export type DifficultyTier = z.infer<typeof DifficultyTier>;

/* ------------------------------------------------------------------ *
 * Concept mastery
 * ------------------------------------------------------------------ */

export const ConceptMastery = z.object({
  /** A sub-concept id from the concept map, e.g. "c2.s8". */
  concept_id: z.string(),
  /** 0-1. Not a score: the system's confidence that the student holds this idea. */
  confidence: z.number().min(0).max(1),
  /** How many independent observations that confidence rests on. */
  evidence_count: z.number().int().min(0),
  last_seen: z.string(),
  trend: Trend,
  /** Plain English, one line, traceable. Shown on hover in the mastery map. */
  note: z.string().optional(),
});
export type ConceptMastery = z.infer<typeof ConceptMastery>;

/** Visual banding. Derived, never stored, so the thresholds live in one place. */
export type MasteryBand = 'strong' | 'shaky' | 'gap' | 'untouched';

export function bandOf(m: Pick<ConceptMastery, 'confidence' | 'evidence_count'>): MasteryBand {
  if (m.evidence_count === 0) return 'untouched';
  if (m.confidence >= 0.75) return 'strong';
  if (m.confidence >= 0.45) return 'shaky';
  return 'gap';
}

export const BAND_LABEL: Record<MasteryBand, string> = {
  strong: 'Secure',
  shaky: 'Shaky',
  gap: 'Not yet',
  untouched: 'Not yet touched',
};

/* ------------------------------------------------------------------ *
 * Misconceptions
 * ------------------------------------------------------------------ */

export const MisconceptionEvidence = z.object({
  version: z.number().int(),
  source: EvidenceSource,
  /** Which question produced this. */
  item_id: z.string(),
  item_text: z.string(),
  student_answer: z.string(),
  expected_answer: z.string(),
  /** What this exchange showed, in plain English. */
  note: z.string(),
  at: z.string(),
});
export type MisconceptionEvidence = z.infer<typeof MisconceptionEvidence>;

export const MisconceptionStatus = z.enum(['open', 'monitoring', 'resolved']);
export type MisconceptionStatus = z.infer<typeof MisconceptionStatus>;

export const StudentMisconception = z.object({
  /** Concept-map misconception id, e.g. "M-C2-01". */
  id: z.string(),
  name: z.string(),
  /** The wrong model itself, stated as the student would state it. */
  student_model: z.string(),
  concept_ids: z.array(z.string()),
  status: MisconceptionStatus,
  first_seen_version: z.number().int(),
  /**
   * "monitoring" means it did not appear this session but has not been proven
   * gone. "resolved" requires a clean pass on an item that directly probes it.
   */
  resolved_at_version: z.number().int().nullable(),
  resolution_note: z.string().nullable(),
  evidence: z.array(MisconceptionEvidence),
});
export type StudentMisconception = z.infer<typeof StudentMisconception>;

/* ------------------------------------------------------------------ *
 * Learning profile and engagement
 * ------------------------------------------------------------------ */

export const LearningProfile = z.object({
  pace: Pace,
  pace_note: z.string(),
  preferred_modality: Modality,
  modality_note: z.string(),
  /** Ranked; the planner leads with [0] and keeps [1] as the re-teach route. */
  modality_ranking: z.array(Modality),
  response_to_hints: HintResponse,
  hint_note: z.string(),
  persistence_after_error: Persistence,
  persistence_note: z.string(),
  typical_error_type: ErrorType,
  error_note: z.string(),
});
export type LearningProfile = z.infer<typeof LearningProfile>;

export const EngagementSignals = z.object({
  avg_seconds_per_question: z.number().min(0),
  /** hints taken / questions attempted, across practise only. */
  hint_dependency_rate: z.number().min(0).max(1),
  attempts_per_question: z.number().min(0),
  /** Where attention fell away, e.g. "long word problems past 60 s". */
  drop_off_points: z.array(z.string()),
  blocks_completed: z.number().int().min(0),
  total_time_on_task_minutes: z.number().min(0),
});
export type EngagementSignals = z.infer<typeof EngagementSignals>;

/* ------------------------------------------------------------------ *
 * Change log — the part a viewer actually reads
 * ------------------------------------------------------------------ */

export const ChangeKind = z.enum([
  'mastery',
  'misconception-opened',
  'misconception-resolved',
  'misconception-persisted',
  'profile',
  'engagement',
  'prerequisite',
]);
export type ChangeKind = z.infer<typeof ChangeKind>;

export const ContextChange = z.object({
  kind: ChangeKind,
  /** concept id, misconception id, or profile field name. */
  target: z.string(),
  /** Human-readable name of the thing that changed. */
  label: z.string(),
  from: z.union([z.string(), z.number(), z.null()]),
  to: z.union([z.string(), z.number(), z.null()]),
  direction: z.enum(['up', 'down', 'neutral']),
  /**
   * Required, and required to be specific. "Confidence in speed-vs-velocity
   * dropped 0.72 -> 0.41 because Q3 and Q4 confused scalar and vector after two
   * hints" — never "score decreased".
   */
  reason: z.string().min(20),
  /** Item ids that justify this change, so the claim is auditable. */
  evidence_refs: z.array(z.string()),
});
export type ContextChange = z.infer<typeof ContextChange>;

/* ------------------------------------------------------------------ *
 * The snapshot
 * ------------------------------------------------------------------ */

export const SnapshotTrigger = z.enum(['diagnostic', 'classroom-complete', 'seed', 'manual']);
export type SnapshotTrigger = z.infer<typeof SnapshotTrigger>;

export const ContextSnapshot = z.object({
  student_id: z.string(),
  version: z.number().int().min(1),
  created_at: z.string(),
  trigger: SnapshotTrigger,
  /** The classroom whose completion produced this snapshot, if any. */
  source_classroom_id: z.string().nullable(),
  /** One line: "where they are right now". Shown in the student list. */
  summary: z.string(),
  /** A paragraph a teacher could read before walking over to the desk. */
  narrative: z.string(),
  mastery: z.array(ConceptMastery),
  misconceptions: z.array(StudentMisconception),
  profile: LearningProfile,
  engagement: EngagementSignals,
  /** What changed relative to version - 1. Empty for v1. */
  changes: z.array(ContextChange),
});
export type ContextSnapshot = z.infer<typeof ContextSnapshot>;

/* ------------------------------------------------------------------ *
 * Student
 * ------------------------------------------------------------------ */

export const Student = z.object({
  id: z.string(),
  name: z.string(),
  grade: z.number().int(),
  board: z.string(),
  section: z.string(),
  created_at: z.string(),
  last_activity_at: z.string().nullable(),
});
export type Student = z.infer<typeof Student>;

export type StudentWithContext = Student & {
  current_version: number;
  snapshot: ContextSnapshot | null;
};

/* ------------------------------------------------------------------ *
 * Session evidence — the raw material extract_insights consumes
 * ------------------------------------------------------------------ */

export const AnsweredItem = z.object({
  item_id: z.string(),
  source: EvidenceSource,
  prompt: z.string(),
  /** Sub-concept ids this item measures. */
  targets: z.array(z.string()),
  tier: DifficultyTier,
  /** Misconception ids this item was written to hunt. */
  probes: z.array(z.string()).default([]),
  expected_answer: z.string(),
  student_answer: z.string(),
  correct: z.boolean(),
  /** Which distractor they chose, if any, so we can read the wrong model. */
  chosen_option_id: z.string().nullable().default(null),
  /** The diagnosis attached to that distractor. */
  diagnosis: z.string().nullable().default(null),
  hints_used: z.number().int().min(0).default(0),
  attempts: z.number().int().min(1).default(1),
  seconds: z.number().min(0).default(0),
});
export type AnsweredItem = z.infer<typeof AnsweredItem>;

export const SessionEvidence = z.object({
  session_id: z.string(),
  student_id: z.string(),
  classroom_id: z.string(),
  from_version: z.number().int(),
  /** Tutor exchanges, including checkpoint questions and how they were answered. */
  learn: z.array(
    z.object({
      turn: z.number().int(),
      kind: z.enum(['explain', 'checkpoint', 'reroute', 'advance', 'student']),
      text: z.string(),
      targets: z.array(z.string()).default([]),
      student_reply: z.string().nullable().default(null),
      judged_correct: z.boolean().nullable().default(null),
    }),
  ),
  practise: z.array(AnsweredItem),
  check: z.array(AnsweredItem),
  started_at: z.string(),
  completed_at: z.string(),
});
export type SessionEvidence = z.infer<typeof SessionEvidence>;

/* ------------------------------------------------------------------ *
 * Context delta — what extract_insights returns, before it becomes a snapshot
 * ------------------------------------------------------------------ */

export const ContextDelta = z.object({
  summary: z.string(),
  narrative: z.string(),
  mastery_updates: z.array(
    z.object({
      concept_id: z.string(),
      confidence: z.number().min(0).max(1),
      trend: Trend,
      reason: z.string().min(20),
      evidence_refs: z.array(z.string()),
      note: z.string().optional(),
    }),
  ),
  misconceptions_opened: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      student_model: z.string(),
      concept_ids: z.array(z.string()),
      reason: z.string().min(20),
      evidence: z.array(MisconceptionEvidence.omit({ version: true })),
    }),
  ),
  misconceptions_resolved: z.array(
    z.object({ id: z.string(), reason: z.string().min(20), evidence_refs: z.array(z.string()) }),
  ),
  misconceptions_persisted: z.array(
    z.object({ id: z.string(), reason: z.string().min(20), evidence_refs: z.array(z.string()) }),
  ),
  profile_updates: z
    .array(
      z.object({
        field: z.enum([
          'pace',
          'preferred_modality',
          'response_to_hints',
          'persistence_after_error',
          'typical_error_type',
        ]),
        to: z.string(),
        reason: z.string().min(20),
        evidence_refs: z.array(z.string()),
      }),
    )
    .default([]),
  engagement_updates: z
    .object({
      avg_seconds_per_question: z.number().min(0),
      hint_dependency_rate: z.number().min(0).max(1),
      attempts_per_question: z.number().min(0),
      drop_off_points: z.array(z.string()),
    })
    .partial()
    .default({}),
});
export type ContextDelta = z.infer<typeof ContextDelta>;

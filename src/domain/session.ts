/**
 * Session plan types (TOMO_SCHOOL_ARCHITECTURE §8).
 * The planner recomputes the next session after every interaction, shaped to the
 * 60-minute Concept Block SOP.
 */

export type SopSegmentKind =
  | "settle" // 3 min — settle + launch (warm-up retrieval, often a D+1 check)
  | "instruction" // 20 min — mastery-progression block
  | "qtime" // 5 min — Q time / movement reset
  | "practice" // 25 min — guided practice (interleaved + retention)
  | "reflection"; // 7 min — reflection + 1-3-7 scheduling commits

export interface SopSegment {
  kind: SopSegmentKind;
  minutes: number;
  title: string;
  /** Human-readable "what the planner filled it with". */
  detail: string;
  unitId: string | null;
  conceptNodeIds: string[];
  retentionCheckIds: string[];
  /** Set when the planner swaps in remediation and notified the teacher. */
  teacherAlert: string | null;
}

export interface SessionPlan {
  studentId: string;
  subjectKey: string;
  forDay: number;
  generatedAt: string;
  /** The unit this session mainly advances. */
  focusUnitId: string | null;
  segments: SopSegment[];
  /** Planner's mix summary for transparency (§8 policy). */
  mix: { newInstruction: number; retention: number; summation: number };
  notes: string[];
}

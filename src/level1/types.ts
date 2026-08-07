/**
 * Level 1 — Student Context Engine demo (Grade 7 · Force, Motion & Energy · ICSE).
 *
 * Types for one Concept Block run: Learn → Practise → Check → Update.
 * The Update step is the product: typed evidence records, a context model
 * DERIVED from them (always recomputable), and a Session 2 plan where every
 * decision cites the evidence that justifies it.
 *
 * Deliberately parallel vocabulary to the core loop (§7) but scoped to the
 * Level 1 cluster; the two converge when Level 1 subtopics enter the main graph.
 */

/** Understanding states. `mastered` is unreachable inside a single session —
 *  it requires the idea to survive spaced retention (no same-day mastery). */
export type UnderstandingState = "not-seen" | "learning" | "practised" | "mastered";

export type Doorway = "everyday-example" | "diagram-contrast" | "act-it-out" | "thought-experiment";

export type CheckSkill = "recall" | "apply" | "reason" | "transfer" | "boundary";

export type Phase = "learn" | "practise" | "check" | "update";

/** Specific misconception tags. Vague tags ("careless", "wrong answer") are
 *  banned strings — evidence must name the actual faulty idea. */
export interface MisconceptionDef {
  tag: string;
  /** The faulty idea, stated as the student would hold it. */
  belief: string;
}

export type EvidenceRecord =
  | {
      id: string;
      phase: "learn";
      kind: "prediction";
      nodeId: string;
      quality: "secure" | "partial" | "misconception";
      note: string;
    }
  | {
      id: string;
      phase: Phase;
      kind: "misconception";
      tag: string;
      status: "surfaced" | "persisting" | "resolved";
      where: string;
      note: string;
    }
  | {
      id: string;
      phase: "learn";
      kind: "doorway";
      doorway: Doorway;
      worked: boolean;
      note: string;
    }
  | {
      id: string;
      phase: "practise";
      kind: "attempt";
      itemId: string;
      correct: boolean;
      hintsUsed: number;
      tries: number;
      /** Correct on first try with zero hints. */
      independent: boolean;
      note: string;
    }
  | {
      id: string;
      phase: "practise";
      kind: "teacher-flag";
      itemId: string;
      note: string;
    }
  | {
      id: string;
      phase: "check";
      kind: "check-result";
      itemId: string;
      skill: CheckSkill;
      correct: boolean;
      note: string;
    };

/** One concept's derived standing in the context model. */
export interface ConceptStanding {
  conceptId: string;
  title: string;
  state: UnderstandingState;
  /** Evidence ids behind the state. */
  evidence: string[];
}

export interface MisconceptionStanding {
  tag: string;
  belief: string;
  status: "surfaced" | "persisting" | "resolved";
  evidence: string[];
}

export interface DoorwayStanding {
  doorway: Doorway;
  worked: boolean;
  evidence: string[];
}

/** The student's memory after this block — derived, never hand-edited. */
export interface ContextModel {
  student: string;
  concepts: ConceptStanding[];
  misconceptions: MisconceptionStanding[];
  doorways: DoorwayStanding[];
  /** 0 (independent) … 3 (heavy scaffolding). */
  supportLevel: number;
  supportTrend: "down" | "flat" | "up";
  supportEvidence: string[];
  checkSummary: { total: number; correct: number; missedSkills: CheckSkill[]; evidence: string[] };
  teacherFlag: { flagged: boolean; evidence: string[] };
}

/** One Session 2 decision, with the evidence that justifies it. */
export interface PlannedDecision {
  decision: string;
  detail: string;
  because: string[];
}

export interface Session2Plan {
  student: string;
  decisions: PlannedDecision[];
}

/* ---------- content shapes (Subtopic 1 authored content) ---------- */

export interface LearnOption {
  id: string;
  text: string;
  /** Where the dialogue goes next; null ends the Learn phase. */
  next: string | null;
  quality: "secure" | "partial" | "misconception";
  misconceptionTag?: string;
  /** Marks this reply as resolving a previously surfaced misconception. */
  resolves?: string;
  /** Tutor's immediate reaction before the next node's turn. */
  reaction: string;
}

export interface LearnNode {
  id: string;
  /** Doorway this node teaches through — nodes switch doorway, never repeat a failed one. */
  doorway: Doorway;
  tutor: string;
  /** Optional visual/manipulative slot rendered by the UI. */
  visual?: string;
  options: LearnOption[];
}

export interface PractiseOption {
  id: string;
  text: string;
  correct?: boolean;
  misconceptionTag?: string;
}

export interface PractiseItem {
  id: string;
  prompt: string;
  options: PractiseOption[];
  /** Strategy → first step → narrowing. Never the answer. */
  hints: [string, string, string];
}

export interface CheckItem {
  id: string;
  skill: CheckSkill;
  prompt: string;
  options: PractiseOption[];
  /** Independent proof: tutor and hints are disabled for every check item. */
  aiFree: true;
}

export interface ConceptBlockContent {
  conceptId: string;
  title: string;
  subtopic: string;
  boardRef: string;
  misconceptions: MisconceptionDef[];
  learn: { start: string; nodes: LearnNode[] };
  practise: PractiseItem[];
  check: CheckItem[];
}

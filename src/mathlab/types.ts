/**
 * Math Lab — CBSE Grade 4 adaptive prototype.
 *
 * Implements the "Adaptive Math Engine" brief (v0.2) on a real CBSE/NCERT
 * concept slice: §1 knowledge graph, §2 instruction layer, §3 learner model,
 * §4 the five adaptive rules.
 *
 * This module is deliberately self-contained and framework-free — it is pure TS
 * with no React imports, matching the house rule that engines lift into
 * `packages/*` unchanged (CLAUDE.md → Swap-in points).
 */

/** §1 Themes. "Go deeper" means moving along a strand, not across grades. */
export type Strand =
  | "number"
  | "operations"
  | "mul-div"
  | "fractions"
  | "measurement"
  | "geometry"
  | "data";

/** §2 Instruction layer. Every micro-concept ships a primary + one alternate. */
export type Modality =
  | "interactive"
  | "story"
  | "game"
  | "worked-example"
  | "hands-on"
  | "video";

/** §3 Per-(student, micro-concept) mastery state. */
export type MasteryState =
  | "not_started"
  | "learning"
  | "practiced"
  | "mastered"
  | "decayed";

/** §5 `content_items.role`. */
export type ExperienceRole = "explainer" | "guided" | "independent" | "stretch";

/** §5 `questions.purpose`. */
export type QuestionPurpose =
  | "diagnostic"
  | "practice"
  | "mastery"
  | "revision"
  | "exam";

/** §1 board_mappings — one spine, board-specific grade + chapter reference. */
export interface BoardMapping {
  board: "CBSE";
  grade: number;
  /** Verbatim NCERT textbook + chapter reference. */
  chapterRef: string;
}

/** §1 The atom mastery is measured on. */
export interface MicroConcept {
  id: string;
  unitId: string;
  title: string;
  /** The observable learning objective, phrased as the child's "can do". */
  objective: string;
  /** Editorial best-fit modality for this specific concept (§2). */
  primaryModality: Modality;
  altModality: Modality;
}

/** §1 The teachable block — carries the 20-day window and the 1-3-7 plan. */
export interface ConceptUnit {
  id: string;
  title: string;
  strand: Strand;
  /** Position along the strand — the acceleration path is index order. */
  levelIndex: number;
  board: BoardMapping;
  /** The authentic NCERT story context the chapter is built around. */
  context: string;
  microConcepts: MicroConcept[];
}

export type EdgeType = "prerequisite" | "related";
export interface Edge {
  from: string;
  to: string;
  type: EdgeType;
}

/** A question. Distractors carry misconception tags so remediation is targeted. */
export interface Option {
  id: string;
  text: string;
  /** Present on wrong options — names the misconception this answer reveals. */
  misconception?: string;
}

export interface Question {
  id: string;
  microConceptId: string;
  purpose: QuestionPurpose;
  /** 1 = fluency, 2 = application, 3 = reasoning / multi-step. */
  difficulty: 1 | 2 | 3;
  prompt: string;
  /** Optional visual/manipulative rendered above the prompt. */
  visual?: Visual;
  options: Option[];
  answerId: string;
  /** Shown after answering — the *why*, not just the what. */
  explanation: string;
}

/** Small declarative visuals so questions aren't walls of text. */
export type Visual =
  | { kind: "place-value"; thousands?: number; hundreds: number; tens: number; ones: number }
  | { kind: "array"; rows: number; cols: number; emoji: string }
  | { kind: "number-line"; from: number; to: number; step: number; mark?: number }
  | { kind: "fraction-bar"; parts: number; shaded: number }
  | { kind: "column-sum"; top: number; bottom: number; op: "+" | "-" }
  | { kind: "groups"; groups: number; per: number; emoji: string };

/** §2 A learning experience — the instructional material for one micro-concept. */
export interface LearningExperience {
  id: string;
  microConceptId: string;
  role: ExperienceRole;
  modality: Modality;
  isPrimary: boolean;
  title: string;
  /** ~1 line of teacher-facing intent. */
  intent: string;
  /** The actual child-facing instructional content, in ordered beats. */
  beats: Beat[];
  minutes: number;
}

export type Beat =
  | { kind: "say"; text: string }
  | { kind: "visual"; visual: Visual; caption?: string }
  | { kind: "worked"; steps: { line: string; note?: string }[] }
  | { kind: "do"; text: string }
  | { kind: "check"; text: string; answer: string };

/** §4 A guided-practice step: scaffolded, hinted, never scored for mastery. */
export interface GuidedStep {
  id: string;
  microConceptId: string;
  prompt: string;
  visual?: Visual;
  options: Option[];
  answerId: string;
  /** Progressive scaffold, revealed one at a time on request or on error. */
  hints: string[];
  explanation: string;
}

/** The bundle of everything authored for one unit. */
export interface UnitContent {
  unitId: string;
  /** Why this unit is in *this* child's plan. */
  rationale: string;
  /** §4 entry check — 5 questions over the unit's direct prerequisites. */
  entryCheck: Question[];
  experiences: LearningExperience[];
  guided: GuidedStep[];
  /** §3 the ≥90% mastery check. Mixed across all micro-concepts. */
  masteryCheck: Question[];
  /** §4 the 1-3-7 revision quiz — shorter, interleaved with related units. */
  revisionSet: Question[];
}

/** Which track a planned unit sits on (§4 gap remediation = parallel track). */
export type Track = "repair" | "bridge" | "core";

export interface PlannedUnit {
  unitId: string;
  track: Track;
  /** Session-time share, per the 60/40 rule. */
  sharePct: number;
  startDay: number;
  /** start + 20 days (§4 twenty-day window). */
  deadlineDay: number;
  order: number;
}

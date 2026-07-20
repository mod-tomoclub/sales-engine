/**
 * Curriculum Graph domain types (TOMO_SCHOOL_ARCHITECTURE §4.1).
 * These mirror the shape produced by scripts/import-curriculum.mjs.
 */

/** Delivery method codes carried on each unit. */
export type DeliveryCode = "T" | "A" | "M" | "R" | "L" | "N" | "P" | "O" | "U" | "C";

/** Per-subject AI interaction style (PlayBook §4.1). */
export type AiInteractionStyle =
  | "conversational-phonics-reading"
  | "intro-questions-responses"
  | "experiment-simulation"
  | "story-narrative";

/** A granular node a child masters one-by-one inside a unit. */
export interface ConceptNode {
  id: string;
  seq: number;
  title: string;
}

/** The mastery-gated node. "Working level" in a subject = furthest unit proven. */
export interface Unit {
  id: string;
  subjectKey: string;
  grade: number;
  unitNo: number;
  /** PHY/CHE/BIO for streamed subjects (PCB), else null. */
  stream: string | null;
  title: string;
  conceptNodes: ConceptNode[];
  deliveryCodes: DeliveryCode[];
  deliveryNote: string;
  practiceSpec: string;
  /** AI-FREE proof instrument spec (§7, §10). */
  masteryProofSpec: string;
  pathLockCriteria: string;
  scholarDepthSpec: string;
  boardRef: string;
  estHours: number | null;
  prereqRaw: string;
  unlocksRaw: string;
  /** Resolved prerequisite unit ids (union of explicit prereqs + inverse unlocks). */
  prereqUnitIds: string[];
}

export interface Subject {
  key: string;
  name: string;
  aiInteractionStyle: AiInteractionStyle;
  unitCount: number;
  deliveryCodes: DeliveryCode[];
}

export type PrereqEdgeType = "prerequisite" | "unlocks";
export interface PrereqEdge {
  from: string;
  to: string;
  type: PrereqEdgeType;
}

export interface CurriculumGraphData {
  meta: {
    source: string;
    title: string;
    generatedBy: string;
    codeLegend: Record<string, string>;
    counts: { subjects: number; units: number; edges: number };
  };
  subjects: Subject[];
  units: Unit[];
  edges: PrereqEdge[];
}

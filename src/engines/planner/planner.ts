/**
 * Session Planner (TOMO_SCHOOL_ARCHITECTURE §8) — "the next session is planned
 * from every interaction". Produces a SessionPlan shaped to the 60-minute
 * Concept Block SOP. A due summation or at-risk retention check preempts new
 * instruction; a stuck flag swaps in remediation and alerts the teacher console.
 */
import type { CurriculumGraph } from "../../curriculum/graph";
import type { Student } from "../../domain/student";
import type { RetentionCheck, StudentUnitState, Flag } from "../../domain/student";
import type { SessionPlan, SopSegment } from "../../domain/session";
import { ACTIVE_STATES, type UnitState } from "../../domain/mastery";
import { dueChecks } from "../mastery/retention";

export interface PlannerInput {
  graph: CurriculumGraph;
  student: Student;
  subjectKey: string;
  stream: string | null;
  states: Map<string, UnitState>;
  unitStateRecords: Map<string, StudentUnitState>;
  retentionChecks: RetentionCheck[];
  flags: Flag[];
  day: number;
}

function activeUnitId(graph: CurriculumGraph, subjectKey: string, stream: string | null, states: Map<string, UnitState>): string | null {
  const lane = graph.lane(subjectKey, stream);
  const active = lane.find((u) => ACTIVE_STATES.includes(states.get(u.id) ?? "LOCKED"));
  if (active) return active.id;
  const next = graph.nextUnlockable(subjectKey, stream, states)[0];
  return next?.id ?? null;
}

export function planSession(input: PlannerInput): SessionPlan {
  const { graph, student, subjectKey, stream, states, retentionChecks, flags, day } = input;
  const focusUnitId = activeUnitId(graph, subjectKey, stream, states);
  const focus = focusUnitId ? graph.unit(focusUnitId) : undefined;
  const focusState = focusUnitId ? states.get(focusUnitId) : undefined;

  const due = dueChecks(
    retentionChecks.filter((c) => graph.unit(c.unitId)?.subjectKey === subjectKey),
    day,
  );
  const d1 = due.filter((c) => c.offsetDays === 1);
  const gating = due.filter((c) => c.offsetDays === 3 || c.offsetDays === 7);

  const stuckFlag = flags.find(
    (f) => f.status !== "closed" && f.kind === "stuck" && f.unitId === focusUnitId,
  );

  const summationDue = focusState === "SUMMATION_DUE";
  const notes: string[] = [];

  // ----- Segment 1: settle + launch (3 min) -----
  const warm = d1[0];
  const settle: SopSegment = {
    kind: "settle",
    minutes: 3,
    title: "Settle & launch",
    detail: warm
      ? `Today's goal + yesterday's win. Warm-up: 1-item D+1 retrieval on ${graph.unit(warm.unitId)?.title ?? "a recent unit"}.`
      : `Today's goal + yesterday's win. 1-item warm-up retrieval.`,
    unitId: warm?.unitId ?? focusUnitId,
    conceptNodeIds: [],
    retentionCheckIds: warm ? [warm.id] : [],
    teacherAlert: null,
  };

  // ----- Segment 2: mastery-progression (20 min) -----
  const nextNodes = focus ? focus.conceptNodes.slice(0, 2).map((n) => n.id) : [];
  const style = graph.subject(subjectKey)?.aiInteractionStyle ?? "intro-questions-responses";
  const instruction: SopSegment = {
    kind: "instruction",
    minutes: 20,
    title: summationDue ? "Summation prep (proof due)" : stuckFlag ? "Targeted remediation" : "Mastery progression",
    detail: !focus
      ? "No active unit — planner will open the next unlockable unit."
      : summationDue
        ? `Summation is due — proof preempts new instruction. Final consolidation of “${focus.title}”.`
        : stuckFlag
          ? `Swap in remediation for “${focus.title}”: re-explain weak node, ${stuckFlag.detail}.`
          : `Instruction on the next node(s) of “${focus.title}” in ${style} style, through the child's interest doorway.`,
    unitId: focusUnitId,
    conceptNodeIds: summationDue || stuckFlag ? [] : nextNodes,
    retentionCheckIds: [],
    teacherAlert: stuckFlag ? `support ${student.name} — ${stuckFlag.detail}` : null,
  };
  if (stuckFlag) notes.push(`Remediation swapped in for ${student.name}; teacher console notified.`);
  if (summationDue) notes.push("Summation due — new instruction deferred until proof is attempted.");

  // ----- Segment 3: Q time / movement (5 min) -----
  const qtime: SopSegment = {
    kind: "qtime",
    minutes: 5,
    title: "Q time / movement reset",
    detail: "Prompted questions; observation only.",
    unitId: null,
    conceptNodeIds: [],
    retentionCheckIds: [],
    teacherAlert: null,
  };

  // ----- Segment 4: guided practice (25 min) -----
  const practiceDetail = [
    focus ? `Today's nodes of “${focus.title}”` : "Ladder practice",
    gating.length ? `+ due D+3/D+7 retention (${gating.length})` : "",
    student.band === "PreK2" ? "· print pack (low-screen)" : "· individual or competency-matched group",
  ]
    .filter(Boolean)
    .join(" ");
  const practice: SopSegment = {
    kind: "practice",
    minutes: 25,
    title: "Guided practice",
    detail: practiceDetail,
    unitId: focusUnitId,
    conceptNodeIds: nextNodes,
    retentionCheckIds: gating.map((c) => c.id),
    teacherAlert: null,
  };

  // ----- Segment 5: reflection (7 min) -----
  const reflection: SopSegment = {
    kind: "reflection",
    minutes: 7,
    title: "Reflection",
    detail: "Summary + confidence check (feedback ticket) + next-session preview. 1-3-7 scheduling commits here; Learning Map updates.",
    unitId: focusUnitId,
    conceptNodeIds: [],
    retentionCheckIds: [],
    teacherAlert: null,
  };

  // Planning mix (§8 policy: ~60/30/10, preemptions shift it).
  const mix = summationDue
    ? { newInstruction: 20, retention: 30, summation: 50 }
    : gating.length
      ? { newInstruction: 45, retention: 45, summation: 10 }
      : { newInstruction: 60, retention: 30, summation: 10 };

  return {
    studentId: student.id,
    subjectKey,
    forDay: day,
    generatedAt: new Date().toISOString(),
    focusUnitId,
    segments: [settle, instruction, qtime, practice, reflection],
    mix,
    notes,
  };
}

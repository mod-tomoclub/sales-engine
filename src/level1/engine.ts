/**
 * Level 1 Concept Block runtime + Student Context Engine (demo slice).
 *
 * Pure TS, no React. One function per student action; every action appends
 * typed evidence. The context model is DERIVED from the evidence log
 * (deriveContext) and the Session 2 plan is derived from the model
 * (planSession2) — same evidence in, same decisions out, every decision cited.
 *
 * Invariants enforced here (guarded by tests/level1.test.ts):
 *  - Check is AI-free: no tutor, no hints; requestHint is a no-op in check.
 *  - A strong check yields `practised`, never `mastered` (no same-day mastery).
 *  - A failed doorway is never repeated; the tutor switches representation.
 *  - Every misconception tag is specific; "careless"/"wrong answer" are banned.
 *  - Hint 3 + still stuck raises a teacher flag — the tutor never gives answers.
 */
import type {
  CheckItem,
  ConceptBlockContent,
  ContextModel,
  EvidenceRecord,
  LearnNode,
  LearnOption,
  Phase,
  PractiseItem,
  Session2Plan,
} from "./types";

/* ------------------------------------------------------------------ */
/* Tutor provider seam (§15 AI Gateway swap-in point)                  */
/* ------------------------------------------------------------------ */

export interface Level1TutorProvider {
  /** The tutor's utterance for a script node, given what it knows so far. */
  turn(node: LearnNode): string;
  /** Reaction to a chosen option — adapts, corrects, or deepens. */
  react(option: LearnOption): string;
  /** Hint ladder during Practise only. Level 1..3, strategy → step → narrowing. */
  hint(item: PractiseItem, level: number): string;
}

/** Rule-based provider: utterances come from the approved script. The Anthropic
 *  provider implements the same contract with generated turns. */
export class ScriptedTutor implements Level1TutorProvider {
  turn(node: LearnNode): string {
    return node.tutor;
  }
  react(option: LearnOption): string {
    return option.reaction;
  }
  hint(item: PractiseItem, level: number): string {
    return item.hints[Math.max(1, Math.min(3, level)) - 1];
  }
}

/* ------------------------------------------------------------------ */
/* Block runtime state                                                 */
/* ------------------------------------------------------------------ */

export interface ChatLine {
  speaker: "tutor" | "student";
  text: string;
  /** Doorway active when the tutor spoke (drives the UI's representation slot). */
  doorway?: string;
  visual?: string;
}

export interface BlockState {
  student: string;
  content: ConceptBlockContent;
  phase: Phase;
  /** Learn */
  nodeId: string | null;
  transcript: ChatLine[];
  failedDoorways: string[];
  /** Practise */
  pIndex: number;
  pHintsUsed: number;
  pTries: number;
  lastHint: string | null;
  pFeedback: string | null;
  /** Check */
  cIndex: number;
  cAnswered: number;
  /** Evidence log — append-only. */
  evidence: EvidenceRecord[];
  seq: number;
}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

function pushEvidence(s: BlockState, e: DistributiveOmit<EvidenceRecord, "id">): BlockState {
  const id = `E${String(s.seq + 1).padStart(2, "0")}`;
  return { ...s, seq: s.seq + 1, evidence: [...s.evidence, { ...e, id } as EvidenceRecord] };
}

function node(s: BlockState, id: string): LearnNode {
  const n = s.content.learn.nodes.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown learn node ${id}`);
  return n;
}

function belief(content: ConceptBlockContent, tag: string): string {
  return content.misconceptions.find((m) => m.tag === tag)?.belief ?? tag;
}

/* ------------------------------------------------------------------ */
/* Learn                                                               */
/* ------------------------------------------------------------------ */

export function startBlock(student: string, content: ConceptBlockContent, tutor: Level1TutorProvider): BlockState {
  const start = content.learn.nodes.find((n) => n.id === content.learn.start)!;
  return {
    student,
    content,
    phase: "learn",
    nodeId: start.id,
    transcript: [{ speaker: "tutor", text: tutor.turn(start), doorway: start.doorway, visual: start.visual }],
    failedDoorways: [],
    pIndex: 0,
    pHintsUsed: 0,
    pTries: 0,
    lastHint: null,
    pFeedback: null,
    cIndex: 0,
    cAnswered: 0,
    evidence: [],
    seq: 0,
  };
}

export function currentNode(s: BlockState): LearnNode | null {
  return s.phase === "learn" && s.nodeId ? node(s, s.nodeId) : null;
}

/** Student picks a reply in the Learn dialogue. */
export function chooseLearnOption(s: BlockState, optionId: string, tutor: Level1TutorProvider): BlockState {
  if (s.phase !== "learn" || !s.nodeId) return s;
  const n = node(s, s.nodeId);
  const opt = n.options.find((o) => o.id === optionId);
  if (!opt) return s;

  let next: BlockState = {
    ...s,
    transcript: [...s.transcript, { speaker: "student", text: opt.text }],
  };

  // Evidence: the opening node is a prediction; later nodes are reasoning turns.
  if (n.id === s.content.learn.start) {
    next = pushEvidence(next, {
      phase: "learn",
      kind: "prediction",
      nodeId: n.id,
      quality: opt.quality,
      note: `Opening prediction: "${opt.text}"`,
    });
  }
  if (opt.misconceptionTag) {
    const seen = next.evidence.some((e) => e.kind === "misconception" && e.tag === opt.misconceptionTag);
    next = pushEvidence(next, {
      phase: "learn",
      kind: "misconception",
      tag: opt.misconceptionTag,
      status: seen ? "persisting" : "surfaced",
      where: `Learn · ${n.id}`,
      note: belief(s.content, opt.misconceptionTag),
    });
  }
  if (opt.resolves) {
    next = pushEvidence(next, {
      phase: "learn",
      kind: "misconception",
      tag: opt.resolves,
      status: "resolved",
      where: `Learn · ${n.id}`,
      note: `Resolved through the ${n.doorway} doorway`,
    });
    next = pushEvidence(next, {
      phase: "learn",
      kind: "doorway",
      doorway: n.doorway,
      worked: true,
      note: `${n.doorway} unlocked the idea after other framings had not`,
    });
  }
  // A partial answer on a doorway node marks that doorway as not landing —
  // the script (and later the AI tutor) must switch representation, not repeat.
  if (opt.quality === "partial" && !next.failedDoorways.includes(n.doorway)) {
    next = { ...next, failedDoorways: [...next.failedDoorways, n.doorway] };
    next = pushEvidence(next, {
      phase: "learn",
      kind: "doorway",
      doorway: n.doorway,
      worked: false,
      note: `${n.doorway} did not land at ${n.id}; switching representation`,
    });
  }

  next = { ...next, transcript: [...next.transcript, { speaker: "tutor", text: tutor.react(opt) }] };

  if (opt.next === null) {
    return { ...next, phase: "practise", nodeId: null };
  }
  const to = node(s, opt.next);
  return {
    ...next,
    nodeId: to.id,
    transcript: [...next.transcript, { speaker: "tutor", text: tutor.turn(to), doorway: to.doorway, visual: to.visual }],
  };
}

/* ------------------------------------------------------------------ */
/* Practise                                                            */
/* ------------------------------------------------------------------ */

export function currentPractiseItem(s: BlockState): PractiseItem | null {
  return s.phase === "practise" ? (s.content.practise[s.pIndex] ?? null) : null;
}

/** Hints exist ONLY in Practise. In Check this is a hard no-op (AI-free proof). */
export function requestHint(s: BlockState, tutor: Level1TutorProvider): BlockState {
  if (s.phase !== "practise") return s;
  const item = currentPractiseItem(s);
  if (!item || s.pHintsUsed >= 3) return s;
  const level = s.pHintsUsed + 1;
  return { ...s, pHintsUsed: level, lastHint: tutor.hint(item, level) };
}

export function answerPractise(s: BlockState, optionId: string): BlockState {
  if (s.phase !== "practise") return s;
  const item = currentPractiseItem(s);
  if (!item) return s;
  const opt = item.options.find((o) => o.id === optionId);
  if (!opt) return s;

  const tries = s.pTries + 1;
  let next: BlockState = { ...s, pTries: tries };

  if (opt.misconceptionTag) {
    const seen = s.evidence.some((e) => e.kind === "misconception" && e.tag === opt.misconceptionTag);
    next = pushEvidence(next, {
      phase: "practise",
      kind: "misconception",
      tag: opt.misconceptionTag,
      status: seen ? "persisting" : "surfaced",
      where: `Practise · ${item.id}`,
      note: belief(s.content, opt.misconceptionTag),
    });
  }

  if (!opt.correct) {
    // Third failed try with the full hint ladder spent → route to a human.
    if (tries >= 3 && s.pHintsUsed >= 3) {
      next = pushEvidence(next, {
        phase: "practise",
        kind: "teacher-flag",
        itemId: item.id,
        note: `Still stuck on ${item.id} after 3 hints and 3 tries — teacher time is worth more than a fourth hint`,
      });
    }
    return { ...next, pFeedback: "not-yet" };
  }

  next = pushEvidence(next, {
    phase: "practise",
    kind: "attempt",
    itemId: item.id,
    correct: true,
    hintsUsed: s.pHintsUsed,
    tries,
    independent: tries === 1 && s.pHintsUsed === 0,
    note:
      tries === 1 && s.pHintsUsed === 0
        ? `${item.id} solved independently — first try, no hints`
        : `${item.id} solved with ${s.pHintsUsed} hint(s), ${tries} tr${tries === 1 ? "y" : "ies"}`,
  });

  const done = s.pIndex + 1 >= s.content.practise.length;
  return {
    ...next,
    phase: done ? "check" : "practise",
    pIndex: done ? s.pIndex : s.pIndex + 1,
    pHintsUsed: 0,
    pTries: 0,
    lastHint: null,
    pFeedback: done ? null : "correct",
  };
}

/* ------------------------------------------------------------------ */
/* Check (AI-free)                                                     */
/* ------------------------------------------------------------------ */

export function currentCheckItem(s: BlockState): CheckItem | null {
  return s.phase === "check" ? (s.content.check[s.cIndex] ?? null) : null;
}

export function answerCheck(s: BlockState, optionId: string): BlockState {
  if (s.phase !== "check") return s;
  const item = currentCheckItem(s);
  if (!item) return s;
  const opt = item.options.find((o) => o.id === optionId);
  if (!opt) return s;

  let next = pushEvidence(s, {
    phase: "check",
    kind: "check-result",
    itemId: item.id,
    skill: item.skill,
    correct: !!opt.correct,
    note: opt.correct
      ? `${item.id} (${item.skill}) correct, unaided`
      : `${item.id} (${item.skill}) missed`,
  });
  if (!opt.correct && opt.misconceptionTag) {
    next = pushEvidence(next, {
      phase: "check",
      kind: "misconception",
      tag: opt.misconceptionTag,
      status: "persisting",
      where: `Check · ${item.id}`,
      note: `${belief(s.content, opt.misconceptionTag)} — reappeared without support`,
    });
  }

  const done = s.cIndex + 1 >= s.content.check.length;
  return { ...next, phase: done ? "update" : "check", cIndex: done ? s.cIndex : s.cIndex + 1, cAnswered: s.cAnswered + 1 };
}

/* ------------------------------------------------------------------ */
/* Update — the Student Context Engine                                 */
/* ------------------------------------------------------------------ */

export function deriveContext(student: string, content: ConceptBlockContent, evidence: EvidenceRecord[]): ContextModel {
  const ids = (pred: (e: EvidenceRecord) => boolean) => evidence.filter(pred).map((e) => e.id);

  // Misconceptions: last status wins (the log is chronological).
  const tags = [...new Set(evidence.filter((e) => e.kind === "misconception").map((e) => (e as any).tag as string))];
  const misconceptions = tags.map((tag) => {
    const trail = evidence.filter((e) => e.kind === "misconception" && (e as any).tag === tag);
    const last = trail[trail.length - 1] as Extract<EvidenceRecord, { kind: "misconception" }>;
    return { tag, belief: belief(content, tag), status: last.status, evidence: trail.map((e) => e.id) };
  });

  const doorwayNames = [...new Set(evidence.filter((e) => e.kind === "doorway").map((e) => (e as any).doorway as string))];
  const doorways = doorwayNames.map((d) => {
    const trail = evidence.filter((e) => e.kind === "doorway" && (e as any).doorway === d);
    const last = trail[trail.length - 1] as Extract<EvidenceRecord, { kind: "doorway" }>;
    return { doorway: last.doorway, worked: last.worked, evidence: trail.map((e) => e.id) };
  });

  const attempts = evidence.filter((e) => e.kind === "attempt") as Extract<EvidenceRecord, { kind: "attempt" }>[];
  const independent = attempts.filter((a) => a.independent).length;
  // Support: 3 = heavy. Start from 2 ("some help here and there") and read the
  // trajectory off the attempt log — late-session independence pulls it down.
  const half = Math.ceil(attempts.length / 2);
  const lateIndependent = attempts.slice(half).filter((a) => a.independent).length;
  const earlyIndependent = attempts.slice(0, half).filter((a) => a.independent).length;
  const supportLevel = attempts.length === 0 ? 2 : independent === attempts.length ? 0 : independent >= attempts.length / 2 ? 1 : 2;
  const supportTrend = lateIndependent > earlyIndependent ? "down" : lateIndependent < earlyIndependent ? "up" : "flat";

  const checks = evidence.filter((e) => e.kind === "check-result") as Extract<EvidenceRecord, { kind: "check-result" }>[];
  const correct = checks.filter((c) => c.correct).length;
  const missedSkills = checks.filter((c) => !c.correct).map((c) => c.skill);

  // No same-day mastery: a strong unaided check earns `practised` at most.
  const ratio = checks.length ? correct / checks.length : 0;
  const state = checks.length === 0 ? (attempts.length ? "learning" : "not-seen") : ratio >= 0.8 ? "practised" : "learning";

  const flags = evidence.filter((e) => e.kind === "teacher-flag");

  return {
    student,
    concepts: [
      {
        conceptId: content.conceptId,
        title: content.title,
        state,
        evidence: [...ids((e) => e.kind === "check-result"), ...ids((e) => e.kind === "attempt")],
      },
    ],
    misconceptions,
    doorways,
    supportLevel,
    supportTrend,
    supportEvidence: attempts.map((a) => a.id),
    checkSummary: { total: checks.length, correct, missedSkills, evidence: checks.map((c) => c.id) },
    teacherFlag: { flagged: flags.length > 0, evidence: flags.map((f) => f.id) },
  };
}

export function planSession2(model: ContextModel, content: ConceptBlockContent): Session2Plan {
  const decisions: Session2Plan["decisions"] = [];

  const open = model.misconceptions.filter((m) => m.status !== "resolved");
  const resolved = model.misconceptions.filter((m) => m.status === "resolved");

  if (open.length) {
    const m = open[0];
    decisions.push({
      decision: "Open Session 2 with a targeted contrast, not a re-teach",
      detail: `First 5 minutes attack "${m.belief}" (${m.tag}) head-on with a near-miss pair of examples. The rest of the subtopic is NOT repeated.`,
      because: m.evidence,
    });
  }
  for (const m of resolved) {
    decisions.push({
      decision: `Keep "${m.tag}" under watch, not under instruction`,
      detail: `The idea "${m.belief}" was resolved during Learn — Session 2 only re-probes it once, inside practise, to confirm it stayed resolved.`,
      because: m.evidence,
    });
  }

  const worked = model.doorways.filter((d) => d.worked);
  const failed = model.doorways.filter((d) => !d.worked);
  if (worked.length) {
    decisions.push({
      decision: `Introduce new ideas ${worked[0].doorway} first`,
      detail: `${worked.map((d) => d.doorway).join(" and ")} unlocked understanding in Session 1${failed.length ? `; ${failed.map((d) => d.doorway).join(", ")} did not land and won't lead` : ""}.`,
      because: [...worked.flatMap((d) => d.evidence), ...failed.flatMap((d) => d.evidence)],
    });
  }

  decisions.push({
    decision:
      model.supportLevel <= 1 && model.supportTrend !== "up"
        ? "Step scaffolding down one level"
        : model.supportTrend === "up"
          ? "Hold scaffolding steady and shorten the problem steps"
          : "Keep scaffolding at the current level",
    detail:
      model.supportTrend === "down"
        ? "Independence rose through the session — hints stay available but the first step is no longer offered up front."
        : "Support stays matched to the evidence, reviewed again after Session 2.",
    because: model.supportEvidence,
  });

  if (model.checkSummary.missedSkills.length) {
    decisions.push({
      decision: `Schedule a ${model.checkSummary.missedSkills[0]}-style retention question for Day 3`,
      detail: `Check was ${model.checkSummary.correct}/${model.checkSummary.total} unaided, but ${model.checkSummary.missedSkills.join(", ")} needs another pass in a new context. State stays "practised" — mastery waits for retention.`,
      because: model.checkSummary.evidence,
    });
  } else if (model.checkSummary.total > 0) {
    decisions.push({
      decision: "Schedule spaced retention checks (Day 3, Day 7)",
      detail: `Check was ${model.checkSummary.correct}/${model.checkSummary.total} unaided. "${content.title}" is practised — mastery is confirmed only if it survives spaced retention.`,
      because: model.checkSummary.evidence,
    });
  }

  if (model.teacherFlag.flagged) {
    decisions.push({
      decision: "Raise a teacher signal before Session 2",
      detail: "The hint ladder ran out at least once — ten minutes of human attention beats a fourth hint.",
      because: model.teacherFlag.evidence,
    });
  }

  return { student: model.student, decisions };
}

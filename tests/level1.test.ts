/**
 * Level 1 invariants — the Concept Block runtime and the Student Context Engine.
 */
import { describe, expect, it } from "vitest";
import { FORCE_EFFECTS, MEERA_SESSION1 } from "../src/level1/content/force-effects";
import {
  answerCheck,
  answerPractise,
  chooseLearnOption,
  currentCheckItem,
  currentNode,
  currentPractiseItem,
  deriveContext,
  planSession2,
  requestHint,
  ScriptedTutor,
  startBlock,
  type BlockState,
} from "../src/level1/engine";

const tutor = new ScriptedTutor();

function playMeera(): BlockState {
  let s = startBlock("Meera", FORCE_EFFECTS, tutor);
  let guard = 0;
  while (s.phase === "learn" && s.nodeId && guard++ < 30) {
    s = chooseLearnOption(s, MEERA_SESSION1.learn[s.nodeId], tutor);
  }
  while (s.phase === "practise" && guard++ < 60) {
    const item = currentPractiseItem(s)!;
    const script = MEERA_SESSION1.practise[item.id];
    for (let h = 0; h < script.hintsBefore; h++) s = requestHint(s, tutor);
    for (const pick of script.picks) s = answerPractise(s, pick);
  }
  while (s.phase === "check" && guard++ < 30) {
    s = answerCheck(s, MEERA_SESSION1.check[currentCheckItem(s)!.id]);
  }
  return s;
}

describe("content hygiene", () => {
  it("every wrong option carries a specific misconception tag; banned strings never appear", () => {
    const all = [...FORCE_EFFECTS.practise, ...FORCE_EFFECTS.check];
    for (const item of all) {
      for (const opt of item.options) {
        if (!opt.correct) {
          expect(opt.misconceptionTag, `${item.id}:${opt.id} must be tagged`).toBeTruthy();
          expect(FORCE_EFFECTS.misconceptions.map((m) => m.tag)).toContain(opt.misconceptionTag);
        }
      }
    }
    const dump = JSON.stringify(FORCE_EFFECTS).toLowerCase();
    expect(dump).not.toContain("careless");
    expect(dump).not.toContain("wrong answer");
    expect(dump).not.toContain("learning style");
  });

  it("every learn node reached after a failed doorway uses a different doorway", () => {
    // partial options must never point at a node with the same doorway
    for (const n of FORCE_EFFECTS.learn.nodes) {
      for (const o of n.options) {
        if (o.quality === "partial" && o.next) {
          const to = FORCE_EFFECTS.learn.nodes.find((x) => x.id === o.next)!;
          expect(to.doorway, `${n.id}->${o.next} must switch representation`).not.toBe(n.doorway);
        }
      }
    }
  });

  it("check items are all marked AI-free", () => {
    for (const c of FORCE_EFFECTS.check) expect(c.aiFree).toBe(true);
  });
});

describe("block runtime", () => {
  it("hints are unavailable in the check phase (AI-free proof)", () => {
    let s = playMeera();
    expect(s.phase).toBe("update");
    // rewind: build a state sitting in check and try to get a hint
    let t = startBlock("X", FORCE_EFFECTS, tutor);
    while (t.phase === "learn" && t.nodeId) t = chooseLearnOption(t, currentNode(t)!.options[0].id, tutor);
    while (t.phase === "practise") t = answerPractise(t, currentPractiseItem(t)!.options.find((o) => o.correct)!.id);
    expect(t.phase).toBe("check");
    const before = t;
    const after = requestHint(t, tutor);
    expect(after).toBe(before); // no-op, no evidence, no hint text
    expect(after.lastHint).toBeNull();
  });

  it("misconception evidence escalates surfaced → persisting, and resolves only via a resolving turn", () => {
    const s = playMeera();
    const m1 = s.evidence.filter((e) => e.kind === "misconception" && (e as any).tag === "M-FME-01");
    expect((m1[0] as any).status).toBe("surfaced");
    expect((m1[m1.length - 1] as any).status).toBe("resolved");
  });

  it("independence is recorded per attempt: hints and retries break independence", () => {
    const s = playMeera();
    const attempts = s.evidence.filter((e) => e.kind === "attempt") as any[];
    const p1 = attempts.find((a) => a.itemId === "P1");
    const p2 = attempts.find((a) => a.itemId === "P2");
    const p3 = attempts.find((a) => a.itemId === "P3");
    expect(p1.independent).toBe(false); // 1 hint
    expect(p2.independent).toBe(true); // clean
    expect(p3.independent).toBe(false); // wrong first try
  });

  it("teacher flag raises after 3 hints + 3 failed tries", () => {
    let t = startBlock("X", FORCE_EFFECTS, tutor);
    while (t.phase === "learn" && t.nodeId) t = chooseLearnOption(t, currentNode(t)!.options[0].id, tutor);
    const item = currentPractiseItem(t)!;
    const wrong = item.options.find((o) => !o.correct)!.id;
    for (let i = 0; i < 3; i++) t = requestHint(t, tutor);
    for (let i = 0; i < 3; i++) t = answerPractise(t, wrong);
    expect(t.evidence.some((e) => e.kind === "teacher-flag")).toBe(true);
  });
});

describe("student context engine", () => {
  it("a 4/5 unaided check yields practised, never mastered (no same-day mastery)", () => {
    const s = playMeera();
    const model = deriveContext("Meera", FORCE_EFFECTS, s.evidence);
    expect(model.checkSummary.correct).toBe(4);
    expect(model.concepts[0].state).toBe("practised");
  });

  it("even a perfect run cannot be mastered inside one session", () => {
    let t = startBlock("X", FORCE_EFFECTS, tutor);
    while (t.phase === "learn" && t.nodeId) t = chooseLearnOption(t, currentNode(t)!.options[0].id, tutor);
    while (t.phase === "practise") t = answerPractise(t, currentPractiseItem(t)!.options.find((o) => o.correct)!.id);
    while (t.phase === "check") t = answerCheck(t, currentCheckItem(t)!.options.find((o) => o.correct)!.id);
    const model = deriveContext("X", FORCE_EFFECTS, t.evidence);
    expect(model.checkSummary.correct).toBe(FORCE_EFFECTS.check.length);
    expect(model.concepts[0].state).toBe("practised");
  });

  it("deriveContext is pure and replayable: same evidence, same model", () => {
    const s = playMeera();
    const a = deriveContext("Meera", FORCE_EFFECTS, s.evidence);
    const b = deriveContext("Meera", FORCE_EFFECTS, [...s.evidence]);
    expect(b).toEqual(a);
  });

  it("Meera's model: M-FME-02 persists into check, diagram-contrast doorway worked, transfer missed", () => {
    const s = playMeera();
    const model = deriveContext("Meera", FORCE_EFFECTS, s.evidence);
    const m2 = model.misconceptions.find((m) => m.tag === "M-FME-02")!;
    expect(m2.status).toBe("persisting");
    expect(model.doorways.some((d) => d.worked)).toBe(true);
    expect(model.checkSummary.missedSkills).toContain("transfer");
  });

  it("every Session 2 decision cites at least one evidence record that exists", () => {
    const s = playMeera();
    const model = deriveContext("Meera", FORCE_EFFECTS, s.evidence);
    const plan = planSession2(model, FORCE_EFFECTS);
    expect(plan.decisions.length).toBeGreaterThanOrEqual(4);
    const known = new Set(s.evidence.map((e) => e.id));
    for (const d of plan.decisions) {
      expect(d.because.length, d.decision).toBeGreaterThan(0);
      for (const id of d.because) expect(known.has(id), `${d.decision} cites unknown ${id}`).toBe(true);
    }
  });

  it("the persisting misconception drives the Session 2 opener; the resolved one is watch-only", () => {
    const s = playMeera();
    const model = deriveContext("Meera", FORCE_EFFECTS, s.evidence);
    const plan = planSession2(model, FORCE_EFFECTS);
    expect(plan.decisions[0].decision).toMatch(/targeted contrast/i);
    expect(plan.decisions[0].detail).toContain("M-FME-02");
    expect(plan.decisions.some((d) => d.decision.includes("M-FME-01") && d.decision.match(/watch/i))).toBe(true);
  });
});

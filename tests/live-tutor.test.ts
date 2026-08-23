import { describe, expect, it } from "vitest";
import {
  evidenceFromTurn,
  failedDoorways,
  MOTION_SPEED_TIME,
  tutorMessages,
  tutorSystemPrompt,
  TutorTurnSchema,
  type TutorRequest,
  type TutorTurn,
} from "../src/level1/live-tutor";
import type { EvidenceRecord } from "../src/level1/types";

const turn = (over: Partial<TutorTurn>): TutorTurn => ({
  say: "What happens next?",
  tactic: "predict",
  doorway: "everyday-example",
  goalsMet: [],
  evidence: [],
  visual: null,
  learnComplete: false,
  ...over,
});

const req = (over: Partial<TutorRequest>): TutorRequest => ({
  student: { name: "Meera", grade: 7 },
  brief: MOTION_SPEED_TIME,
  transcript: [],
  evidenceSoFar: [],
  goalsMet: [],
  visual: null,
  ...over,
});

describe("live tutor · evidence mapping", () => {
  it("records the opening prediction once only", () => {
    const t = turn({ evidence: [{ kind: "prediction", quality: "misconception", note: "Said the bus is faster because it is ahead" }] });
    const first = evidenceFromTurn(t, MOTION_SPEED_TIME, [], 0);
    expect(first.records).toHaveLength(1);
    expect(first.records[0]).toMatchObject({ id: "E01", kind: "prediction", quality: "misconception" });
    const second = evidenceFromTurn(t, MOTION_SPEED_TIME, first.records, first.seq);
    expect(second.records).toHaveLength(0);
  });

  it("drops unknown misconception tags and vague notes", () => {
    const t = turn({
      evidence: [
        { kind: "misconception", tag: "M-XYZ-99", status: "surfaced", note: "made up tag" },
        { kind: "misconception", tag: "M-MST-01", status: "surfaced", note: "a careless slip" },
        { kind: "misconception", tag: "M-MST-01", status: "surfaced", note: "Picked the bus as faster only because it was in front" },
      ],
    });
    const { records } = evidenceFromTurn(t, MOTION_SPEED_TIME, [], 0);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ kind: "misconception", tag: "M-MST-01", status: "surfaced" });
  });

  it("a tag cannot persist or resolve before it has surfaced", () => {
    const t = turn({ evidence: [{ kind: "misconception", tag: "M-MST-03", status: "resolved", note: "Read slope correctly" }] });
    const { records } = evidenceFromTurn(t, MOTION_SPEED_TIME, [], 0);
    expect(records[0]).toMatchObject({ status: "surfaced" });
  });

  it("failed doorways are tracked and cleared when the doorway later works", () => {
    const ev: EvidenceRecord[] = [
      { id: "E01", phase: "learn", kind: "doorway", doorway: "everyday-example", worked: false, note: "x" },
      { id: "E02", phase: "learn", kind: "doorway", doorway: "diagram-contrast", worked: false, note: "y" },
      { id: "E03", phase: "learn", kind: "doorway", doorway: "diagram-contrast", worked: true, note: "z" },
    ];
    expect(failedDoorways(ev)).toEqual(["everyday-example"]);
  });
});

describe("live tutor · prompt contract", () => {
  it("system prompt carries goals, knowledge and exact tags, and bans grading", () => {
    const p = tutorSystemPrompt(MOTION_SPEED_TIME);
    for (const g of MOTION_SPEED_TIME.goals) expect(p).toContain(g.id);
    for (const m of MOTION_SPEED_TIME.misconceptions) expect(p).toContain(m.tag);
    expect(p).toMatch(/not allowed to give a quiz, a score, or a grade/);
    expect(p).not.toMatch(/learning style/i);
  });

  it("messages start with a user turn, end with a user turn, and name failed doorways", () => {
    const msgs = tutorMessages(
      req({
        transcript: [
          { speaker: "tutor", text: "Bus or cycle — which is faster?" },
          { speaker: "student", text: "The bus, it is ahead", via: "voice" },
          { speaker: "tutor", text: "Watch this race." },
        ],
        evidenceSoFar: [{ id: "E01", phase: "learn", kind: "doorway", doorway: "act-it-out", worked: false, note: "n" }],
      }),
    );
    expect(msgs[0].role).toBe("user");
    expect(msgs[msgs.length - 1].role).toBe("user");
    expect(msgs[0].content).toContain("Failed doorways (do not repeat): act-it-out");
  });

  it("the turn schema rejects unknown tactics", () => {
    expect(TutorTurnSchema.safeParse(turn({ tactic: "lecture" as any })).success).toBe(false);
    expect(TutorTurnSchema.safeParse(turn({})).success).toBe(true);
  });
});

describe("live tutor · tag folded into prediction", () => {
  it("records both the prediction and the misconception", () => {
    const t = turn({ evidence: [{ kind: "prediction", quality: "misconception", tag: "M-MST-01", status: "surfaced", note: "Said the cyclist is faster because he is ahead" }] });
    const { records } = evidenceFromTurn(t, MOTION_SPEED_TIME, [], 0);
    expect(records.map((r) => r.kind)).toEqual(["prediction", "misconception"]);
  });
});

describe("live tutor · opening turn", () => {
  it("produces no evidence before the student has spoken", () => {
    const t = turn({ evidence: [{ kind: "doorway", doorway: "everyday-example", worked: true, note: "Opened with a bus example" }] });
    expect(evidenceFromTurn(t, MOTION_SPEED_TIME, [], 0, false).records).toHaveLength(0);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import curriculum from "../src/data/curriculum.json";
import { CurriculumGraph } from "../src/curriculum/graph";
import type { CurriculumGraphData } from "../src/domain/curriculum";
import { bandForGrade, type Student } from "../src/domain/student";
import { seedBaseline } from "../src/engines/baseline/baseline";
import {
  advanceDay,
  getUnitState,
  scoreRetentionCheck,
  startInstruction,
  submitInstructionCheck,
  submitPracticeRung,
  submitSummation,
  statesForStudent,
  PRACTICE_RUNGS,
  type CampusState,
} from "../src/engines/progression";
import { dueChecks } from "../src/engines/mastery/retention";

let graph: CurriculumGraph;
const student: Student = {
  id: "t1",
  name: "Test Kid",
  grade: 3,
  band: bandForGrade(3),
  coachId: "c1",
  devicePolicy: "one-to-one",
  languages: ["en"],
  avatar: "🧪",
};

function freshState(): CampusState {
  const { states } = seedBaseline(graph, student, {
    // confirmed through Math G3 U1 → G3 U2 should be READY
    confirmedThrough: { "math:": "math-g3-u1" },
  });
  const unitStates: CampusState["unitStates"] = {};
  for (const s of states) unitStates[`${s.studentId}:${s.unitId}`] = s;
  return { version: 1, day: 0, unitStates, retentionChecks: [], ledger: [], flags: [], streaks: {}, interactions: [] };
}

beforeAll(() => {
  graph = new CurriculumGraph(curriculum as unknown as CurriculumGraphData);
});

describe("full concept-block loop (integration)", () => {
  it("baseline makes the next unit READY and prior units CONFIRMED", () => {
    const s = freshState();
    expect(getUnitState(s, "t1", "math-g3-u1").state).toBe("CONFIRMED_MASTERY");
    expect(getUnitState(s, "t1", "math-g3-u2").state).toBe("READY");
  });

  it("drives a unit to PROVISIONAL and confirms it via 1-3-7", () => {
    let s = freshState();
    const unitId = "math-g3-u2";
    const unit = graph.unit(unitId)!;

    // Instruction: expose every concept node with a correct check.
    s = startInstruction(s, student, graph, unitId).state;
    expect(getUnitState(s, "t1", unitId).state).toBe("INSTRUCTION");
    for (let i = 0; i < unit.conceptNodes.length; i++) {
      s = submitInstructionCheck(s, student, graph, unitId, true).state;
    }
    expect(getUnitState(s, "t1", unitId).state).toBe("PRACTICE");

    // Practice: clear the ladder rungs.
    for (let r = 0; r < PRACTICE_RUNGS; r++) {
      s = submitPracticeRung(s, student, graph, unitId, [
        { correct: true, firstTry: true, hintToTerminal: false },
        { correct: true, firstTry: true, hintToTerminal: false },
      ]).state;
    }
    expect(getUnitState(s, "t1", unitId).state).toBe("SUMMATION_DUE");

    // Summation ≥90% → PROVISIONAL (never confirmed same day).
    s = submitSummation(s, student, graph, unitId, 1.0).state;
    expect(getUnitState(s, "t1", unitId).state).toBe("PROVISIONAL_MASTERY");
    expect(s.retentionChecks.filter((c) => c.unitId === unitId)).toHaveLength(5);

    // Unlock is an AND-gate over ALL prereqs: math-g4-u2 needs math-g3-u2 AND
    // math-g4-u1, so it must NOT unlock from this one pass alone (§7).
    const states = statesForStudent(s, "t1");
    expect(graph.dependents(unitId).map((d) => d.id)).toContain("math-g4-u2");
    expect(states.get("math-g4-u2") ?? "LOCKED").toBe("LOCKED");
    expect(graph.isUnlockable("math-g4-u2", states)).toBe(false);

    // Advance to D+3 and D+7, pass both → CONFIRMED.
    s = advanceDay(s); // day1
    s = advanceDay(s); // day2
    s = advanceDay(s); // day3
    let due = dueChecks(s.retentionChecks.filter((c) => c.unitId === unitId), s.day);
    const d3 = due.find((c) => c.offsetDays === 3)!;
    s = scoreRetentionCheck(s, student, graph, d3.id, 1.0).state;
    expect(getUnitState(s, "t1", unitId).state).toBe("PROVISIONAL_MASTERY"); // not yet — D+7 pending

    for (let d = 3; d < 7; d++) s = advanceDay(s);
    due = dueChecks(s.retentionChecks.filter((c) => c.unitId === unitId), s.day);
    const d7 = due.find((c) => c.offsetDays === 7)!;
    s = scoreRetentionCheck(s, student, graph, d7.id, 1.0).state;
    expect(getUnitState(s, "t1", unitId).state).toBe("CONFIRMED_MASTERY");
    expect(getUnitState(s, "t1", unitId).confirmedMasteryAt).not.toBeNull();
  });

  it("summation below 90% keeps the unit out of mastery (no same-day pass)", () => {
    let s = freshState();
    const unitId = "math-g3-u2";
    const unit = graph.unit(unitId)!;
    s = startInstruction(s, student, graph, unitId).state;
    for (let i = 0; i < unit.conceptNodes.length; i++) s = submitInstructionCheck(s, student, graph, unitId, true).state;
    for (let r = 0; r < PRACTICE_RUNGS; r++) s = submitPracticeRung(s, student, graph, unitId, [{ correct: true, firstTry: true, hintToTerminal: false }]).state;
    s = submitSummation(s, student, graph, unitId, 0.8).state;
    expect(getUnitState(s, "t1", unitId).state).toBe("PRACTICE");
    expect(s.flags.some((f) => f.unitId === unitId)).toBe(true);
  });

  it("a gating retention failure drops a provisional unit to REFRESH_NEEDED", () => {
    let s = freshState();
    const unitId = "math-g3-u2";
    const unit = graph.unit(unitId)!;
    s = startInstruction(s, student, graph, unitId).state;
    for (let i = 0; i < unit.conceptNodes.length; i++) s = submitInstructionCheck(s, student, graph, unitId, true).state;
    for (let r = 0; r < PRACTICE_RUNGS; r++) s = submitPracticeRung(s, student, graph, unitId, [{ correct: true, firstTry: true, hintToTerminal: false }]).state;
    s = submitSummation(s, student, graph, unitId, 1.0).state;
    for (let d = 0; d < 3; d++) s = advanceDay(s);
    const d3 = dueChecks(s.retentionChecks.filter((c) => c.unitId === unitId), s.day).find((c) => c.offsetDays === 3)!;
    s = scoreRetentionCheck(s, student, graph, d3.id, 0.5).state; // fail
    expect(getUnitState(s, "t1", unitId).state).toBe("REFRESH_NEEDED");
    expect(s.streaks["t1"].multiplierPaused).toBe(true);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import curriculum from "../src/data/curriculum.json";
import { CurriculumGraph } from "../src/curriculum/graph";
import type { CurriculumGraphData } from "../src/domain/curriculum";
import { GraphItemBank } from "../src/engines/tutor/items";

let graph: CurriculumGraph;
let bank: GraphItemBank;

beforeAll(() => {
  graph = new CurriculumGraph(curriculum as unknown as CurriculumGraphData);
  bank = new GraphItemBank(graph);
});

/** Every concept-block title that exists in a given subject. */
function titlesForSubject(key: string): Set<string> {
  const s = new Set<string>();
  for (const u of graph.unitsForSubject(key)) for (const n of u.conceptNodes) s.add(n.title);
  return s;
}

describe("item bank is grounded in the curriculum map", () => {
  it("NEVER offers an option from another subject (the Gandhi-in-Maths bug)", () => {
    // Sample broadly across subjects and grades.
    const sampled = graph.allUnits.filter((_, i) => i % 7 === 0);
    expect(sampled.length).toBeGreaterThan(40);

    for (const unit of sampled) {
      const ownSubjectTitles = titlesForSubject(unit.subjectKey);
      const items = bank.build(unit, "practice", 4, "t");
      for (const item of items) {
        // "belongs"/"sequence" items offer concept blocks; those must all be
        // from this unit's own subject.
        if (item.form !== "belongs" && item.form !== "sequence") continue;
        for (const choice of item.choices) {
          expect(
            ownSubjectTitles.has(choice),
            `"${choice}" is not a ${unit.subjectKey} concept block (unit ${unit.id})`,
          ).toBe(true);
        }
      }
    }
  });

  it("the correct answer is always real curriculum content", () => {
    const unit = graph.unit("math-g4-u4")!;
    const items = bank.build(unit, "practice", 6, "x");
    const ownTitles = unit.conceptNodes.map((n) => n.title);
    for (const item of items) {
      const correct = item.choices[item.correctIndex];
      if (item.form === "belongs" || item.form === "sequence") {
        expect(ownTitles).toContain(correct);
      } else if (item.form === "proof") {
        expect(correct).toBe(unit.masteryProofSpec);
      } else if (item.form === "prereq") {
        expect(graph.prereqs(unit.id).map((p) => p.title)).toContain(correct);
      }
    }
  });

  it("sequence items follow the workbook's concept-block ordering", () => {
    const unit = graph.unit("math-g3-u2")!;
    const items = bank.build(unit, "summation", 10, "seq").filter((i) => i.form === "sequence");
    expect(items.length).toBeGreaterThan(0);
    const titles = unit.conceptNodes.map((n) => n.title);
    for (const item of items) {
      const m = item.prompt.match(/straight after “(.+?)”\?/);
      expect(m).not.toBeNull();
      const afterIdx = titles.indexOf(m![1]);
      expect(afterIdx).toBeGreaterThanOrEqual(0);
      expect(item.choices[item.correctIndex]).toBe(titles[afterIdx + 1]);
    }
  });

  it("produces distinct, well-formed items with 4 options and a rationale", () => {
    const unit = graph.unit("science-g5-u1") ?? graph.unitsForSubject("science")[8];
    const items = bank.build(unit, "summation", 10, "s");
    expect(items.length).toBeGreaterThan(4);
    for (const item of items) {
      expect(item.choices.length).toBe(4);
      expect(new Set(item.choices).size).toBe(4); // no duplicate options
      expect(item.correctIndex).toBeGreaterThanOrEqual(0);
      expect(item.rationale.length).toBeGreaterThan(10);
    }
  });

  it("marks summation and retention items AI-free", () => {
    const unit = graph.unit("math-g4-u4")!;
    expect(bank.build(unit, "summation", 3, "a").every((i) => i.aiFree)).toBe(true);
    expect(bank.build(unit, "retention", 3, "b").every((i) => i.aiFree)).toBe(true);
    expect(bank.build(unit, "practice", 3, "c").every((i) => !i.aiFree)).toBe(true);
  });
});

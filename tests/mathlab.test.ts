import { describe, expect, it } from "vitest";
import { UNIT_CONTENT } from "../src/mathlab/content";
import { AARAV_RESPONSES, DIAGNOSTIC_BANK, STRAND_ENTRY } from "../src/mathlab/diagnostic";
import {
  answerDiagnostic,
  buildPlan,
  deferredUnits,
  MASTERY_THRESHOLD,
  nextDiagnosticQuestion,
  nextMasteryState,
  reteachModality,
  scheduleRevisions,
  scoreCheck,
  startDiagnostic,
  TWENTY_DAY_WINDOW,
  type DiagnosticState,
  type StrandResult,
} from "../src/mathlab/engine";
import { allMicros, EDGES, getUnit, prereqsOf, UNITS } from "../src/mathlab/graph";
import type { Question } from "../src/mathlab/types";

const GRADE = 4;

function replayAarav(): DiagnosticState {
  let s = startDiagnostic(GRADE);
  for (let guard = 0; guard < 80; guard += 1) {
    const q = nextDiagnosticQuestion(s);
    if (!q) break;
    const answer = AARAV_RESPONSES[q.id];
    expect(answer, `no recorded answer for ${q.id}`).toBeDefined();
    s = answerDiagnostic(s, q, answer);
  }
  return s;
}

// ───────────────────────────── graph integrity ────────────────────────────

describe("curriculum graph", () => {
  it("has no dangling edges", () => {
    const ids = new Set(UNITS.map((u) => u.id));
    EDGES.forEach((e) => {
      expect(ids.has(e.from), `edge from unknown unit ${e.from}`).toBe(true);
      expect(ids.has(e.to), `edge to unknown unit ${e.to}`).toBe(true);
    });
  });

  it("has no prerequisite cycles", () => {
    const seen = new Set<string>();
    const stack = new Set<string>();
    const walk = (id: string) => {
      if (stack.has(id)) throw new Error(`cycle through ${id}`);
      if (seen.has(id)) return;
      seen.add(id);
      stack.add(id);
      prereqsOf(id).forEach(walk);
      stack.delete(id);
    };
    expect(() => UNITS.forEach((u) => walk(u.id))).not.toThrow();
  });

  it("never makes a lower grade depend on a higher one", () => {
    EDGES.filter((e) => e.type === "prerequisite").forEach((e) => {
      expect(
        getUnit(e.from).board.grade,
        `${e.from} (G${getUnit(e.from).board.grade}) should not gate ${e.to} (G${getUnit(e.to).board.grade})`,
      ).toBeLessThanOrEqual(getUnit(e.to).board.grade);
    });
  });

  it("gives every micro-concept a distinct primary and alternate modality", () => {
    allMicros().forEach((m) => {
      expect(m.primaryModality, m.id).not.toBe(m.altModality);
    });
  });
});

// ───────────────────────────── rule 1: placement ──────────────────────────

describe("placement", () => {
  it("probes every strand and terminates", () => {
    const s = replayAarav();
    expect(s.done).toBe(true);
    expect(Object.keys(s.frontier).sort()).toEqual(Object.keys(STRAND_ENTRY).sort());
  });

  it("starts each strand at the nominal-grade node, not at the bottom", () => {
    const s = startDiagnostic(GRADE);
    expect(s.unitId).toBe(STRAND_ENTRY.number);
  });

  it("steps back along a prerequisite edge on failure", () => {
    const s = replayAarav();
    const back = s.trace.filter((t) => t.rule === "placement.step-back");
    expect(back.length).toBeGreaterThan(0);
  });

  it("finds Aarav's frontier below his enrolled grade in number and operations", () => {
    const s = replayAarav();
    const f = s.frontier as Record<string, StrandResult>;
    expect(f.number.workingGrade).toBeLessThan(GRADE);
    expect(f.operations.workingGrade).toBeLessThan(GRADE);
    expect(f.fractions.provenUnitId).toBe("g3.frac.fair-share");
  });
});

// ──────────────────────── rule 3: the gap is the root ─────────────────────

describe("gap remediation", () => {
  it("collapses four strand failures onto two root causes", () => {
    const s = replayAarav();
    const gaps = new Set(
      (Object.values(s.frontier) as StrandResult[]).map((r) => r.gapUnitId).filter(Boolean),
    );
    expect([...gaps].sort()).toEqual(["g3.mul.raksha", "g3.num.hundreds"]);
  });

  it("blames a unit whose own prerequisites are all proven", () => {
    const s = replayAarav();
    (Object.values(s.frontier) as StrandResult[]).forEach((r) => {
      if (!r.gapUnitId) return;
      const unprovenPrereqs = prereqsOf(r.gapUnitId).filter((p) => {
        const probe = s.probes[p];
        return probe && probe.correct !== probe.total;
      });
      expect(unprovenPrereqs, `${r.gapUnitId} still has an unproven prerequisite`).toEqual([]);
    });
  });

  it("does not blame the unit where the failure surfaced", () => {
    const s = replayAarav();
    const f = s.frontier as Record<string, StrandResult>;
    // Fractions failed at the Grade 4 unit, but the cause is a Grade 3 multiplication gap.
    expect(f.fractions.gapUnitId).toBe("g3.mul.raksha");
    expect(getUnit(f.fractions.gapUnitId!).board.grade).toBe(3);
  });
});

// ──────────────────────── rules 3 + 5: the study plan ─────────────────────

describe("study plan", () => {
  const plan = buildPlan(replayAarav().frontier, GRADE);

  it("is five units, gaps first, grade-level work in parallel", () => {
    expect(plan.map((p) => p.unitId)).toEqual([
      "g3.num.hundreds",
      "g3.ops.give-take",
      "g3.mul.raksha",
      "g4.num.thousands",
      "g4.mul.equal-groups",
    ]);
  });

  it("marks diagnosed gaps as repair and path units as bridge", () => {
    const track = Object.fromEntries(plan.map((p) => [p.unitId, p.track]));
    expect(track["g3.num.hundreds"]).toBe("repair");
    expect(track["g3.mul.raksha"]).toBe("repair");
    expect(track["g3.ops.give-take"]).toBe("bridge");
    expect(track["g4.num.thousands"]).toBe("core");
  });

  it("splits session time about 60 / 40 towards grade-level work", () => {
    const core = plan.filter((p) => p.track === "core").reduce((a, p) => a + p.sharePct, 0);
    const repair = plan.filter((p) => p.track !== "core").reduce((a, p) => a + p.sharePct, 0);
    expect(core).toBe(60);
    expect(repair).toBeGreaterThanOrEqual(39);
    expect(core).toBeGreaterThan(repair);
  });

  it("starts grade-level work on day one — repair is never a demotion", () => {
    const firstCore = plan.find((p) => p.track === "core")!;
    expect(firstCore.startDay).toBe(1);
  });

  it("gives every unit a 20-day window", () => {
    plan.forEach((p) => expect(p.deadlineDay - p.startDay).toBe(TWENTY_DAY_WINDOW));
  });

  it("defers grade-4 units that are gated behind another planned unit", () => {
    const deferred = deferredUnits(plan, GRADE);
    expect(deferred).toContain("g4.frac.sharing");
    expect(plan.map((p) => p.unitId)).not.toContain("g4.frac.sharing");
  });
});

// ──────────────────────── rules 2 + 4: mastery and 1-3-7 ──────────────────

describe("mastery rule", () => {
  const qs: Question[] = UNIT_CONTENT["g3.num.hundreds"].masteryCheck;

  it("passes only at or above 90%", () => {
    const allRight = Object.fromEntries(qs.map((q) => [q.id, q.answerId]));
    expect(scoreCheck(qs, allRight).passed).toBe(true);

    const oneWrong = { ...allRight };
    const victim = qs[0];
    oneWrong[victim.id] = victim.options.find((o) => o.id !== victim.answerId)!.id;
    const r = scoreCheck(qs, oneWrong);
    expect(r.score).toBeGreaterThanOrEqual(MASTERY_THRESHOLD - 0.001);
    expect(r.weakMicroConceptIds).toEqual([victim.microConceptId]);

    const twoWrong = { ...oneWrong };
    twoWrong[qs[1].id] = qs[1].options.find((o) => o.id !== qs[1].answerId)!.id;
    expect(scoreCheck(qs, twoWrong).passed).toBe(false);
  });

  it("records the misconception behind a wrong answer", () => {
    const answers = Object.fromEntries(qs.map((q) => [q.id, q.answerId]));
    const victim = qs.find((q) => q.options.some((o) => o.id !== q.answerId && o.misconception))!;
    const bad = victim.options.find((o) => o.id !== victim.answerId && o.misconception)!;
    answers[victim.id] = bad.id;
    expect(scoreCheck(qs, answers).misconceptions).toContain(bad.misconception);
  });

  it("never awards mastery from a single sitting", () => {
    expect(nextMasteryState("learning", "check-pass")).toBe("practiced");
    expect(nextMasteryState("practiced", "revision-pass")).toBe("mastered");
    expect(nextMasteryState("practiced", "revision-fail")).toBe("decayed");
    expect(nextMasteryState("mastered", "revision-fail")).toBe("decayed");
  });

  it("enqueues D+1, D+3 and D+7 on mastery", () => {
    const events = scheduleRevisions("g3.num.hundreds", 10);
    expect(events.map((e) => e.dueDay)).toEqual([11, 13, 17]);
    expect(events.every((e) => e.status === "pending")).toBe(true);
  });

  it("never re-teaches through the modality that just failed", () => {
    expect(reteachModality("game", "worked-example", "game")).toBe("worked-example");
    expect(reteachModality("game", "worked-example", "worked-example")).toBe("game");
  });
});

// ────────────────────────── content integrity ─────────────────────────────

const PLANNED = [
  "g3.num.hundreds",
  "g3.ops.give-take",
  "g3.mul.raksha",
  "g4.num.thousands",
  "g4.mul.equal-groups",
];

describe("authored unit content", () => {
  const microIds = new Set(allMicros().map((m) => m.id));

  it("exists for every planned unit", () => {
    PLANNED.forEach((id) => expect(UNIT_CONTENT[id], `missing content for ${id}`).toBeDefined());
  });

  PLANNED.forEach((unitId) => {
    describe(unitId, () => {
      const c = UNIT_CONTENT[unitId];
      const unit = getUnit(unitId);
      const items = () => [...c.entryCheck, ...c.masteryCheck, ...c.revisionSet];

      it("has the required counts", () => {
        expect(c.entryCheck).toHaveLength(5);
        expect(c.masteryCheck).toHaveLength(10);
        expect(c.revisionSet).toHaveLength(5);
        expect(c.guided.length).toBeGreaterThanOrEqual(3);
      });

      it("teaches every micro-concept, with at least one alternate doorway", () => {
        const taught = new Set(c.experiences.filter((x) => x.isPrimary).map((x) => x.microConceptId));
        unit.microConcepts.forEach((m) => expect(taught.has(m.id), `${m.id} untaught`).toBe(true));
        expect(c.experiences.some((x) => !x.isPrimary)).toBe(true);
      });

      it("gives every experience real instructional beats", () => {
        c.experiences.forEach((x) => {
          expect(x.beats.length, x.id).toBeGreaterThanOrEqual(4);
          expect(x.minutes, x.id).toBeGreaterThan(0);
          expect(x.intent.length, x.id).toBeGreaterThan(10);
        });
      });

      it("references only real micro-concepts", () => {
        [...items(), ...c.guided, ...c.experiences].forEach((x) => {
          expect(microIds.has(x.microConceptId), `${x.id} → unknown micro ${x.microConceptId}`).toBe(true);
        });
      });

      it("checks mastery only on this unit's own micro-concepts", () => {
        const own = new Set(unit.microConcepts.map((m) => m.id));
        c.masteryCheck.forEach((q) => {
          expect(own.has(q.microConceptId), `${q.id} tests outside the unit`).toBe(true);
        });
      });

      it("draws the entry check from prerequisite units only", () => {
        const prereqMicros = new Set(prereqsOf(unitId).flatMap((p) => getUnit(p).microConcepts.map((m) => m.id)));
        c.entryCheck.forEach((q) => {
          expect(prereqMicros.has(q.microConceptId), `${q.id} is not a prerequisite check`).toBe(true);
        });
      });

      it("interleaves revision with material from outside the unit", () => {
        const own = new Set(unit.microConcepts.map((m) => m.id));
        expect(c.revisionSet.some((q) => !own.has(q.microConceptId))).toBe(true);
      });

      it("has a resolvable answer and unique ids on every item", () => {
        const all = [...items(), ...c.guided];
        const ids = all.map((x) => x.id);
        expect(new Set(ids).size, "duplicate item id").toBe(ids.length);
        all.forEach((x) => {
          expect(x.options.length, x.id).toBeGreaterThanOrEqual(3);
          expect(x.options.map((o) => o.id), x.id).toContain(x.answerId);
          expect(new Set(x.options.map((o) => o.text)).size, `${x.id} has duplicate options`).toBe(x.options.length);
        });
      });

      it("tags every distractor with a specific misconception", () => {
        [...items(), ...c.guided].forEach((x) => {
          x.options
            .filter((o) => o.id !== x.answerId)
            .forEach((o) => {
              expect(o.misconception, `${x.id} option ${o.id} untagged`).toBeTruthy();
              expect(o.misconception!.length, `${x.id} option ${o.id} tag too vague`).toBeGreaterThan(12);
              expect(o.misconception!.toLowerCase()).not.toMatch(/careless|wrong answer|guess(ed|ing)?\b/);
            });
        });
      });

      it("scaffolds guided practice with progressive hints", () => {
        c.guided.forEach((g) => {
          expect(g.hints.length, g.id).toBeGreaterThanOrEqual(2);
          g.hints.forEach((h) => expect(h.length, `${g.id} hint too thin`).toBeGreaterThan(15));
        });
      });

      it("explains every item", () => {
        [...items(), ...c.guided].forEach((x) => {
          expect(x.explanation.length, `${x.id} explanation too thin`).toBeGreaterThan(20);
        });
      });
    });
  });
});

describe("diagnostic bank", () => {
  const microIds = new Set(allMicros().map((m) => m.id));

  it("references only real micro-concepts", () => {
    DIAGNOSTIC_BANK.forEach((q) => expect(microIds.has(q.microConceptId), q.id).toBe(true));
  });

  it("carries exactly two questions for every unit it can reach", () => {
    const byUnit = new Map<string, number>();
    DIAGNOSTIC_BANK.forEach((q) => {
      const unitId = q.microConceptId.split(".").slice(0, 3).join(".");
      byUnit.set(unitId, (byUnit.get(unitId) ?? 0) + 1);
    });
    byUnit.forEach((n, unitId) => expect(n, unitId).toBe(2));
  });

  it("has a recorded answer for every question", () => {
    DIAGNOSTIC_BANK.forEach((q) => {
      expect(AARAV_RESPONSES[q.id], `${q.id} has no recorded answer`).toBeDefined();
      expect(q.options.map((o) => o.id)).toContain(AARAV_RESPONSES[q.id]);
    });
  });
});

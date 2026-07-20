import { describe, it, expect } from "vitest";
import {
  transition,
  isAiFreeState,
  isProven,
  SUMMATION_GATE,
  RETENTION_GATE,
} from "../src/domain/mastery";

describe("mastery state machine (§7)", () => {
  it("LOCKED → READY only on PREREQS_MET", () => {
    expect(transition("LOCKED", { type: "PREREQS_MET" })?.next).toBe("READY");
    expect(transition("LOCKED", { type: "SCHEDULE_INSTRUCTION" })).toBeNull();
  });

  it("walks READY → INSTRUCTION → PRACTICE → SUMMATION_DUE", () => {
    expect(transition("READY", { type: "SCHEDULE_INSTRUCTION" })?.next).toBe("INSTRUCTION");
    expect(transition("INSTRUCTION", { type: "INSTRUCTION_COMPLETE" })?.next).toBe("PRACTICE");
    expect(transition("PRACTICE", { type: "PRACTICE_LADDER_MET" })?.next).toBe("SUMMATION_DUE");
  });

  it("summation ≥90% yields PROVISIONAL and unlocks dependents + schedules retention", () => {
    const t = transition("SUMMATION_DUE", { type: "SUMMATION_SCORED", score: SUMMATION_GATE });
    expect(t?.next).toBe("PROVISIONAL_MASTERY");
    const kinds = t!.effects.map((e) => e.kind);
    expect(kinds).toContain("UNLOCK_DEPENDENTS");
    expect(kinds).toContain("SCHEDULE_RETENTION");
    expect(kinds).toContain("AWARD");
  });

  it("summation <90% returns to PRACTICE with a flag (never same-day mastery)", () => {
    const t = transition("SUMMATION_DUE", { type: "SUMMATION_SCORED", score: 0.89 });
    expect(t?.next).toBe("PRACTICE");
    expect(t!.effects.some((e) => e.kind === "RAISE_FLAG")).toBe(true);
  });

  it("provisional does NOT confirm until both D+3 and D+7 pass", () => {
    // D+3 passes but not all confirming in yet
    const d3 = transition("PROVISIONAL_MASTERY", {
      type: "RETENTION_SCORED",
      offset: 3,
      score: 0.85,
      allConfirmingPassed: false,
    });
    expect(d3?.next).toBe("PROVISIONAL_MASTERY");
    expect(d3!.effects.some((e) => e.kind === "AWARD")).toBe(true);

    // D+7 passes and both confirming now in → CONFIRMED
    const d7 = transition("PROVISIONAL_MASTERY", {
      type: "RETENTION_SCORED",
      offset: 7,
      score: 0.9,
      allConfirmingPassed: true,
    });
    expect(d7?.next).toBe("CONFIRMED_MASTERY");
    expect(d7!.effects.some((e) => e.kind === "MARK_CONFIRMED")).toBe(true);
  });

  it("a gating retention failure sends provisional → REFRESH_NEEDED", () => {
    const t = transition("PROVISIONAL_MASTERY", {
      type: "RETENTION_SCORED",
      offset: 3,
      score: RETENTION_GATE - 0.01,
      allConfirmingPassed: false,
    });
    expect(t?.next).toBe("REFRESH_NEEDED");
  });

  it("D+1 is formative — a low D+1 does not block", () => {
    const t = transition("PROVISIONAL_MASTERY", {
      type: "RETENTION_SCORED",
      offset: 1,
      score: 0.2,
      allConfirmingPassed: false,
    });
    expect(t?.next).toBe("PROVISIONAL_MASTERY");
  });

  it("confirmed unit decays to REFRESH_NEEDED and flags on the 2nd decay", () => {
    const first = transition("CONFIRMED_MASTERY", { type: "RETENTION_SCORED", offset: 21, score: 0.5, allConfirmingPassed: false }, { decayCount: 0 });
    expect(first?.next).toBe("REFRESH_NEEDED");
    expect(first!.effects.some((e) => e.kind === "RAISE_FLAG")).toBe(false);

    const second = transition("CONFIRMED_MASTERY", { type: "RETENTION_SCORED", offset: 21, score: 0.5, allConfirmingPassed: false }, { decayCount: 1 });
    expect(second!.effects.some((e) => e.kind === "RAISE_FLAG")).toBe(true);
  });

  it("refresh micro-loop re-confirms without re-locking dependents", () => {
    expect(transition("REFRESH_NEEDED", { type: "REFRESH_PASSED" })?.next).toBe("CONFIRMED_MASTERY");
  });

  it("Tomoe is AI-free during summation only", () => {
    expect(isAiFreeState("SUMMATION_DUE")).toBe(true);
    expect(isAiFreeState("PRACTICE")).toBe(false);
  });

  it("isProven covers provisional/confirmed/refresh (working-level counts)", () => {
    expect(isProven("PROVISIONAL_MASTERY")).toBe(true);
    expect(isProven("CONFIRMED_MASTERY")).toBe(true);
    expect(isProven("REFRESH_NEEDED")).toBe(true);
    expect(isProven("PRACTICE")).toBe(false);
    expect(isProven("READY")).toBe(false);
  });
});

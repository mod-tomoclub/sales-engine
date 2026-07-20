import { describe, it, expect } from "vitest";
import {
  scheduleRetention,
  dueChecks,
  markDue,
  allConfirmingPassed,
  scorePasses,
} from "../src/engines/mastery/retention";

describe("retention scheduler (§7 1-3-7)", () => {
  it("schedules D+1/3/7/21/60 relative to provisional day", () => {
    const checks = scheduleRetention("s1", "math-g2-u2", 10);
    expect(checks.map((c) => c.offsetDays)).toEqual([1, 3, 7, 21, 60]);
    expect(checks.map((c) => c.dueDay)).toEqual([11, 13, 17, 31, 70]);
    expect(checks.every((c) => c.status === "scheduled")).toBe(true);
  });

  it("dueChecks returns only checks at/under the current day", () => {
    const checks = scheduleRetention("s1", "u", 0);
    expect(dueChecks(checks, 1).map((c) => c.offsetDays)).toEqual([1]);
    expect(dueChecks(checks, 7).map((c) => c.offsetDays)).toEqual([1, 3, 7]);
  });

  it("markDue flips scheduled → due when the day arrives", () => {
    const checks = markDue(scheduleRetention("s1", "u", 0), 3);
    const d3 = checks.find((c) => c.offsetDays === 3)!;
    expect(d3.status).toBe("due");
    const d7 = checks.find((c) => c.offsetDays === 7)!;
    expect(d7.status).toBe("scheduled");
  });

  it("allConfirmingPassed requires BOTH D+3 and D+7 passed", () => {
    const base = scheduleRetention("s1", "u", 0);
    const onlyD3 = base.map((c) => (c.offsetDays === 3 ? { ...c, status: "passed" as const } : c));
    expect(allConfirmingPassed(onlyD3)).toBe(false);
    const both = onlyD3.map((c) => (c.offsetDays === 7 ? { ...c, status: "passed" as const } : c));
    expect(allConfirmingPassed(both)).toBe(true);
  });

  it("scorePasses uses the 80% retention gate", () => {
    expect(scorePasses(0.8)).toBe(true);
    expect(scorePasses(0.79)).toBe(false);
  });
});

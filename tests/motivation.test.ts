import { describe, it, expect } from "vitest";
import {
  award,
  balance,
  emptyStreak,
  registerMeaningfulAction,
  pauseMultiplier,
  dailyGoals,
} from "../src/engines/motivation/ledger";

describe("motivation engine (§12)", () => {
  it("summation pass awards +10, D+7 confirm awards +5", () => {
    let ledger = award([], "s1", "summation_pass", 0, undefined).ledger;
    ledger = award(ledger, "s1", "retention_d7_confirm", 0, undefined).ledger;
    expect(balance(ledger, "s1")).toBe(15);
  });

  it("streak counts once per day and escalates when consecutive", () => {
    let s = emptyStreak("s1");
    s = registerMeaningfulAction(s, 1);
    expect(s.current).toBe(1);
    s = registerMeaningfulAction(s, 1); // same day, no double count
    expect(s.current).toBe(1);
    s = registerMeaningfulAction(s, 2);
    expect(s.current).toBe(2);
    s = registerMeaningfulAction(s, 5); // gap → reset to 1
    expect(s.current).toBe(1);
  });

  it("streak multiplier bonus applies to daily_streak and pauses after decay", () => {
    let s = emptyStreak("s1");
    s = registerMeaningfulAction(s, 1);
    s = registerMeaningfulAction(s, 2);
    s = registerMeaningfulAction(s, 3); // current = 3
    const withBonus = award([], "s1", "daily_streak", 3, s).entry.delta;
    expect(withBonus).toBe(4 + 3); // base 4 + min(current,5)

    const paused = pauseMultiplier(s);
    const noBonus = award([], "s1", "daily_streak", 3, paused).entry.delta;
    expect(noBonus).toBe(4); // multiplier paused → base only
  });

  it("a fresh meaningful action resumes a paused multiplier", () => {
    let s = pauseMultiplier(registerMeaningfulAction(emptyStreak("s1"), 1));
    expect(s.multiplierPaused).toBe(true);
    s = registerMeaningfulAction(s, 2);
    expect(s.multiplierPaused).toBe(false);
  });

  it("daily goals render the Bloomy-style set", () => {
    const goals = dailyGoals({ instruction: 1, practice: 0, retentionDue: 2, retentionDone: 1, coinsToday: 12 });
    expect(goals.map((g) => g.key)).toEqual(["instruction", "practice", "retention", "coins"]);
    expect(goals.find((g) => g.key === "instruction")!.progress).toBe(1);
    expect(goals.find((g) => g.key === "coins")!.progress).toBe(12);
  });
});

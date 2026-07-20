/**
 * Demo campus — a Grade 4 pilot class (Math + Science), per the PlayBook Phase 2
 * shape. Seeds working levels, live 1-3-7 retention pipelines, and a couple of
 * flags so the Teacher Console and Learning Map are meaningful on first load.
 * All content is illustrative; production content flows through the approval
 * pipeline (§14.2).
 */
import type { CurriculumGraph } from "../curriculum/graph";
import { bandForGrade, type InterestProfile, type Student } from "../domain/student";
import type { CampusState } from "../engines/progression";
import { seedBaseline, type BaselineSpec } from "../engines/baseline/baseline";
import { scheduleRetention } from "../engines/mastery/retention";
import { award, emptyStreak, registerMeaningfulAction } from "../engines/motivation/ledger";
import type { StudentUnitState } from "../domain/student";

export const COACH = { id: "coach-1", name: "Coach Nandini" };

interface DemoStudent {
  student: Student;
  interests: string[];
  spec: BaselineSpec;
  /** Units to place in PROVISIONAL with a live retention pipeline started N days ago. */
  provisional?: { unitId: string; startedDaysAgo: number }[];
  coins?: number;
  streakDays?: number;
}

function mk(id: string, name: string, grade: number, avatar: string, devicePolicy: Student["devicePolicy"], _interests: string[]): Student {
  return { id, name, grade, band: bandForGrade(grade), coachId: COACH.id, devicePolicy, languages: ["en", "hi"], avatar };
}

const ROSTER: DemoStudent[] = [
  {
    student: mk("s-aarav", "Aarav", 4, "🦊", "one-to-one", ["cricket", "space"]),
    interests: ["cricket", "space"],
    spec: { confirmedThrough: { "math:": "math-g4-u3", "science:": "science-g4-u2" }, active: { "math:": { unitId: "math-g4-u4", state: "PRACTICE", ladderRung: 1 } } },
    coins: 148,
    streakDays: 6,
  },
  {
    student: mk("s-diya", "Diya", 4, "🦋", "one-to-one", ["dance", "animals"]),
    interests: ["dance", "animals"],
    spec: { confirmedThrough: { "math:": "math-g4-u1", "science:": "science-g4-u1" }, gaps: ["math-g3-u5"] },
    coins: 92,
    streakDays: 3,
  },
  {
    student: mk("s-kabir", "Kabir", 4, "🐯", "one-to-one", ["cars", "football"]),
    interests: ["cars", "football"],
    spec: { confirmedThrough: { "math:": "math-g3-u2", "science:": "science-g3-u2" }, active: { "math:": { unitId: "math-g3-u3", state: "INSTRUCTION", nodesExposed: 1 } } },
    coins: 54,
    streakDays: 1,
  },
  {
    student: mk("s-meera", "Meera", 4, "🌸", "one-to-one", ["art", "birds"]),
    interests: ["art", "birds"],
    spec: { confirmedThrough: { "math:": "math-g3-u7", "science:": "science-g4-u1" } },
    provisional: [{ unitId: "math-g4-u1", startedDaysAgo: 3 }],
    coins: 116,
    streakDays: 4,
  },
  {
    student: mk("s-rohan", "Rohan", 4, "🚀", "one-to-one", ["robots", "space"]),
    interests: ["robots", "space"],
    spec: { confirmedThrough: { "math:": "math-g4-u1", "science:": "science-g4-u2" }, active: { "math:": { unitId: "math-g4-u2", state: "INSTRUCTION", nodesExposed: 2 } } },
    coins: 101,
    streakDays: 5,
  },
  {
    student: mk("s-sara", "Sara", 4, "🎨", "one-to-one", ["painting", "music"]),
    interests: ["painting", "music"],
    spec: { confirmedThrough: { "math:": "math-g4-u2", "science:": "science-g4-u1" }, gaps: ["math-g3-u4"] },
    coins: 88,
    streakDays: 2,
  },
  {
    student: mk("s-vivaan", "Vivaan", 4, "⚽", "one-to-one", ["football", "comics"]),
    interests: ["football", "comics"],
    spec: { confirmedThrough: { "math:": "math-g4-u2", "science:": "science-g4-u2" } },
    provisional: [{ unitId: "math-g4-u3", startedDaysAgo: 1 }],
    coins: 133,
    streakDays: 7,
  },
  {
    student: mk("s-ananya", "Ananya", 4, "📚", "one-to-one", ["reading", "stories"]),
    interests: ["reading", "stories"],
    spec: { confirmedThrough: { "math:": "math-g4-u1", "science:": "science-g4-u3" } },
    coins: 77,
    streakDays: 2,
  },
];

export const DEMO_STUDENTS: Student[] = ROSTER.map((r) => r.student);

export const INTEREST_PROFILES: Record<string, InterestProfile> = Object.fromEntries(
  ROSTER.map((r) => [
    r.student.id,
    {
      studentId: r.student.id,
      interests: r.interests,
      doorways: r.interests,
      confidenceSurvey: { math: "medium", science: "high" },
      teacherNotes: { strength: "Curious and persistent", gap: "Rushes on multi-step work", confidence: "Growing" },
    },
  ]),
);

const key = (studentId: string, unitId: string) => `${studentId}:${unitId}`;

export function buildInitialCampusState(graph: CurriculumGraph): CampusState {
  const unitStates: Record<string, StudentUnitState> = {};
  let retentionChecks: CampusState["retentionChecks"] = [];
  let ledger: CampusState["ledger"] = [];
  const flags: CampusState["flags"] = [];
  const streaks: CampusState["streaks"] = {};
  const day = 0;

  for (const r of ROSTER) {
    const { states } = seedBaseline(graph, r.student, r.spec);
    for (const s of states) unitStates[key(s.studentId, s.unitId)] = s;

    // Live retention pipelines: schedule N days ago so some checks are due now.
    for (const p of r.provisional ?? []) {
      const rec = unitStates[key(r.student.id, p.unitId)] ?? {
        studentId: r.student.id,
        unitId: p.unitId,
        state: "PROVISIONAL_MASTERY" as const,
        nodesExposed: graph.unit(p.unitId)?.conceptNodes.length ?? 0,
        ladderRung: 3,
        attempts: 6,
        timeSpentMin: 60,
        provisionalMasteryAt: new Date(0).toISOString(),
        confirmedMasteryAt: null,
        decayCount: 0,
        lastSummationScore: 0.94,
      };
      unitStates[key(r.student.id, p.unitId)] = { ...rec, state: "PROVISIONAL_MASTERY", lastSummationScore: 0.94 };
      retentionChecks = retentionChecks.concat(scheduleRetention(r.student.id, p.unitId, day - p.startedDaysAgo));
    }

    // Streak + coins.
    let streak = emptyStreak(r.student.id);
    for (let d = 1; d <= (r.streakDays ?? 0); d++) streak = registerMeaningfulAction(streak, d);
    streaks[r.student.id] = streak;
    if (r.coins) ledger.push({ id: `seed-${r.student.id}`, studentId: r.student.id, delta: r.coins, reason: "summation_pass", note: "Term-to-date", atDay: 0 });
    void award; // engine award used at runtime; seed uses a single opening entry
  }

  // A couple of pre-existing flags for the Teacher Console.
  flags.push(
    { id: "flag-seed-1", studentId: "s-kabir", unitId: "math-g3-u3", source: "AI", kind: "stuck", detail: "misconception: borrowing across zeros", status: "open", ownerId: null, atDay: 0 },
    { id: "flag-seed-2", studentId: "s-diya", unitId: "math-g3-u5", source: "teacher", kind: "misconception", detail: "equal-parts test not secure", status: "open", ownerId: COACH.id, atDay: 0 },
  );

  // Mark due at start.
  retentionChecks = retentionChecks.map((c) => (c.dueDay <= day ? { ...c, status: "due" as const } : c));

  return { version: 1, day, unitStates, retentionChecks, ledger, flags, streaks, interactions: [] };
}

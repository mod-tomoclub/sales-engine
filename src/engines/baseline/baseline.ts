/**
 * Baseline Engine (TOMO_SCHOOL_ARCHITECTURE §6) — everything starts here.
 * Establishes each child's working level per subject (potentially below their
 * enrolled grade) and seeds the personalized plan. Here we seed demo starting
 * states from a compact BaselineSpec; a real deployment runs the graph-adaptive
 * routing over the item bank.
 */
import type { CurriculumGraph } from "../../curriculum/graph";
import type { BaselineResult, Student, StudentUnitState } from "../../domain/student";

const laneKey = (subjectKey: string, stream: string | null) => `${subjectKey}:${stream ?? ""}`;

export interface BaselineSpec {
  /** Furthest CONFIRMED unit id per lane (inclusive). */
  confirmedThrough: Record<string, string>;
  /** Units to render as gaps (REFRESH_NEEDED) despite being below working level. */
  gaps?: string[];
  /** A unit currently mid-flight per lane (INSTRUCTION/PRACTICE) with progress. */
  active?: Record<string, { unitId: string; state: "INSTRUCTION" | "PRACTICE"; nodesExposed?: number; ladderRung?: number }>;
}

function base(studentId: string, unitId: string, state: StudentUnitState["state"]): StudentUnitState {
  return {
    studentId,
    unitId,
    state,
    nodesExposed: 0,
    ladderRung: 0,
    attempts: 0,
    timeSpentMin: 0,
    provisionalMasteryAt: null,
    confirmedMasteryAt: null,
    decayCount: 0,
    lastSummationScore: null,
  };
}

export function seedBaseline(
  graph: CurriculumGraph,
  student: Student,
  spec: BaselineSpec,
): { states: StudentUnitState[]; results: BaselineResult[] } {
  const states: StudentUnitState[] = [];
  const results: BaselineResult[] = [];
  const gaps = new Set(spec.gaps ?? []);
  const nowIso = new Date(0).toISOString(); // fixed for deterministic seed

  for (const subject of graph.subjects) {
    const streams = graph.streamsForSubject(subject.key);
    const lanes = streams.length ? streams : [null];
    for (const stream of lanes) {
      const lane = graph.lane(subject.key, stream);
      const lk = laneKey(subject.key, stream);
      const throughId = spec.confirmedThrough[lk];
      const throughIdx = throughId ? lane.findIndex((u) => u.id === throughId) : -1;
      const active = spec.active?.[lk];

      const gapUnitIds: string[] = [];
      lane.forEach((u, idx) => {
        if (active && active.unitId === u.id) {
          const rec = base(student.id, u.id, active.state);
          rec.nodesExposed = active.nodesExposed ?? 0;
          rec.ladderRung = active.ladderRung ?? 0;
          states.push(rec);
          return;
        }
        if (idx <= throughIdx) {
          if (gaps.has(u.id)) {
            const rec = base(student.id, u.id, "REFRESH_NEEDED");
            rec.provisionalMasteryAt = nowIso;
            rec.confirmedMasteryAt = nowIso;
            rec.decayCount = 1;
            states.push(rec);
            gapUnitIds.push(u.id);
          } else {
            const rec = base(student.id, u.id, "CONFIRMED_MASTERY");
            rec.provisionalMasteryAt = nowIso;
            rec.confirmedMasteryAt = nowIso;
            rec.lastSummationScore = 0.95;
            states.push(rec);
          }
        } else if (idx === throughIdx + 1 && !active) {
          // Next unit is unlockable → READY.
          states.push(base(student.id, u.id, "READY"));
        }
        // else: remains implicitly LOCKED (no record needed until touched)
      });

      const workingLevelUnitId = throughIdx >= 0 ? lane[throughIdx].id : null;
      results.push({
        subjectKey: subject.key,
        workingLevelUnitId,
        gapUnitIds,
        confidenceBand: gapUnitIds.length > 1 ? "low" : gapUnitIds.length === 1 ? "medium" : "high",
        administeredAt: nowIso,
      });
    }
  }

  return { states, results };
}

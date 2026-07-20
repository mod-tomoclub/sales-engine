/**
 * Curriculum Graph queries (TOMO_SCHOOL_ARCHITECTURE §4.1, packages/curriculum-graph).
 * Prerequisite edges ARE the adaptive structure (baseline) and the parallel-unit
 * enabler (planner). This class wraps the imported graph with the traversals the
 * engines need.
 */
import type { CurriculumGraphData, Subject, Unit } from "../domain/curriculum";
import { isProven, type UnitState } from "../domain/mastery";

export class CurriculumGraph {
  private unitById = new Map<string, Unit>();
  private dependentsOf = new Map<string, string[]>(); // unit -> units that require it
  private unitsBySubject = new Map<string, Unit[]>();

  constructor(private data: CurriculumGraphData) {
    for (const u of data.units) {
      this.unitById.set(u.id, u);
      if (!this.unitsBySubject.has(u.subjectKey)) this.unitsBySubject.set(u.subjectKey, []);
      this.unitsBySubject.get(u.subjectKey)!.push(u);
    }
    for (const u of data.units) {
      for (const p of u.prereqUnitIds) {
        if (!this.dependentsOf.has(p)) this.dependentsOf.set(p, []);
        this.dependentsOf.get(p)!.push(u.id);
      }
    }
    for (const [, list] of this.unitsBySubject) {
      list.sort((a, b) => a.grade - b.grade || (a.stream ?? "").localeCompare(b.stream ?? "") || a.unitNo - b.unitNo);
    }
  }

  get meta() { return this.data.meta; }
  get subjects(): Subject[] { return this.data.subjects; }
  get allUnits(): Unit[] { return this.data.units; }

  subject(key: string): Subject | undefined { return this.data.subjects.find((s) => s.key === key); }
  unit(id: string): Unit | undefined { return this.unitById.get(id); }
  unitsForSubject(key: string): Unit[] { return this.unitsBySubject.get(key) ?? []; }

  /** Streams present in a subject (PCB -> [PHY,CHE,BIO]); [] for single-stream. */
  streamsForSubject(key: string): string[] {
    return [...new Set(this.unitsForSubject(key).map((u) => u.stream).filter(Boolean) as string[])];
  }

  /** Units within a subject stream (or whole subject if streamless), in order. */
  lane(subjectKey: string, stream: string | null): Unit[] {
    return this.unitsForSubject(subjectKey).filter((u) => u.stream === stream);
  }

  prereqs(unitId: string): Unit[] {
    const u = this.unit(unitId);
    if (!u) return [];
    return u.prereqUnitIds.map((id) => this.unitById.get(id)).filter(Boolean) as Unit[];
  }

  dependents(unitId: string): Unit[] {
    return (this.dependentsOf.get(unitId) ?? []).map((id) => this.unitById.get(id)!).filter(Boolean);
  }

  /**
   * A unit is unlockable when all its prerequisites are at least provisionally
   * proven (§7: "prereqs provisionally mastered → READY"). Units with no
   * prerequisites are roots and always unlockable.
   */
  isUnlockable(unitId: string, states: Map<string, UnitState>): boolean {
    const u = this.unit(unitId);
    if (!u) return false;
    if (u.prereqUnitIds.length === 0) return true;
    return u.prereqUnitIds.every((pid) => {
      const s = states.get(pid);
      return s !== undefined && isProven(s);
    });
  }

  /** Furthest proven unit in a subject stream = the "working level" (§6). */
  workingLevel(subjectKey: string, stream: string | null, states: Map<string, UnitState>): Unit | null {
    const lane = this.lane(subjectKey, stream);
    let best: Unit | null = null;
    for (const u of lane) {
      const s = states.get(u.id);
      if (s && isProven(s)) best = u;
    }
    return best;
  }

  /** The next not-yet-started unit(s) in a lane that are unlockable now. */
  nextUnlockable(subjectKey: string, stream: string | null, states: Map<string, UnitState>): Unit[] {
    return this.lane(subjectKey, stream).filter((u) => {
      const s = states.get(u.id) ?? "LOCKED";
      return (s === "LOCKED" || s === "READY") && this.isUnlockable(u.id, states);
    });
  }
}

let singleton: CurriculumGraph | null = null;
export function loadGraph(data: CurriculumGraphData): CurriculumGraph {
  singleton = new CurriculumGraph(data);
  return singleton;
}
export function getGraph(): CurriculumGraph {
  if (!singleton) throw new Error("CurriculumGraph not loaded — call loadGraph() first.");
  return singleton;
}

/** Derived views over CampusState shared by the surfaces. */
import type { CurriculumGraph } from "../curriculum/graph";
import type { Unit } from "../domain/curriculum";
import type { RetentionCheck, StudentUnitState } from "../domain/student";
import { ACTIVE_STATES, isProven, type UnitState } from "../domain/mastery";
import { getUnitState, statesForStudent, type CampusState } from "../engines/progression";
import { balance } from "../engines/motivation/ledger";
import { dueChecks } from "../engines/mastery/retention";

export interface LaneSummary {
  subjectKey: string;
  subjectName: string;
  stream: string | null;
  laneLabel: string;
  workingLevel: Unit | null;
  workingLevelPct: number; // position in lane
  counts: Record<UnitState, number>;
  provenCount: number;
  total: number;
  focusUnit: Unit | null;
  focusState: UnitState | null;
  retentionHealth: number; // fraction of scheduled/confirming checks passed
}

const EMPTY_COUNTS = (): Record<UnitState, number> => ({
  LOCKED: 0, READY: 0, INSTRUCTION: 0, PRACTICE: 0, SUMMATION_DUE: 0,
  PROVISIONAL_MASTERY: 0, CONFIRMED_MASTERY: 0, REFRESH_NEEDED: 0,
});

export function laneSummaries(graph: CurriculumGraph, state: CampusState, studentId: string): LaneSummary[] {
  const states = statesForStudent(state, studentId);
  const out: LaneSummary[] = [];
  for (const subject of graph.subjects) {
    const streams = graph.streamsForSubject(subject.key);
    const lanes = streams.length ? streams : [null];
    for (const stream of lanes) {
      const lane = graph.lane(subject.key, stream);
      const counts = EMPTY_COUNTS();
      let provenCount = 0;
      for (const u of lane) {
        const s = states.get(u.id) ?? "LOCKED";
        counts[s]++;
        if (isProven(s)) provenCount++;
      }
      const workingLevel = graph.workingLevel(subject.key, stream, states);
      const focusUnit = lane.find((u) => ACTIVE_STATES.includes(states.get(u.id) ?? "LOCKED")) ?? null;
      const wlIdx = workingLevel ? lane.findIndex((u) => u.id === workingLevel.id) : -1;

      const laneChecks = state.retentionChecks.filter((c) => c.studentId === studentId && graph.unit(c.unitId)?.subjectKey === subject.key && graph.unit(c.unitId)?.stream === stream);
      const scored = laneChecks.filter((c) => c.status === "passed" || c.status === "failed");
      const retentionHealth = scored.length ? scored.filter((c) => c.status === "passed").length / scored.length : 1;

      out.push({
        subjectKey: subject.key,
        subjectName: subject.name,
        stream,
        laneLabel: stream ? `${subject.name} · ${stream}` : subject.name,
        workingLevel,
        workingLevelPct: lane.length ? (wlIdx + 1) / lane.length : 0,
        counts,
        provenCount,
        total: lane.length,
        focusUnit,
        focusState: focusUnit ? states.get(focusUnit.id) ?? null : null,
        retentionHealth,
      });
    }
  }
  return out;
}

export function masteryStrip(
  graph: CurriculumGraph,
  state: CampusState,
  studentId: string,
  subjectKey: string,
  stream: string | null,
): { unit: Unit; state: UnitState }[] {
  const states = statesForStudent(state, studentId);
  return graph.lane(subjectKey, stream).map((unit) => ({ unit, state: states.get(unit.id) ?? "LOCKED" }));
}

export function coins(state: CampusState, studentId: string): number {
  return balance(state.ledger, studentId);
}

export function coinsEarnedToday(state: CampusState, studentId: string): number {
  return state.ledger.reduce((sum, e) => (e.studentId === studentId && e.atDay === state.day && e.delta > 0 ? sum + e.delta : sum), 0);
}

export function dueRetention(state: CampusState, studentId: string): RetentionCheck[] {
  return dueChecks(state.retentionChecks.filter((c) => c.studentId === studentId), state.day);
}

/** The single "Up Next" recommendation for a student: an active unit, or the next unlockable. */
export function upNext(graph: CurriculumGraph, state: CampusState, studentId: string, subjectKey?: string): { unit: Unit; rec: StudentUnitState } | null {
  const states = statesForStudent(state, studentId);
  const subjects = subjectKey ? [subjectKey] : graph.subjects.map((s) => s.key);
  // Prefer an in-flight unit (INSTRUCTION/PRACTICE/SUMMATION_DUE).
  for (const sk of subjects) {
    for (const stream of graph.streamsForSubject(sk).length ? graph.streamsForSubject(sk) : [null]) {
      const active = graph.lane(sk, stream).find((u) => ACTIVE_STATES.includes(states.get(u.id) ?? "LOCKED"));
      if (active) return { unit: active, rec: getUnitState(state, studentId, active.id) };
    }
  }
  // Else the next unlockable.
  for (const sk of subjects) {
    for (const stream of graph.streamsForSubject(sk).length ? graph.streamsForSubject(sk) : [null]) {
      const next = graph.nextUnlockable(sk, stream, states)[0];
      if (next) return { unit: next, rec: getUnitState(state, studentId, next.id) };
    }
  }
  return null;
}

export interface ClassRow {
  studentId: string;
  focusUnit: Unit | null;
  focusState: UnitState | null;
  openFlags: number;
  dueRetention: number;
  workingLevelDelta: number; // working grade - enrolled grade
}

export function classForSubject(graph: CurriculumGraph, state: CampusState, studentIds: string[], subjectKey: string, enrolledGrade: number): ClassRow[] {
  return studentIds.map((studentId) => {
    const states = statesForStudent(state, studentId);
    const stream = null;
    const focusUnit =
      graph.lane(subjectKey, stream).find((u) => ACTIVE_STATES.includes(states.get(u.id) ?? "LOCKED")) ??
      graph.nextUnlockable(subjectKey, stream, states)[0] ??
      null;
    const wl = graph.workingLevel(subjectKey, stream, states);
    return {
      studentId,
      focusUnit,
      focusState: focusUnit ? states.get(focusUnit.id) ?? "LOCKED" : null,
      openFlags: state.flags.filter((f) => f.studentId === studentId && f.status !== "closed").length,
      dueRetention: dueChecks(state.retentionChecks.filter((c) => c.studentId === studentId && graph.unit(c.unitId)?.subjectKey === subjectKey), state.day).length,
      workingLevelDelta: wl ? wl.grade - enrolledGrade : -enrolledGrade,
    };
  });
}

import { CLASSROOMS, type Classroom } from '../curriculum';
import { listSnapshots } from '../context-engine/store';

/** Classrooms this student has completed at least one full block in. */
export function completedClassrooms(studentId: string): Set<string> {
  return new Set(
    listSnapshots(studentId)
      .map((s) => s.source_classroom_id)
      .filter((x): x is string => Boolean(x)),
  );
}

/** AND-gate: every prerequisite classroom must be completed. */
export function isUnlockable(c: Classroom, completed: Set<string>): boolean {
  return c.prerequisite_concept_ids.every((p) => completed.has(p));
}

export function availableClassrooms(completed: Set<string>): Classroom[] {
  return CLASSROOMS.filter((c) => !completed.has(c.concept_id) && isUnlockable(c, completed));
}

/** The classroom the student would walk into next, in book order. */
export function nextClassroomFor(studentId: string): Classroom | null {
  const completed = completedClassrooms(studentId);
  return availableClassrooms(completed)[0] ?? null;
}

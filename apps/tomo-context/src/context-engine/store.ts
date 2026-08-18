/**
 * The context engine's public operations over persistence.
 *
 * Reads are cheap and everywhere. There is exactly one write path for context —
 * commitDelta — and it only ever INSERTs a new version.
 */

import { randomUUID } from 'node:crypto';
import { getDb } from './db';
import {
  ContextSnapshot,
  type ContextChange,
  type ContextDelta,
  type SessionEvidence,
  type SnapshotTrigger,
  type Student,
  type StudentMisconception,
  type StudentWithContext,
} from './types';
import { subConceptTitle, misconceptionName } from '../curriculum';

/* ------------------------------------------------------------------ *
 * Students
 * ------------------------------------------------------------------ */

export function listStudents(): StudentWithContext[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT s.*, COALESCE(MAX(c.version), 0) AS current_version
         FROM students s LEFT JOIN context_snapshots c ON c.student_id = s.id
        GROUP BY s.id
        ORDER BY s.name ASC`,
    )
    .all() as (Student & { current_version: number })[];

  return rows.map((r) => ({ ...r, snapshot: r.current_version ? getSnapshot(r.id, r.current_version) : null }));
}

export function getStudent(id: string): StudentWithContext | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM students WHERE id = ?`).get(id) as Student | undefined;
  if (!row) return null;
  const v = currentVersion(id);
  return { ...row, current_version: v, snapshot: v ? getSnapshot(id, v) : null };
}

export function createStudent(input: {
  name: string;
  grade?: number;
  board?: string;
  section?: string;
}): Student {
  const db = getDb();
  const student: Student = {
    id: `stu_${randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    grade: input.grade ?? 7,
    board: input.board ?? 'ICSE',
    section: input.section ?? '7-B',
    created_at: new Date().toISOString(),
    last_activity_at: null,
  };
  db.prepare(
    `INSERT INTO students (id, name, grade, board, section, created_at, last_activity_at)
     VALUES (@id, @name, @grade, @board, @section, @created_at, @last_activity_at)`,
  ).run(student);
  return student;
}

export function insertStudentRaw(student: Student) {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO students (id, name, grade, board, section, created_at, last_activity_at)
       VALUES (@id, @name, @grade, @board, @section, @created_at, @last_activity_at)`,
    )
    .run(student);
}

export function touchStudent(id: string, at = new Date().toISOString()) {
  getDb().prepare(`UPDATE students SET last_activity_at = ? WHERE id = ?`).run(at, id);
}

/* ------------------------------------------------------------------ *
 * Snapshots — read
 * ------------------------------------------------------------------ */

export function currentVersion(studentId: string): number {
  const row = getDb()
    .prepare(`SELECT COALESCE(MAX(version), 0) AS v FROM context_snapshots WHERE student_id = ?`)
    .get(studentId) as { v: number };
  return row.v;
}

export function getSnapshot(studentId: string, version: number): ContextSnapshot | null {
  const row = getDb()
    .prepare(`SELECT payload FROM context_snapshots WHERE student_id = ? AND version = ?`)
    .get(studentId, version) as { payload: string } | undefined;
  return row ? (JSON.parse(row.payload) as ContextSnapshot) : null;
}

export function getLatestSnapshot(studentId: string): ContextSnapshot | null {
  const v = currentVersion(studentId);
  return v ? getSnapshot(studentId, v) : null;
}

export function listSnapshots(studentId: string): ContextSnapshot[] {
  const rows = getDb()
    .prepare(`SELECT payload FROM context_snapshots WHERE student_id = ? ORDER BY version ASC`)
    .all(studentId) as { payload: string }[];
  return rows.map((r) => JSON.parse(r.payload) as ContextSnapshot);
}

/** Snapshots with version in (from, to], for a multi-version diff. */
export function snapshotSpan(studentId: string, from: number, to: number): ContextSnapshot[] {
  const rows = getDb()
    .prepare(
      `SELECT payload FROM context_snapshots
        WHERE student_id = ? AND version > ? AND version <= ? ORDER BY version ASC`,
    )
    .all(studentId, from, to) as { payload: string }[];
  return rows.map((r) => JSON.parse(r.payload) as ContextSnapshot);
}

/* ------------------------------------------------------------------ *
 * Snapshots — the single write path
 * ------------------------------------------------------------------ */

export function insertSnapshot(snapshot: ContextSnapshot) {
  const parsed = ContextSnapshot.parse(snapshot);
  getDb()
    .prepare(
      `INSERT INTO context_snapshots (student_id, version, created_at, trigger, payload)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(parsed.student_id, parsed.version, parsed.created_at, parsed.trigger, JSON.stringify(parsed));
  touchStudent(parsed.student_id, parsed.created_at);
}

/**
 * Fold a ContextDelta onto the current snapshot and append the result as the
 * next version. This is where "what changed and why" is computed — every field
 * that moves produces a ContextChange with a reason and evidence refs, so no
 * number in the UI is ever unexplained.
 */
export function commitDelta(
  studentId: string,
  delta: ContextDelta,
  opts: { trigger: SnapshotTrigger; source_classroom_id?: string | null; at?: string },
): ContextSnapshot {
  const prev = getLatestSnapshot(studentId);
  const version = (prev?.version ?? 0) + 1;
  const at = opts.at ?? new Date().toISOString();
  const changes: ContextChange[] = [];

  /* ---- mastery ---- */
  const mastery = new Map((prev?.mastery ?? []).map((m) => [m.concept_id, { ...m }]));
  for (const u of delta.mastery_updates) {
    const before = mastery.get(u.concept_id);
    const next = {
      concept_id: u.concept_id,
      confidence: round2(u.confidence),
      evidence_count: (before?.evidence_count ?? 0) + Math.max(1, u.evidence_refs.length),
      last_seen: at,
      trend: u.trend,
      note: u.note ?? before?.note,
    };
    mastery.set(u.concept_id, next);

    const from = before ? before.confidence : null;
    if (from === null || Math.abs(from - next.confidence) >= 0.005) {
      changes.push({
        kind: 'mastery',
        target: u.concept_id,
        label: subConceptTitle(u.concept_id),
        from,
        to: next.confidence,
        direction: from === null ? 'neutral' : next.confidence > from ? 'up' : 'down',
        reason: u.reason,
        evidence_refs: u.evidence_refs,
      });
    }
  }

  /* ---- misconceptions ---- */
  const misconceptions = new Map<string, StudentMisconception>(
    (prev?.misconceptions ?? []).map((m) => [m.id, { ...m, evidence: [...m.evidence] }]),
  );

  for (const o of delta.misconceptions_opened) {
    const existing = misconceptions.get(o.id);
    const evidence = o.evidence.map((e) => ({ ...e, version }));
    if (existing) {
      existing.status = 'open';
      existing.evidence = [...existing.evidence, ...evidence];
      existing.resolved_at_version = null;
      existing.resolution_note = null;
    } else {
      misconceptions.set(o.id, {
        id: o.id,
        name: o.name,
        student_model: o.student_model,
        concept_ids: o.concept_ids,
        status: 'open',
        first_seen_version: version,
        resolved_at_version: null,
        resolution_note: null,
        evidence,
      });
    }
    changes.push({
      kind: 'misconception-opened',
      target: o.id,
      label: o.name,
      from: existing ? existing.status : null,
      to: 'open',
      direction: 'down',
      reason: o.reason,
      evidence_refs: evidence.map((e) => e.item_id),
    });
  }

  for (const r of delta.misconceptions_resolved) {
    const m = misconceptions.get(r.id);
    if (!m) continue;
    const fromStatus = m.status;
    m.status = 'resolved';
    m.resolved_at_version = version;
    m.resolution_note = r.reason;
    changes.push({
      kind: 'misconception-resolved',
      target: r.id,
      label: m.name,
      from: fromStatus,
      to: 'resolved',
      direction: 'up',
      reason: r.reason,
      evidence_refs: r.evidence_refs,
    });
  }

  for (const p of delta.misconceptions_persisted) {
    const m = misconceptions.get(p.id);
    if (!m) continue;
    const fromStatus = m.status;
    m.status = 'open';
    changes.push({
      kind: 'misconception-persisted',
      target: p.id,
      label: m.name || misconceptionName(p.id),
      from: fromStatus,
      to: 'open',
      direction: 'down',
      reason: p.reason,
      evidence_refs: p.evidence_refs,
    });
  }

  /* ---- profile ---- */
  const profile = { ...(prev?.profile ?? DEFAULT_PROFILE) };
  for (const u of delta.profile_updates) {
    const before = String((profile as unknown as Record<string, unknown>)[u.field]);
    if (before === u.to) continue;
    (profile as unknown as Record<string, unknown>)[u.field] = u.to;
    (profile as unknown as Record<string, unknown>)[`${noteKey(u.field)}`] = u.reason;
    changes.push({
      kind: 'profile',
      target: u.field,
      label: u.field.replace(/_/g, ' '),
      from: before,
      to: u.to,
      direction: 'neutral',
      reason: u.reason,
      evidence_refs: u.evidence_refs,
    });
  }

  /* ---- engagement ---- */
  const prevEng = prev?.engagement ?? DEFAULT_ENGAGEMENT;
  const engagement = {
    ...prevEng,
    ...delta.engagement_updates,
    blocks_completed: prevEng.blocks_completed + (opts.trigger === 'classroom-complete' ? 1 : 0),
  };
  for (const [k, v] of Object.entries(delta.engagement_updates)) {
    const before = (prevEng as unknown as Record<string, number>)[k];
    if (typeof v === 'number' && typeof before === 'number' && Math.abs(before - v) > 0.001) {
      changes.push({
        kind: 'engagement',
        target: k,
        label: k.replace(/_/g, ' '),
        from: round2(before),
        to: round2(v),
        direction: v > before ? 'up' : 'down',
        reason: delta.summary,
        evidence_refs: [],
      });
    }
  }

  const snapshot: ContextSnapshot = {
    student_id: studentId,
    version,
    created_at: at,
    trigger: opts.trigger,
    source_classroom_id: opts.source_classroom_id ?? null,
    summary: delta.summary,
    narrative: delta.narrative,
    mastery: [...mastery.values()],
    misconceptions: [...misconceptions.values()],
    profile,
    engagement,
    changes,
  };

  insertSnapshot(snapshot);
  return snapshot;
}

function noteKey(field: string): string {
  switch (field) {
    case 'pace':
      return 'pace_note';
    case 'preferred_modality':
      return 'modality_note';
    case 'response_to_hints':
      return 'hint_note';
    case 'persistence_after_error':
      return 'persistence_note';
    default:
      return 'error_note';
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const DEFAULT_PROFILE = {
  pace: 'steady' as const,
  pace_note: 'Not yet observed.',
  preferred_modality: 'worked-example-first' as const,
  modality_note: 'Default doorway until evidence says otherwise.',
  modality_ranking: ['worked-example-first', 'visual', 'analogy', 'formal'] as (
    | 'worked-example-first'
    | 'visual'
    | 'analogy'
    | 'formal'
  )[],
  response_to_hints: 'uses-when-stuck' as const,
  hint_note: 'Not yet observed.',
  persistence_after_error: 'retries-and-repairs' as const,
  persistence_note: 'Not yet observed.',
  typical_error_type: 'conceptual' as const,
  error_note: 'Not yet observed.',
};

export const DEFAULT_ENGAGEMENT = {
  avg_seconds_per_question: 0,
  hint_dependency_rate: 0,
  attempts_per_question: 0,
  drop_off_points: [] as string[],
  blocks_completed: 0,
  total_time_on_task_minutes: 0,
};

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

export function startSession(input: {
  student_id: string;
  classroom_id: string;
  from_version: number;
  plan: unknown;
}): string {
  const id = `ses_${randomUUID().slice(0, 8)}`;
  getDb()
    .prepare(
      `INSERT INTO sessions (id, student_id, classroom_id, from_version, started_at, plan)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.student_id, input.classroom_id, input.from_version, new Date().toISOString(), JSON.stringify(input.plan));
  return id;
}

export function completeSession(id: string, evidence: SessionEvidence, toVersion: number) {
  getDb()
    .prepare(`UPDATE sessions SET completed_at = ?, evidence = ?, to_version = ? WHERE id = ?`)
    .run(new Date().toISOString(), JSON.stringify(evidence), toVersion, id);
}

export function getSession(id: string) {
  const row = getDb().prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as
    | {
        id: string;
        student_id: string;
        classroom_id: string;
        from_version: number;
        to_version: number | null;
        started_at: string;
        completed_at: string | null;
        plan: string | null;
        evidence: string | null;
      }
    | undefined;
  if (!row) return null;
  return {
    ...row,
    plan: row.plan ? JSON.parse(row.plan) : null,
    evidence: row.evidence ? (JSON.parse(row.evidence) as SessionEvidence) : null,
  };
}

export function listSessions(studentId: string) {
  const rows = getDb()
    .prepare(`SELECT id, classroom_id, from_version, to_version, started_at, completed_at FROM sessions WHERE student_id = ? ORDER BY started_at DESC`)
    .all(studentId) as {
    id: string;
    classroom_id: string;
    from_version: number;
    to_version: number | null;
    started_at: string;
    completed_at: string | null;
  }[];
  return rows;
}

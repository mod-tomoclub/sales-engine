/**
 * Diffing two context versions.
 *
 * This is the artifact the demo lives or dies on, so it computes structure, not
 * prose: what the system learned, what it revised, and what it now believes —
 * each row carrying the recorded reason that produced it.
 */

import {
  bandOf,
  type ContextChange,
  type ContextSnapshot,
  type MasteryBand,
  type StudentMisconception,
} from './types';
import { subConceptTitle } from '../curriculum';

export type MasteryDiffRow = {
  concept_id: string;
  title: string;
  from: number | null;
  to: number | null;
  delta: number;
  band_from: MasteryBand;
  band_to: MasteryBand;
  status: 'new' | 'improved' | 'declined' | 'unchanged';
  evidence_from: number;
  evidence_to: number;
  reasons: string[];
};

export type MisconceptionDiffRow = {
  id: string;
  name: string;
  student_model: string;
  status_from: StudentMisconception['status'] | null;
  status_to: StudentMisconception['status'] | null;
  change: 'opened' | 'resolved' | 'persisted' | 'unchanged';
  reasons: string[];
};

export type FieldDiffRow = { field: string; label: string; from: string; to: string; reason?: string };

export type SnapshotDiff = {
  from_version: number;
  to_version: number;
  mastery: MasteryDiffRow[];
  misconceptions: MisconceptionDiffRow[];
  profile: FieldDiffRow[];
  engagement: FieldDiffRow[];
  /** Every recorded change across the span, newest last. */
  changes: ContextChange[];
  headline: string;
};

const PROFILE_LABELS: Record<string, string> = {
  pace: 'Pace',
  preferred_modality: 'Leading doorway',
  response_to_hints: 'Response to hints',
  persistence_after_error: 'Persistence after a wrong answer',
  typical_error_type: 'Typical error type',
};

const ENGAGEMENT_LABELS: Record<string, string> = {
  avg_seconds_per_question: 'Avg seconds per question',
  hint_dependency_rate: 'Hint dependency',
  attempts_per_question: 'Attempts per question',
  blocks_completed: 'Blocks completed',
  total_time_on_task_minutes: 'Time on task (min)',
};

function reasonsFor(changes: ContextChange[], target: string): string[] {
  return changes.filter((c) => c.target === target).map((c) => c.reason);
}

/**
 * @param a earlier snapshot
 * @param b later snapshot
 * @param span every snapshot with version in (a.version, b.version], in order,
 *        so a v1 -> v3 diff still carries the reasons recorded at v2.
 */
export function diffSnapshots(
  a: ContextSnapshot,
  b: ContextSnapshot,
  span: ContextSnapshot[] = [],
): SnapshotDiff {
  const changes = (span.length ? span : [b]).flatMap((s) => s.changes);

  const aM = new Map(a.mastery.map((m) => [m.concept_id, m]));
  const bM = new Map(b.mastery.map((m) => [m.concept_id, m]));

  const mastery: MasteryDiffRow[] = [];
  for (const id of new Set([...aM.keys(), ...bM.keys()])) {
    const x = aM.get(id);
    const y = bM.get(id);
    const from = x ? x.confidence : null;
    const to = y ? y.confidence : null;
    const delta = (to ?? 0) - (from ?? 0);
    const bandFrom = x ? bandOf(x) : 'untouched';
    const bandTo = y ? bandOf(y) : 'untouched';

    let status: MasteryDiffRow['status'];
    if (!x || x.evidence_count === 0) status = y && y.evidence_count > 0 ? 'new' : 'unchanged';
    else if (Math.abs(delta) < 0.005) status = 'unchanged';
    else status = delta > 0 ? 'improved' : 'declined';

    mastery.push({
      concept_id: id,
      title: subConceptTitle(id),
      from,
      to,
      delta,
      band_from: bandFrom,
      band_to: bandTo,
      status,
      evidence_from: x?.evidence_count ?? 0,
      evidence_to: y?.evidence_count ?? 0,
      reasons: reasonsFor(changes, id),
    });
  }

  // Revisions are the story, so they lead: what the system took back, then what
  // it strengthened, then what it saw for the first time. Unchanged rows sink.
  const MASTERY_RANK: Record<MasteryDiffRow['status'], number> = {
    declined: 0,
    improved: 1,
    new: 2,
    unchanged: 3,
  };
  mastery.sort((p, q) => {
    if (MASTERY_RANK[p.status] !== MASTERY_RANK[q.status]) return MASTERY_RANK[p.status] - MASTERY_RANK[q.status];
    return Math.abs(q.delta) - Math.abs(p.delta);
  });

  const aX = new Map(a.misconceptions.map((m) => [m.id, m]));
  const bX = new Map(b.misconceptions.map((m) => [m.id, m]));
  // A misconception that was explicitly re-confirmed this span is "persisted"
  // even though its status never moved — staying open after a whole block is a
  // finding, not a non-event, so it must not read as "unchanged".
  const persistedIds = new Set(
    changes.filter((c) => c.kind === 'misconception-persisted').map((c) => c.target),
  );

  const misconceptions: MisconceptionDiffRow[] = [];
  for (const id of new Set([...aX.keys(), ...bX.keys()])) {
    const x = aX.get(id);
    const y = bX.get(id);
    let change: MisconceptionDiffRow['change'] = 'unchanged';
    if (!x && y) change = y.status === 'resolved' ? 'resolved' : 'opened';
    else if (x && y && x.status !== y.status) change = y.status === 'resolved' ? 'resolved' : 'persisted';
    else if (persistedIds.has(id)) change = 'persisted';
    else if (x && y && y.status === 'open' && y.evidence.length > x.evidence.length) change = 'persisted';

    misconceptions.push({
      id,
      name: (y ?? x)!.name,
      student_model: (y ?? x)!.student_model,
      status_from: x?.status ?? null,
      status_to: y?.status ?? null,
      change,
      reasons: reasonsFor(changes, id),
    });
  }
  misconceptions.sort((p, q) => {
    const rank = (r: MisconceptionDiffRow) =>
      r.change === 'resolved' ? 0 : r.change === 'opened' ? 1 : r.change === 'persisted' ? 2 : 3;
    return rank(p) - rank(q);
  });

  const profile: FieldDiffRow[] = [];
  for (const key of Object.keys(PROFILE_LABELS)) {
    const from = String((a.profile as unknown as Record<string, unknown>)[key] ?? '');
    const to = String((b.profile as unknown as Record<string, unknown>)[key] ?? '');
    if (from !== to) {
      profile.push({ field: key, label: PROFILE_LABELS[key], from, to, reason: reasonsFor(changes, key)[0] });
    }
  }

  const engagement: FieldDiffRow[] = [];
  for (const key of Object.keys(ENGAGEMENT_LABELS)) {
    const from = (a.engagement as unknown as Record<string, number>)[key];
    const to = (b.engagement as unknown as Record<string, number>)[key];
    if (typeof from === 'number' && typeof to === 'number' && Math.abs(from - to) > 0.001) {
      engagement.push({
        field: key,
        label: ENGAGEMENT_LABELS[key],
        from: fmt(key, from),
        to: fmt(key, to),
        reason: reasonsFor(changes, key)[0],
      });
    }
  }

  return {
    from_version: a.version,
    to_version: b.version,
    mastery,
    misconceptions,
    profile,
    engagement,
    changes,
    headline: headlineFor(mastery, misconceptions),
  };
}

function fmt(key: string, v: number): string {
  if (key === 'hint_dependency_rate') return `${Math.round(v * 100)}%`;
  if (key === 'avg_seconds_per_question') return `${Math.round(v)}s`;
  return String(Math.round(v * 100) / 100);
}

function headlineFor(mastery: MasteryDiffRow[], misconceptions: MisconceptionDiffRow[]): string {
  const up = mastery.filter((m) => m.status === 'improved').length;
  const down = mastery.filter((m) => m.status === 'declined').length;
  const fresh = mastery.filter((m) => m.status === 'new').length;
  const resolved = misconceptions.filter((m) => m.change === 'resolved').length;
  const opened = misconceptions.filter((m) => m.change === 'opened').length;

  const parts: string[] = [];
  if (fresh) parts.push(`${fresh} sub-concept${fresh > 1 ? 's' : ''} newly evidenced`);
  if (up) parts.push(`${up} strengthened`);
  if (down) parts.push(`${down} revised downward`);
  if (resolved) parts.push(`${resolved} misconception${resolved > 1 ? 's' : ''} resolved`);
  if (opened) parts.push(`${opened} newly surfaced`);
  return parts.length ? parts.join(' · ') : 'No material change';
}

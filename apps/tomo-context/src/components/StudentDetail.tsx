'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { diffSnapshots } from '../context-engine/diff';
import type { ContextSnapshot } from '../context-engine/types';
import { ContextDiff } from './ContextDiff';
import { MasteryMap } from './MasteryMap';
import { Misconceptions } from './Misconceptions';
import { SectionTitle, VersionPill, relativeDate } from './primitives';

type Tab = 'timeline' | 'mastery' | 'misconceptions' | 'json';

const TABS: { id: Tab; label: string }[] = [
  { id: 'timeline', label: 'Context timeline' },
  { id: 'mastery', label: 'Mastery map' },
  { id: 'misconceptions', label: 'Misconceptions' },
  { id: 'json', label: 'Raw JSON' },
];

const TRIGGER_LABEL: Record<string, string> = {
  diagnostic: 'Diagnostic',
  'classroom-complete': 'Classroom completed',
  seed: 'Seeded',
  manual: 'Manual',
};

export function StudentDetail({
  student,
  snapshots,
  classroomTitles,
  nextClassroom,
}: {
  student: { id: string; name: string; grade: number; board: string; section: string; last_activity_at: string | null };
  snapshots: ContextSnapshot[];
  classroomTitles: Record<string, string>;
  nextClassroom: { id: string; title: string } | null;
}) {
  const [tab, setTab] = useState<Tab>('timeline');
  const latest = snapshots[snapshots.length - 1];

  // Default the diff to the most recent step, which is what a viewer wants first.
  const [from, setFrom] = useState(Math.max(1, (latest?.version ?? 1) - 1));
  const [to, setTo] = useState(latest?.version ?? 1);

  const diff = useMemo(() => {
    if (!snapshots.length || from === to) return null;
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const a = snapshots.find((s) => s.version === lo);
    const b = snapshots.find((s) => s.version === hi);
    if (!a || !b) return null;
    return diffSnapshots(
      a,
      b,
      snapshots.filter((s) => s.version > lo && s.version <= hi),
    );
  }, [snapshots, from, to]);

  const viewing = snapshots.find((s) => s.version === to) ?? latest;

  return (
    <div>
      {/* -------- header -------- */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/" className="text-[12.5px] text-ink-mute hover:text-ink">
            ← All students
          </Link>
          <h1 className="mt-1 flex flex-wrap items-baseline gap-3 text-[22px] font-semibold tracking-tight text-ink">
            {student.name}
            <VersionPill v={latest?.version ?? 0} />
          </h1>
          <p className="mt-1 text-[13px] text-ink-mute">
            Grade {student.grade} · {student.board} · {student.section} · last active{' '}
            {relativeDate(student.last_activity_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/compare?a=${student.id}`} className="btn">
            Compare with…
          </Link>
          {nextClassroom ? (
            <Link href={`/classroom/${nextClassroom.id}?student=${student.id}`} className="btn btn-primary">
              Enter {nextClassroom.title} →
            </Link>
          ) : null}
        </div>
      </div>

      {/* -------- where they are right now -------- */}
      {latest ? (
        <div className="card mb-6 px-5 py-4">
          <p className="label mb-1.5">Where {student.name.split(' ')[0]} is right now · v{latest.version}</p>
          <p className="text-[15px] font-medium leading-snug text-ink">{latest.summary}</p>
          <p className="prose-note mt-2.5 max-w-[80ch]">{latest.narrative}</p>
        </div>
      ) : null}

      {/* -------- tabs -------- */}
      <div className="mb-5 flex flex-wrap gap-1 border-b border-paper-rule" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              tab === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-mute hover:text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'timeline' ? (
        <div className="space-y-6">
          <div>
            <SectionTitle hint="Append-only. Each version was written by a completed block, never edited afterwards. Pick any two to diff.">
              Context versions
            </SectionTitle>

            <ol className="flex flex-wrap items-stretch gap-2">
              {snapshots.map((s, i) => {
                const selected = s.version === from || s.version === to;
                const inSpan = s.version > Math.min(from, to) && s.version < Math.max(from, to);
                return (
                  <li key={s.version} className="flex items-stretch">
                    {i > 0 ? (
                      <span
                        className={`mr-2 self-center text-[13px] ${inSpan || selected ? 'text-accent' : 'text-paper-rule'}`}
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                    <button
                      onClick={() => {
                        // Click sets the "to" end and slides "from" behind it;
                        // shift-click pins the "from" end for a wider span.
                        setTo(s.version);
                        setFrom(Math.max(1, s.version - 1));
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setFrom(s.version);
                      }}
                      aria-pressed={selected}
                      className={`w-[210px] rounded-lg border px-3.5 py-3 text-left transition-colors ${
                        selected
                          ? 'border-accent bg-accent-soft'
                          : inSpan
                            ? 'border-accent/40 bg-white'
                            : 'border-paper-rule bg-white hover:border-ink-mute'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <VersionPill v={s.version} muted={!selected} />
                        <span className="text-[11px] text-ink-mute">{relativeDate(s.created_at)}</span>
                      </span>
                      <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-mute">
                        {TRIGGER_LABEL[s.trigger] ?? s.trigger}
                        {s.source_classroom_id ? ` · ${classroomTitles[s.source_classroom_id] ?? ''}` : ''}
                      </span>
                      <span className="mt-1.5 block text-[12px] leading-snug text-ink-soft line-clamp-3">
                        {s.summary}
                      </span>
                      <span className="mt-1.5 block text-[11px] text-ink-mute">
                        {s.changes.length} recorded change{s.changes.length === 1 ? '' : 's'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <p className="mt-2 text-[11.5px] text-ink-mute">
              Click a version to diff it against the one before. Right-click a version to pin it as the
              left-hand side and compare across a wider span.
            </p>
          </div>

          {diff ? (
            <div>
              <SectionTitle hint="What the system learned, what it revised, and what it now believes.">
                Diff
              </SectionTitle>
              <ContextDiff diff={diff} />
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-paper-rule px-4 py-8 text-center text-[13px] text-ink-mute">
              Only one version so far — there is nothing to diff yet.
            </div>
          )}

          {viewing && viewing.changes.length ? (
            <div>
              <SectionTitle hint={`Every change recorded when v${viewing.version} was written, with the student action that caused it.`}>
                Change log · v{viewing.version}
              </SectionTitle>
              <ul className="card divide-y divide-paper-rule">
                {viewing.changes.map((c, i) => (
                  <li key={i} className="px-4 py-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span
                        className={`chip ${
                          c.direction === 'up'
                            ? 'bg-strong-soft text-strong'
                            : c.direction === 'down'
                              ? 'bg-gap-soft text-gap'
                              : 'bg-untouched-soft text-ink-mute'
                        }`}
                      >
                        {c.kind.replace(/-/g, ' ')}
                      </span>
                      <span className="text-[13px] font-medium text-ink">{c.label}</span>
                      <span className="ml-auto font-mono text-[11.5px] text-ink-mute">
                        {c.from === null ? '—' : c.from} → {c.to === null ? '—' : c.to}
                      </span>
                    </div>
                    <p className="prose-note mt-1.5">{c.reason}</p>
                    {c.evidence_refs.length ? (
                      <p className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.evidence_refs.map((r) => (
                          <span key={r} className="rounded bg-untouched-soft px-1.5 py-0.5 font-mono text-[10.5px] text-ink-mute">
                            {r}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'mastery' ? (
        <div>
          <SectionTitle hint="Every sub-concept in the theme. Click one to see the book's own definition and the engine's note.">
            Concept mastery · v{viewing?.version ?? 0}
          </SectionTitle>
          <MasteryMap
            mastery={viewing?.mastery ?? []}
            compareTo={snapshots.find((s) => s.version === Math.min(from, to))?.mastery}
          />
        </div>
      ) : null}

      {tab === 'misconceptions' ? (
        <div>
          <SectionTitle hint="Specific wrong models this student has demonstrated, with the exchange that demonstrated them.">
            Misconceptions
          </SectionTitle>
          <Misconceptions items={viewing?.misconceptions ?? []} />
        </div>
      ) : null}

      {tab === 'json' ? (
        <div>
          <SectionTitle
            hint="The actual persisted object for this version. This is what the planner reads before generating anything."
            right={
              <select
                value={to}
                onChange={(e) => setTo(Number(e.target.value))}
                aria-label="Version to show"
                className="rounded-md border border-paper-rule bg-white px-2.5 py-1.5 text-[12.5px]"
              >
                {snapshots.map((s) => (
                  <option key={s.version} value={s.version}>
                    v{s.version}
                  </option>
                ))}
              </select>
            }
          >
            Raw context object
          </SectionTitle>
          <pre className="card max-h-[70vh] overflow-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed text-ink-soft">
            {JSON.stringify(viewing, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

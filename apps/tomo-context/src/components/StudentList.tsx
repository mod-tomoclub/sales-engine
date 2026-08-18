'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { MasteryBand } from '../context-engine/types';
import { BAND_STYLE, VersionPill, relativeDate } from './primitives';

export type StudentRow = {
  id: string;
  name: string;
  grade: number;
  board: string;
  section: string;
  version: number;
  last_activity_at: string | null;
  summary: string;
  bands: Record<MasteryBand, number>;
  open_misconceptions: number;
  next_classroom: string | null;
};

type Filter = 'all' | 'has-context' | 'no-context' | 'open-misconceptions';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'has-context', label: 'Has context' },
  { id: 'open-misconceptions', label: 'Open misconceptions' },
  { id: 'no-context', label: 'Not yet diagnosed' },
];

export function StudentList({ rows }: { rows: StudentRow[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle && !`${r.name} ${r.section} ${r.summary}`.toLowerCase().includes(needle)) return false;
      if (filter === 'has-context') return r.version > 0;
      if (filter === 'no-context') return r.version === 0;
      if (filter === 'open-misconceptions') return r.open_misconceptions > 0;
      return true;
    });
  }, [rows, q, filter]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students…"
            aria-label="Search students"
            className="w-full rounded-md border border-paper-rule bg-white px-3.5 py-2.5 text-[13.5px] text-ink
                       placeholder:text-ink-mute focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter students">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-md border px-3 py-2 text-[12.5px] font-medium transition-colors ${
                filter === f.id
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-paper-rule bg-white text-ink-soft hover:border-ink-mute'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Link href="/onboard" className="btn btn-primary">
          + New student
        </Link>
      </div>

      <ul className="space-y-2.5">
        {shown.map((r) => (
          <li key={r.id}>
            <Link
              href={r.version > 0 ? `/students/${r.id}` : `/onboard?student=${r.id}`}
              className="card group block px-5 py-4 transition-colors hover:border-ink-mute"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[15px] font-semibold tracking-tight text-ink">{r.name}</span>
                <span className="text-[12.5px] text-ink-mute">
                  Grade {r.grade} · {r.board} · {r.section}
                </span>
                {r.version > 0 ? (
                  <VersionPill v={r.version} />
                ) : (
                  <span className="chip bg-untouched-soft text-ink-mute">No context yet</span>
                )}
                {r.open_misconceptions > 0 ? (
                  <span className="chip bg-gap-soft text-gap">
                    {r.open_misconceptions} open misconception{r.open_misconceptions > 1 ? 's' : ''}
                  </span>
                ) : null}
                <span className="ml-auto text-[12px] text-ink-mute">
                  Last active {relativeDate(r.last_activity_at)}
                </span>
              </div>

              <p className="prose-note mt-2 max-w-[78ch]">{r.summary}</p>

              {r.version > 0 ? (
                <div className="mt-3 flex items-center gap-4">
                  <BandStrip bands={r.bands} />
                  {r.next_classroom ? (
                    <span className="text-[12px] text-ink-mute">
                      Next up: <span className="text-ink-soft">{r.next_classroom}</span>
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] font-medium text-accent group-hover:underline">
                  Run the 5-question diagnostic →
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {shown.length === 0 ? (
        <div className="rounded-md border border-dashed border-paper-rule px-4 py-10 text-center text-[13px] text-ink-mute">
          No students match “{q}”.
        </div>
      ) : null}
    </div>
  );
}

/**
 * A compact read of where the student is across every sub-concept in the theme.
 * Widths are proportional, and the counts are written out so the bar never
 * carries the meaning by colour alone.
 */
function BandStrip({ bands }: { bands: Record<MasteryBand, number> }) {
  const order: MasteryBand[] = ['strong', 'shaky', 'gap', 'untouched'];
  const total = order.reduce((n, b) => n + bands[b], 0) || 1;
  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="flex h-1.5 w-full max-w-[280px] overflow-hidden rounded-full">
        {order.map((b) =>
          bands[b] ? (
            <div key={b} className={BAND_STYLE[b].bar} style={{ width: `${(bands[b] / total) * 100}%` }} />
          ) : null,
        )}
      </div>
      <span className="whitespace-nowrap text-[11.5px] text-ink-mute">
        {bands.strong} secure · {bands.shaky} shaky · {bands.gap} not yet
      </span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { StudentMisconception } from '../context-engine/types';
import { Empty } from './primitives';

const STATUS_STYLE: Record<StudentMisconception['status'], { chip: string; label: string }> = {
  open: { chip: 'bg-gap-soft text-gap', label: 'Open' },
  monitoring: { chip: 'bg-shaky-soft text-shaky', label: 'Monitoring' },
  resolved: { chip: 'bg-strong-soft text-strong', label: 'Resolved' },
};

export function Misconceptions({ items }: { items: StudentMisconception[] }) {
  const [open, setOpen] = useState<string | null>(items.find((m) => m.status === 'open')?.id ?? null);

  if (!items.length) {
    return <Empty>No misconceptions recorded. Nothing has been evidenced against this student yet.</Empty>;
  }

  const sorted = [...items].sort((a, b) => {
    const rank = (m: StudentMisconception) => (m.status === 'open' ? 0 : m.status === 'monitoring' ? 1 : 2);
    return rank(a) - rank(b) || a.id.localeCompare(b.id);
  });

  return (
    <ul className="space-y-2">
      {sorted.map((m) => {
        const isOpen = open === m.id;
        const s = STATUS_STYLE[m.status];
        return (
          <li key={m.id} className="card overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : m.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-paper"
            >
              <span className={`chip mt-0.5 shrink-0 ${s.chip}`}>{s.label}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-ink">{m.name}</span>
                <span className="mt-0.5 block text-[12.5px] italic leading-relaxed text-ink-soft">
                  “{m.student_model}”
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-ink-mute">
                {m.status === 'resolved' ? `v${m.first_seen_version}→v${m.resolved_at_version}` : `since v${m.first_seen_version}`}
              </span>
            </button>

            {isOpen ? (
              <div className="animate-rise border-t border-paper-rule bg-paper px-4 py-3">
                {m.resolution_note ? (
                  <p className="mb-3 rounded-md bg-strong-soft px-3 py-2 text-[12.5px] leading-relaxed text-strong">
                    <span className="label mr-2 text-strong">Resolved at v{m.resolved_at_version}</span>
                    {m.resolution_note}
                  </p>
                ) : null}

                <p className="label mb-2">Evidence ({m.evidence.length})</p>
                <ul className="space-y-2.5">
                  {m.evidence.map((e, i) => (
                    <li key={`${e.item_id}-${i}`} className="rounded-md border border-paper-rule bg-white px-3 py-2.5">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-mute">
                        <span className="rounded bg-untouched-soft px-1.5 py-0.5 font-mono">{e.item_id}</span>
                        <span className="uppercase tracking-wide">{e.source}</span>
                        <span>·</span>
                        <span>v{e.version}</span>
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-ink">{e.item_text}</p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-gap">
                        <span className="label mr-2 text-gap">Said</span>
                        {e.student_answer}
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-strong">
                        <span className="label mr-2 text-strong">Book</span>
                        {e.expected_answer}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-mute">{e.note}</p>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-[11.5px] text-ink-mute">
                  Attacks: <span className="font-mono">{m.concept_ids.join(', ')}</span>
                </p>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

'use client';

import { useState } from 'react';
import { bandOf, type ConceptMastery, type MasteryBand } from '../context-engine/types';
import { CLASSROOMS } from '../curriculum';
import { BAND_STYLE, ConfidenceBar } from './primitives';

/**
 * Where the student is, across every sub-concept in the theme, grouped by
 * classroom so the shape of the gap is readable at a glance: a student who is
 * secure in Classroom 1 and untouched in Classroom 2 looks different from one
 * who is shaky everywhere.
 */
export function MasteryMap({
  mastery,
  compareTo,
  dense = false,
}: {
  mastery: ConceptMastery[];
  /** Optional earlier snapshot's mastery, to draw the previous value as a ghost. */
  compareTo?: ConceptMastery[];
  dense?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const byId = new Map(mastery.map((m) => [m.concept_id, m]));
  const prevById = new Map((compareTo ?? []).map((m) => [m.concept_id, m]));

  return (
    <div className="space-y-5">
      {CLASSROOMS.map((c) => {
        const rows = c.sub_concepts.map((sc) => {
          const m = byId.get(sc.id);
          const band: MasteryBand = m ? bandOf(m) : 'untouched';
          return { sc, m, band, prev: prevById.get(sc.id) };
        });
        const counts = rows.reduce(
          (acc, r) => ({ ...acc, [r.band]: (acc[r.band] ?? 0) + 1 }),
          {} as Record<MasteryBand, number>,
        );

        return (
          <section key={c.concept_id}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="text-[13px] font-semibold tracking-tight text-ink">{c.title}</h3>
              <span className="text-[11.5px] text-ink-mute">
                {counts.strong ?? 0} secure · {counts.shaky ?? 0} shaky · {counts.gap ?? 0} not yet ·{' '}
                {counts.untouched ?? 0} untouched
              </span>
            </div>

            <ul className={dense ? 'space-y-1' : 'space-y-1.5'}>
              {rows.map(({ sc, m, band, prev }) => {
                const isOpen = open === sc.id;
                const moved = m && prev && Math.abs(m.confidence - prev.confidence) >= 0.005;
                return (
                  <li key={sc.id}>
                    <button
                      onClick={() => setOpen(isOpen ? null : sc.id)}
                      aria-expanded={isOpen}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-md px-2 py-1.5 text-left
                                 transition-colors hover:bg-paper-card"
                    >
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className={`text-[11px] ${BAND_STYLE[band].fg}`} aria-hidden>
                            {BAND_STYLE[band].dot}
                          </span>
                          <span className="truncate text-[13px] text-ink-soft">{sc.title}</span>
                          <span className="shrink-0 font-mono text-[10.5px] uppercase text-ink-mute">{sc.tier}</span>
                        </span>
                        <span className="mt-1 block max-w-[420px]">
                          <ConfidenceBar value={m?.confidence ?? 0} band={band} />
                        </span>
                      </span>

                      <span className="text-right">
                        <span className="block font-mono text-[12px] font-semibold text-ink">
                          {m ? m.confidence.toFixed(2) : '—'}
                        </span>
                        <span className="block text-[10.5px] text-ink-mute">
                          {moved ? (
                            <span className={m!.confidence > prev!.confidence ? 'text-strong' : 'text-gap'}>
                              was {prev!.confidence.toFixed(2)}
                            </span>
                          ) : (
                            `${m?.evidence_count ?? 0} obs`
                          )}
                        </span>
                      </span>
                    </button>

                    {isOpen ? (
                      <div className="animate-rise mx-2 mb-1 rounded-md border border-paper-rule bg-paper-card px-3 py-2.5">
                        <p className="text-[12.5px] leading-relaxed text-ink-soft">
                          <span className="label mr-2">Book</span>
                          {sc.book_definition_verbatim}
                        </p>
                        {sc.discriminator ? (
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                            <span className="label mr-2">Test</span>
                            {sc.discriminator}
                          </p>
                        ) : null}
                        {m?.note ? (
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-accent">
                            <span className="label mr-2">Engine</span>
                            {m.note}
                          </p>
                        ) : null}
                        <p className="mt-1.5 text-[11.5px] text-ink-mute">
                          {m
                            ? `${m.evidence_count} observation${m.evidence_count === 1 ? '' : 's'} · trend ${m.trend} · p. ${sc.page}`
                            : `No evidence yet · p. ${sc.page}`}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

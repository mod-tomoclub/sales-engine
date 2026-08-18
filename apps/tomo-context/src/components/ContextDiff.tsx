'use client';

import type { SnapshotDiff } from '../context-engine/diff';
import { BAND_STYLE, ConfidenceBar, Delta, VersionPill } from './primitives';

const CHANGE_ROW_STYLE: Record<string, string> = {
  opened: 'bg-gap-soft text-gap',
  persisted: 'bg-shaky-soft text-shaky',
  resolved: 'bg-strong-soft text-strong',
  unchanged: 'bg-untouched-soft text-ink-mute',
};

/**
 * What the system learned, what it revised, and what it now believes.
 * Every row carries the recorded reason, so nothing on this screen is a number
 * the viewer has to take on trust.
 */
export function ContextDiff({ diff, compact = false }: { diff: SnapshotDiff; compact?: boolean }) {
  const moved = diff.mastery.filter((m) => m.status !== 'unchanged');

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/25 bg-accent-soft px-4 py-3">
        <VersionPill v={diff.from_version} muted />
        <span className="text-ink-mute" aria-hidden>
          →
        </span>
        <VersionPill v={diff.to_version} />
        <span className="text-[13px] font-medium text-accent">{diff.headline}</span>
      </div>

      {/* ---- mastery ---- */}
      <section>
        <h3 className="label mb-2">Concept mastery</h3>
        {moved.length === 0 ? (
          <p className="text-[13px] text-ink-mute">No confidence values moved between these versions.</p>
        ) : (
          <ul className="space-y-2">
            {moved.map((m) => (
              <li key={m.concept_id} className="card px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[13.5px] font-medium text-ink">{m.title}</span>
                  <span className="font-mono text-[11px] text-ink-mute">{m.concept_id}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="font-mono text-[12px] text-ink-mute">
                      {m.from === null ? '—' : m.from.toFixed(2)}
                    </span>
                    <span className="text-ink-mute" aria-hidden>
                      →
                    </span>
                    <span className="font-mono text-[12.5px] font-semibold text-ink">
                      {m.to === null ? '—' : m.to.toFixed(2)}
                    </span>
                    <Delta from={m.from} to={m.to} />
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <ConfidenceBar value={m.from ?? 0} band={m.band_from} />
                  <span className="text-[10px] text-ink-mute" aria-hidden>
                    ▸
                  </span>
                  <ConfidenceBar value={m.to ?? 0} band={m.band_to} animate />
                </div>

                {m.band_from !== m.band_to ? (
                  <p className="mt-2 text-[11.5px]">
                    <span className={BAND_STYLE[m.band_from].fg}>{BAND_STYLE[m.band_from].label}</span>
                    <span className="mx-1.5 text-ink-mute" aria-hidden>
                      →
                    </span>
                    <span className={`font-semibold ${BAND_STYLE[m.band_to].fg}`}>{BAND_STYLE[m.band_to].label}</span>
                  </p>
                ) : null}

                {m.reasons.map((r, i) => (
                  <p key={i} className="prose-note mt-2 border-l-2 border-paper-rule pl-3">
                    {r}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- misconceptions ---- */}
      {diff.misconceptions.some((m) => m.change !== 'unchanged') ? (
        <section>
          <h3 className="label mb-2">Misconceptions</h3>
          <ul className="space-y-2">
            {diff.misconceptions
              .filter((m) => m.change !== 'unchanged')
              .map((m) => (
                <li key={m.id} className="card px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`chip ${CHANGE_ROW_STYLE[m.change]}`}>
                      {m.change === 'opened'
                        ? 'Newly surfaced'
                        : m.change === 'resolved'
                          ? 'Resolved'
                          : 'Still present'}
                    </span>
                    <span className="text-[13.5px] font-medium text-ink">{m.name}</span>
                    <span className="ml-auto font-mono text-[11px] text-ink-mute">{m.id}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] italic leading-relaxed text-ink-soft">“{m.student_model}”</p>
                  {m.reasons.map((r, i) => (
                    <p key={i} className="prose-note mt-2 border-l-2 border-paper-rule pl-3">
                      {r}
                    </p>
                  ))}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {/* ---- profile ---- */}
      {diff.profile.length ? (
        <section>
          <h3 className="label mb-2">Learning profile</h3>
          <ul className="space-y-2">
            {diff.profile.map((p) => (
              <li key={p.field} className="card px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[13px] font-medium text-ink">{p.label}</span>
                  <span className="ml-auto flex items-center gap-2 text-[12.5px]">
                    <span className="text-ink-mute line-through">{p.from}</span>
                    <span className="text-ink-mute" aria-hidden>
                      →
                    </span>
                    <span className="font-semibold text-accent">{p.to}</span>
                  </span>
                </div>
                {p.reason ? <p className="prose-note mt-2 border-l-2 border-paper-rule pl-3">{p.reason}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ---- engagement ---- */}
      {diff.engagement.length && !compact ? (
        <section>
          <h3 className="label mb-2">Engagement signals</h3>
          <div className="card divide-y divide-paper-rule">
            {diff.engagement.map((e) => (
              <div key={e.field} className="flex items-baseline justify-between px-4 py-2.5">
                <span className="text-[13px] text-ink-soft">{e.label}</span>
                <span className="flex items-center gap-2 font-mono text-[12.5px]">
                  <span className="text-ink-mute">{e.from}</span>
                  <span className="text-ink-mute" aria-hidden>
                    →
                  </span>
                  <span className="font-semibold text-ink">{e.to}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

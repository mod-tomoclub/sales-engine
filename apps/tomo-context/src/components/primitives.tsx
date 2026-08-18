import type { MasteryBand } from '../context-engine/types';

export const BAND_STYLE: Record<MasteryBand, { bg: string; fg: string; bar: string; label: string; dot: string }> = {
  strong: { bg: 'bg-strong-soft', fg: 'text-strong', bar: 'bg-strong', label: 'Secure', dot: '●' },
  shaky: { bg: 'bg-shaky-soft', fg: 'text-shaky', bar: 'bg-shaky', label: 'Shaky', dot: '◐' },
  gap: { bg: 'bg-gap-soft', fg: 'text-gap', bar: 'bg-gap', label: 'Not yet', dot: '○' },
  untouched: { bg: 'bg-untouched-soft', fg: 'text-untouched', bar: 'bg-untouched', label: 'Untouched', dot: '·' },
};

export function BandChip({ band, children }: { band: MasteryBand; children?: React.ReactNode }) {
  const s = BAND_STYLE[band];
  return (
    <span className={`chip ${s.bg} ${s.fg}`}>
      <span aria-hidden>{s.dot}</span>
      {children ?? s.label}
    </span>
  );
}

/** A confidence bar. The width animates, because the width is the information. */
export function ConfidenceBar({
  value,
  band,
  animate = false,
  height = 'h-1.5',
}: {
  value: number;
  band: MasteryBand;
  animate?: boolean;
  height?: string;
}) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-paper-rule/70 ${height}`}>
      <div
        className={`${height} rounded-full ${BAND_STYLE[band].bar} ${animate ? 'animate-bar' : ''}`}
        style={{ width: `${Math.max(2, Math.round(value * 100))}%` }}
      />
    </div>
  );
}

export function VersionPill({ v, muted = false }: { v: number; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
        muted ? 'bg-untouched-soft text-ink-mute' : 'bg-accent-soft text-accent'
      }`}
    >
      v{v}
    </span>
  );
}

export function Delta({ from, to }: { from: number | null; to: number | null }) {
  if (from === null || to === null) return <span className="font-mono text-[12px] text-ink-mute">new</span>;
  const d = to - from;
  if (Math.abs(d) < 0.005) return <span className="font-mono text-[12px] text-ink-mute">—</span>;
  const up = d > 0;
  return (
    <span className={`font-mono text-[12px] font-semibold ${up ? 'text-strong' : 'text-gap'}`}>
      {up ? '▲' : '▼'} {up ? '+' : ''}
      {d.toFixed(2)}
    </span>
  );
}

export function SectionTitle({
  children,
  hint,
  right,
}: {
  children: React.ReactNode;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">{children}</h2>
        {hint ? <p className="mt-0.5 text-[12.5px] text-ink-mute">{hint}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-paper-rule px-4 py-6 text-center text-[13px] text-ink-mute">
      {children}
    </div>
  );
}

export function relativeDate(iso: string | null): string {
  if (!iso) return 'never';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

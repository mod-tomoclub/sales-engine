/** Shared UI atoms used across all three surfaces. */
import type { ReactNode } from "react";
import { UNIT_STATE_META, type UnitState } from "../domain/mastery";

export function StateDot({ state, size = 10 }: { state: UnitState; size?: number }) {
  const m = UNIT_STATE_META[state];
  return <span title={m.label} style={{ width: size, height: size, borderRadius: 999, background: m.color, display: "inline-block", flex: "0 0 auto" }} />;
}

export function MasteryPill({ state }: { state: UnitState }) {
  const m = UNIT_STATE_META[state];
  return (
    <span className="chip" style={{ background: "transparent", borderColor: m.color, color: m.color, fontWeight: 700 }}>
      <StateDot state={state} size={7} /> {m.label}
    </span>
  );
}

export function Coin({ n }: { n: number }) {
  return (
    <span className="row gap-4" style={{ fontWeight: 700, color: "var(--ink)" }}>
      <span style={{ color: "var(--coin)" }}>◉</span>
      <span className="mono">{n}</span>
    </span>
  );
}

export function Ring({ value, size = 44, stroke = 5, color = "var(--accent)" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

export function Bar({ value, color = "var(--accent)", height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ background: "var(--bg-sunken)", borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color, height: "100%", borderRadius: 999, transition: "width .3s ease" }} />
    </div>
  );
}

export function StatTile({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: string }) {
  return (
    <div className="card card-pad" style={{ minWidth: 0 }}>
      <div className="small muted" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 750, letterSpacing: "-0.02em", color: accent ?? "var(--ink)" }}>{value}</div>
      {sub && <div className="small muted" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Avatar({ emoji, size = 34, ring }: { emoji: string; size?: number; ring?: string }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-sunken)", fontSize: size * 0.55, flex: "0 0 auto", boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {emoji}
    </span>
  );
}

export function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="row" style={{ background: "var(--bg-sunken)", borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="row gap-8"
          style={{
            border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 14px", fontSize: 13.5, fontWeight: 650,
            background: value === o.value ? "var(--bg-elev)" : "transparent",
            color: value === o.value ? "var(--ink)" : "var(--ink-3)",
            boxShadow: value === o.value ? "var(--shadow-1)" : "none",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="stack" style={{ alignItems: "center", justifyContent: "center", padding: "48px 20px", textAlign: "center", gap: 8 }}>
      <div style={{ fontSize: 40 }}>{icon}</div>
      <div style={{ fontWeight: 700 }}>{title}</div>
      {sub && <div className="muted small" style={{ maxWidth: 340 }}>{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{children}</h3>
      {right}
    </div>
  );
}

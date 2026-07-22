/** Declarative question visuals — place-value blocks, arrays, number lines. */
import type { Visual } from "../../mathlab/types";

const ROOM = [
  { key: "thousands", label: "Th", color: "#6d5cf5" },
  { key: "hundreds", label: "H", color: "#2f80ed" },
  { key: "tens", label: "T", color: "#e08a1e" },
  { key: "ones", label: "O", color: "#23a26d" },
] as const;

function PlaceValue({ v }: { v: Extract<Visual, { kind: "place-value" }> }) {
  const rooms = ROOM.filter((r) => r.key !== "thousands" || v.thousands !== undefined);
  return (
    <div className="row gap-8 wrap" style={{ alignItems: "stretch" }}>
      {rooms.map((r) => {
        const n = (v as unknown as Record<string, number | undefined>)[r.key] ?? 0;
        return (
          <div key={r.key} className="stack" style={{ flex: 1, minWidth: 76, border: `1px solid var(--line)`, borderRadius: 10, overflow: "hidden" }}>
            <div className="small" style={{ background: r.color, color: "#fff", textAlign: "center", fontWeight: 700, padding: "2px 0" }}>{r.label}</div>
            <div className="row wrap gap-4" style={{ padding: 8, minHeight: 46, alignContent: "flex-start", justifyContent: "center" }}>
              {n === 0 ? (
                <span className="small muted" style={{ fontStyle: "italic" }}>empty</span>
              ) : (
                Array.from({ length: Math.min(n, 10) }).map((_, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: r.color, opacity: 0.85 }} />
                ))
              )}
            </div>
            <div className="mono" style={{ textAlign: "center", fontWeight: 700, fontSize: 16, paddingBottom: 6 }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
}

function Arr({ v }: { v: Extract<Visual, { kind: "array" }> }) {
  const rows = Math.min(v.rows, 12);
  const cols = Math.min(v.cols, 12);
  return (
    <div className="stack gap-4" style={{ alignItems: "flex-start" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="row gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <span key={c} style={{ fontSize: 17, lineHeight: 1 }}>{v.emoji}</span>
          ))}
        </div>
      ))}
      <span className="small muted mono">{rows} rows × {cols} in each row</span>
    </div>
  );
}

function Groups({ v }: { v: Extract<Visual, { kind: "groups" }> }) {
  const groups = Math.min(v.groups, 8);
  const per = Math.min(v.per, 10);
  return (
    <div className="stack gap-8">
      <div className="row gap-8 wrap">
        {Array.from({ length: groups }).map((_, g) => (
          <div key={g} className="row wrap gap-4" style={{ border: "1px dashed var(--line-strong)", borderRadius: 10, padding: "6px 8px", maxWidth: 128 }}>
            {Array.from({ length: per }).map((_, i) => (
              <span key={i} style={{ fontSize: 15, lineHeight: 1 }}>{v.emoji}</span>
            ))}
          </div>
        ))}
      </div>
      <span className="small muted mono">
        {v.groups} group{v.groups === 1 ? "" : "s"} of {v.per}
        {(v.groups > groups || v.per > per) && " (showing part)"}
      </span>
    </div>
  );
}

function NumberLine({ v }: { v: Extract<Visual, { kind: "number-line" }> }) {
  const ticks: number[] = [];
  for (let n = v.from; n <= v.to; n += v.step) ticks.push(n);
  const span = v.to - v.from || 1;
  const pct = (n: number) => ((n - v.from) / span) * 100;
  return (
    <div style={{ padding: "18px 10px 4px", position: "relative" }}>
      <div style={{ height: 3, background: "var(--line-strong)", borderRadius: 2, position: "relative" }}>
        {ticks.map((t) => (
          <div key={t} style={{ position: "absolute", left: `${pct(t)}%`, transform: "translateX(-50%)", top: -5 }}>
            <div style={{ width: 2, height: 12, background: "var(--line-strong)", margin: "0 auto" }} />
            <div className="small mono muted" style={{ marginTop: 3 }}>{t}</div>
          </div>
        ))}
        {v.mark !== undefined && (
          <div style={{ position: "absolute", left: `${pct(v.mark)}%`, transform: "translateX(-50%)", top: -26 }}>
            <div className="chip mono" style={{ borderColor: "var(--accent)", color: "var(--accent-ink)", background: "var(--accent-soft)", padding: "1px 8px" }}>{v.mark}</div>
            <div style={{ width: 2, height: 10, background: "var(--accent)", margin: "0 auto" }} />
          </div>
        )}
      </div>
      <div style={{ height: 22 }} />
    </div>
  );
}

function FractionBar({ v }: { v: Extract<Visual, { kind: "fraction-bar" }> }) {
  return (
    <div className="stack gap-4">
      <div className="row" style={{ border: "1px solid var(--line-strong)", borderRadius: 8, overflow: "hidden", height: 34 }}>
        {Array.from({ length: v.parts }).map((_, i) => (
          <div key={i} style={{ flex: 1, background: i < v.shaded ? "var(--accent)" : "var(--bg-sunken)", borderRight: i < v.parts - 1 ? "1px solid var(--line-strong)" : undefined }} />
        ))}
      </div>
      <span className="small muted mono">{v.shaded} of {v.parts} equal parts</span>
    </div>
  );
}

function ColumnSum({ v }: { v: Extract<Visual, { kind: "column-sum" }> }) {
  const width = Math.max(String(v.top).length, String(v.bottom).length + 1);
  const pad = (n: number | string) => String(n).padStart(width, " ");
  return (
    <pre className="mono" style={{ margin: 0, fontSize: 19, lineHeight: 1.35, background: "var(--bg-sunken)", padding: "12px 16px", borderRadius: 10, display: "inline-block", fontWeight: 650 }}>
{pad(v.top)}
{"\n"}{v.op}{pad(v.bottom).slice(1)}
{"\n"}{"─".repeat(width)}
    </pre>
  );
}

export function VisualBlock({ visual }: { visual: Visual }) {
  return (
    <div style={{ margin: "10px 0 14px" }}>
      {visual.kind === "place-value" && <PlaceValue v={visual} />}
      {visual.kind === "array" && <Arr v={visual} />}
      {visual.kind === "groups" && <Groups v={visual} />}
      {visual.kind === "number-line" && <NumberLine v={visual} />}
      {visual.kind === "fraction-bar" && <FractionBar v={visual} />}
      {visual.kind === "column-sum" && <ColumnSum v={visual} />}
    </div>
  );
}

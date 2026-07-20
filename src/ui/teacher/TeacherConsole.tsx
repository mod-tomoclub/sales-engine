import { useMemo, useState } from "react";
import { useApp, ops } from "../../state/AppContext";
import { UNIT_STATE_META, type UnitState } from "../../domain/mastery";
import { classForSubject } from "../selectors";
import { Avatar, MasteryPill, SectionTitle, StatTile, StateDot } from "../components";

const ENROLLED_GRADE = 4;

/** Priority score for the "support next" ranked list (School AI insight, §14.5). */
function priority(row: { openFlags: number; dueRetention: number; focusState: UnitState | null; workingLevelDelta: number }): number {
  let p = row.openFlags * 5 + row.dueRetention * 1.5;
  if (row.focusState === "SUMMATION_DUE") p += 2;
  if (row.focusState === "REFRESH_NEEDED") p += 3;
  if (row.workingLevelDelta < 0) p += Math.abs(row.workingLevelDelta) * 2;
  return p;
}

export function TeacherConsole() {
  const app = useApp();
  const [subjectKey, setSubjectKey] = useState("math");
  const studentIds = app.students.map((s) => s.id);

  const rows = useMemo(
    () => classForSubject(app.graph, app.state, studentIds, subjectKey, ENROLLED_GRADE).sort((a, b) => priority(b) - priority(a)),
    [app.graph, app.state, subjectKey],
  );

  const openFlags = app.state.flags.filter((f) => f.status !== "closed");
  const student = (id: string) => app.students.find((s) => s.id === id)!;

  // Misconception clusters: group open misconception/stuck flags by detail text.
  const clusters = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const f of openFlags) {
      if (f.kind === "misconception" || f.kind === "stuck") {
        const k = f.detail;
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(f.studentId);
      }
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [openFlags]);

  const stateDist = useMemo(() => {
    const d: Record<string, number> = {};
    for (const r of rows) if (r.focusState) d[r.focusState] = (d[r.focusState] ?? 0) + 1;
    return d;
  }, [rows]);

  const needCount = rows.filter((r) => priority(r) > 0).length;

  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="stack" style={{ gap: 2 }}>
          <h2 style={{ fontSize: 20 }}>Grade 4 · Live Concept Block</h2>
          <span className="muted small">Pilot class · {app.students.length} students · School AI insight feed</span>
        </div>
        <div className="row gap-12">
          <select className="student-select" value={subjectKey} onChange={(e) => setSubjectKey(e.target.value)}>
            {app.graph.subjects.map((s) => (<option key={s.key} value={s.key}>{s.name}</option>))}
          </select>
          <button className="btn sm secondary" title="Fallback print mode is a first-class flow — a fallback session is not a failure (§16).">🖨️ Print fallback</button>
        </div>
      </div>

      <div className="grid four-col">
        <StatTile label="Need support now" value={needCount} sub="ranked below" accent={needCount ? "var(--warn)" : "var(--good)"} />
        <StatTile label="Open flags" value={openFlags.length} sub="tracked to closure" />
        <StatTile label="Retention due" value={rows.reduce((a, r) => a + r.dueRetention, 0)} sub="across the class" />
        <StatTile label="On/above grade" value={rows.filter((r) => r.workingLevelDelta >= 0).length} sub={`of ${rows.length}`} accent="var(--good)" />
      </div>

      <div className="grid two-col">
        {/* Support-next ranked list */}
        <div className="card card-pad">
          <SectionTitle right={<span className="badge-soft">who to help</span>}>Support next</SectionTitle>
          <div className="seg-list">
            {rows.map((r, i) => {
              const s = student(r.studentId);
              const flags = openFlags.filter((f) => f.studentId === r.studentId);
              const p = priority(r);
              const minute = 8 + i * 3; // illustrative "support at min ~N"
              return (
                <div key={r.studentId} className="trow" style={{ gridTemplateColumns: "auto 1fr auto", borderColor: p > 4 ? "var(--warn)" : "var(--line)", background: p > 4 ? "var(--warn-soft)" : undefined }}>
                  <Avatar emoji={s.avatar} />
                  <div className="stack" style={{ gap: 3, minWidth: 0 }}>
                    <div className="row gap-8">
                      <strong style={{ fontSize: 14 }}>{s.name}</strong>
                      {r.focusState && <MasteryPill state={r.focusState} />}
                      {r.workingLevelDelta < 0 && <span className="chip" style={{ color: "var(--warn)", borderColor: "var(--warn)" }}>{Math.abs(r.workingLevelDelta)}y below</span>}
                    </div>
                    <span className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.focusUnit ? r.focusUnit.title : "no active unit"}
                      {flags.length > 0 && <> · <span style={{ color: "var(--warn)" }}>{flags[0].detail}</span></>}
                    </span>
                    {p > 4 && <span className="small" style={{ color: "var(--warn)", fontWeight: 650 }}>💡 Support {s.name} around min {minute}{flags[0] ? ` — ${flags[0].kind}` : r.focusState === "SUMMATION_DUE" ? " — summation proctor" : ""}</span>}
                  </div>
                  <div className="row gap-8" style={{ justifyContent: "flex-end" }}>
                    {r.dueRetention > 0 && <span className="chip code">{r.dueRetention}×D+</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: misconception clusters + block distribution */}
        <div className="stack gap-16">
          <div className="card card-pad">
            <SectionTitle>Misconception clusters</SectionTitle>
            {clusters.length === 0 ? (
              <div className="small muted">No open clusters — nice.</div>
            ) : (
              <div className="seg-list">
                {clusters.map(([detail, ids]) => (
                  <div key={detail} className="trow" style={{ gridTemplateColumns: "1fr auto" }}>
                    <div className="stack" style={{ gap: 3 }}>
                      <strong style={{ fontSize: 13.5 }}>{detail}</strong>
                      <div className="row gap-4">{ids.map((id) => <Avatar key={id} emoji={student(id).avatar} size={22} />)}</div>
                    </div>
                    <span className="badge-soft">{ids.length}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-pad">
            <SectionTitle>Live block distribution</SectionTitle>
            <div className="stack gap-8">
              {(Object.keys(stateDist) as UnitState[]).sort((a, b) => stateDist[b] - stateDist[a]).map((st) => (
                <div key={st} className="row gap-12">
                  <StateDot state={st} />
                  <span className="small" style={{ width: 110 }}>{UNIT_STATE_META[st].label}</span>
                  <div className="grow"><div style={{ height: 18, background: UNIT_STATE_META[st].color, width: `${(stateDist[st] / app.students.length) * 100}%`, borderRadius: 6, minWidth: 18 }} /></div>
                  <strong className="mono small">{stateDist[st]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intervention log */}
      <div className="card card-pad">
        <SectionTitle right={<span className="small muted">owners + closure</span>}>Intervention log</SectionTitle>
        {openFlags.length === 0 ? (
          <div className="small muted">No open interventions.</div>
        ) : (
          <div className="seg-list">
            {app.state.flags.filter((f) => f.status !== "closed").map((f) => {
              const s = student(f.studentId);
              const u = f.unitId ? app.graph.unit(f.unitId) : null;
              return (
                <div key={f.id} className="trow" style={{ gridTemplateColumns: "auto 1fr auto auto" }}>
                  <Avatar emoji={s.avatar} size={26} />
                  <div className="stack" style={{ gap: 2 }}>
                    <strong style={{ fontSize: 13.5 }}>{s.name} · {f.detail}</strong>
                    <span className="small muted">{u ? u.title : "—"} · source: {f.source} · {f.kind}</span>
                  </div>
                  <span className="chip" style={{ color: f.status === "open" ? "var(--warn)" : "var(--ink-3)" }}>{f.status}</span>
                  <div className="row gap-8">
                    {f.status === "open" && <button className="btn sm secondary" onClick={() => app.setState((st) => ops.acknowledgeFlag(st, f.id, "teacher"))}>Ack</button>}
                    <button className="btn sm" onClick={() => app.setState((st) => ops.closeFlag(st, f.id))}>Close</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

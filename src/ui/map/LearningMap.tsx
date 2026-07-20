import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import { UNIT_STATE_META } from "../../domain/mastery";
import { laneSummaries, masteryStrip, type LaneSummary } from "../selectors";
import { Avatar, Bar, MasteryPill, SectionTitle, StatTile } from "../components";

const ENROLLED_GRADE = 4;

type Level = "Placed" | "Low" | "Med" | "High" | "Complete";
const LEVEL_COLOR: Record<Level, string> = {
  Placed: "var(--st-locked)", Low: "var(--bad)", Med: "var(--warn)", High: "var(--st-ready)", Complete: "var(--good)",
};

function levelOf(l: LaneSummary): Level {
  if (!l.workingLevel) return "Placed";
  const gaps = l.counts.REFRESH_NEEDED;
  const delta = l.workingLevel.grade - ENROLLED_GRADE;
  if (gaps >= 2 || delta <= -2) return "Low";
  if (gaps === 1 || delta === -1) return "Med";
  if (l.counts.PROVISIONAL_MASTERY > 0 || l.retentionHealth < 1) return "High";
  return "Complete";
}

export function LearningMap() {
  const app = useApp();
  const [view, setView] = useState<"class" | "student">("class");
  const [studentId, setStudentId] = useState(app.students[0].id);

  // Per-student lane summaries (one row per subject, first lane per subject).
  const perStudent = useMemo(() => {
    const map = new Map<string, LaneSummary[]>();
    for (const s of app.students) {
      const lanes = laneSummaries(app.graph, app.state, s.id);
      // one summary per subject (first lane)
      const bySubject = new Map<string, LaneSummary>();
      for (const l of lanes) if (!bySubject.has(l.subjectKey)) bySubject.set(l.subjectKey, l);
      map.set(s.id, [...bySubject.values()]);
    }
    return map;
  }, [app.graph, app.state, app.students]);

  const subjects = app.graph.subjects;

  // Leadership KPIs
  const allScored = app.state.retentionChecks.filter((c) => c.status === "passed" || c.status === "failed");
  const retentionPass = allScored.length ? Math.round((allScored.filter((c) => c.status === "passed").length / allScored.length) * 100) : 100;
  const totalConfirmed = app.students.reduce((a, s) => a + (perStudent.get(s.id)?.reduce((x, l) => x + l.counts.CONFIRMED_MASTERY, 0) ?? 0), 0);
  const onGrade = app.students.filter((s) => (perStudent.get(s.id) ?? []).some((l) => l.subjectKey === "math" && l.workingLevel && l.workingLevel.grade >= ENROLLED_GRADE)).length;

  // Class action list: combine gaps, refresh, flags, below-grade.
  const actions = useMemo(() => {
    const items: { studentId: string; label: string; detail: string; sev: number }[] = [];
    for (const s of app.students) {
      for (const l of perStudent.get(s.id) ?? []) {
        if (l.counts.REFRESH_NEEDED > 0) items.push({ studentId: s.id, label: `${l.subjectName}: ${l.counts.REFRESH_NEEDED} unit(s) need refresh`, detail: "retention decay — micro-loop", sev: 2 });
        if (l.workingLevel && l.workingLevel.grade < ENROLLED_GRADE) items.push({ studentId: s.id, label: `${l.subjectName}: ${ENROLLED_GRADE - l.workingLevel.grade}y below grade`, detail: `working at ${l.workingLevel.title}`, sev: 3 });
      }
    }
    for (const f of app.state.flags.filter((f) => f.status !== "closed")) items.push({ studentId: f.studentId, label: f.detail, detail: `${f.kind} · ${f.source}`, sev: f.kind === "wellbeing" ? 4 : 2 });
    return items.sort((a, b) => b.sev - a.sev);
  }, [app.state, perStudent, app.students]);

  const student = app.students.find((s) => s.id === studentId)!;
  const studentLanes = perStudent.get(studentId) ?? [];

  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="stack" style={{ gap: 2 }}>
          <h2 style={{ fontSize: 20 }}>Learning Map</h2>
          <span className="muted small">State-machine-true mastery — not a single score. Parents see curated narratives only (§13).</span>
        </div>
        <div className="row" style={{ background: "var(--bg-sunken)", borderRadius: 999, padding: 3 }}>
          {(["class", "student"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "7px 16px", fontSize: 13.5, fontWeight: 650, background: view === v ? "var(--bg-elev)" : "transparent", color: view === v ? "var(--ink)" : "var(--ink-3)", boxShadow: view === v ? "var(--shadow-1)" : "none" }}>
              {v === "class" ? "Class" : "Student"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid four-col">
        <StatTile label="Mastery velocity" value={totalConfirmed} sub="confirmed units (class)" accent="var(--good)" />
        <StatTile label="Retention pass rate" value={`${retentionPass}%`} sub={`${allScored.length} checks scored`} />
        <StatTile label="On/above grade (Math)" value={`${onGrade}/${app.students.length}`} />
        <StatTile label="Open interventions" value={app.state.flags.filter((f) => f.status !== "closed").length} sub="tracked to closure" />
      </div>

      {view === "class" ? (
        <div className="grid two-col">
          {/* Heatmap */}
          <div className="card card-pad" style={{ overflowX: "auto" }}>
            <SectionTitle right={<span className="small muted">working-level grade per subject</span>}>Class mastery heatmap</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${subjects.length}, minmax(40px, 1fr))`, gap: 4, minWidth: 520 }}>
              <div />
              {subjects.map((s) => (
                <div key={s.key} className="small muted" style={{ textAlign: "center", fontWeight: 600, transform: "rotate(0deg)", fontSize: 10.5, alignSelf: "end", paddingBottom: 4 }}>{s.name.split(" ")[0]}</div>
              ))}
              {app.students.map((st) => (
                <FragmentRow key={st.id} studentAvatar={st.avatar} studentName={st.name} lanes={perStudent.get(st.id) ?? []} subjectKeys={subjects.map((s) => s.key)} />
              ))}
            </div>
            <div className="row wrap gap-12" style={{ marginTop: 14 }}>
              {(Object.keys(LEVEL_COLOR) as Level[]).map((lv) => (
                <span key={lv} className="row gap-4 small muted"><span style={{ width: 10, height: 10, borderRadius: 3, background: LEVEL_COLOR[lv] }} /> {lv}</span>
              ))}
            </div>
          </div>

          {/* Action list */}
          <div className="card card-pad">
            <SectionTitle right={<span className="badge-soft">{actions.length}</span>}>Class action list</SectionTitle>
            {actions.length === 0 ? (
              <div className="small muted">No open actions.</div>
            ) : (
              <div className="seg-list">
                {actions.map((a, i) => {
                  const s = app.students.find((x) => x.id === a.studentId)!;
                  return (
                    <div key={i} className="trow" style={{ gridTemplateColumns: "auto 1fr", borderLeft: `3px solid ${a.sev >= 3 ? "var(--bad)" : "var(--warn)"}` }}>
                      <Avatar emoji={s.avatar} size={26} />
                      <div className="stack" style={{ gap: 2 }}>
                        <strong style={{ fontSize: 13 }}>{s.name} · {a.label}</strong>
                        <span className="small muted">{a.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="stack gap-16">
          <div className="card card-pad">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row gap-12">
                <Avatar emoji={student.avatar} size={40} />
                <div className="stack" style={{ gap: 2 }}><strong>{student.name}</strong><span className="small muted">Grade {student.grade} · {student.band}</span></div>
              </div>
              <select className="student-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                {app.students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
          </div>

          {studentLanes.filter((l) => l.workingLevel || l.subjectKey === "math" || l.subjectKey === "science").map((l) => {
            const strip = masteryStrip(app.graph, app.state, studentId, l.subjectKey, l.stream);
            return (
              <div key={l.subjectKey + (l.stream ?? "")} className="card card-pad">
                <SectionTitle
                  right={<div className="row gap-8">{l.focusState && <MasteryPill state={l.focusState} />}<span className="small muted">retention {Math.round(l.retentionHealth * 100)}%</span></div>}
                >
                  {l.laneLabel}
                </SectionTitle>
                <div className="row gap-16" style={{ marginBottom: 12 }}>
                  <div className="stack" style={{ gap: 3, minWidth: 150 }}>
                    <span className="small muted">Working level</span>
                    <strong style={{ fontSize: 13.5 }}>{l.workingLevel ? l.workingLevel.title : "Baseline pending"}</strong>
                  </div>
                  <div className="grow stack" style={{ gap: 6 }}>
                    <span className="small muted">Proven {l.provenCount} / {l.total} units on track</span>
                    <Bar value={l.workingLevelPct} color={LEVEL_COLOR[levelOf(l)]} />
                  </div>
                </div>
                <div className="strip">
                  {strip.map(({ unit, state }) => (
                    <div key={unit.id} className="strip-cell" title={`${unit.title} — ${UNIT_STATE_META[state].label}`} style={{ background: UNIT_STATE_META[state].color, opacity: state === "LOCKED" ? 0.3 : 1 }}>{unit.grade}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  function FragmentRow({ studentAvatar, studentName, lanes, subjectKeys }: { studentAvatar: string; studentName: string; lanes: LaneSummary[]; subjectKeys: string[] }) {
    return (
      <>
        <div className="row gap-8" style={{ minWidth: 0 }}>
          <Avatar emoji={studentAvatar} size={22} />
          <span className="small" style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{studentName}</span>
        </div>
        {subjectKeys.map((sk) => {
          const l = lanes.find((x) => x.subjectKey === sk);
          const lv = l ? levelOf(l) : "Placed";
          return (
            <div key={sk} className="heat-cell" title={l ? `${studentName} · ${l.subjectName}: ${lv}${l.workingLevel ? ` (G${l.workingLevel.grade})` : ""}` : "Placed"} style={{ background: LEVEL_COLOR[lv], opacity: lv === "Placed" ? 0.4 : 1 }}>
              {l?.workingLevel ? l.workingLevel.grade : ""}
            </div>
          );
        })}
      </>
    );
  }
}

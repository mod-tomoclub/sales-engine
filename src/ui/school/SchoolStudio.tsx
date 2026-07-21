/**
 * School AI Studio — the campus/school-level surface (§14, §2).
 * Curriculum library coverage, content approval pipeline ("zero unreviewed
 * content reaches a child"), band policy, campus KPIs, and the provenance of
 * the curriculum map itself.
 */
import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import { bandForGrade } from "../../domain/student";
import { statesForStudent } from "../../engines/progression";
import { SectionTitle, StatTile, Bar, Avatar } from "../components";

type AssetStatus = "draft" | "pending" | "approved" | "rejected";
interface PipelineAsset {
  id: string;
  kind: "instructionScript" | "practiceItem" | "summationForm" | "retentionItem" | "lessonPlan";
  unitId: string;
  level: string;
  language: string;
  version: string;
  status: AssetStatus;
}

const KIND_LABEL: Record<PipelineAsset["kind"], string> = {
  instructionScript: "Instruction script",
  practiceItem: "Guided practice set",
  summationForm: "Summation form (AI-free)",
  retentionItem: "Retention item set",
  lessonPlan: "Lesson plan (60-min SOP)",
};

/** Illustrative queue — in production these come from the generator (§14.2). */
function seedPipeline(unitIds: string[]): PipelineAsset[] {
  const kinds: PipelineAsset["kind"][] = ["lessonPlan", "instructionScript", "practiceItem", "summationForm", "retentionItem"];
  const levels = ["scaffolded", "standard", "extension"];
  return unitIds.slice(0, 9).map((unitId, i) => ({
    id: `asset-${i}`,
    kind: kinds[i % kinds.length],
    unitId,
    level: levels[i % levels.length],
    language: i % 4 === 3 ? "hi" : "en",
    version: `v1.${i % 3}`,
    status: i < 5 ? "pending" : i < 7 ? "approved" : "draft",
  }));
}

export function SchoolStudio() {
  const app = useApp();
  const { graph } = app;
  const legend = graph.meta.codeLegend;
  const notes = graph.meta.notes;

  const [pipeline, setPipeline] = useState<PipelineAsset[]>(() =>
    seedPipeline(graph.unitsForSubject("math").slice(20, 32).map((u) => u.id)),
  );
  const setStatus = (id: string, status: AssetStatus) =>
    setPipeline((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));

  // ---- Campus rollup across every student ----
  const campus = useMemo(() => {
    let confirmed = 0, provisional = 0, refresh = 0, active = 0;
    for (const s of app.students) {
      const states = statesForStudent(app.state, s.id);
      for (const st of states.values()) {
        if (st === "CONFIRMED_MASTERY") confirmed++;
        else if (st === "PROVISIONAL_MASTERY") provisional++;
        else if (st === "REFRESH_NEEDED") refresh++;
        else if (st === "INSTRUCTION" || st === "PRACTICE" || st === "SUMMATION_DUE") active++;
      }
    }
    const scored = app.state.retentionChecks.filter((c) => c.status === "passed" || c.status === "failed");
    const retentionPass = scored.length ? scored.filter((c) => c.status === "passed").length / scored.length : 1;
    return { confirmed, provisional, refresh, active, retentionPass, scored: scored.length };
  }, [app.students, app.state]);

  const pendingCount = pipeline.filter((a) => a.status === "pending").length;
  const approvedCount = pipeline.filter((a) => a.status === "approved").length;

  // Students grouped by grade (the campus roll).
  const byGrade = useMemo(() => {
    const m = new Map<number, typeof app.students>();
    for (const s of app.students) m.set(s.grade, [...(m.get(s.grade) ?? []), s]);
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [app.students]);

  const maxUnits = Math.max(...graph.coverage.map((g) => g.totalUnits), 1);

  return (
    <div className="stack gap-16">
      <div className="stack" style={{ gap: 2 }}>
        <h2 style={{ fontSize: 20 }}>School AI Studio</h2>
        <span className="muted small">Campus backbone — curriculum library, content approvals, policy, and school-wide mastery.</span>
      </div>

      <div className="grid four-col">
        <StatTile label="Curriculum library" value={graph.meta.counts.units} sub={`${graph.meta.counts.conceptNodes} concept blocks`} />
        <StatTile label="Pending approval" value={pendingCount} sub="blocks release to children" accent={pendingCount ? "var(--warn)" : "var(--good)"} />
        <StatTile label="Confirmed units (campus)" value={campus.confirmed} sub={`${campus.provisional} provisional · ${campus.refresh} refresh`} accent="var(--good)" />
        <StatTile label="Retention pass rate" value={`${Math.round(campus.retentionPass * 100)}%`} sub={`${campus.scored} checks scored`} />
      </div>

      {/* ---- Coverage matrix: the real workbook Dashboard ---- */}
      <div className="card card-pad" style={{ overflowX: "auto" }}>
        <SectionTitle right={<span className="small muted">units · estimated hours</span>}>
          Curriculum coverage by grade × subject
        </SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "var(--ink-3)", fontWeight: 600 }}>Grade</th>
              {graph.subjects.map((s) => (
                <th key={s.key} style={{ textAlign: "center", padding: "8px 6px", color: "var(--ink-3)", fontWeight: 600 }} title={s.name}>{shortName(s.name)}</th>
              ))}
              <th style={{ textAlign: "center", padding: "8px 6px", fontWeight: 700 }}>Total</th>
              <th style={{ textAlign: "left", padding: "8px 6px", color: "var(--ink-3)", fontWeight: 600, width: 110 }}>Load</th>
            </tr>
          </thead>
          <tbody>
            {graph.coverage.map((g) => {
              const band = bandForGrade(g.grade);
              return (
                <tr key={g.grade} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "7px 6px", fontWeight: 700 }}>
                    {g.grade} <span className="small muted" style={{ fontWeight: 500 }}>{band}</span>
                  </td>
                  {graph.subjects.map((s) => {
                    const c = g.bySubject[s.key];
                    return (
                      <td key={s.key} style={{ textAlign: "center", padding: "7px 6px", color: c.units ? "var(--ink)" : "var(--ink-3)", opacity: c.units ? 1 : 0.4 }}>
                        {c.units ? (<><strong>{c.units}</strong> <span className="muted" style={{ fontSize: 11 }}>{c.hours}h</span></>) : "—"}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center", padding: "7px 6px", fontWeight: 700 }}>{g.totalUnits}</td>
                  <td style={{ padding: "7px 6px" }}><Bar value={g.totalUnits / maxUnits} /></td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid var(--line-strong)", fontWeight: 700 }}>
              <td style={{ padding: "8px 6px" }}>All</td>
              {graph.subjects.map((s) => (
                <td key={s.key} style={{ textAlign: "center", padding: "8px 6px" }}>{s.unitCount}</td>
              ))}
              <td style={{ textAlign: "center", padding: "8px 6px" }}>{graph.meta.counts.units}</td>
              <td style={{ padding: "8px 6px" }} className="small muted">{graph.meta.counts.hours.toLocaleString()}h</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid two-col" style={{ alignItems: "start" }}>
        {/* ---- Content approval pipeline ---- */}
        <div className="card card-pad">
          <SectionTitle right={<span className="badge-soft">{approvedCount} approved</span>}>
            Content pipeline · Academic Head review
          </SectionTitle>
          <div className="small muted" style={{ marginBottom: 12 }}>
            Zero unreviewed content reaches a child. Every child-facing asset carries version, reviewer and date in the audit trail.
          </div>
          <div className="seg-list">
            {pipeline.map((a) => {
              const u = graph.unit(a.unitId);
              const tone =
                a.status === "approved" ? "var(--good)" : a.status === "rejected" ? "var(--bad)" : a.status === "pending" ? "var(--warn)" : "var(--ink-3)";
              return (
                <div key={a.id} className="trow" style={{ gridTemplateColumns: "1fr auto", borderLeft: `3px solid ${tone}` }}>
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <strong style={{ fontSize: 13 }}>{KIND_LABEL[a.kind]}</strong>
                    <span className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u ? `G${u.grade} · ${u.title}` : a.unitId} · {a.level} · {a.language} · {a.version}
                    </span>
                  </div>
                  <div className="row gap-8">
                    <span className="chip" style={{ color: tone, borderColor: tone }}>{a.status}</span>
                    {a.status === "pending" && (
                      <>
                        <button className="btn sm" onClick={() => setStatus(a.id, "approved")}>Approve</button>
                        <button className="btn sm secondary" onClick={() => setStatus(a.id, "rejected")}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stack gap-16">
          {/* ---- Campus roll ---- */}
          <div className="card card-pad">
            <SectionTitle>Campus roll</SectionTitle>
            <div className="seg-list">
              {byGrade.map(([g, students]) => (
                <div key={g} className="trow" style={{ gridTemplateColumns: "auto 1fr auto" }}>
                  <span className="chip code">G{g}</span>
                  <div className="row gap-4 wrap">
                    {students.map((s) => (<Avatar key={s.id} emoji={s.avatar} size={22} />))}
                  </div>
                  <span className="small muted">{students.length} · {bandForGrade(g)}</span>
                </div>
              ))}
            </div>
            <div className="small muted" style={{ marginTop: 10 }}>
              Pilot cohort. Grades not listed are mapped in the curriculum library but not yet enrolled.
            </div>
          </div>

          {/* ---- Band policy ---- */}
          <div className="card card-pad">
            <SectionTitle>Delivery policy by band</SectionTitle>
            <div className="stack gap-8">
              <PolicyRow band="PreK–2 (G1–2)" rule="No 1:1 screens. M/T/O-heavy — smartboard + named printed practice via print/scan." tone="var(--warn)" />
              <PolicyRow band="Elementary (G3–5)" rule="1:1 devices from Grade 3. AI-doorway-first delivery begins Grades 4–5." tone="var(--st-ready)" />
              <PolicyRow band="Middle (G6–8)" rule="AI-doorway-first is standard. Disclosed tutor use." tone="var(--accent)" />
              <PolicyRow band="High (G9–12)" rule="Board-format sets (ICSE/ISC refs on each unit); process-logged AI use." tone="var(--good)" />
            </div>
            {notes.designRule && <div className="small muted" style={{ marginTop: 10 }}>{notes.designRule}</div>}
          </div>
        </div>
      </div>

      {/* ---- Provenance ---- */}
      <div className="card card-pad">
        <SectionTitle right={<span className="small muted">{notes.version}</span>}>Curriculum library provenance</SectionTitle>
        <div className="stack gap-12">
          {notes.sourcing && <div className="small"><strong>Sourcing & confidence:</strong> <span className="muted">{notes.sourcing}</span></div>}
          {notes.howToRead && <div className="small"><strong>How to read a row:</strong> <span className="muted">{notes.howToRead}</span></div>}
          {notes.scopeDecisions.length > 0 && (
            <div className="stack gap-4">
              <span className="small" style={{ fontWeight: 700 }}>Scope decisions (flagged, reversible)</span>
              {notes.scopeDecisions.map((d, i) => (<span key={i} className="small muted">{d}</span>))}
            </div>
          )}
          <div className="stack gap-4">
            <span className="small" style={{ fontWeight: 700 }}>Delivery codes</span>
            <div className="row wrap gap-8">
              {Object.entries(legend).map(([c, desc]) => (
                <span key={c} className="chip" title={desc}>
                  <strong className="mono">{c}</strong> {desc.split(" (")[0]}
                </span>
              ))}
            </div>
          </div>
          <div className="small muted">Source: {graph.meta.source} · imported by {graph.meta.generatedBy}</div>
        </div>
      </div>
    </div>
  );
}

/** "Science (PCB)" -> "PCB", "Social Studies" -> "Social", else first word. */
function shortName(name: string): string {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) return paren[1];
  return name.split(" ")[0];
}

function PolicyRow({ band, rule, tone }: { band: string; rule: string; tone: string }) {
  return (
    <div className="row gap-12" style={{ alignItems: "flex-start" }}>
      <span style={{ width: 4, alignSelf: "stretch", background: tone, borderRadius: 2, flex: "0 0 auto" }} />
      <div className="stack" style={{ gap: 2 }}>
        <strong style={{ fontSize: 13 }}>{band}</strong>
        <span className="small muted">{rule}</span>
      </div>
    </div>
  );
}

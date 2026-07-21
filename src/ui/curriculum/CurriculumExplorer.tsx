/**
 * Curriculum Explorer — the unit library browser (§14.1, §18 P0).
 * Maps the ICSE Concept-Block workbook into a navigable graph:
 * subject → grade → unit → concept blocks, with every spec column shown
 * verbatim and prerequisite/unlock edges walkable.
 */
import { useMemo, useState } from "react";
import { useApp } from "../../state/AppContext";
import type { Unit } from "../../domain/curriculum";
import { UNIT_STATE_META } from "../../domain/mastery";
import { statesForStudent } from "../../engines/progression";
import { SectionTitle, StatTile, StateDot } from "../components";

export function CurriculumExplorer() {
  const app = useApp();
  const { graph } = app;
  const [subjectKey, setSubjectKey] = useState("math");
  const [grade, setGrade] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlayStudent, setOverlayStudent] = useState<string>("");

  const legend = graph.meta.codeLegend;
  const subject = graph.subject(subjectKey);

  const units = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? graph.allUnits.filter(
          (u) =>
            u.title.toLowerCase().includes(q) ||
            u.conceptNodes.some((n) => n.title.toLowerCase().includes(q)),
        )
      : graph.unitsForSubject(subjectKey);
    if (grade !== "all") list = list.filter((u) => u.grade === grade);
    return list;
  }, [graph, subjectKey, grade, query]);

  const selected: Unit | undefined = useMemo(
    () => (selectedId ? graph.unit(selectedId) : undefined) ?? units[0],
    [selectedId, graph, units],
  );

  const grades = useMemo(
    () => [...new Set(graph.unitsForSubject(subjectKey).map((u) => u.grade))].sort((a, b) => a - b),
    [graph, subjectKey],
  );

  // Optional: overlay a student's mastery state onto the map.
  const overlay = useMemo(
    () => (overlayStudent ? statesForStudent(app.state, overlayStudent) : null),
    [app.state, overlayStudent],
  );

  const counts = graph.meta.counts;

  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="stack" style={{ gap: 2 }}>
          <h2 style={{ fontSize: 20 }}>Curriculum Map</h2>
          <span className="muted small">{graph.meta.title} · one row = one unit · concept blocks are the granular nodes a child masters one by one</span>
        </div>
        <select className="student-select" value={overlayStudent} onChange={(e) => setOverlayStudent(e.target.value)} title="Overlay a student's mastery state">
          <option value="">No student overlay</option>
          {app.students.map((s) => (<option key={s.id} value={s.id}>{s.avatar} {s.name}</option>))}
        </select>
      </div>

      <div className="grid four-col">
        <StatTile label="Units mapped" value={counts.units} sub={`${counts.grades} grades · ${counts.subjects} subjects`} />
        <StatTile label="Concept blocks" value={counts.conceptNodes} sub="granular mastery nodes" accent="var(--accent)" />
        <StatTile label="Prerequisite edges" value={counts.edges} sub="the progression graph" />
        <StatTile label="Teaching hours" value={counts.hours.toLocaleString()} sub="design estimates" />
      </div>

      {/* Filters */}
      <div className="card card-pad">
        <div className="row wrap gap-8" style={{ marginBottom: 12 }}>
          {graph.subjects.map((s) => (
            <button
              key={s.key}
              className="chip pointer"
              onClick={() => { setSubjectKey(s.key); setSelectedId(null); setQuery(""); }}
              style={{
                background: s.key === subjectKey && !query ? "var(--accent)" : "var(--bg-sunken)",
                color: s.key === subjectKey && !query ? "#fff" : "var(--ink-2)",
                borderColor: s.key === subjectKey && !query ? "var(--accent)" : "var(--line)",
                fontSize: 13, padding: "6px 13px",
              }}
            >
              {s.name} <span style={{ opacity: 0.7 }}>{s.unitCount}</span>
            </button>
          ))}
        </div>
        <div className="row wrap gap-12">
          <input
            className="student-select"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Search units and concept blocks across all subjects…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedId(null); }}
          />
          <select className="student-select" value={String(grade)} onChange={(e) => setGrade(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All grades</option>
            {grades.map((g) => (<option key={g} value={g}>Grade {g}</option>))}
          </select>
          <span className="small muted" style={{ alignSelf: "center" }}>{units.length} unit{units.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="grid two-col" style={{ alignItems: "start" }}>
        {/* Unit list */}
        <div className="card card-pad" style={{ maxHeight: 620, overflowY: "auto" }}>
          <SectionTitle right={query ? <span className="badge-soft">search</span> : <span className="small muted">{subject?.name}</span>}>
            Units
          </SectionTitle>
          <div className="seg-list">
            {units.map((u) => {
              const st = overlay?.get(u.id);
              const isSel = selected?.id === u.id;
              return (
                <div
                  key={u.id}
                  className="trow pointer"
                  onClick={() => setSelectedId(u.id)}
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    borderColor: isSel ? "var(--accent)" : "var(--line)",
                    background: isSel ? "var(--accent-soft)" : undefined,
                  }}
                >
                  <span className="chip code" style={{ minWidth: 52, justifyContent: "center" }}>
                    G{u.grade}·U{u.unitNo}
                  </span>
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <strong style={{ fontSize: 13.5 }}>{u.title}</strong>
                    <span className="small muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.conceptNodes.length} blocks · {u.estHours ?? "—"}h
                      {query ? ` · ${graph.subject(u.subjectKey)?.name}` : ""}
                    </span>
                  </div>
                  {st ? <StateDot state={st} /> : <span className="small muted mono">{u.deliveryCodes.join("+")}</span>}
                </div>
              );
            })}
            {units.length === 0 && <div className="small muted">No units match that search.</div>}
          </div>
        </div>

        {/* Unit detail */}
        {selected ? (
          <div className="card card-pad">
            <div className="stack gap-4" style={{ marginBottom: 14 }}>
              <span className="small muted">
                {graph.subject(selected.subjectKey)?.name} · Grade {selected.grade} · Unit {selected.unitNo}
                {selected.stream ? ` · ${selected.stream}` : ""}
              </span>
              <h3 style={{ fontSize: 18 }}>{selected.title}</h3>
              {overlay?.get(selected.id) && (
                <div className="row gap-8" style={{ marginTop: 4 }}>
                  <StateDot state={overlay.get(selected.id)!} />
                  <span className="small" style={{ fontWeight: 650 }}>{UNIT_STATE_META[overlay.get(selected.id)!].label}</span>
                  <span className="small muted">{UNIT_STATE_META[overlay.get(selected.id)!].blurb}</span>
                </div>
              )}
            </div>

            {/* Delivery codes with the workbook's own legend */}
            <div className="row wrap gap-8" style={{ marginBottom: 14 }}>
              {selected.deliveryCodes.map((c) => (
                <span key={c} className="chip" title={legend[c]}>
                  <strong className="mono">{c}</strong> {legend[c]?.split(" (")[0]}
                </span>
              ))}
              {selected.estHours != null && <span className="chip">⏱ {selected.estHours}h</span>}
            </div>
            {selected.deliveryNote && <div className="small muted" style={{ marginBottom: 14 }}>Delivery note: {selected.deliveryNote}</div>}

            {/* Concept blocks */}
            <SectionTitle right={<span className="badge-soft">{selected.conceptNodes.length}</span>}>Concept blocks</SectionTitle>
            <div className="stack gap-4" style={{ marginBottom: 16 }}>
              {selected.conceptNodes.map((n) => (
                <div key={n.id} className="row gap-8">
                  <span className="chip code" style={{ minWidth: 24, justifyContent: "center" }}>{n.seq}</span>
                  <span className="small">{n.title}</span>
                </div>
              ))}
            </div>

            {/* Spec columns, verbatim */}
            <div className="stack gap-12">
              <Spec label="Practice" value={selected.practiceSpec} />
              <Spec label="Mastery proof — always AI-free" value={selected.masteryProofSpec} accent="var(--bad)" />
              <Spec label="Path lock (holds progression)" value={selected.pathLockCriteria} />
              <Spec label="Scholar depth (extension lane)" value={selected.scholarDepthSpec} />
              <Spec label="Board reference" value={selected.boardRef} />
            </div>

            {/* Graph navigation */}
            <div className="grid two-col" style={{ marginTop: 16, gap: 12 }}>
              <div>
                <SectionTitle>Prerequisites</SectionTitle>
                {graph.prereqs(selected.id).length === 0 ? (
                  <div className="small muted">None — this is an entry unit.</div>
                ) : (
                  <div className="seg-list">
                    {graph.prereqs(selected.id).map((p) => (
                      <div key={p.id} className="trow pointer" style={{ gridTemplateColumns: "auto 1fr", padding: "8px 10px" }} onClick={() => { setQuery(""); setSubjectKey(p.subjectKey); setSelectedId(p.id); }}>
                        <span className="chip code">G{p.grade}·U{p.unitNo}</span>
                        <span className="small">{p.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selected.prereqRaw && selected.prereqRaw !== "None" && (
                  <div className="small muted" style={{ marginTop: 6 }}>Source: “{selected.prereqRaw}”</div>
                )}
              </div>
              <div>
                <SectionTitle>Unlocks</SectionTitle>
                {graph.dependents(selected.id).length === 0 ? (
                  <div className="small muted">Terminal unit in this lane.</div>
                ) : (
                  <div className="seg-list">
                    {graph.dependents(selected.id).map((d) => (
                      <div key={d.id} className="trow pointer" style={{ gridTemplateColumns: "auto 1fr", padding: "8px 10px" }} onClick={() => { setQuery(""); setSubjectKey(d.subjectKey); setSelectedId(d.id); }}>
                        <span className="chip code">G{d.grade}·U{d.unitNo}</span>
                        <span className="small">{d.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-pad"><div className="small muted">Select a unit.</div></div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value, accent }: { label: string; value: string; accent?: string }) {
  if (!value) return null;
  return (
    <div className="stack" style={{ gap: 3 }}>
      <span className="small" style={{ fontWeight: 700, color: accent ?? "var(--ink-2)" }}>{label}</span>
      <span className="small muted">{value}</span>
    </div>
  );
}

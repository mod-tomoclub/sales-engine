import { useMemo, useState } from "react";
import { useActiveStudent, useApp } from "../../state/AppContext";
import { UNIT_STATE_META } from "../../domain/mastery";
import { planSession } from "../../engines/planner/planner";
import { statesForStudent, getUnitState } from "../../engines/progression";
import { dailyGoals } from "../../engines/motivation/ledger";
import { coins, coinsEarnedToday, dueRetention, laneSummaries, masteryStrip, upNext } from "../selectors";
import { Avatar, Bar, MasteryPill, Ring, SectionTitle, StateDot } from "../components";
import { LoopRunner, RetentionRunner } from "./Loop";

export function StudentApp() {
  const app = useApp();
  const student = useActiveStudent();
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);
  const [openCheck, setOpenCheck] = useState<string | null>(null);
  const [stripSubject, setStripSubject] = useState<string>("math");

  const lanes = useMemo(() => laneSummaries(app.graph, app.state, student.id), [app.graph, app.state, student.id]);
  const next = useMemo(() => upNext(app.graph, app.state, student.id), [app.graph, app.state, student.id]);
  const due = useMemo(() => dueRetention(app.state, student.id), [app.state, student.id]);
  const balance = coins(app.state, student.id);
  const streak = app.state.streaks[student.id];
  const earnedToday = coinsEarnedToday(app.state, student.id);

  // Session plan for the up-next subject (or math default).
  const planSubject = next?.unit.subjectKey ?? "math";
  const planStream = next?.unit.stream ?? null;
  const plan = useMemo(() => {
    const states = statesForStudent(app.state, student.id);
    const records = new Map(Object.values(app.state.unitStates).filter((r) => r.studentId === student.id).map((r) => [r.unitId, r]));
    return planSession({
      graph: app.graph,
      student,
      subjectKey: planSubject,
      stream: planStream,
      states,
      unitStateRecords: records,
      retentionChecks: app.state.retentionChecks,
      flags: app.state.flags,
      day: app.state.day,
    });
  }, [app.graph, app.state, student, planSubject, planStream]);

  const goals = dailyGoals({
    instruction: app.state.interactions.filter((e) => e.studentId === student.id && e.atDay === app.state.day && e.type === "checkQ").length,
    practice: app.state.interactions.filter((e) => e.studentId === student.id && e.atDay === app.state.day && e.type === "practiceAttempt").length,
    retentionDue: due.length,
    retentionDone: app.state.interactions.filter((e) => e.studentId === student.id && e.atDay === app.state.day && e.type === "retentionAttempt").length,
    coinsToday: earnedToday,
  });

  const strip = masteryStrip(app.graph, app.state, student.id, stripSubject, app.graph.streamsForSubject(stripSubject)[0] ?? null);
  const stripSummary = lanes.find((l) => l.subjectKey === stripSubject);

  const openUnit = openUnitId ? app.graph.unit(openUnitId) : null;
  const openCheckObj = openCheck ? app.state.retentionChecks.find((c) => c.id === openCheck) : null;
  const openCheckUnit = openCheckObj ? app.graph.unit(openCheckObj.unitId) : null;

  return (
    <div className="grid two-col">
      <div className="stack gap-16">
        {/* Hero */}
        <div className="hero">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="row gap-12">
              <Avatar emoji={student.avatar} size={52} ring="rgba(255,255,255,0.5)" />
              <div className="stack" style={{ gap: 2 }}>
                <strong style={{ fontSize: 20 }}>Hi {student.name} 👋</strong>
                <span className="small" style={{ opacity: 0.85 }}>Grade {student.grade} · {student.band} · Coach {app.coach.name.split(" ")[1]}</span>
              </div>
            </div>
            <div className="row gap-16">
              <div className="stack" style={{ alignItems: "flex-end" }}>
                <span className="row gap-4" style={{ fontWeight: 800, fontSize: 20 }}>◉ <span className="mono">{balance}</span></span>
                <span className="small" style={{ opacity: 0.8 }}>coins</span>
              </div>
              <div className="stack" style={{ alignItems: "flex-end" }}>
                <span style={{ fontWeight: 800, fontSize: 20 }}>🔥 {streak?.current ?? 0}</span>
                <span className="small" style={{ opacity: 0.8 }}>day streak</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "16px 0" }} />

          {next ? (
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <span className="small" style={{ opacity: 0.85 }}>UP NEXT · {app.graph.subject(next.unit.subjectKey)?.name}</span>
                <strong style={{ fontSize: 18 }}>{next.unit.title}</strong>
                <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
                  <MasteryPill state={next.rec.state} />
                  {next.unit.deliveryCodes.map((c) => (
                    <span key={c} className="chip code" title={app.graph.meta.codeLegend[c]}>{c}</span>
                  ))}
                </div>
              </div>
              <button className="btn lg secondary" onClick={() => { setOpenCheck(null); setOpenUnitId(next.unit.id); }}>
                {["INSTRUCTION", "PRACTICE", "SUMMATION_DUE"].includes(next.rec.state) ? "Continue" : "Start"} →
              </button>
            </div>
          ) : (
            <div>All caught up — great work! 🎉</div>
          )}
        </div>

        {/* Active loop OR plan / retention */}
        {openUnit ? (
          <LoopRunner unit={openUnit} onExit={() => setOpenUnitId(null)} />
        ) : openCheckObj && openCheckUnit ? (
          <div className="card card-pad animate-in">
            <RetentionRunner unit={openCheckUnit} checkId={openCheckObj.id} offset={openCheckObj.offsetDays} onDone={() => setOpenCheck(null)} />
          </div>
        ) : (
          <>
            {/* Due retention checks */}
            {due.length > 0 && (
              <div className="card card-pad">
                <SectionTitle right={<span className="badge-soft">{due.length} due</span>}>Retention checks due today</SectionTitle>
                <div className="seg-list">
                  {due.map((c) => {
                    const u = app.graph.unit(c.unitId)!;
                    return (
                      <div key={c.id} className="trow" style={{ gridTemplateColumns: "auto 1fr auto" }}>
                        <span className="chip code">D+{c.offsetDays}</span>
                        <div className="stack" style={{ gap: 2 }}>
                          <strong style={{ fontSize: 14 }}>{u.title}</strong>
                          <span className="small muted">{c.offsetDays === 1 ? "Light retrieval (formative)" : c.offsetDays <= 7 ? "Confirming check — helps lock mastery" : "Longitudinal probe"}</span>
                        </div>
                        <button className="btn sm" onClick={() => { setOpenUnitId(null); setOpenCheck(c.id); }}>Do check →</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Session plan (planner → 60-min SOP) */}
            <div className="card card-pad">
              <SectionTitle
                right={<span className="small muted">mix {plan.mix.newInstruction}/{plan.mix.retention}/{plan.mix.summation}</span>}
              >
                Today's Concept Block · {app.graph.subject(planSubject)?.name}
              </SectionTitle>
              <div className="seg-list">
                {plan.segments.map((seg, i) => (
                  <div key={i} className="trow" style={{ gridTemplateColumns: "48px 1fr", background: seg.teacherAlert ? "var(--warn-soft)" : undefined, borderColor: seg.teacherAlert ? "var(--warn)" : undefined }}>
                    <div className="stack" style={{ alignItems: "center" }}>
                      <strong className="mono" style={{ fontSize: 15 }}>{seg.minutes}'</strong>
                    </div>
                    <div className="stack" style={{ gap: 3 }}>
                      <strong style={{ fontSize: 13.5 }}>{seg.title}</strong>
                      <span className="small muted">{seg.detail}</span>
                      {seg.teacherAlert && <span className="small" style={{ color: "var(--warn)", fontWeight: 650 }}>⚑ Teacher console: {seg.teacherAlert}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {plan.notes.map((n, i) => (
                <div key={i} className="small muted" style={{ marginTop: 10 }}>ℹ️ {n}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="stack gap-16">
        <div className="card card-pad">
          <SectionTitle>Today's goals</SectionTitle>
          <div className="stack gap-12">
            {goals.map((g) => (
              <div key={g.key} className="stack" style={{ gap: 6 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="small" style={{ fontWeight: 600 }}>{g.label}</span>
                  <span className="small muted mono">{Math.min(g.progress, g.target)}/{g.target}</span>
                </div>
                <Bar value={g.progress / g.target} color={g.progress >= g.target ? "var(--good)" : "var(--accent)"} />
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="row gap-16">
            <Ring value={Math.min((streak?.current ?? 0) / 7, 1)} size={56} color="var(--coin)" />
            <div className="stack" style={{ gap: 2 }}>
              <strong style={{ fontSize: 15 }}>🔥 {streak?.current ?? 0}-day streak</strong>
              <span className="small muted">Best {streak?.best ?? 0} · one meaningful action a day</span>
              {streak?.multiplierPaused && <span className="small" style={{ color: "var(--warn)" }}>Multiplier paused after a slip — no penalty</span>}
            </div>
          </div>
        </div>

        {/* PATH-time credits (strategic reward) */}
        <div className="card card-pad" style={{ background: "var(--accent-soft)", borderColor: "var(--accent)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="stack" style={{ gap: 2 }}>
              <strong style={{ fontSize: 14 }}>⏱️ PATH-time banked</strong>
              <span className="small muted">Master fast → earn more PATH time</span>
            </div>
            <strong className="mono" style={{ fontSize: 20, color: "var(--accent-ink)" }}>{Math.round(lanes.reduce((a, l) => a + l.provenCount, 0) * 1.5)}m</strong>
          </div>
        </div>

        {/* Mastery strip */}
        <div className="card card-pad">
          <SectionTitle
            right={
              <select className="student-select" style={{ padding: "4px 10px", fontSize: 12 }} value={stripSubject} onChange={(e) => setStripSubject(e.target.value)}>
                {app.graph.subjects.map((s) => (<option key={s.key} value={s.key}>{s.name}</option>))}
              </select>
            }
          >
            Mastery strip
          </SectionTitle>
          {stripSummary && (
            <div className="small muted" style={{ marginBottom: 10 }}>
              Working level: <strong style={{ color: "var(--ink)" }}>{stripSummary.workingLevel ? `${stripSummary.workingLevel.title}` : "baseline"}</strong>
              {stripSummary.workingLevel && stripSummary.workingLevel.grade !== student.grade && (
                <span style={{ color: stripSummary.workingLevel.grade < student.grade ? "var(--warn)" : "var(--good)" }}> · {stripSummary.workingLevel.grade < student.grade ? `${student.grade - stripSummary.workingLevel.grade}y below grade` : "above grade"}</span>
              )}
            </div>
          )}
          <div className="strip">
            {strip.map(({ unit, state }) => (
              <div
                key={unit.id}
                className="strip-cell"
                title={`${unit.title} — ${UNIT_STATE_META[state].label}`}
                style={{ background: UNIT_STATE_META[state].color, opacity: state === "LOCKED" ? 0.35 : 1, cursor: getUnitState(app.state, student.id, unit.id).state !== "LOCKED" ? "pointer" : "default" }}
                onClick={() => { if (state !== "LOCKED") { setOpenCheck(null); setOpenUnitId(unit.id); } }}
              >
                {unit.grade}
              </div>
            ))}
          </div>
          <div className="row wrap gap-12" style={{ marginTop: 12 }}>
            {(["CONFIRMED_MASTERY", "PROVISIONAL_MASTERY", "PRACTICE", "READY", "REFRESH_NEEDED", "LOCKED"] as const).map((s) => (
              <span key={s} className="row gap-4 small muted"><StateDot state={s} size={8} /> {UNIT_STATE_META[s].label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

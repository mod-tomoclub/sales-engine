/**
 * The Tomoe mastery loop (§7 + §9). Reads the unit's state-machine state and
 * renders the matching phase, driving the progression engine forward. Tomoe
 * offers hints (never answers) during practice and is DISABLED during the
 * AI-free summation and retention checks.
 */
import { useMemo, useState } from "react";
import type { Unit } from "../../domain/curriculum";
import { bandForGrade } from "../../domain/student";
import type { Item } from "../../engines/tutor/items";
import { RETENTION_ITEMS, SUMMATION_ITEMS, getUnitState } from "../../engines/progression";
import { useActiveStudent, useApp, ops } from "../../state/AppContext";

type ResolveResult = { correct: boolean; firstTry: boolean; hintToTerminal: boolean };

function tutorCtx(app: ReturnType<typeof useApp>, unit: Unit) {
  const student = app.students.find((s) => s.id === app.activeStudentId)!;
  const profile = app.interestProfiles[student.id];
  const style = app.graph.subject(unit.subjectKey)?.aiInteractionStyle ?? "intro-questions-responses";
  return {
    style,
    interests: profile?.interests ?? [],
    band: student.band,
    aiDoorwayAllowed: student.grade >= 4, // AI-doorway-first from Grade 4-5 (§9)
  };
}

/** One multiple-choice item. Single selection; optional Tomoe hint ladder. */
function QuestionCard({ item, unitTitle, aiFree, onResolve }: { item: Item; unitTitle: string; aiFree: boolean; onResolve: (r: ResolveResult) => void }) {
  const app = useApp();
  const [selected, setSelected] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const revealed = selected !== null;

  const hintText = hintLevel > 0 ? app.tomoe.hint(unitTitle, hintLevel, { style: "intro-questions-responses", interests: [], band: "Elem", aiDoorwayAllowed: true }) : null;

  return (
    <div className="stack gap-16">
      {item.aiFree && (
        <div className="chip" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "var(--bad)" }}>
          🔒 AI-free proof — Tomoe is off for this
        </div>
      )}
      <div style={{ fontSize: 17, fontWeight: 650 }}>{item.prompt}</div>
      <div className="stack gap-8">
        {item.choices.map((c, i) => {
          const isCorrect = i === item.correctIndex;
          const cls = !revealed ? "choice" : isCorrect ? "choice correct" : i === selected ? "choice wrong" : "choice";
          return (
            <button key={i} className={cls} disabled={revealed} onClick={() => setSelected(i)}>
              <span className="choice-key">{String.fromCharCode(65 + i)}</span>
              <span>{c}</span>
              {revealed && isCorrect && <span style={{ marginLeft: "auto" }}>✓</span>}
              {revealed && !isCorrect && i === selected && <span style={{ marginLeft: "auto" }}>✕</span>}
            </button>
          );
        })}
      </div>

      {!aiFree && !revealed && (
        <div className="row gap-12">
          <button className="btn sm ghost" onClick={() => setHintLevel((l) => Math.min(3, l + 1))}>
            💡 {hintLevel === 0 ? "Ask Tomoe for a hint" : `Another hint (${hintLevel}/3)`}
          </button>
        </div>
      )}
      {hintText && (
        <div className="tomoe">
          <div className="tomoe-face">とも</div>
          <div className="small">{hintText}</div>
        </div>
      )}

      {revealed && (
        <>
          {/* Why the answer is right, in curriculum terms. */}
          <div className="card card-pad" style={{ background: "var(--bg-sunken)", padding: 12 }}>
            <div className="small" style={{ fontWeight: 650, marginBottom: 3 }}>
              {selected === item.correctIndex ? "✓ Correct" : "✕ Not quite"}
            </div>
            <div className="small muted">{item.rationale}</div>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className={`small`} style={{ color: selected === item.correctIndex ? "var(--good)" : "var(--bad)", fontWeight: 650 }}>
              {item.aiFree ? "" : app.tomoe.encourage(selected === item.correctIndex, { style: "intro-questions-responses", interests: [], band: "Elem", aiDoorwayAllowed: true })}
            </div>
            <button
              className="btn"
              onClick={() =>
                onResolve({
                  correct: selected === item.correctIndex,
                  firstTry: hintLevel === 0,
                  hintToTerminal: hintLevel >= 2,
                })
              }
            >
              Continue →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Sequential quiz used for practice rungs, summation, and retention. */
function Quiz({ items, unitTitle, aiFree, onComplete }: { items: Item[]; unitTitle: string; aiFree: boolean; onComplete: (results: ResolveResult[]) => void }) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<ResolveResult[]>([]);
  const item = items[idx];
  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="small muted">Question {idx + 1} of {items.length}</span>
        <div className="row gap-4">
          {items.map((_, i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i < results.length ? (results[i]?.correct ? "var(--good)" : "var(--bad)") : i === idx ? "var(--accent)" : "var(--line-strong)" }} />
          ))}
        </div>
      </div>
      <QuestionCard
        key={item.id}
        item={item}
        unitTitle={unitTitle}
        aiFree={aiFree}
        onResolve={(r) => {
          const next = [...results, r];
          if (idx + 1 < items.length) {
            setResults(next);
            setIdx(idx + 1);
          } else {
            onComplete(next);
          }
        }}
      />
    </div>
  );
}

/** INSTRUCTION: teach each concept node (Tomoe) then a comprehension check. */
function InstructionPhase({ unit }: { unit: Unit }) {
  const app = useApp();
  const student = useActiveStudent();
  const rec = getUnitState(app.state, student.id, unit.id);
  const nodeIdx = Math.min(rec.nodesExposed, unit.conceptNodes.length - 1);
  const node = unit.conceptNodes[nodeIdx];
  const ctx = tutorCtx(app, unit);
  const item = useMemo(() => app.itemBank.build(unit, "check", 1, `n${nodeIdx}`)[0], [app, unit, nodeIdx]);

  const legend = app.graph.meta.codeLegend;

  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge-soft">Concept block {nodeIdx + 1} / {unit.conceptNodes.length}</span>
        <span className="small muted">{ctx.style.replaceAll("-", " ")}</span>
      </div>

      {/* The concept blocks for this unit, straight from the curriculum map. */}
      <div className="card card-pad" style={{ background: "var(--bg-sunken)", padding: 14 }}>
        <div className="small muted" style={{ marginBottom: 8 }}>Concept blocks in this unit</div>
        <div className="stack gap-4">
          {unit.conceptNodes.map((n, i) => (
            <div key={n.id} className="row gap-8" style={{ opacity: i < rec.nodesExposed ? 1 : i === nodeIdx ? 1 : 0.45 }}>
              <span className="chip code" style={{ minWidth: 26, justifyContent: "center", background: i < rec.nodesExposed ? "var(--good-soft)" : i === nodeIdx ? "var(--accent-soft)" : undefined, borderColor: i === nodeIdx ? "var(--accent)" : undefined }}>
                {i < rec.nodesExposed ? "✓" : i + 1}
              </span>
              <span className="small" style={{ fontWeight: i === nodeIdx ? 700 : 500 }}>{n.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tomoe">
        <div className="tomoe-face">とも</div>
        <div className="stack gap-4">
          <strong style={{ fontSize: 15 }}>{node.title}</strong>
          <span className="small">{app.tomoe.teach(unit, node, ctx)}</span>
          {app.tomoe.howThisRuns(unit) && <span className="small muted">{app.tomoe.howThisRuns(unit)}</span>}
        </div>
      </div>

      {/* Delivery / practice / proof, verbatim from the workbook row. */}
      <div className="row wrap gap-8">
        {unit.deliveryCodes.map((c) => (
          <span key={c} className="chip code" title={legend[c]}>{c} · {legend[c]?.split(" (")[0]}</span>
        ))}
      </div>
      <div className="stack gap-8">
        {unit.practiceSpec && <div className="small"><strong>Practice:</strong> <span className="muted">{unit.practiceSpec}</span></div>}
        {unit.masteryProofSpec && <div className="small"><strong>Mastery proof (AI-free):</strong> <span className="muted">{unit.masteryProofSpec}</span></div>}
        {unit.scholarDepthSpec && <div className="small"><strong>Scholar depth:</strong> <span className="muted">{unit.scholarDepthSpec}</span></div>}
        {unit.boardRef && <div className="small muted">📘 {unit.boardRef}</div>}
      </div>

      <QuestionCard
        key={item.id}
        item={item}
        unitTitle={unit.title}
        aiFree={false}
        onResolve={(r) => app.run((s) => ops.submitInstructionCheck(s, student, app.graph, unit.id, r.correct))}
      />
    </div>
  );
}

function PracticePhase({ unit }: { unit: Unit }) {
  const app = useApp();
  const student = useActiveStudent();
  const rec = getUnitState(app.state, student.id, unit.id);
  const items = useMemo(() => app.itemBank.build(unit, "practice", 3, `r${rec.ladderRung}`), [app, unit, rec.ladderRung]);
  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge-soft">Guided practice · ladder rung {rec.ladderRung + 1} / 3</span>
        <span className="chip code">L{rec.ladderRung + 1}</span>
      </div>
      <Quiz
        key={`rung-${rec.ladderRung}`}
        items={items}
        unitTitle={unit.title}
        aiFree={false}
        onComplete={(results) => app.run((s) => ops.submitPracticeRung(s, student, app.graph, unit.id, results))}
      />
    </div>
  );
}

function SummationPhase({ unit }: { unit: Unit }) {
  const app = useApp();
  const student = useActiveStudent();
  const items = useMemo(() => app.itemBank.build(unit, "summation", SUMMATION_ITEMS, "sum"), [app, unit]);
  return (
    <div className="stack gap-16">
      <div className="card card-pad" style={{ background: "var(--bad-soft)", borderColor: "var(--bad)" }}>
        <div className="row gap-8" style={{ fontWeight: 700, color: "var(--bad)" }}>🔒 Summation — AI-free mastery proof</div>
        <div className="small" style={{ marginTop: 4 }}>
          Proof: <em>{unit.masteryProofSpec || "written check"}</em>. Score ≥ 90% to unlock — a pass is <strong>provisional</strong> until the 1-3-7 retention checks confirm it.
        </div>
      </div>
      <Quiz
        key="summation"
        items={items}
        unitTitle={unit.title}
        aiFree
        onComplete={(results) => {
          const score = results.filter((r) => r.correct).length / results.length;
          app.run((s) => ops.submitSummation(s, student, app.graph, unit.id, score));
        }}
      />
    </div>
  );
}

/** Retention check runner (AI-free) for a specific due check. */
export function RetentionRunner({ unit, checkId, offset, onDone }: { unit: Unit; checkId: string; offset: number; onDone: () => void }) {
  const app = useApp();
  const student = useActiveStudent();
  const items = useMemo(() => app.itemBank.build(unit, "retention", RETENTION_ITEMS, `d${offset}`), [app, unit, offset]);
  return (
    <div className="stack gap-16">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="badge-soft">D+{offset} retention check · {unit.title}</span>
        <span className="chip" style={{ background: "var(--bad-soft)", color: "var(--bad)", borderColor: "var(--bad)" }}>🔒 AI-free</span>
      </div>
      <Quiz
        key={checkId}
        items={items}
        unitTitle={unit.title}
        aiFree
        onComplete={(results) => {
          const score = results.filter((r) => r.correct).length / results.length;
          app.run((s) => ops.scoreRetentionCheck(s, student, app.graph, checkId, score));
          onDone();
        }}
      />
    </div>
  );
}

/** Router that renders the correct phase for the unit's current state. */
export function LoopRunner({ unit, onExit }: { unit: Unit; onExit: () => void }) {
  const app = useApp();
  const student = useActiveStudent();
  const rec = getUnitState(app.state, student.id, unit.id);

  const startIfNeeded = () => {
    if (rec.state === "LOCKED" || rec.state === "READY") {
      app.run((s) => ops.startInstruction(s, student, app.graph, unit.id));
    }
  };

  let body;
  switch (rec.state) {
    case "LOCKED":
    case "READY":
      body = (
        <div className="stack gap-16" style={{ alignItems: "flex-start" }}>
          <div className="tomoe">
            <div className="tomoe-face">とも</div>
            <div className="small">{app.tomoe.intro(unit, tutorCtx(app, unit))}</div>
          </div>
          <button className="btn lg" onClick={startIfNeeded}>Start learning “{unit.title}”</button>
        </div>
      );
      break;
    case "INSTRUCTION":
      body = <InstructionPhase unit={unit} />;
      break;
    case "PRACTICE":
      body = <PracticePhase unit={unit} />;
      break;
    case "SUMMATION_DUE":
      body = <SummationPhase unit={unit} />;
      break;
    case "PROVISIONAL_MASTERY":
      body = (
        <div className="stack gap-16" style={{ alignItems: "flex-start" }}>
          <div style={{ fontSize: 40 }}>🎉</div>
          <h3>Provisional mastery earned!</h3>
          <p className="muted">
            You passed the AI-free proof. Dependent units unlocked, and retention checks are scheduled at D+1, D+3, D+7.
            Come back over the next days (use “Next day →”) to <strong>confirm</strong> it.
          </p>
          <button className="btn" onClick={onExit}>Back to my plan</button>
        </div>
      );
      break;
    case "CONFIRMED_MASTERY":
      body = (
        <div className="stack gap-16" style={{ alignItems: "flex-start" }}>
          <div style={{ fontSize: 40 }}>🏆</div>
          <h3>Confirmed over time</h3>
          <p className="muted">This unit held up across the 1-3-7 checks — real, durable mastery.</p>
          <button className="btn" onClick={onExit}>Back to my plan</button>
        </div>
      );
      break;
    case "REFRESH_NEEDED":
      body = (
        <div className="stack gap-16" style={{ alignItems: "flex-start" }}>
          <div style={{ fontSize: 36 }}>🔁</div>
          <h3>Quick refresh</h3>
          <p className="muted">A retention check slipped. A short micro-loop will re-secure this — no penalty, and nothing downstream is re-locked.</p>
          <button className="btn" onClick={() => app.run((s) => ops.submitRefresh(s, student, app.graph, unit.id, true))}>Do the refresh →</button>
          <button className="btn ghost" onClick={onExit}>Later</button>
        </div>
      );
      break;
  }

  const bandNote = bandForGrade(student.grade) === "PreK2";
  return (
    <div className="card card-pad animate-in" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div className="stack">
          <span className="small muted">{app.graph.subject(unit.subjectKey)?.name} · Grade {unit.grade}{unit.stream ? ` · ${unit.stream}` : ""}</span>
          <strong style={{ fontSize: 16 }}>{unit.title}</strong>
        </div>
        <button className="btn sm ghost" onClick={onExit}>✕ Close</button>
      </div>
      {bandNote && (
        <div className="chip" style={{ marginBottom: 12 }}>
          Note: PreK-2 policy is low-screen — this loop would run as smartboard + printed guided practice.
        </div>
      )}
      {body}
    </div>
  );
}

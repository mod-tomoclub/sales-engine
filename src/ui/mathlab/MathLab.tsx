/**
 * Math Lab — a walkthrough of the adaptive engine on one real child.
 *
 * Four steps, in the order the system actually runs them:
 *   Placement → Gap report → Study plan → Inside a unit.
 */
import { useMemo, useState } from "react";
import { AARAV_RESPONSES, STRAND_ENTRY } from "../../mathlab/diagnostic";
import {
  answerDiagnostic,
  buildPlan,
  nextDiagnosticQuestion,
  startDiagnostic,
  type DiagnosticState,
  type TraceLine,
} from "../../mathlab/engine";
import { getUnit } from "../../mathlab/graph";
import { AARAV } from "../../mathlab/student";
import { SegmentedControl } from "../components";
import { GapReport } from "./GapReport";
import { PlanView } from "./PlanView";
import { QuestionCard } from "./QuestionCard";
import { UnitView } from "./UnitView";

type Step = "placement" | "gaps" | "plan" | "units";

const STEPS: { value: Step; label: string }[] = [
  { value: "placement", label: "1 · Placement" },
  { value: "gaps", label: "2 · Gap report" },
  { value: "plan", label: "3 · Study plan" },
  { value: "units", label: "4 · Inside a unit" },
];

const TONE: Record<TraceLine["tone"], { color: string; glyph: string }> = {
  info: { color: "var(--ink-3)", glyph: "•" },
  up: { color: "var(--good)", glyph: "↑" },
  down: { color: "var(--warn)", glyph: "↓" },
  stop: { color: "var(--bad)", glyph: "⚑" },
};

export function MathLab() {
  const [step, setStep] = useState<Step>("placement");
  const [diag, setDiag] = useState<DiagnosticState>(() => startDiagnostic(AARAV.grade));
  const [chosen, setChosen] = useState<string | undefined>();
  const [mode, setMode] = useState<"aarav" | "self">("aarav");

  const question = nextDiagnosticQuestion(diag);
  const plan = useMemo(
    () => (diag.done ? buildPlan(diag.frontier, AARAV.grade) : []),
    [diag.done, diag.frontier],
  );

  function reset() {
    setDiag(startDiagnostic(AARAV.grade));
    setChosen(undefined);
    setStep("placement");
  }

  function commit() {
    if (!question || !chosen) return;
    const next = answerDiagnostic(diag, question, chosen);
    setDiag(next);
    setChosen(undefined);
  }

  function runToEnd() {
    let s = diag;
    let guard = 0;
    for (;;) {
      const q = nextDiagnosticQuestion(s);
      if (!q || guard++ > 60) break;
      s = answerDiagnostic(s, q, AARAV_RESPONSES[q.id] ?? q.answerId);
    }
    setDiag(s);
    setChosen(undefined);
    setStep("gaps");
  }

  return (
    <div className="stack gap-16" style={{ maxWidth: "var(--maxw)", margin: "0 auto", width: "100%" }}>
      <div className="card card-pad row gap-16 wrap" style={{ justifyContent: "space-between" }}>
        <div className="row gap-12">
          <span style={{ fontSize: 34 }}>{AARAV.avatar}</span>
          <div className="stack">
            <strong style={{ fontSize: 17 }}>{AARAV.name}</strong>
            <span className="small muted">
              Grade {AARAV.grade} · {AARAV.board} · Mathematics · {AARAV.note}
            </span>
          </div>
        </div>
        <SegmentedControl value={step} options={STEPS} onChange={setStep} />
        <button className="btn sm ghost" onClick={reset} title="Restart the walkthrough">↺ Restart</button>
      </div>

      {step === "placement" && (
        <div className="grid two-col">
          <div className="stack gap-16">
            <div className="card card-pad stack gap-8">
              <h3 style={{ fontSize: 15 }}>Rule 1 — Placement</h3>
              <p className="small muted">
                The diagnostic starts at Aarav's nominal grade and walks the prerequisite graph:
                <strong style={{ color: "var(--good)" }}> forward on success</strong>,
                <strong style={{ color: "var(--warn)" }}> back along a prerequisite edge on failure</strong>.
                It probes one strand at a time and stops as soon as it knows the direction — two
                questions per unit is enough, because the engine needs a direction, not a score.
              </p>
              <div className="row gap-8 wrap">
                <button
                  className={`btn sm ${mode === "aarav" ? "" : "secondary"}`}
                  onClick={() => { setMode("aarav"); setChosen(undefined); }}
                >
                  Replay Aarav's answers
                </button>
                <button
                  className={`btn sm ${mode === "self" ? "" : "secondary"}`}
                  onClick={() => { setMode("self"); setChosen(undefined); }}
                >
                  Answer it yourself
                </button>
                {mode === "aarav" && !diag.done && (
                  <button className="btn sm ghost" onClick={runToEnd}>Skip to the result →</button>
                )}
              </div>
            </div>

            {question ? (
              <QuestionCard
                q={question}
                chosen={mode === "aarav" ? AARAV_RESPONSES[question.id] : chosen}
                revealed={mode === "aarav" || !!chosen}
                onChoose={(id) => mode === "self" && setChosen(id)}
                header={
                  <div className="row gap-8 wrap" style={{ marginBottom: 2 }}>
                    <span className="chip code">{diag.strand}</span>
                    <span className="chip">{getUnit(diag.unitId!).title}</span>
                    <span className="chip">Grade {getUnit(diag.unitId!).board.grade}</span>
                  </div>
                }
                footer={
                  <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                    <span className="small muted">
                      {mode === "aarav" ? "Aarav's recorded answer is shown." : "Pick an answer to reveal the reasoning."}
                    </span>
                    <button className="btn sm" disabled={mode === "self" && !chosen} onClick={commit}>
                      Next →
                    </button>
                  </div>
                }
              />
            ) : (
              <div className="card card-pad stack gap-12">
                <strong>Placement complete.</strong>
                <p className="small muted">
                  {diag.attempts.length} questions across {Object.keys(STRAND_ENTRY).length} strands.
                  The engine now knows Aarav's frontier in each strand and, more usefully, where the
                  real gaps sit.
                </p>
                <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => setStep("gaps")}>
                  See the gap report →
                </button>
              </div>
            )}
          </div>

          <div className="card card-pad stack gap-12" style={{ alignSelf: "flex-start", position: "sticky", top: 16 }}>
            <h3 style={{ fontSize: 14 }}>Engine trace</h3>
            <div className="stack gap-8" style={{ maxHeight: 520, overflowY: "auto" }}>
              {diag.trace.map((t, i) => (
                <div key={i} className="row gap-8 animate-in" style={{ alignItems: "flex-start" }}>
                  <span style={{ color: TONE[t.tone].color, fontWeight: 700, flex: "0 0 auto" }}>{TONE[t.tone].glyph}</span>
                  <div className="stack">
                    <span className="small mono" style={{ color: TONE[t.tone].color, fontWeight: 650 }}>{t.rule}</span>
                    <span className="small" style={{ color: "var(--ink-2)" }}>{t.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "gaps" && <GapReport diag={diag} onNext={() => setStep("plan")} />}
      {step === "plan" && <PlanView plan={plan} diag={diag} onNext={() => setStep("units")} />}
      {step === "units" && <UnitView plan={plan} />}
    </div>
  );
}

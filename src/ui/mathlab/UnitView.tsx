/** Step 4 — inside a unit: instructional material, guided practice, assessment. */
import { useMemo, useState } from "react";
import { contentFor } from "../../mathlab/content";
import {
  MASTERY_THRESHOLD,
  reteachModality,
  scheduleRevisions,
  scoreCheck,
  type PlanEntry,
} from "../../mathlab/engine";
import { getMicro, getUnit, STRAND_META } from "../../mathlab/graph";
import type { Beat, LearningExperience, Modality, UnitContent } from "../../mathlab/types";
import { Bar, Empty, SegmentedControl } from "../components";
import { asAnswerable, QuestionCard } from "./QuestionCard";
import { VisualBlock } from "./Visuals";

const MODALITY: Record<Modality, { label: string; icon: string }> = {
  interactive: { label: "Interactive", icon: "🖐" },
  story: { label: "Story", icon: "📖" },
  game: { label: "Game", icon: "🎲" },
  "worked-example": { label: "Worked example", icon: "✏️" },
  "hands-on": { label: "Hands-on", icon: "🧱" },
  video: { label: "Video", icon: "🎬" },
};

type Section = "teach" | "guided" | "check" | "entry";
const SECTIONS: { value: Section; label: string }[] = [
  { value: "entry", label: "Entry check" },
  { value: "teach", label: "Instructional material" },
  { value: "guided", label: "Guided practice" },
  { value: "check", label: "Mastery check" },
];

function BeatBlock({ beat }: { beat: Beat }) {
  if (beat.kind === "say") return <p style={{ fontSize: 15, lineHeight: 1.55 }}>{beat.text}</p>;
  if (beat.kind === "visual")
    return (
      <div className="stack gap-4">
        <VisualBlock visual={beat.visual} />
        {beat.caption && <span className="small muted">{beat.caption}</span>}
      </div>
    );
  if (beat.kind === "worked")
    return (
      <div className="stack gap-8" style={{ background: "var(--bg-sunken)", borderRadius: 12, padding: "14px 16px" }}>
        {beat.steps.map((s, i) => (
          <div key={i} className="stack gap-4">
            <span className="mono" style={{ fontSize: 15, fontWeight: 650 }}>{s.line}</span>
            {s.note && <span className="small muted">{s.note}</span>}
          </div>
        ))}
      </div>
    );
  if (beat.kind === "do")
    return (
      <div className="row gap-8" style={{ alignItems: "flex-start", background: "var(--accent-soft)", borderRadius: 12, padding: "12px 14px" }}>
        <span>✍️</span>
        <span style={{ color: "var(--accent-ink)", fontWeight: 600 }}>{beat.text}</span>
      </div>
    );
  return (
    <details style={{ background: "var(--good-soft)", borderRadius: 12, padding: "12px 14px" }}>
      <summary className="pointer" style={{ fontWeight: 650, color: "var(--good)" }}>{beat.text}</summary>
      <div className="small" style={{ marginTop: 8, color: "var(--ink-2)" }}>{beat.answer}</div>
    </details>
  );
}

function ExperienceCard({ x, defaultOpen }: { x: LearningExperience; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const m = MODALITY[x.modality];
  const micro = getMicro(x.microConceptId);
  return (
    <div className="card" style={{ overflow: "hidden", borderColor: x.isPrimary ? "var(--line)" : "var(--warn)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="row gap-12 wrap"
        style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: 16, textAlign: "left" }}
      >
        <span style={{ fontSize: 22 }}>{m.icon}</span>
        <div className="stack grow" style={{ minWidth: 200 }}>
          <strong style={{ fontSize: 14.5 }}>{x.title}</strong>
          <span className="small muted">{micro.title} · {micro.objective}</span>
        </div>
        <span className="chip">{m.label}</span>
        <span className="chip" style={x.isPrimary ? undefined : { borderColor: "var(--warn)", color: "var(--warn)" }}>
          {x.isPrimary ? "Primary" : "Alternate doorway"}
        </span>
        <span className="chip mono">{x.minutes} min</span>
        <span className="muted">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="stack gap-12" style={{ padding: "0 16px 18px" }}>
          <div className="small muted" style={{ borderLeft: "3px solid var(--line-strong)", paddingLeft: 10 }}>
            <strong>Teaching intent:</strong> {x.intent}
          </div>
          {x.beats.map((b, i) => <BeatBlock key={i} beat={b} />)}
        </div>
      )}
    </div>
  );
}

function GuidedPractice({ content }: { content: UnitContent }) {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | undefined>();
  const [hints, setHints] = useState(0);
  const s = content.guided[i];
  if (!s) return null;
  return (
    <div className="stack gap-12">
      <p className="small muted" style={{ maxWidth: 760 }}>
        Guided practice is scaffolded and never scored for mastery. Hints are progressive: each one narrows
        the thinking without handing over the answer. A wrong answer here is cheap on purpose.
      </p>
      <div className="row gap-8">
        {content.guided.map((_, n) => (
          <div key={n} style={{ flex: 1 }}>
            <Bar value={n < i ? 1 : n === i ? 0.4 : 0} />
          </div>
        ))}
      </div>
      <QuestionCard
        q={asAnswerable(s)}
        chosen={chosen}
        revealed={!!chosen}
        onChoose={setChosen}
        hints={s.hints}
        hintsShown={hints}
        onHint={() => setHints((h) => h + 1)}
        header={
          <div className="row gap-8 wrap">
            <span className="chip">Step {i + 1} of {content.guided.length}</span>
            <span className="chip">{getMicro(s.microConceptId).title}</span>
          </div>
        }
        footer={
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 10 }}>
            <button
              className="btn sm"
              disabled={!chosen || i >= content.guided.length - 1}
              onClick={() => { setI((n) => n + 1); setChosen(undefined); setHints(0); }}
            >
              Next step →
            </button>
          </div>
        }
      />
    </div>
  );
}

function MasteryCheck({ content }: { content: UnitContent }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const qs = content.masteryCheck;
  const q = qs[i];
  const result = useMemo(() => scoreCheck(qs, answers), [qs, answers]);

  if (submitted) {
    const revisions = scheduleRevisions(content.unitId, 14);
    return (
      <div className="stack gap-16">
        <div className="card card-pad stack gap-12">
          <div className="row gap-16 wrap" style={{ justifyContent: "space-between" }}>
            <div className="stack">
              <span className="small muted">Score</span>
              <strong style={{ fontSize: 34, color: result.passed ? "var(--good)" : "var(--bad)" }}>
                {Math.round(result.score * 100)}%
              </strong>
              <span className="small muted">{result.correct} of {result.total} correct</span>
            </div>
            <div className="stack grow" style={{ minWidth: 260 }}>
              <Bar value={result.score} color={result.passed ? "var(--good)" : "var(--bad)"} height={12} />
              <span className="small muted" style={{ marginTop: 6 }}>
                Mastery threshold is {MASTERY_THRESHOLD * 100}%. {result.passed ? "Cleared." : "Not cleared."}
              </span>
            </div>
          </div>

          <div
            className="stack gap-8"
            style={{
              padding: "14px 16px", borderRadius: 12,
              background: result.passed ? "var(--good-soft)" : "var(--bad-soft)",
            }}
          >
            {result.passed ? (
              <>
                <strong style={{ color: "var(--good)" }}>Provisional only — not mastered yet.</strong>
                <span className="small" style={{ color: "var(--ink-2)" }}>
                  A 90% check moves every micro-concept to <em>practiced</em>. It becomes <em>mastered</em>
                  {" "}only when the Day-1 revision also passes. The three revision events are enqueued now:
                </span>
                <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
                  {revisions.map((r) => (
                    <span key={r.stage} className="chip mono">D+{r.stage} · day {r.dueDay}</span>
                  ))}
                </div>
                <span className="small" style={{ color: "var(--ink-2)" }}>
                  Dependents unlock immediately, though — progress is never blocked on retention.
                </span>
              </>
            ) : (
              <>
                <strong style={{ color: "var(--bad)" }}>Below threshold — targeted re-teach, not a repeat.</strong>
                <span className="small" style={{ color: "var(--ink-2)" }}>
                  Only the missed micro-concepts are re-taught, and never through the modality that just
                  failed.
                </span>
              </>
            )}
          </div>
        </div>

        {result.weakMicroConceptIds.length > 0 && (
          <div className="card card-pad stack gap-12">
            <h3 style={{ fontSize: 15 }}>Re-teach plan</h3>
            <div className="stack gap-8">
              {result.weakMicroConceptIds.map((id) => {
                const micro = getMicro(id);
                const failedVia = content.experiences.find((x) => x.microConceptId === id && x.isPrimary)?.modality;
                const next = reteachModality(micro.primaryModality, micro.altModality, failedVia) as Modality;
                return (
                  <div key={id} className="row gap-12 wrap" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                    <div className="stack grow" style={{ minWidth: 220 }}>
                      <strong style={{ fontSize: 14 }}>{micro.title}</strong>
                      <span className="small muted">{micro.objective}</span>
                    </div>
                    <span className="chip" style={{ textDecoration: "line-through", opacity: 0.6 }}>
                      {MODALITY[micro.primaryModality].icon} {MODALITY[micro.primaryModality].label}
                    </span>
                    <span className="muted">→</span>
                    <span className="chip" style={{ borderColor: "var(--accent)", color: "var(--accent-ink)" }}>
                      {MODALITY[next].icon} {MODALITY[next].label}
                    </span>
                  </div>
                );
              })}
            </div>
            {result.misconceptions.length > 0 && (
              <div className="stack gap-4" style={{ marginTop: 4 }}>
                <span className="small muted">Misconceptions logged for the teacher:</span>
                {result.misconceptions.map((m) => (
                  <span key={m} className="small" style={{ borderLeft: "3px solid var(--bad)", paddingLeft: 10 }}>{m}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className="btn secondary"
          style={{ alignSelf: "flex-start" }}
          onClick={() => { setAnswers({}); setI(0); setSubmitted(false); }}
        >
          ↺ Take it again
        </button>
      </div>
    );
  }

  const chosen = answers[q.id];
  const isLast = i === qs.length - 1;
  return (
    <div className="stack gap-12">
      <p className="small muted" style={{ maxWidth: 760 }}>
        The mastery check mixes all micro-concepts together and is scored at {MASTERY_THRESHOLD * 100}%.
        Answers are not revealed item by item — this is assessment, not practice.
      </p>
      <div className="row gap-4">
        {qs.map((x, n) => (
          <div
            key={x.id}
            style={{
              flex: 1, height: 6, borderRadius: 3,
              background: answers[x.id] ? "var(--accent)" : n === i ? "var(--line-strong)" : "var(--bg-sunken)",
            }}
          />
        ))}
      </div>
      <QuestionCard
        q={q}
        chosen={chosen}
        revealed={false}
        onChoose={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))}
        header={
          <div className="row gap-8 wrap">
            <span className="chip">Question {i + 1} of {qs.length}</span>
            <span className="chip">{getMicro(q.microConceptId).title}</span>
            <span className="chip mono">difficulty {q.difficulty}</span>
          </div>
        }
        footer={
          <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
            <button className="btn sm ghost" disabled={i === 0} onClick={() => setI((n) => n - 1)}>← Back</button>
            {isLast ? (
              <button className="btn sm" disabled={Object.keys(answers).length < qs.length} onClick={() => setSubmitted(true)}>
                Submit check
              </button>
            ) : (
              <button className="btn sm" disabled={!chosen} onClick={() => setI((n) => n + 1)}>Next →</button>
            )}
          </div>
        }
      />
    </div>
  );
}

function EntryCheck({ content }: { content: UnitContent }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <div className="stack gap-12">
      <p className="small muted" style={{ maxWidth: 760 }}>
        Every unit opens with five questions over its <em>direct prerequisites</em>. This is the second gap
        detection path: if a child fails it, the engine walks the prerequisite chain down before teaching a
        single thing. It is cheap, and it catches gaps the enrolment diagnostic missed.
      </p>
      {content.entryCheck.map((q) => (
        <QuestionCard
          key={q.id}
          q={q}
          chosen={answers[q.id]}
          revealed={!!answers[q.id]}
          onChoose={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))}
          header={<span className="chip">{getMicro(q.microConceptId).title}</span>}
        />
      ))}
    </div>
  );
}

export function UnitView({ plan }: { plan: PlanEntry[] }) {
  const [unitId, setUnitId] = useState(plan[0]?.unitId ?? "");
  const [section, setSection] = useState<Section>("teach");
  const content = contentFor(unitId);
  const unit = unitId ? getUnit(unitId) : null;

  if (!plan.length) return <Empty icon="🧭" title="Run placement first" sub="The plan is derived from the diagnostic." />;

  return (
    <div className="stack gap-16">
      <div className="card card-pad stack gap-12">
        <span className="small muted">Aarav's five units, in plan order</span>
        <div className="row gap-8 wrap">
          {plan.map((p) => {
            const u = getUnit(p.unitId);
            const active = p.unitId === unitId;
            return (
              <button
                key={p.unitId}
                onClick={() => setUnitId(p.unitId)}
                className="row gap-8"
                style={{
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                  background: active ? "var(--accent-soft)" : "var(--bg-elev)",
                  color: active ? "var(--accent-ink)" : "var(--ink-2)",
                  borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontWeight: 640, fontSize: 13.5,
                }}
              >
                <span className="mono">{p.order + 1}</span>
                {u.title.split(":")[0]}
                <span className="chip" style={{ padding: "1px 7px" }}>G{u.board.grade}</span>
              </button>
            );
          })}
        </div>
      </div>

      {unit && content ? (
        <>
          <div className="card card-pad stack gap-12">
            <div className="row gap-12 wrap" style={{ justifyContent: "space-between" }}>
              <div className="stack">
                <h3 style={{ fontSize: 18 }}>{unit.title}</h3>
                <span className="small muted">{unit.board.chapterRef}</span>
              </div>
              <span className="chip" style={{ borderColor: STRAND_META[unit.strand].color, color: STRAND_META[unit.strand].color }}>
                {STRAND_META[unit.strand].icon} {STRAND_META[unit.strand].label}
              </span>
            </div>
            <div className="small" style={{ color: "var(--ink-2)", background: "var(--bg-sunken)", borderRadius: 12, padding: "12px 14px" }}>
              <strong>Textbook context: </strong>{unit.context}
            </div>
            <div className="small" style={{ color: "var(--ink-2)" }}>
              <strong>Why Aarav is here: </strong>{content.rationale}
            </div>
            <div className="row gap-8 wrap">
              {unit.microConcepts.map((m) => (
                <span key={m.id} className="chip" title={m.objective}>{m.title}</span>
              ))}
            </div>
          </div>

          <SegmentedControl value={section} options={SECTIONS} onChange={setSection} />

          {section === "entry" && <EntryCheck content={content} />}
          {section === "teach" && (
            <div className="stack gap-12">
              <p className="small muted" style={{ maxWidth: 780 }}>
                Every micro-concept ships a primary experience plus at least one alternate in a different
                modality. The choice is editorial, not random — place value gets manipulatives, word
                problems get a story, fluency gets a game. The alternate exists so that re-teaching after a
                failed check never repeats the modality that just failed.
              </p>
              {content.experiences.map((x, i) => (
                <ExperienceCard key={x.id} x={x} defaultOpen={i === 0} />
              ))}
            </div>
          )}
          {section === "guided" && <GuidedPractice key={unitId} content={content} />}
          {section === "check" && <MasteryCheck key={unitId} content={content} />}
        </>
      ) : (
        <Empty icon="📝" title="Content not authored yet" sub="This unit is on the plan but its content pack has not been written." />
      )}
    </div>
  );
}

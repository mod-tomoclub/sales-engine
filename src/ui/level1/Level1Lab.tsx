/**
 * Level 1 — the Concept Block loop made visible for one student.
 *
 * Learn (active AI tutor) → Practise (guided) → Check (support-free) →
 * Update (evidence → context model → Session 2 plan, every decision cited).
 *
 * Design rule for this surface: one primary action per moment. The student
 * only ever sees reply choices, one hint chip, and answer choices.
 */
import { useMemo, useState } from "react";
import {
  answerCheck,
  answerPractise,
  chooseLearnOption,
  currentCheckItem,
  currentNode,
  currentPractiseItem,
  deriveContext,
  planSession2,
  requestHint,
  ScriptedTutor,
  startBlock,
  type BlockState,
} from "../../level1/engine";
import { FORCE_EFFECTS, MEERA_SESSION1 } from "../../level1/content/force-effects";
import { SectionTitle, SegmentedControl } from "../components";
import { LiveTutor } from "./LiveTutor";

const tutor = new ScriptedTutor();
const STUDENT = "Meera";

const PHASES = [
  { key: "learn", label: "1 · Learn" },
  { key: "practise", label: "2 · Practise" },
  { key: "check", label: "3 · Check" },
  { key: "update", label: "4 · Session 2" },
] as const;

const DOORWAY_LABEL: Record<string, string> = {
  "everyday-example": "everyday example",
  "diagram-contrast": "diagram contrast",
  "act-it-out": "act it out",
  "thought-experiment": "thought experiment",
};

function fresh(): BlockState {
  return startBlock(STUDENT, FORCE_EFFECTS, tutor);
}

/** Meera's whole Session 1, replayed through the same engine calls a live
 *  student would trigger — the demo shortcut for investor walkthroughs. */
function autoPlayMeera(): BlockState {
  let s = fresh();
  let guard = 0;
  while (s.phase === "learn" && s.nodeId && guard++ < 30) {
    s = chooseLearnOption(s, MEERA_SESSION1.learn[s.nodeId] ?? currentNode(s)!.options[0].id, tutor);
  }
  while (s.phase === "practise" && guard++ < 60) {
    const item = currentPractiseItem(s)!;
    const script = MEERA_SESSION1.practise[item.id];
    for (let h = 0; h < (script?.hintsBefore ?? 0); h++) s = requestHint(s, tutor);
    for (const pick of script?.picks ?? [item.options.find((o) => o.correct)!.id]) {
      s = answerPractise(s, pick);
    }
  }
  while (s.phase === "check" && guard++ < 30) {
    const item = currentCheckItem(s)!;
    s = answerCheck(s, MEERA_SESSION1.check[item.id] ?? item.options[0].id);
  }
  return s;
}

type Subtopic = "s1" | "s2";
const SUBTOPIC_OPTS: { value: Subtopic; label: string }[] = [
  { value: "s2", label: "🎙️ ST2 · Motion, speed & time — live tutor" },
  { value: "s1", label: "📜 ST1 · Force & its effects — scripted" },
];

export function Level1Lab() {
  const [sub, setSub] = useState<Subtopic>("s2");
  return (
    <div className="stack gap-16" style={{ maxWidth: "var(--maxw)", margin: "0 auto", width: "100%" }}>
      <div className="row" style={{ justifyContent: "center" }}>
        <SegmentedControl value={sub} options={SUBTOPIC_OPTS} onChange={setSub} />
      </div>
      {sub === "s2" ? <LiveTutor /> : <ScriptedBlock />}
    </div>
  );
}

function ScriptedBlock() {
  const [s, setS] = useState<BlockState>(fresh);

  const model = useMemo(
    () => (s.phase === "update" ? deriveContext(STUDENT, s.content, s.evidence) : null),
    [s.phase, s.content, s.evidence],
  );
  const plan = useMemo(() => (model ? planSession2(model, s.content) : null), [model, s.content]);

  return (
    <div className="stack gap-16" style={{ maxWidth: "var(--maxw)", margin: "0 auto", width: "100%" }}>
      <div className="card card-pad row gap-12 wrap">
        <div className="stack" style={{ lineHeight: 1.2 }}>
          <strong>Level 1 · {FORCE_EFFECTS.title}</strong>
          <span className="small muted">
            {FORCE_EFFECTS.subtopic} · Grade 7 · ICSE — Session 1 with {STUDENT}
          </span>
        </div>
        <div className="grow" />
        <div className="row gap-8 wrap">
          {PHASES.map((p) => (
            <span
              key={p.key}
              className="chip"
              style={
                s.phase === p.key
                  ? { background: "var(--accent-soft)", borderColor: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }
                  : undefined
              }
            >
              {p.label}
            </span>
          ))}
          <span className="chip mono" title="Typed evidence records captured so far">
            evidence · {s.evidence.length}
          </span>
        </div>
        <div className="row gap-8">
          {s.phase === "learn" && s.transcript.length <= 1 && (
            <button className="btn sm secondary" onClick={() => setS(autoPlayMeera())}>
              ▶ Play Meera's whole session
            </button>
          )}
          <button className="btn sm ghost" onClick={() => setS(fresh())} title="Restart Session 1">
            ↺
          </button>
        </div>
      </div>

      {s.phase === "learn" && <LearnView s={s} setS={setS} />}
      {s.phase === "practise" && <PractiseView s={s} setS={setS} />}
      {s.phase === "check" && <CheckView s={s} setS={setS} />}
      {s.phase === "update" && model && plan && <UpdateView s={s} model={model} plan={plan} />}

      <p className="small muted" style={{ textAlign: "center" }}>
        Tutor turns come from an approved script behind the TutorProvider seam — the Anthropic gateway drops in with the
        same contract. Content is illustrative and pipeline-pending.
      </p>
    </div>
  );
}

/* ---------------- Learn ---------------- */

function LearnView({ s, setS }: { s: BlockState; setS: (s: BlockState) => void }) {
  const node = currentNode(s);
  return (
    <div className="card card-pad stack gap-12">
      <SectionTitle right={node && <span className="chip">doorway · {DOORWAY_LABEL[node.doorway]}</span>}>
        Learn — think along with the tutor
      </SectionTitle>
      <div className="stack gap-8">
        {s.transcript.map((line, i) =>
          line.speaker === "tutor" ? (
            <div key={i} className="row gap-8" style={{ alignItems: "flex-start" }}>
              <span className="tomoe-face" aria-hidden>
                ◕‿◕
              </span>
              <div className="stack gap-4" style={{ maxWidth: "72ch" }}>
                <div className="tomoe" style={{ padding: "10px 14px" }}>
                  {line.text}
                </div>
                {line.visual && (
                  <div
                    className="small muted"
                    style={{ border: "1.5px dashed var(--line-strong)", borderRadius: 10, padding: "10px 14px" }}
                  >
                    ⬚ {line.visual}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="card"
              style={{
                alignSelf: "flex-end",
                maxWidth: "60ch",
                padding: "10px 14px",
                background: "var(--accent-soft)",
                borderColor: "var(--accent)",
              }}
            >
              {line.text}
            </div>
          ),
        )}
      </div>
      {node && (
        <div className="stack gap-8" style={{ marginTop: 4 }}>
          <span className="small muted">Your reply — commit to an idea, then we test it:</span>
          {node.options.map((o) => (
            <button key={o.id} className="choice" onClick={() => setS(chooseLearnOption(s, o.id, tutor))}>
              <span className="choice-key">{o.id.toUpperCase()}</span>
              {o.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Practise ---------------- */

function PractiseView({ s, setS }: { s: BlockState; setS: (s: BlockState) => void }) {
  const item = currentPractiseItem(s);
  if (!item) return null;
  return (
    <div className="card card-pad stack gap-12">
      <SectionTitle
        right={
          <span className="small muted mono">
            Q{s.pIndex + 1} / {s.content.practise.length} · hints {s.pHintsUsed}/3
          </span>
        }
      >
        Guided practise — help on request, never pushed
      </SectionTitle>
      {s.pFeedback === "correct" && <div className="chip" style={{ alignSelf: "flex-start", color: "var(--good)" }}>✓ Solved — next one</div>}
      <p style={{ margin: 0, maxWidth: "70ch" }}>{item.prompt}</p>
      <div className="stack gap-8">
        {item.options.map((o) => (
          <button key={o.id} className="choice" onClick={() => setS(answerPractise(s, o.id))}>
            <span className="choice-key">{o.id.toUpperCase()}</span>
            {o.text}
          </button>
        ))}
      </div>
      {s.pFeedback === "not-yet" && (
        <div className="row gap-8" style={{ alignItems: "flex-start" }}>
          <span className="tomoe-face" aria-hidden>◕‿◕</span>
          <div className="tomoe" style={{ padding: "8px 12px" }}>Not yet — think it through once more. Want a hint?</div>
        </div>
      )}
      {s.lastHint && (
        <div className="row gap-8" style={{ alignItems: "flex-start" }}>
          <span className="tomoe-face" aria-hidden>◕‿◕</span>
          <div className="tomoe" style={{ padding: "8px 12px" }}>
            <span className="small muted mono">hint {s.pHintsUsed} · </span>
            {s.lastHint}
          </div>
        </div>
      )}
      <div className="row gap-8">
        <button className="btn sm secondary" disabled={s.pHintsUsed >= 3} onClick={() => setS(requestHint(s, tutor))}>
          Give me a hint
        </button>
        <span className="small muted">Hints are strategy only — how you reach the answer is recorded as evidence.</span>
      </div>
    </div>
  );
}

/* ---------------- Check ---------------- */

function CheckView({ s, setS }: { s: BlockState; setS: (s: BlockState) => void }) {
  const item = currentCheckItem(s);
  if (!item) return null;
  return (
    <div className="card card-pad stack gap-12">
      <SectionTitle right={<span className="small muted mono">Q{s.cIndex + 1} / {s.content.check.length}</span>}>
        Independent check — on your own
      </SectionTitle>
      <div className="chip" style={{ alignSelf: "flex-start" }}>
        🔇 Tutor off · no hints · new questions — this is how the system learns what you can do alone
      </div>
      <p style={{ margin: 0, maxWidth: "70ch" }}>{item.prompt}</p>
      <div className="stack gap-8">
        {item.options.map((o) => (
          <button key={o.id} className="choice" onClick={() => setS(answerCheck(s, o.id))}>
            <span className="choice-key">{o.id.toUpperCase()}</span>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Update ---------------- */

const STATUS_COLOR: Record<string, string> = { resolved: "var(--good)", surfaced: "var(--warn)", persisting: "var(--bad)" };

function UpdateView({
  s,
  model,
  plan,
}: {
  s: BlockState;
  model: NonNullable<ReturnType<typeof deriveContext>>;
  plan: NonNullable<ReturnType<typeof planSession2>>;
}) {
  const concept = model.concepts[0];
  return (
    <div className="grid three-col" style={{ alignItems: "start" }}>
      <div className="card card-pad stack gap-8">
        <SectionTitle>Evidence from Session 1</SectionTitle>
        <span className="small muted">Append-only, typed — not a score. This is what the block sends back.</span>
        {s.evidence.map((e) => (
          <div key={e.id} className="row gap-8" style={{ alignItems: "flex-start" }}>
            <span className="chip code mono" style={{ flex: "none" }}>{e.id}</span>
            <div className="stack" style={{ lineHeight: 1.35 }}>
              <span className="small mono muted">
                {e.phase} · {e.kind}
                {e.kind === "misconception" && (
                  <strong style={{ color: STATUS_COLOR[e.status], marginLeft: 6 }}>{e.status}</strong>
                )}
              </span>
              <span className="small">{"note" in e ? e.note : ""}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad stack gap-10">
        <SectionTitle>{model.student}'s context — derived</SectionTitle>
        <span className="small muted">Recomputable from the log at any time; nothing is hand-edited.</span>
        <div className="stack gap-4">
          <span className="small mono muted">UNDERSTANDING</span>
          <div className="row gap-8">
            <strong>{concept.title}</strong>
            <span className="chip" style={{ color: concept.state === "practised" ? "var(--good)" : "var(--warn)" }}>
              {concept.state}
            </span>
          </div>
          <span className="small muted">
            Check {model.checkSummary.correct}/{model.checkSummary.total} unaided — “mastered” waits for Day 3 + Day 7
            retention.
          </span>
        </div>
        <div className="stack gap-4">
          <span className="small mono muted">MISCONCEPTIONS</span>
          {model.misconceptions.map((m) => (
            <div key={m.tag} className="stack" style={{ lineHeight: 1.35 }}>
              <span className="small">
                <strong className="mono">{m.tag}</strong>{" "}
                <strong style={{ color: STATUS_COLOR[m.status] }}>{m.status}</strong> <Cite ids={m.evidence} />
              </span>
              <span className="small muted">“{m.belief}”</span>
            </div>
          ))}
        </div>
        <div className="stack gap-4">
          <span className="small mono muted">DOORWAYS</span>
          {model.doorways.map((d) => (
            <span key={d.doorway} className="small">
              {d.worked ? "✓" : "✗"} {DOORWAY_LABEL[d.doorway]} {d.worked ? "works for Meera" : "did not land"}{" "}
              <Cite ids={d.evidence} />
            </span>
          ))}
        </div>
        <div className="stack gap-4">
          <span className="small mono muted">SUPPORT</span>
          <span className="small">
            Level {model.supportLevel}/3 · trending {model.supportTrend} <Cite ids={model.supportEvidence} />
          </span>
        </div>
      </div>

      <div className="card card-pad stack gap-10">
        <SectionTitle>What changes in Session 2</SectionTitle>
        <span className="small muted">Every decision cites the evidence that justifies it — no black boxes.</span>
        {plan.decisions.map((d, i) => (
          <div key={i} className="stack gap-4" style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 10 }}>
            <strong style={{ fontSize: 13.5 }}>{d.decision}</strong>
            <span className="small muted">{d.detail}</span>
            <span className="small">
              because <Cite ids={d.because} />
            </span>
          </div>
        ))}
        <span className="small muted" style={{ marginTop: 4 }}>
          Session 2 itself — the plan executed — is the next build milestone.
        </span>
      </div>
    </div>
  );
}

function Cite({ ids }: { ids: string[] }) {
  return (
    <span className="mono small" style={{ color: "var(--accent-ink)" }} title="Evidence records behind this line">
      [{[...new Set(ids)].join(" ")}]
    </span>
  );
}

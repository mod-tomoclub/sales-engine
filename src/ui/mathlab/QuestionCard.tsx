/** One answerable item. Used by placement, guided practice and mastery checks. */
import type { Option, Question, GuidedStep } from "../../mathlab/types";
import { VisualBlock } from "./Visuals";

type Answerable = Pick<Question, "id" | "prompt" | "options" | "answerId" | "explanation" | "visual">;

export function QuestionCard({
  q,
  chosen,
  onChoose,
  revealed,
  hintsShown = 0,
  hints = [],
  onHint,
  header,
  footer,
}: {
  q: Answerable;
  chosen?: string;
  onChoose: (optionId: string) => void;
  revealed: boolean;
  hintsShown?: number;
  hints?: string[];
  onHint?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const correct = chosen === q.answerId;
  const chosenOpt = q.options.find((o) => o.id === chosen);

  return (
    <div className="card card-pad stack gap-8 animate-in">
      {header}
      <div style={{ fontSize: 16.5, fontWeight: 650, lineHeight: 1.4 }}>{q.prompt}</div>
      {q.visual && <VisualBlock visual={q.visual} />}

      <div className="stack gap-8">
        {q.options.map((o: Option, i) => {
          const isChosen = chosen === o.id;
          const showCorrect = revealed && o.id === q.answerId;
          const showWrong = revealed && isChosen && o.id !== q.answerId;
          return (
            <button
              key={o.id}
              className={`choice${showCorrect ? " correct" : ""}${showWrong ? " wrong" : ""}`}
              disabled={revealed}
              onClick={() => onChoose(o.id)}
              style={{ textAlign: "left" }}
            >
              <span className="choice-key">{"ABCD"[i]}</span>
              <span className="grow">{o.text}</span>
              {showCorrect && <span style={{ color: "var(--good)" }}>✓</span>}
              {showWrong && <span style={{ color: "var(--bad)" }}>✕</span>}
            </button>
          );
        })}
      </div>

      {!revealed && hints.length > 0 && (
        <div className="stack gap-8" style={{ marginTop: 4 }}>
          {hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="row gap-8 animate-in" style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "9px 12px", alignItems: "flex-start" }}>
              <span style={{ flex: "0 0 auto" }}>💡</span>
              <span className="small" style={{ color: "var(--accent-ink)", fontWeight: 550 }}>{h}</span>
            </div>
          ))}
          {hintsShown < hints.length && (
            <button className="btn sm ghost" style={{ alignSelf: "flex-start" }} onClick={onHint}>
              Give me a hint ({hints.length - hintsShown} left)
            </button>
          )}
        </div>
      )}

      {revealed && (
        <div
          className="stack gap-4 animate-in"
          style={{
            marginTop: 4, padding: "11px 14px", borderRadius: 12,
            background: correct ? "var(--good-soft)" : "var(--bad-soft)",
            border: `1px solid ${correct ? "var(--good)" : "var(--bad)"}33`,
          }}
        >
          <strong className="small" style={{ color: correct ? "var(--good)" : "var(--bad)" }}>
            {correct ? "Correct" : "Not quite"}
          </strong>
          {!correct && chosenOpt?.misconception && (
            <div className="small" style={{ color: "var(--ink-2)" }}>
              <strong>What this answer reveals:</strong> {chosenOpt.misconception}
            </div>
          )}
          <div className="small" style={{ color: "var(--ink-2)" }}>{q.explanation}</div>
        </div>
      )}

      {footer}
    </div>
  );
}

export type { Answerable };
export function asAnswerable(s: GuidedStep): Answerable {
  return { id: s.id, prompt: s.prompt, options: s.options, answerId: s.answerId, explanation: s.explanation, visual: s.visual };
}

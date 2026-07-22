/** Terse authoring helpers so unit content files stay readable. */
import type { GuidedStep, Question, QuestionPurpose, Visual } from "../types";

/**
 * Author a question. `opts` is [correctText, ...wrongTexts] and `wrong` gives the
 * misconception each wrong option reveals, in the same order.
 */
export function qn(args: {
  id: string;
  micro: string;
  purpose: QuestionPurpose;
  difficulty: 1 | 2 | 3;
  prompt: string;
  visual?: Visual;
  correct: string;
  wrong: [string, string][];
  why: string;
}): Question {
  const options = [
    { id: "a", text: args.correct },
    ...args.wrong.map(([text, misconception], i) => ({ id: "bcd"[i], text, misconception })),
  ];
  // Deterministic shuffle so the answer is not always first, but replays identically.
  const seed = args.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotated = options.map((_, i) => options[(i + seed) % options.length]);
  return {
    id: args.id,
    microConceptId: args.micro,
    purpose: args.purpose,
    difficulty: args.difficulty,
    prompt: args.prompt,
    visual: args.visual,
    options: rotated,
    answerId: "a",
    explanation: args.why,
  };
}

export function step(args: {
  id: string;
  micro: string;
  prompt: string;
  visual?: Visual;
  correct: string;
  wrong: [string, string][];
  hints: string[];
  why: string;
}): GuidedStep {
  const q = qn({ ...args, purpose: "practice", difficulty: 1, why: args.why });
  return {
    id: args.id,
    microConceptId: args.micro,
    prompt: args.prompt,
    visual: args.visual,
    options: q.options,
    answerId: q.answerId,
    hints: args.hints,
    explanation: args.why,
  };
}

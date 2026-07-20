/**
 * Tomoe — the child-facing personality of Student AI (§9).
 * Socratic: explains why, gives hints/strategy, NEVER final answers during
 * practice. Disabled during summation + retention scoring (AI-free proof).
 * Uses InterestProfile doorways to frame concepts (AI-doorway-first from G4-5).
 *
 * Rule-based here (deployable, no backend). Behind the TutorProvider port so the
 * AI Gateway (§15, Anthropic) drops in with the same contract — persona/prompt
 * are per-subject registry assets, versioned + approved.
 */
import type { AiInteractionStyle, Unit } from "../../domain/curriculum";
import type { ConceptNode } from "../../domain/curriculum";
import { hashSeed, makeRng, pick } from "../rng";

export interface TutorContext {
  style: AiInteractionStyle;
  interests: string[];
  band: string;
  aiDoorwayAllowed: boolean;
}

export interface TutorProvider {
  intro(unit: Unit, ctx: TutorContext): string;
  teach(unit: Unit, node: ConceptNode, ctx: TutorContext): string;
  /** Hint ladder for an item — strategy only, never the answer. Level 1..3. */
  hint(unitTitle: string, level: number, ctx: TutorContext): string;
  encourage(correct: boolean, ctx: TutorContext): string;
}

const STYLE_INTRO: Record<AiInteractionStyle, string> = {
  "intro-questions-responses": "Let's build this step by step. I'll ask, you think, then we go.",
  "experiment-simulation": "Let's run this like an experiment — predict first, then test.",
  "story-narrative": "Let me tell you the story behind this — it'll make the ideas stick.",
  "conversational-phonics-reading": "Let's read and talk this through together, out loud.",
};

const STYLE_TEACH: Record<AiInteractionStyle, (node: string) => string> = {
  "intro-questions-responses": (n) => `Here's the idea of ${n}. What do you notice first? Try it, then I'll nudge.`,
  "experiment-simulation": (n) => `For ${n}, picture the setup. What do you predict will happen, and why?`,
  "story-narrative": (n) => `Think of ${n} as a scene in a bigger story. Who are the characters, what changes?`,
  "conversational-phonics-reading": (n) => `Let's sound out ${n} together. Say it, then tell me what you hear.`,
};

const HINTS = [
  (u: string) => `Think about what “${u}” is really about. What is the one big idea here?`,
  (u: string) => `Rule out the option that clearly belongs to a different topic than “${u}”.`,
  (u: string) => `You've narrowed it down — which choice uses the vocabulary we practised in “${u}”?`,
];

const PRAISE = ["Nice — you reasoned that out.", "That's it. See how you thought first?", "Strong move. Keep going.", "Yes! Your thinking is getting sharper."];
const NUDGE = ["Not quite — think first, then try again.", "Close. What did the question really ask?", "Let's slow down one step. Re-read it.", "Good attempt — check the tricky word."];

export class RuleBasedTomoe implements TutorProvider {
  intro(_unit: Unit, ctx: TutorContext): string {
    const base = STYLE_INTRO[ctx.style];
    if (ctx.aiDoorwayAllowed && ctx.interests.length) {
      return `${base} And since you're into ${ctx.interests[0]}, I'll use that to explain.`;
    }
    return base;
  }

  teach(unit: Unit, node: ConceptNode, ctx: TutorContext): string {
    const base = STYLE_TEACH[ctx.style](node.title);
    if (ctx.aiDoorwayAllowed && ctx.interests.length) {
      const rng = makeRng(hashSeed(`${unit.id}:${node.id}`));
      const doorway = pick(rng, ctx.interests);
      return `${base}  (Doorway: imagine this through ${doorway}, then we'll use the standard way.)`;
    }
    return base;
  }

  hint(unitTitle: string, level: number, _ctx: TutorContext): string {
    const l = Math.max(1, Math.min(3, level));
    return HINTS[l - 1](unitTitle);
  }

  encourage(correct: boolean, ctx: TutorContext): string {
    const rng = makeRng(hashSeed(`${ctx.style}:${correct}:${Math.floor(Math.random() * 1e6)}`));
    return correct ? pick(rng, PRAISE) : pick(rng, NUDGE);
  }
}

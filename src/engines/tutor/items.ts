/**
 * Item bank — generated from the ICSE Concept-Block map (§4.1) so every item is
 * grounded in the curriculum the school actually teaches.
 *
 * Hard rules (these were the bug that made earlier items nonsense):
 *  1. Distractors NEVER cross subjects. A Mathematics item can only offer
 *     Mathematics concept blocks as options.
 *  2. Distractors are drawn from units near the same grade, so wrong options are
 *     plausible near-misses rather than absurd ones.
 *  3. Every correct answer is a real concept block, sequence position, mastery
 *     proof, or prerequisite taken verbatim from the workbook row.
 *
 * These are still *recognition* items. True subject practice (numericals, oral
 * teach-backs, lab write-ups) is authored by the content pipeline (§14.2) and
 * human-approved before a child sees it — this bank exists so the mastery loop
 * is exercisable end-to-end without a backend.
 *
 * Behind the ItemProvider port so the real generator / AI gateway swaps in (§15).
 */
import type { CurriculumGraph } from "../../curriculum/graph";
import type { AiInteractionStyle, Unit } from "../../domain/curriculum";
import { hashSeed, makeRng, shuffle } from "../rng";

export type ItemKind = "check" | "practice" | "summation" | "retention";
export type ItemForm = "belongs" | "sequence" | "proof" | "prereq";

export interface Item {
  id: string;
  kind: ItemKind;
  form: ItemForm;
  prompt: string;
  choices: string[];
  correctIndex: number;
  /** The concept block (or spec) this item is about — shown after answering. */
  conceptNodeTitle: string;
  /** Why the answer is right, in curriculum terms. */
  rationale: string;
  aiFree: boolean;
}

export interface ItemProvider {
  build(unit: Unit, kind: ItemKind, count: number, salt?: string): Item[];
}

interface PoolNode {
  unitId: string;
  unitTitle: string;
  grade: number;
  title: string;
}

const BELONGS_STEM: Record<AiInteractionStyle, (u: string) => string> = {
  "intro-questions-responses": (u) => `Which of these is a concept block inside “${u}”?`,
  "experiment-simulation": (u) => `In “${u}”, which of these do we actually investigate?`,
  "story-narrative": (u) => `“${u}” covers which of these ideas?`,
  "conversational-phonics-reading": (u) => `Which skill is part of “${u}”?`,
};

export class GraphItemBank implements ItemProvider {
  /** Concept blocks grouped by subject — the ONLY source of distractors. */
  private nodesBySubject = new Map<string, PoolNode[]>();
  /** Mastery-proof specs by subject, for "proof" items. */
  private proofsBySubject = new Map<string, { unitId: string; proof: string }[]>();

  constructor(private graph: CurriculumGraph) {
    for (const u of graph.allUnits) {
      const list = this.nodesBySubject.get(u.subjectKey) ?? [];
      for (const n of u.conceptNodes) {
        list.push({ unitId: u.id, unitTitle: u.title, grade: u.grade, title: n.title });
      }
      this.nodesBySubject.set(u.subjectKey, list);

      if (u.masteryProofSpec) {
        const pl = this.proofsBySubject.get(u.subjectKey) ?? [];
        pl.push({ unitId: u.id, proof: u.masteryProofSpec });
        this.proofsBySubject.set(u.subjectKey, pl);
      }
    }
  }

  /**
   * Plausible wrong options: same subject, closest grades first, never from the
   * unit itself and never duplicating text already on the card.
   */
  private distractors(unit: Unit, exclude: Set<string>, n: number, rng: () => number): string[] {
    const pool = (this.nodesBySubject.get(unit.subjectKey) ?? []).filter(
      (p) => p.unitId !== unit.id && !exclude.has(p.title),
    );
    if (pool.length === 0) return [];
    // Prefer near-grade units; widen the window until we have enough candidates.
    let candidates: PoolNode[] = [];
    for (const window of [1, 2, 3, 12]) {
      candidates = pool.filter((p) => Math.abs(p.grade - unit.grade) <= window);
      if (candidates.length >= n * 3) break;
    }
    if (candidates.length < n) candidates = pool;

    const picked: string[] = [];
    const seen = new Set<string>();
    for (const p of shuffle(rng, candidates)) {
      if (seen.has(p.title)) continue;
      seen.add(p.title);
      picked.push(p.title);
      if (picked.length >= n) break;
    }
    return picked;
  }

  private assemble(
    id: string,
    kind: ItemKind,
    form: ItemForm,
    prompt: string,
    correct: string,
    distractors: string[],
    rationale: string,
    rng: () => number,
  ): Item | null {
    if (!correct || distractors.length < 2) return null;
    const choices = shuffle(rng, [correct, ...distractors.slice(0, 3)]);
    return {
      id,
      kind,
      form,
      prompt,
      choices,
      correctIndex: choices.indexOf(correct),
      conceptNodeTitle: correct,
      rationale,
      aiFree: kind === "summation" || kind === "retention",
    };
  }

  build(unit: Unit, kind: ItemKind, count: number, salt = ""): Item[] {
    const style = this.graph.subject(unit.subjectKey)?.aiInteractionStyle ?? "intro-questions-responses";
    const subjectName = this.graph.subject(unit.subjectKey)?.name ?? "";
    const rng = makeRng(hashSeed(`${unit.id}:${kind}:${salt}`));
    const nodes = unit.conceptNodes;
    if (nodes.length === 0) return [];

    const prereqs = this.graph.prereqs(unit.id);
    const items: Item[] = [];
    const order = shuffle(rng, nodes.map((_, i) => i));

    for (let i = 0; items.length < count && i < count * 4; i++) {
      const nodeIdx = order[i % order.length];
      const node = nodes[nodeIdx];

      // Rotate item forms so a set isn't monotonous. Sequence items need >=3
      // blocks; prereq items need a real prerequisite edge.
      const wants: ItemForm =
        i % 4 === 1 && nodes.length >= 3
          ? "sequence"
          : i % 4 === 2 && prereqs.length > 0 && kind !== "check"
            ? "prereq"
            : i % 7 === 5 && unit.masteryProofSpec && kind !== "check"
              ? "proof"
              : "belongs";

      let item: Item | null = null;
      const idBase = `${unit.id}-${kind}-${salt}-${i}`;

      if (wants === "sequence") {
        // Use the curriculum team's own ordering of concept blocks.
        const pos = nodeIdx < nodes.length - 1 ? nodeIdx : 0;
        const after = nodes[pos];
        const correct = nodes[pos + 1].title;
        const others = nodes.filter((n) => n.title !== correct && n.title !== after.title).map((n) => n.title);
        item = this.assemble(
          idBase,
          kind,
          "sequence",
          `In “${unit.title}”, which concept block comes straight after “${after.title}”?`,
          correct,
          shuffle(rng, others).slice(0, 3),
          `The map sequences “${unit.title}” as block ${pos + 1} → ${pos + 2}: “${after.title}” then “${correct}”.`,
          rng,
        );
      } else if (wants === "prereq") {
        const correct = prereqs[Math.floor(rng() * prereqs.length)].title;
        const sameSubject = this.graph
          .unitsForSubject(unit.subjectKey)
          .filter((u) => u.id !== unit.id && !unit.prereqUnitIds.includes(u.id) && Math.abs(u.grade - unit.grade) <= 3)
          .map((u) => u.title);
        item = this.assemble(
          idBase,
          kind,
          "prereq",
          `Which unit must be proven before starting “${unit.title}”?`,
          correct,
          shuffle(rng, sameSubject).slice(0, 3),
          `The graph gates “${unit.title}” behind ${prereqs.map((p) => `“${p.title}”`).join(", ")} — all prerequisites must be proven (AND-gate).`,
          rng,
        );
      } else if (wants === "proof") {
        const correct = unit.masteryProofSpec;
        const others = (this.proofsBySubject.get(unit.subjectKey) ?? [])
          .filter((p) => p.unitId !== unit.id && p.proof !== correct)
          .map((p) => p.proof);
        item = this.assemble(
          idBase,
          kind,
          "proof",
          `How is mastery of “${unit.title}” proven? (AI-free)`,
          correct,
          shuffle(rng, others).slice(0, 3),
          `The Mastery_Proof for this unit is “${correct}” — always AI-free, scored at 90%.`,
          rng,
        );
      }

      if (!item) {
        // Default: does this concept block belong to this unit?
        const exclude = new Set(nodes.map((n) => n.title));
        item = this.assemble(
          idBase,
          kind,
          "belongs",
          BELONGS_STEM[style](unit.title),
          node.title,
          this.distractors(unit, exclude, 3, rng),
          `“${node.title}” is concept block ${nodeIdx + 1} of ${nodes.length} in “${unit.title}” (${subjectName}, Grade ${unit.grade}). The other options are ${subjectName} blocks from different units.`,
          rng,
        );
      }

      if (item && !items.some((x) => x.prompt === item!.prompt && x.conceptNodeTitle === item!.conceptNodeTitle)) {
        items.push(item);
      }
    }

    return items.slice(0, count);
  }
}

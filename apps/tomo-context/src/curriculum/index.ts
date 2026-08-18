/**
 * Typed access to the concept map extracted from the ICSE Grade 7 chapter
 * "Force and Pressure : Motion" (Learning Elementary Physics Class 7, pp. 29-42).
 *
 * Everything the tutor, the planner and the item generators say must be
 * traceable to a record in here. If a term, a unit or a worked number is not in
 * this file, it does not belong in student-facing content.
 */

import raw from './concept-map.json';
import type { DifficultyTier } from '../context-engine/types';

export type SubConcept = {
  id: string;
  title: string;
  tier: DifficultyTier;
  book_definition_verbatim: string;
  book_working_verbatim?: string;
  book_examples?: string[];
  page: number;
  discriminator?: string;
  why_it_matters?: string;
  note_for_content_generation?: string;
  maps_to_learning_outcome?: string;
};

export type Misconception = {
  id: string;
  name: string;
  student_model: string;
  book_evidence: string;
  probe: string;
  targets: string[];
  error_type?: string;
};

export type WorkedExample = {
  id: string;
  source: string;
  prompt: string;
  book_working: string;
  answer?: string;
};

export type Classroom = {
  concept_id: string;
  title: string;
  book_unit: string;
  pages: string;
  prerequisite_concept_ids: string[];
  prerequisite_sub_concept_ids?: string[];
  external_prerequisites: string[];
  sequence_index: number;
  sequencing_note?: string;
  sub_concepts: SubConcept[];
  misconceptions: Misconception[];
  worked_examples: WorkedExample[];
  textbook_items_verbatim: string[];
};

export type DiagnosticItemSpec = {
  id: string;
  targets: string[];
  tier: DifficultyTier;
  type: 'conceptual' | 'computational';
  probes?: string[];
  on_correct?: string;
  on_wrong?: string;
};

type ConceptMapShape = {
  source: Record<string, unknown>;
  theme: { theme_id: string; title: string; grade: number; subject: string; learning_outcomes_verbatim: string[] };
  notation_and_conventions: {
    symbols: Record<string, string>;
    formulae_verbatim: string[];
    units: Record<string, string>;
    book_specific_vocabulary: string[];
    house_rules_for_generated_content: string[];
  };
  classrooms: Classroom[];
  diagnostic_blueprint: { purpose: string; entry_item: string; items: DiagnosticItemSpec[]; note: string };
};

export const conceptMap = raw as unknown as ConceptMapShape;

export const THEME = conceptMap.theme;
export const NOTATION = conceptMap.notation_and_conventions;
export const CLASSROOMS: Classroom[] = [...conceptMap.classrooms].sort(
  (a, b) => a.sequence_index - b.sequence_index,
);
export const DIAGNOSTIC = conceptMap.diagnostic_blueprint;

const classroomById = new Map(CLASSROOMS.map((c) => [c.concept_id, c]));
const subConceptById = new Map<string, SubConcept & { classroom_id: string }>();
const misconceptionById = new Map<string, Misconception & { classroom_id: string }>();

for (const c of CLASSROOMS) {
  for (const s of c.sub_concepts) subConceptById.set(s.id, { ...s, classroom_id: c.concept_id });
  for (const m of c.misconceptions) misconceptionById.set(m.id, { ...m, classroom_id: c.concept_id });
}

export function getClassroom(id: string): Classroom {
  const c = classroomById.get(id);
  if (!c) throw new Error(`Unknown classroom: ${id}`);
  return c;
}

export function findClassroom(id: string): Classroom | undefined {
  return classroomById.get(id);
}

export function getSubConcept(id: string) {
  return subConceptById.get(id);
}

export function subConceptTitle(id: string): string {
  return subConceptById.get(id)?.title ?? id;
}

export function getMisconception(id: string) {
  return misconceptionById.get(id);
}

export function misconceptionName(id: string): string {
  return misconceptionById.get(id)?.name ?? id;
}

export const ALL_SUB_CONCEPTS: (SubConcept & { classroom_id: string })[] = [...subConceptById.values()];
export const ALL_MISCONCEPTIONS: (Misconception & { classroom_id: string })[] = [...misconceptionById.values()];

/** The classroom that follows this one in book order, if any. */
export function nextClassroom(id: string): Classroom | undefined {
  const c = classroomById.get(id);
  if (!c) return undefined;
  return CLASSROOMS.find((x) => x.sequence_index === c.sequence_index + 1);
}

/**
 * The house rules block, injected verbatim into every generation prompt so the
 * model cannot drift into generic internet physics.
 */
export function houseStyleBlock(): string {
  return [
    `SOURCE: ${String((conceptMap.source as { book: string }).book)} — ${String(
      (conceptMap.source as { chapter: string }).chapter,
    )} (${String((conceptMap.source as { board: string }).board)}, pp. ${String(
      (conceptMap.source as { pages_extracted: string }).pages_extracted,
    )}).`,
    '',
    'NOTATION AND UNITS (use exactly these):',
    ...NOTATION.formulae_verbatim.map((f) => `  - ${f}`),
    ...Object.entries(NOTATION.units).map(([k, v]) => `  - ${k}: ${v}`),
    '',
    'HOUSE RULES:',
    ...NOTATION.house_rules_for_generated_content.map((r) => `  - ${r}`),
  ].join('\n');
}

/** Compact classroom brief for prompt injection. */
export function classroomBrief(classroomId: string): string {
  const c = getClassroom(classroomId);
  return [
    `CLASSROOM: ${c.title} (${c.concept_id}) — ${c.book_unit}, pp. ${c.pages}`,
    '',
    'SUB-CONCEPTS:',
    ...c.sub_concepts.map(
      (s) =>
        `  [${s.id}] (${s.tier}) ${s.title}\n      book: "${s.book_definition_verbatim}"` +
        (s.discriminator ? `\n      discriminator: ${s.discriminator}` : ''),
    ),
    '',
    'KNOWN MISCONCEPTIONS FOR THIS CLASSROOM:',
    ...c.misconceptions.map(
      (m) => `  [${m.id}] ${m.name} — student thinks: "${m.student_model}" (targets ${m.targets.join(', ')})`,
    ),
    '',
    "WORKED EXAMPLES FROM THE BOOK (reuse these numbers, don't invent new ones):",
    ...c.worked_examples.map((w) => `  [${w.id}] ${w.prompt}\n      ${w.book_working}`),
  ].join('\n');
}

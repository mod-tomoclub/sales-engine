/**
 * §1 The curriculum knowledge graph — a real CBSE Math slice, Grade 2 → Grade 4.
 *
 * Board mappings are verbatim references to the current NCF-2023 aligned NCERT
 * textbooks: Class 2 "Joyful Mathematics", Class 3 "Maths Mela", Class 4
 * "Maths Mela". Grade is a *tag on the node*, never a container — the traversal
 * rules in engine.ts never read a child's enrolled grade to decide what unlocks.
 */
import type { ConceptUnit, Edge, MicroConcept, Strand } from "./types";

type MicroSeed = Omit<MicroConcept, "unitId">;

function unit(
  u: Omit<ConceptUnit, "microConcepts"> & { microConcepts: MicroSeed[] },
): ConceptUnit {
  return { ...u, microConcepts: u.microConcepts.map((m) => ({ ...m, unitId: u.id })) };
}

export const UNITS: ConceptUnit[] = [
  // ───────────────────────── Grade 2 — the floor the gap-walk can reach ────
  unit({
    id: "g2.num.tens-ones",
    title: "Tens and ones: numbers to 99",
    strand: "number",
    levelIndex: 1,
    board: { board: "CBSE", grade: 2, chapterRef: "NCERT Joyful Mathematics (Class 2) — grouping in tens" },
    context: "Bundling sticks into tens at the shop",
    microConcepts: [
      { id: "g2.num.tens-ones.m1", title: "Bundle into tens", objective: "Group loose objects into bundles of ten and count the leftovers", primaryModality: "hands-on", altModality: "game" },
      { id: "g2.num.tens-ones.m2", title: "Read a 2-digit number", objective: "Say what the two digits of a number like 47 stand for", primaryModality: "interactive", altModality: "story" },
    ],
  }),
  unit({
    id: "g2.ops.add-sub-99",
    title: "Adding and taking away within 99",
    strand: "operations",
    levelIndex: 1,
    board: { board: "CBSE", grade: 2, chapterRef: "NCERT Joyful Mathematics (Class 2) — addition and subtraction" },
    context: "Counting things collected on a beach day",
    microConcepts: [
      { id: "g2.ops.add-sub-99.m1", title: "Add without regrouping", objective: "Add two 2-digit numbers when no column crosses ten", primaryModality: "worked-example", altModality: "game" },
      { id: "g2.ops.add-sub-99.m2", title: "Subtract without regrouping", objective: "Take away a 2-digit number when no column needs breaking", primaryModality: "worked-example", altModality: "game" },
    ],
  }),
  unit({
    id: "g2.mul.skip-count",
    title: "Skip counting and equal groups",
    strand: "mul-div",
    levelIndex: 1,
    board: { board: "CBSE", grade: 2, chapterRef: "NCERT Joyful Mathematics (Class 2) — equal groups" },
    context: "Legs on animals, wheels on rickshaws",
    microConcepts: [
      { id: "g2.mul.skip-count.m1", title: "Skip count in 2s, 5s, 10s", objective: "Count forward in steps of 2, 5 and 10 without dropping a step", primaryModality: "game", altModality: "interactive" },
      { id: "g2.mul.skip-count.m2", title: "See equal groups", objective: "Recognise when groups are equal and count them by skip counting", primaryModality: "hands-on", altModality: "story" },
    ],
  }),

  // ───────────────────────── Grade 3 — Maths Mela ──────────────────────────
  unit({
    id: "g3.num.double-century",
    title: "Double Century: numbers beyond a hundred",
    strand: "number",
    levelIndex: 2,
    board: { board: "CBSE", grade: 3, chapterRef: "NCERT Maths Mela (Class 3), Ch. 3 — Double Century" },
    context: "Counting on past one hundred, all the way to a double century",
    microConcepts: [
      { id: "g3.num.double-century.m1", title: "Count past 100", objective: "Count on and back across the hundreds boundary (98, 99, 100, 101 …)", primaryModality: "interactive", altModality: "game" },
      { id: "g3.num.double-century.m2", title: "Numbers to 200 on a line", objective: "Place and read numbers up to 200 on a number line", primaryModality: "interactive", altModality: "hands-on" },
    ],
  }),
  unit({
    // NCERT splits this across two chapters, but it is one teachable block: the
    // Class 3 place-value work is not finished until Ch. 9. §1 says the unit is
    // the teachable block, not the chapter.
    id: "g3.num.hundreds",
    title: "House of Hundreds: 3-digit numbers",
    strand: "number",
    levelIndex: 3,
    board: { board: "CBSE", grade: 3, chapterRef: "NCERT Maths Mela (Class 3), Ch. 6 & 9 — House of Hundreds I & II" },
    context: "Counting torans and bangles at the mela, delivering to Farooq Chacha's sweet shop, and finding flats in an apartment where the house number tells you the floor",
    microConcepts: [
      { id: "g3.num.hundreds.m1", title: "H–T–O rooms", objective: "Build and read a 3-digit number from hundreds, tens and ones", primaryModality: "hands-on", altModality: "interactive" },
      { id: "g3.num.hundreds.m2", title: "Compare and order", objective: "Compare 3-digit numbers by opening the biggest room first, and put a set in order", primaryModality: "game", altModality: "worked-example" },
      { id: "g3.num.hundreds.m3", title: "Largest and smallest", objective: "Arrange given digits to make the largest and smallest 3-digit number", primaryModality: "game", altModality: "hands-on" },
      { id: "g3.num.hundreds.m4", title: "Neighbouring hundreds", objective: "Say which two hundreds a number lies between, and place it on a number line to 1000", primaryModality: "interactive", altModality: "story" },
      { id: "g3.num.hundreds.m5", title: "Many names for one number", objective: "See that '68 more than 300' and '32 less than 400' name the same number", primaryModality: "worked-example", altModality: "interactive" },
    ],
  }),
  unit({
    id: "g3.ops.give-take",
    title: "Give and Take: regrouping in addition and subtraction",
    strand: "operations",
    levelIndex: 2,
    board: { board: "CBSE", grade: 3, chapterRef: "NCERT Maths Mela (Class 3), Ch. 12 — Give and Take" },
    context: "Shopkeeper and customer giving and taking change",
    microConcepts: [
      { id: "g3.ops.give-take.m1", title: "Add with carrying", objective: "Add 3-digit numbers, carrying when a column passes 9", primaryModality: "worked-example", altModality: "hands-on" },
      { id: "g3.ops.give-take.m2", title: "Subtract with borrowing", objective: "Subtract 3-digit numbers, breaking a ten or a hundred when needed", primaryModality: "hands-on", altModality: "worked-example" },
      { id: "g3.ops.give-take.m3", title: "Borrow across a zero", objective: "Subtract from numbers like 400 or 305 where the middle column is empty", primaryModality: "worked-example", altModality: "interactive" },
      { id: "g3.ops.give-take.m4", title: "Choose the operation", objective: "Read a shop story and decide whether it is a giving or a taking problem", primaryModality: "story", altModality: "game" },
    ],
  }),
  unit({
    id: "g3.mul.raksha",
    title: "Raksha Bandhan: equal groups become multiplication",
    strand: "mul-div",
    levelIndex: 2,
    board: { board: "CBSE", grade: 3, chapterRef: "NCERT Maths Mela (Class 3), Ch. 7 — Raksha Bandhan" },
    context: "Gopal and Dhara making rakhis for Atya's visit, then buying laddoos at the Jagannath Sweet Shop and sharing them out",
    microConcepts: [
      { id: "g3.mul.raksha.m1", title: "Repeated addition → ×", objective: "Write 2 + 2 + 2 + 2 + 2 as 5 × 2 and read it as '5 times 2'", primaryModality: "hands-on", altModality: "story" },
      { id: "g3.mul.raksha.m2", title: "Arrays", objective: "Count a rectangular box of sweets as rows × columns", primaryModality: "interactive", altModality: "game" },
      { id: "g3.mul.raksha.m3", title: "Tables of 2, 5 and 10", objective: "Recall the 2, 5 and 10 tables quickly", primaryModality: "game", altModality: "interactive" },
      { id: "g3.mul.raksha.m4", title: "Equal sharing → ÷", objective: "Share a total equally and write it as a division, e.g. 18 ÷ 9 = 2", primaryModality: "hands-on", altModality: "story" },
    ],
  }),
  unit({
    id: "g3.frac.fair-share",
    title: "Fair Share: halves and quarters",
    strand: "fractions",
    levelIndex: 1,
    board: { board: "CBSE", grade: 3, chapterRef: "NCERT Maths Mela (Class 3), Ch. 8 — Fair Share" },
    context: "Sharing rotis and sweets so that nobody gets a bigger piece",
    microConcepts: [
      { id: "g3.frac.fair-share.m1", title: "Equal parts", objective: "Tell whether a shape has been cut into equal parts or not", primaryModality: "hands-on", altModality: "interactive" },
      { id: "g3.frac.fair-share.m2", title: "Half and quarter", objective: "Name one part of two as a half and one part of four as a quarter", primaryModality: "story", altModality: "hands-on" },
    ],
  }),

  // ───────────────────────── Grade 4 — Maths Mela ──────────────────────────
  unit({
    id: "g4.num.thousands",
    title: "Thousands Around Us: 4-digit numbers",
    strand: "number",
    levelIndex: 4,
    board: { board: "CBSE", grade: 4, chapterRef: "NCERT Maths Mela (Class 4), Ch. 4 — Thousands Around Us" },
    context: "Jaspreet and Gulnaz organising a langar at the Gurudwara for about a thousand people, then reading real thousands — the Thousand Pillars Temple, India's 788 districts, cricket run tallies and Himalayan peak heights",
    microConcepts: [
      { id: "g4.num.thousands.m1", title: "The thousands room", objective: "Read and write 4-digit numbers using Th–H–T–O", primaryModality: "interactive", altModality: "hands-on" },
      { id: "g4.num.thousands.m2", title: "Expanded form to 9999", objective: "Write 3 254 as 3000 + 200 + 50 + 4 and back again", primaryModality: "worked-example", altModality: "game" },
      { id: "g4.num.thousands.m3", title: "Regroup across places", objective: "Convert between forms like '15 tens and 23 ones' and a single number", primaryModality: "hands-on", altModality: "worked-example" },
      { id: "g4.num.thousands.m4", title: "Compare and order to 9999", objective: "Compare 4-digit numbers and put a set in order", primaryModality: "game", altModality: "interactive" },
      { id: "g4.num.thousands.m5", title: "4-digit number line", objective: "Mark and read numbers to 9 500 on a scaled number line", primaryModality: "interactive", altModality: "story" },
    ],
  }),
  unit({
    id: "g4.mul.equal-groups",
    title: "Equal Groups: multiplication and division",
    strand: "mul-div",
    levelIndex: 3,
    board: { board: "CBSE", grade: 4, chapterRef: "NCERT Maths Mela (Class 4), Ch. 9 — Equal Groups" },
    context: "Animal jumps along a number line, Gulabo's flower garden, bullock-cart bamboo rods and e-autorickshaws — then Chippi the lizard counting legs, which turns multiplication into division",
    microConcepts: [
      { id: "g4.mul.equal-groups.m1", title: "Tables to 10", objective: "Recall multiplication facts up to 10 × 10", primaryModality: "game", altModality: "interactive" },
      { id: "g4.mul.equal-groups.m2", title: "2-digit × 1-digit", objective: "Multiply a 2-digit number by a 1-digit number using place value", primaryModality: "worked-example", altModality: "hands-on" },
      { id: "g4.mul.equal-groups.m3", title: "Division as equal sharing", objective: "Share a total into equal groups and write it as a division", primaryModality: "hands-on", altModality: "story" },
      { id: "g4.mul.equal-groups.m4", title: "Remainders", objective: "Say what is left over when a total will not share equally, and what to do with it", primaryModality: "story", altModality: "game" },
    ],
  }),
  unit({
    id: "g4.frac.sharing",
    title: "Sharing and Measuring: fractions of a whole",
    strand: "fractions",
    levelIndex: 2,
    // Despite the title this chapter is entirely fractions — no standard-unit
    // measurement. Measurement is a separate chapter (Ch. 6).
    board: { board: "CBSE", grade: 4, chapterRef: "NCERT Maths Mela (Class 4), Ch. 5 — Sharing and Measuring" },
    context: "Sumedha's dhokla, re-cut smaller every time the doorbell rings; Idha's flower garden in fractional beds; Karan's Dream Dosa Designer",
    microConcepts: [
      { id: "g4.frac.sharing.m1", title: "Halves, quarters, thirds", objective: "Name and shade 1/2, 1/4, 1/3 and 3/4 of a shape", primaryModality: "interactive", altModality: "hands-on" },
      { id: "g4.frac.sharing.m2", title: "Fraction of a collection", objective: "Find half or a quarter of a group of objects using division", primaryModality: "hands-on", altModality: "story" },
      { id: "g4.frac.sharing.m3", title: "Equivalent halves", objective: "See that 1/2 and 2/4 cover the same amount", primaryModality: "interactive", altModality: "game" },
      { id: "g4.frac.sharing.m4", title: "Compare unit fractions", objective: "Know that more pieces means smaller pieces — 1/4 is less than 1/2", primaryModality: "hands-on", altModality: "worked-example" },
    ],
  }),
  unit({
    id: "g4.meas.length",
    title: "Measuring Length",
    strand: "measurement",
    levelIndex: 1,
    board: { board: "CBSE", grade: 4, chapterRef: "NCERT Maths Mela (Class 4), Ch. 6 — Measuring Length" },
    context: "Measuring around the school with tapes and strides",
    microConcepts: [
      { id: "g4.meas.length.m1", title: "cm and m", objective: "Choose and use the right unit, and convert between m and cm", primaryModality: "hands-on", altModality: "interactive" },
    ],
  }),
  unit({
    id: "g4.data.handling",
    title: "Data Handling",
    strand: "data",
    levelIndex: 1,
    board: { board: "CBSE", chapterRef: "NCERT Maths Mela (Class 4), Ch. 14 — Data Handling", grade: 4 },
    context: "Turning a class survey into a picture graph",
    microConcepts: [
      { id: "g4.data.handling.m1", title: "Read a pictograph", objective: "Read a pictograph where one symbol stands for more than one thing", primaryModality: "interactive", altModality: "story" },
    ],
  }),
  unit({
    id: "g4.geom.shapes",
    title: "Shapes Around Us",
    strand: "geometry",
    levelIndex: 1,
    board: { board: "CBSE", grade: 4, chapterRef: "NCERT Maths Mela (Class 4), Ch. 1 — Shapes Around Us" },
    context: "Finding shapes in bricks, tiles and buildings",
    microConcepts: [
      { id: "g4.geom.shapes.m1", title: "Faces, edges, corners", objective: "Describe common 2-D and 3-D shapes by their parts", primaryModality: "hands-on", altModality: "interactive" },
    ],
  }),
];

/** §1 Two edge types. `prerequisite` is a hard dependency; `related` is soft. */
export const EDGES: Edge[] = [
  // Number spine
  { from: "g2.num.tens-ones", to: "g3.num.double-century", type: "prerequisite" },
  { from: "g3.num.double-century", to: "g3.num.hundreds", type: "prerequisite" },
  { from: "g3.num.hundreds", to: "g4.num.thousands", type: "prerequisite" },
  // Addition / subtraction spine
  { from: "g2.ops.add-sub-99", to: "g3.ops.give-take", type: "prerequisite" },
  { from: "g3.num.hundreds", to: "g3.ops.give-take", type: "prerequisite" },
  { from: "g3.ops.give-take", to: "g4.num.thousands", type: "prerequisite" },
  // Multiplication / division spine
  { from: "g2.mul.skip-count", to: "g3.mul.raksha", type: "prerequisite" },
  { from: "g3.mul.raksha", to: "g4.mul.equal-groups", type: "prerequisite" },
  { from: "g3.ops.give-take", to: "g4.mul.equal-groups", type: "prerequisite" },
  // Fractions spine
  { from: "g3.frac.fair-share", to: "g4.frac.sharing", type: "prerequisite" },
  { from: "g4.mul.equal-groups", to: "g4.frac.sharing", type: "prerequisite" },
  // Measurement + data
  { from: "g3.num.hundreds", to: "g4.meas.length", type: "prerequisite" },
  { from: "g3.mul.raksha", to: "g4.data.handling", type: "prerequisite" },
  // Soft edges — used for interleaving and transfer questions, never for gating
  { from: "g4.frac.sharing", to: "g4.meas.length", type: "related" },
  { from: "g4.num.thousands", to: "g4.mul.equal-groups", type: "related" },
  { from: "g3.ops.give-take", to: "g3.mul.raksha", type: "related" },
  { from: "g3.mul.raksha", to: "g3.frac.fair-share", type: "related" },
];

export const STRAND_META: Record<Strand, { label: string; color: string; icon: string }> = {
  number: { label: "Number & Place Value", color: "#2f80ed", icon: "🔢" },
  operations: { label: "Addition & Subtraction", color: "#e08a1e", icon: "➕" },
  "mul-div": { label: "Multiplication & Division", color: "#8b6df2", icon: "✖️" },
  fractions: { label: "Fractions", color: "#23a26d", icon: "🍕" },
  measurement: { label: "Measurement", color: "#b4531f", icon: "📏" },
  geometry: { label: "Geometry", color: "#0f7a6b", icon: "🔷" },
  data: { label: "Data Handling", color: "#c2417a", icon: "📊" },
};

// ───────────────────────────── graph queries ──────────────────────────────

const byId = new Map(UNITS.map((u) => [u.id, u]));
const microById = new Map(UNITS.flatMap((u) => u.microConcepts).map((m) => [m.id, m]));

export function getUnit(id: string): ConceptUnit {
  const u = byId.get(id);
  if (!u) throw new Error(`Unknown unit: ${id}`);
  return u;
}

export function getMicro(id: string): MicroConcept {
  const m = microById.get(id);
  if (!m) throw new Error(`Unknown micro-concept: ${id}`);
  return m;
}

export function allMicros(): MicroConcept[] {
  return UNITS.flatMap((u) => u.microConcepts);
}

/** Hard prerequisites of a unit — the AND-gate for unlocking. */
export function prereqsOf(unitId: string): string[] {
  return EDGES.filter((e) => e.to === unitId && e.type === "prerequisite").map((e) => e.from);
}

/** Units this one unlocks. The acceleration path within a strand. */
export function successorsOf(unitId: string): string[] {
  return EDGES.filter((e) => e.from === unitId && e.type === "prerequisite").map((e) => e.to);
}

/** Soft neighbours, used to pick interleaved revision questions. */
export function relatedOf(unitId: string): string[] {
  return EDGES.filter(
    (e) => e.type === "related" && (e.from === unitId || e.to === unitId),
  ).map((e) => (e.from === unitId ? e.to : e.from));
}

export function unitsInStrand(strand: Strand): ConceptUnit[] {
  return UNITS.filter((u) => u.strand === strand).sort((a, b) => a.levelIndex - b.levelIndex);
}

/**
 * §4 Gap remediation — walk *down* the prerequisite chain from a failed unit to
 * the deepest ancestor the child has not proven. That ancestor is the real gap,
 * not the unit where the failure surfaced.
 */
export function deepestUnprovenAncestor(
  unitId: string,
  isProven: (id: string) => boolean,
  trace?: string[],
): string {
  const prereqs = prereqsOf(unitId).filter((p) => !isProven(p));
  trace?.push(
    prereqs.length
      ? `${unitId} — unproven prerequisite(s): ${prereqs.join(", ")} → descend`
      : `${unitId} — all prerequisites proven → this is the gap`,
  );
  if (!prereqs.length) return unitId;
  // Descend the shallowest (lowest levelIndex) unproven branch first: fixing the
  // foundation usually repairs its siblings.
  const next = prereqs
    .map(getUnit)
    .sort((a, b) => a.levelIndex - b.levelIndex)[0];
  return deepestUnprovenAncestor(next.id, isProven, trace);
}

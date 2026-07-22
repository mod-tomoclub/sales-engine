/**
 * §4 Placement — the adaptive diagnostic bank.
 *
 * Two questions per unit is enough to decide "proven / not proven", because the
 * engine does not need a score, only a direction: step forward along the strand
 * or step back along a prerequisite edge.
 *
 * Numbers and contexts are taken from the NCERT chapters themselves (Maths Mela
 * Class 3 Ch. 3/6/7/8/9/12 and Class 4 Ch. 4/5/9) so a child meets the same
 * quantities here that they will meet in the textbook.
 *
 * Every wrong option carries a misconception tag. That tag is what makes
 * remediation targeted rather than "do the unit again".
 */
import type { Question } from "./types";

/** The strands this diagnostic probes, and where each walk begins. */
export type ProbedStrand = "number" | "operations" | "mul-div" | "fractions";

export const STRAND_ENTRY: Record<ProbedStrand, string> = {
  number: "g4.num.thousands",
  // CBSE folds Grade 4 addition/subtraction into Thousands Around Us, so the
  // deepest dedicated add/sub unit on the spine is the Grade 3 one.
  operations: "g3.ops.give-take",
  "mul-div": "g4.mul.equal-groups",
  fractions: "g4.frac.sharing",
};

const q = (
  id: string,
  microConceptId: string,
  difficulty: 1 | 2 | 3,
  prompt: string,
  options: [string, string, string, string],
  answerIdx: number,
  misconceptions: (string | null)[],
  explanation: string,
  visual?: Question["visual"],
): Question => ({
  id,
  microConceptId,
  purpose: "diagnostic",
  difficulty,
  prompt,
  visual,
  options: options.map((text, i) => ({
    id: "abcd"[i],
    text,
    misconception: i === answerIdx ? undefined : misconceptions[i] ?? undefined,
  })),
  answerId: "abcd"[answerIdx],
  explanation,
});

export const DIAGNOSTIC_BANK: Question[] = [
  // ── g4.num.thousands — Class 4, Ch. 4 ───────────────────────────────────
  q(
    "d.thou.1", "g4.num.thousands.m1", 2,
    "At the langar, Ram wrote “7 Thousands, 0 Hundreds, 2 Tens and 4 Ones” as 724. Is that right?",
    ["No — it should be 7024", "Yes, 724 is correct", "No — it should be 7240", "No — it should be 70024"], 0,
    [null, "drops the empty hundreds place instead of holding it with a zero", "shifts every digit one room to the left", "writes each place side by side instead of using place value"],
    "The hundreds room is empty, so a 0 must hold it: 7000 + 0 + 20 + 4 = 7024.",
    { kind: "place-value", thousands: 7, hundreds: 0, tens: 2, ones: 4 },
  ),
  q(
    "d.thou.2", "g4.num.thousands.m4", 2,
    "Two cricketers' career runs: 2190 and 2910. Who scored more?",
    ["The one with 2910", "The one with 2190", "Both the same", "Cannot tell"], 0,
    [null, "compares the last digits instead of reading left to right", "sees the same digits and assumes equal value", "does not use place value to compare"],
    "Thousands tie at 2. Next room: 9 hundreds beats 1 hundred, so 2910 is more.",
  ),

  // ── g3.num.hundreds — Class 3, Ch. 6 & 9 ────────────────────────────────
  q(
    "d.h.1", "g3.num.hundreds.m1", 1,
    "Farooq Chacha's delivery boxes are numbered by the House of Hundreds: 3 hundred-flats, 5 ten-rods, 6 unit-cubes. Which box is it?",
    ["356", "536", "365", "3 5 6, written separately"], 0,
    [null, "swaps hundreds and tens", "swaps tens and ones", "reads the blocks but does not build one number"],
    "3 hundreds + 5 tens + 6 ones = 300 + 50 + 6 = 356.",
    { kind: "place-value", hundreds: 3, tens: 5, ones: 6 },
  ),
  q(
    "d.h.2", "g3.num.hundreds.m2", 1,
    "Circle the greatest number in this row: 466, 437, 439, 447",
    ["466", "439", "437", "447"], 0,
    [null, "compares the ones digit — 9 looks biggest", "picks the first number in the row", "compares only the tens digit"],
    "Hundreds tie at 4 for all four. Compare tens: 6 tens beats 4 and 3 tens, so 466 wins.",
  ),

  // ── g3.num.double-century — Class 3, Ch. 3 ──────────────────────────────
  q(
    "d.dc.1", "g3.num.double-century.m1", 1,
    "Count on: 198, 199, __ ?",
    ["200", "1910", "100", "209"], 0,
    [null, "writes the digits instead of the next number", "restarts at the hundred", "jumps a ten"],
    "The ones and the tens rooms are both full, so both roll over: 200.",
  ),
  q(
    "d.dc.2", "g3.num.double-century.m2", 1,
    "Which number is missing? 150, 160, __, 180",
    ["170", "165", "171", "175"], 0,
    [null, "steps by five instead of ten", "adds one instead of ten", "guesses a halfway value"],
    "The pattern adds 1 ten each time, so after 160 comes 170.",
    { kind: "number-line", from: 150, to: 180, step: 10, mark: 170 },
  ),

  // ── g3.ops.give-take — Class 3, Ch. 12 ──────────────────────────────────
  q(
    "d.give.1", "g3.ops.give-take.m1", 2,
    "Kishan had 364 saplings in his nursery and brought 52 more. How many now?",
    ["416", "416 is wrong — it is 316", "84", "3652"], 0,
    [null, "loses the carry out of the tens column", "adds only the tens and ones digits", "writes the numbers side by side"],
    "4 + 2 = 6 ones. 6 + 5 = 11 tens → write 1, carry 1. 3 + 1 = 4 hundreds. So 416.",
    { kind: "column-sum", top: 364, bottom: 52, op: "+" },
  ),
  q(
    "d.give.2", "g3.ops.give-take.m3", 3,
    "Reena bought groceries for ₹209 and gave Peter uncle a ₹500 note. How much change should she get?",
    ["₹291", "₹309", "₹311", "₹709"], 0,
    [null, "subtracts the smaller digit from the larger in each column", "borrows from the hundreds but not through the empty tens", "adds instead of subtracting"],
    "The tens room of 500 is empty, so break a hundred into 10 tens, then a ten into 10 ones: 500 − 209 = 291.",
    { kind: "column-sum", top: 500, bottom: 209, op: "-" },
  ),

  // ── g2.ops.add-sub-99 ───────────────────────────────────────────────────
  q(
    "d.g2add.1", "g2.ops.add-sub-99.m1", 1,
    "34 shells, and 25 more shells. How many shells now?",
    ["59", "50", "69", "39"], 0,
    [null, "adds only the tens", "adds an extra ten", "adds only the ones"],
    "4 + 5 = 9 ones, 3 + 2 = 5 tens → 59. No column passes ten, so nothing is carried.",
  ),
  q(
    "d.g2add.2", "g2.ops.add-sub-99.m2", 1,
    "There were 68 marbles. 23 rolled away. How many are left?",
    ["45", "55", "41", "85"], 0,
    [null, "subtracts only the ones", "subtracts the wrong way round in the ones column", "adds instead of subtracting"],
    "8 − 3 = 5 ones, 6 − 2 = 4 tens → 45.",
  ),

  // ── g4.mul.equal-groups — Class 4, Ch. 9 ────────────────────────────────
  q(
    "d.eq.1", "g4.mul.equal-groups.m2", 2,
    "8 bamboo rods are needed to make one bullock cart. How many rods for 23 carts?",
    ["184", "31", "164", "8023"], 0,
    [null, "adds instead of multiplying", "multiplies only the tens and forgets the ones", "writes the digits side by side"],
    "Break it by place value: 20 × 8 = 160 and 3 × 8 = 24. 160 + 24 = 184.",
    { kind: "groups", groups: 23, per: 8, emoji: "🎋" },
  ),
  q(
    "d.eq.2", "g4.mul.equal-groups.m4", 2,
    "A factory has 58 wheels. Each small tempo needs 3 wheels. How many tempos can they fit out, and how many wheels are left?",
    ["19 tempos, 1 wheel left", "20 tempos, no wheels left", "19 tempos, 2 wheels left", "18 tempos, 4 wheels left"], 0,
    [null, "rounds the share up and loses the remainder", "shares correctly but miscounts what remains", "stops one group short"],
    "3 × 19 = 57, and 58 − 57 = 1. So 19 tempos with 1 wheel left over.",
  ),

  // ── g3.mul.raksha — Class 3, Ch. 7 ──────────────────────────────────────
  q(
    "d.rak.1", "g3.mul.raksha.m1", 1,
    "Each rakhi uses 2 threads. Dhara is making 5 rakhis. Which one says this?",
    ["5 × 2", "5 + 2", "5 − 2", "2 ÷ 5"], 0,
    [null, "reads '5 times 2' as adding the two numbers", "picks an operation at random", "confuses grouping with sharing"],
    "5 times 2 is written 5 × 2 — the same as 2 + 2 + 2 + 2 + 2 = 10.",
    { kind: "array", rows: 5, cols: 2, emoji: "🧵" },
  ),
  q(
    "d.rak.2", "g3.mul.raksha.m2", 1,
    "The laddoo box at the sweet shop has 3 rows with 3 laddoos in each row. How many laddoos?",
    ["9", "6", "33", "12"], 0,
    [null, "adds the rows and columns", "writes the digits side by side", "counts one row too many"],
    "3 rows × 3 in each = 3 + 3 + 3 = 9 laddoos.",
    { kind: "array", rows: 3, cols: 3, emoji: "🟡" },
  ),

  // ── g2.mul.skip-count ───────────────────────────────────────────────────
  q(
    "d.skip.1", "g2.mul.skip-count.m1", 1,
    "Count in fives: 5, 10, 15, 20, __ ?",
    ["25", "21", "30", "24"], 0,
    [null, "counts on by one instead of by five", "skips a step", "adds four"],
    "Each step adds 5, so after 20 comes 25.",
    { kind: "number-line", from: 0, to: 30, step: 5, mark: 25 },
  ),
  q(
    "d.skip.2", "g2.mul.skip-count.m2", 1,
    "3 autorickshaws are parked. Each has 3 wheels. How many wheels altogether?",
    ["9", "6", "3", "12"], 0,
    [null, "counts the vehicles instead of the wheels", "counts only one group", "counts an extra group"],
    "Three equal groups of 3: 3, 6, 9.",
    { kind: "groups", groups: 3, per: 3, emoji: "🛺" },
  ),

  // ── g4.frac.sharing — Class 4, Ch. 5 ────────────────────────────────────
  q(
    "d.frac4.1", "g4.frac.sharing.m2", 2,
    "There are 16 barfis in the box. How many barfis are in one quarter of the box?",
    ["4", "1 out of 4", "8", "12"], 0,
    [null, "reads 'a quarter' as the number 4 without dividing", "confuses a quarter with a half", "gives what is left instead of the share"],
    "A quarter means 4 equal parts: 16 ÷ 4 = 4 barfis.",
  ),
  q(
    "d.frac4.2", "g4.frac.sharing.m4", 2,
    "Sumedha's dhokla is shared between 2 people, then later between 5. Which share is bigger — one half or one fifth?",
    ["One half", "One fifth", "They are equal", "Depends on the dhokla"], 0,
    [null, "thinks a bigger bottom number means a bigger piece", "treats all fractions as the same", "does not compare unit fractions"],
    "More people means smaller pieces. Cutting into 2 gives bigger pieces than cutting into 5.",
    { kind: "fraction-bar", parts: 5, shaded: 1 },
  ),

  // ── g3.frac.fair-share — Class 3, Ch. 8 ─────────────────────────────────
  q(
    "d.frac3.1", "g3.frac.fair-share.m1", 1,
    "A sweet is broken into 2 pieces — one big, one small. Has it been shared into halves?",
    ["No — halves must be equal", "Yes, there are 2 pieces", "Yes, if you eat the big one", "Only if it is square"], 0,
    [null, "counts pieces without checking they are equal", "no idea of equal parts", "confuses shape with equal share"],
    "Halves means two *equal* parts. Two unequal pieces are not halves.",
  ),
  q(
    "d.frac3.2", "g3.frac.fair-share.m2", 1,
    "One roti is shared equally between 2 children. How much does each get?",
    ["Half a roti", "Two rotis", "A quarter of a roti", "One roti each"], 0,
    [null, "multiplies instead of sharing", "confuses half with quarter", "ignores the sharing"],
    "One whole shared between 2 gives each child one half.",
    { kind: "fraction-bar", parts: 2, shaded: 1 },
  ),
];

/**
 * Aarav's recorded responses, so the walk replays deterministically. The wrong
 * answers are chosen to expose *specific* misconceptions rather than being
 * random — this is a coherent profile of one child, not noise.
 */
export const AARAV_RESPONSES: Record<string, string> = {
  // Number — can build a 3-digit number, but judges size by the last digit
  "d.thou.1": "b", // accepts 724 — drops the empty hundreds place
  "d.thou.2": "b", // compares from the right
  "d.h.1": "a",    // ✓ reads H–T–O blocks correctly
  "d.h.2": "b",    // picks 439 — compares the ones digit
  "d.dc.1": "a",   // ✓
  "d.dc.2": "a",   // ✓
  // Operations — carrying is fine, borrowing through an empty room is not
  "d.give.1": "a", // ✓ addition with carrying
  "d.give.2": "b", // ₹309 — subtracts smaller-from-larger in each column
  "d.g2add.1": "a", // ✓
  "d.g2add.2": "a", // ✓
  // Multiplication — meaning is there, place value and remainders are not
  "d.eq.1": "b",   // 31 — adds instead of multiplying
  "d.eq.2": "b",   // 20 tempos — rounds up and loses the remainder
  "d.rak.1": "a",  // ✓ understands "5 times 2"
  "d.rak.2": "b",  // 6 — adds rows and columns instead of multiplying
  "d.skip.1": "a", // ✓
  "d.skip.2": "a", // ✓
  // Fractions — Grade 3 sharing is solid; Grade 4 needs the division he lacks
  "d.frac4.1": "b", // reads "a quarter" as the number 4
  "d.frac4.2": "a", // ✓ compares unit fractions
  "d.frac3.1": "a", // ✓
  "d.frac3.2": "a", // ✓
};

/**
 * Unit 5 (core track) — g4.mul.equal-groups
 * NCERT Maths Mela (Class 4), Ch. 9 — Equal Groups.
 *
 * Why Aarav is here: this is real Grade 4 work running in parallel with his
 * Grade 3 repair, and it is the last gate before Grade 4 fractions — you cannot
 * find a fraction of a collection without dividing.
 */
import type { UnitContent } from "../types";
import { qn, step } from "./authoring";

const M1 = "g4.mul.equal-groups.m1";
const M2 = "g4.mul.equal-groups.m2";
const M3 = "g4.mul.equal-groups.m3";
const M4 = "g4.mul.equal-groups.m4";

export const U5_EQUAL_GROUPS: UnitContent = {
  unitId: "g4.mul.equal-groups",
  rationale:
    "Aarav is doing this unit on his core track, at grade level, from day one — the Grade 3 Raksha Bandhan repair runs just below it, so fixing a gap is never a demotion. Placement showed two specific habits: asked for the rods on 23 bullock carts at 8 rods each he answered 31, adding the two numbers instead of multiplying; and given 58 wheels at 3 per tempo he said 20 tempos with nothing left over, rounding the share up and throwing the leftover away. Both are addressed head on here, and both have to be gone before fractions, because finding a fraction of a collection is division.",

  entryCheck: [
    qn({
      id: "u5.e1", micro: "g3.mul.raksha.m1", purpose: "diagnostic", difficulty: 1,
      prompt: "Gopal ties 4 rakhis on each of 6 wrists. Which sentence says how many rakhis that is?",
      correct: "6 × 4",
      wrong: [["6 + 4", "adds the two numbers instead of multiplying"], ["6 − 4", "reads any two-number story as a take-away"], ["4 + 4", "counts only two of the six wrists"]],
      why: "Six equal groups of four. Repeated addition 4+4+4+4+4+4 is written short as 6 × 4.",
    }),
    qn({
      id: "u5.e2", micro: "g3.mul.raksha.m2", purpose: "diagnostic", difficulty: 1,
      prompt: "A box of laddoos is packed in rows. How many laddoos are in the box?",
      visual: { kind: "array", rows: 4, cols: 6, emoji: "🟡" },
      correct: "24",
      wrong: [["10", "adds the rows and the columns"], ["16", "counts only the four rows"], ["12", "counts two rows and stops"]],
      why: "4 rows of 6. You can count 6, 12, 18, 24 — or write it straight away as 4 × 6 = 24.",
    }),
    qn({
      id: "u5.e3", micro: "g3.mul.raksha.m3", purpose: "diagnostic", difficulty: 1,
      prompt: "How much is 7 × 5?",
      correct: "35",
      wrong: [["12", "adds instead of multiplying"], ["30", "lands one step short in the 5 table"], ["25", "counts 5 fives instead of 7"]],
      why: "Count on in fives seven times: 5, 10, 15, 20, 25, 30, 35.",
    }),
    qn({
      id: "u5.e4", micro: "g3.mul.raksha.m4", purpose: "diagnostic", difficulty: 2,
      prompt: "18 laddoos are shared equally among 9 cousins. How many does each cousin get?",
      correct: "2",
      wrong: [["27", "adds instead of sharing"], ["9", "repeats the number of cousins"], ["3", "shares among 6 instead of 9"]],
      why: "Nine equal shares out of 18: 18 ÷ 9 = 2, because 9 × 2 = 18.",
    }),
    qn({
      id: "u5.e5", micro: "g3.ops.give-take.m4", purpose: "diagnostic", difficulty: 2,
      prompt: "A shop has 8 spokes in every wheel. To find the spokes in 12 wheels, what should you do?",
      correct: "Multiply 12 by 8",
      wrong: [["Add 12 and 8", "adds because both numbers are in the story"], ["Subtract 8 from 12", "picks take-away when one number is smaller"], ["Divide 12 by 8", "divides whenever groups are mentioned"]],
      why: "Every wheel has the same 8 spokes, so it is 12 equal groups of 8 — that is multiplication.",
    }),
  ],

  experiences: [
    {
      id: "u5.x1", microConceptId: M1, role: "explainer", modality: "game", isPrimary: true,
      title: "Animal jumps: the numbers each animal lands on", minutes: 8,
      intent: "Build tables to 10 as landing spots on a number line, so a fact he cannot recall he can still reach.",
      beats: [
        { kind: "say", text: "Four animals stand at 0 on a long number line. The frog jumps 3 steps at a time, the squirrel 4, the rabbit 6 and the kangaroo 8. Nobody ever changes their jump." },
        { kind: "visual", visual: { kind: "number-line", from: 0, to: 30, step: 3, mark: 24 }, caption: "The frog's landing spots: 3, 6, 9, 12 … these are the multiples of 3, which is the 3 table." },
        {
          kind: "worked",
          steps: [
            { line: "Will the frog ever touch 67?", note: "Do not guess. Jump there." },
            { line: "10 jumps = 30. 20 jumps = 60.", note: "Counting in tens of jumps gets you close fast." },
            { line: "Then 63, 66, 69.", note: "The frog steps straight over 67." },
            { line: "No — 67 is not a multiple of 3.", note: "67 is not in the 3 table, so no number of 3-jumps lands on it." },
          ],
        },
        { kind: "say", text: "Some numbers get visited twice. The frog lands on 24 (that is 8 jumps of 3) and so does the kangaroo (3 jumps of 8). A number both animals land on is called a common multiple." },
        { kind: "do", text: "Play the cat-and-rat chase. The cat starts at 0 and jumps 5; the rat starts at 0 and jumps 2. The cat can only catch the rat on a number they can both land on. Which numbers under 30 are those?" },
        { kind: "say", text: "Magician Anvi has a doubling trick: whatever flowers you hand her, she gives back twice as many. Hand her 3 and she returns 6; hand those back and you get 12; again and you get 24. Doubling is just the 2 table used again and again." },
        { kind: "check", text: "The kangaroo jumps 8. Does it land on 60?", answer: "No. 8 × 7 = 56 and 8 × 8 = 64, so it jumps right over 60." },
      ],
    },
    {
      id: "u5.x2", microConceptId: M2, role: "explainer", modality: "worked-example", isPrimary: true,
      title: "Bullock carts: split the tens off first", minutes: 10,
      intent: "Teach 2-digit × 1-digit as two partial products, and confront the add-instead-of-multiply habit directly.",
      beats: [
        { kind: "say", text: "8 bamboo rods are needed to make one bullock cart. A workshop is building 23 carts. How many rods do they need? Aarav's first answer was 31 — that is 23 + 8." },
        { kind: "say", text: "Test that honestly. One cart already takes 8 rods. Two take 16. Four take 32 — and you have only built four of the twenty-three. So 31 rods cannot possibly be enough for 23 carts." },
        { kind: "say", text: "The trick the book uses: 23 carts is 20 carts and 3 carts. Do the easy twenty first, then the awkward three." },
        {
          kind: "worked",
          steps: [
            { line: "20 carts × 8 rods = 160", note: "2 × 8 = 16, so 20 × 8 = 160. Ten times the carts, ten times the rods." },
            { line: " 3 carts × 8 rods =  24", note: "Straight from the 8 table." },
            { line: "160 + 24 = 184 rods", note: "The two parts, put back together." },
          ],
        },
        { kind: "visual", visual: { kind: "column-sum", top: 160, bottom: 24, op: "+" }, caption: "The two partial products added. Neither part may be dropped — 160 alone forgets 3 whole carts." },
        {
          kind: "worked",
          steps: [
            { line: "Big e-autorickshaws carry 8 passengers. How many people fit in 125 autos?" },
            { line: "100 × 8 = 800", note: "Split 125 into 100, 20 and 5." },
            { line: " 20 × 8 = 160" },
            { line: "  5 × 8 =  40" },
            { line: "800 + 160 + 40 = 1 000 people", note: "Same method, one extra room." },
          ],
        },
        { kind: "check", text: "Now you: 45 × 9.", answer: "40 × 9 = 360 and 5 × 9 = 45. Together 405." },
      ],
    },
    {
      id: "u5.x2b", microConceptId: M2, role: "explainer", modality: "hands-on", isPrimary: false,
      title: "Alternate doorway — bundles of ten carts", minutes: 8,
      intent: "Re-teach path for a child who added instead of multiplying: build the tens and ones split with real counters before writing it.",
      beats: [
        { kind: "say", text: "Take 23 counters. Make 2 bundles of ten and leave 3 loose. Those are the 23 bullock carts, sorted into tens and ones." },
        { kind: "say", text: "Now put 8 rods beside each cart. Do not add anything yet — just look at how the counters are grouped." },
        {
          kind: "worked",
          steps: [
            { line: "One bundle of 10 carts → 10 × 8 = 80 rods", note: "Count the 8 table ten times, or just add a zero to 8." },
            { line: "Two bundles → 80 + 80 = 160 rods" },
            { line: "The 3 loose carts → 3 × 8 = 24 rods" },
            { line: "160 + 24 = 184 rods in all" },
          ],
        },
        { kind: "visual", visual: { kind: "place-value", hundreds: 1, tens: 8, ones: 4 }, caption: "184 rods: 1 hundred, 8 tens, 4 ones." },
        { kind: "say", text: "Here is the difference in one line. You add when the groups are different sizes and you want the whole pile. You multiply when every group is the same size — because then you already know one group, and you only need to know how many groups." },
        { kind: "do", text: "Try it with 14 carts. Split 14 into 10 and 4 before you write anything down." },
        { kind: "check", text: "How many rods for 14 carts?", answer: "10 × 8 = 80, 4 × 8 = 32, so 80 + 32 = 112 rods." },
      ],
    },
    {
      id: "u5.x3", microConceptId: M3, role: "explainer", modality: "hands-on", isPrimary: true,
      title: "Chippi counts legs — and multiplication runs backwards", minutes: 9,
      intent: "Introduce division as the undo of equal groups, and separate share problems from measure problems.",
      beats: [
        { kind: "say", text: "Chippi the lizard likes counting legs. 6 geese have 12 legs — that is 6 × 2, forwards. But one day Chippi counts 24 legs in a pen of sheep and wants to know how many sheep. That question runs the multiplication backwards: 24 ÷ 4 = 6 sheep." },
        { kind: "say", text: "There are two kinds of these backwards questions. In a share problem you are told how many groups (9 boats — how many people in each?). In a measure problem you are told the size of each group (5 petals per flower — how many flowers?). Both are division; only the missing piece is different." },
        {
          kind: "worked",
          steps: [
            { line: "Gulabo counted 80 hibiscus petals. Each flower has 5. How many flowers?" },
            { line: "This is a measure problem — the group size, 5, is given.", note: "The unknown is the number of flowers." },
            { line: "10 flowers would be 50 petals.", note: "30 petals still unaccounted for." },
            { line: " 6 flowers would be 30 petals." },
            { line: "10 + 6 = 16 flowers. So 80 ÷ 5 = 16.", note: "Check forwards: 16 × 5 = 80. ✓" },
          ],
        },
        { kind: "visual", visual: { kind: "groups", groups: 4, per: 5, emoji: "🌺" }, caption: "Four hibiscus flowers, 5 petals each — 20 petals. Gulabo had four times as many as this." },
        {
          kind: "worked",
          steps: [
            { line: "9 boats ferry 108 people across the Cauvery. Every boat carries the same number." },
            { line: "This is a share problem — the number of groups, 9, is given." },
            { line: "45 people → 5 each. Another 45 → 5 more each.", note: "90 people placed, 18 left." },
            { line: "18 people → 2 each." },
            { line: "5 + 5 + 2 = 12 people per boat. 108 ÷ 9 = 12." },
          ],
        },
        { kind: "do", text: "Kahlu and Rabia the potters have made 72 earthen kulhads and pack 6 into every crate. Say out loud whether that is a share problem or a measure problem, then solve it." },
        { kind: "check", text: "Chippi counts 40 legs, all belonging to octopuses. How many octopuses?", answer: "8 legs each, so 40 ÷ 8 = 5 octopuses." },
      ],
    },
    {
      id: "u5.x4", microConceptId: M4, role: "explainer", modality: "story", isPrimary: true,
      title: "58 wheels: the piece that is left over", minutes: 9,
      intent: "Teach partial quotients and the remainder, and kill the habit of rounding the share up until nothing is left.",
      beats: [
        { kind: "say", text: "A factory has ordered 58 wheels for its small tempos. Each tempo takes 3 wheels. In how many tempos can they fix the wheels? Aarav's answer was 20 tempos with nothing left over." },
        { kind: "say", text: "Check that against the delivery. 20 tempos would need 20 × 3 = 60 wheels. The factory only has 58 — it is two wheels short of 20 tempos, so 20 cannot be right." },
        {
          kind: "worked",
          steps: [
            { line: "Take 30 wheels  → 10 tempos", note: "28 wheels still in the crate." },
            { line: "Take 15 wheels  →  5 tempos", note: "13 left." },
            { line: "Take  9 wheels  →  3 tempos", note: "4 left." },
            { line: "Take  3 wheels  →  1 tempo", note: "1 left. Not enough for another tempo." },
            { line: "10 + 5 + 3 + 1 = 19 tempos, 1 wheel left over" },
          ],
        },
        { kind: "say", text: "That last wheel has a name: the remainder. It does not vanish and it is not a mistake. Write the whole story as 58 = 19 × 3 + 1. A remainder is always smaller than the group size — if it were 3 or more, one more tempo could be built." },
        { kind: "say", text: "What you do with the remainder depends on the story. A spare wheel goes back on the shelf and waits. But if 38 children are going rafting on the Ganga and a raft holds 6, then 38 ÷ 6 gives 6 rafts and 2 children left — and those 2 children still need a raft, so the answer is 7. Same with the Darjeeling Toy Train: a part-full coach is still a coach." },
        { kind: "check", text: "Work out 94 ÷ 4 with partial quotients.", answer: "80 → 20 groups, 14 left. 12 → 3 more groups, 2 left. So 23 remainder 2." },
      ],
    },
  ],

  guided: [
    step({
      id: "u5.g1", micro: M1,
      prompt: "The frog jumps 3 steps at a time, starting from 0. Will it ever land exactly on 67?",
      visual: { kind: "number-line", from: 0, to: 30, step: 3 },
      correct: "No — it lands on 66 and then 69",
      wrong: [["Yes, because 67 is an odd number", "checks odd or even instead of counting in threes"], ["Yes, because 67 is bigger than 3", "thinks every number past the jump size gets touched"], ["Only if it starts from 1", "changes the starting point rather than testing the multiples"]],
      hints: [
        "The frog only ever lands on numbers in the 3 table. So the real question is: is 67 in the 3 table?",
        "Do not count one jump at a time. 20 jumps takes it to 60 — carry on from there.",
        "From 60 the next landings are 63, 66, 69. Is 67 among them?",
      ],
      why: "67 is not a multiple of 3. The frog goes 63, 66, 69 — it steps straight over 67.",
    }),
    step({
      id: "u5.g2", micro: M2,
      prompt: "8 bamboo rods are needed to make one bullock cart. How many rods are needed for 23 carts?",
      correct: "184",
      wrong: [["31", "adds the two numbers instead of multiplying"], ["160", "multiplies the tens and forgets the 3 leftover carts"], ["166", "multiplies 20 × 8 but then adds the 3 carts instead of 3 × 8"]],
      hints: [
        "Before you calculate: 3 carts alone already need 24 rods. So the answer must be far bigger than 31.",
        "Split 23 into 20 carts and 3 carts. Do them separately.",
        "20 × 8 = 160 and 3 × 8 = 24. Now put the two parts back together.",
      ],
      why: "20 × 8 = 160, 3 × 8 = 24, and 160 + 24 = 184. Both parts of 23 have to be multiplied, not just the tens.",
    }),
    step({
      id: "u5.g3", micro: M3,
      prompt: "In a hibiscus flower there are 5 petals. Gulabo counted all the petals in her garden and found 80. How many flowers did she have?",
      correct: "16",
      wrong: [["85", "adds instead of dividing"], ["400", "multiplies instead of dividing"], ["15", "stops one group short when counting up in fives"]],
      hints: [
        "She knows the size of each group (5 petals) but not how many groups. That makes it a division: 80 ÷ 5.",
        "Build up in easy chunks. 10 flowers would use 50 petals. How many petals are still unaccounted for?",
        "30 petals are left, and 6 flowers use 30 petals. Add the two chunks of flowers together.",
      ],
      why: "10 flowers use 50 petals, 6 more use 30, and 10 + 6 = 16. Checking forwards, 16 × 5 = 80.",
    }),
    step({
      id: "u5.g4", micro: M4,
      prompt: "A factory has ordered 58 wheels for its small tempos. Each tempo has 3 wheels. In how many tempos can they fix the wheels?",
      correct: "19 tempos, with 1 wheel left over",
      wrong: [["20 tempos, with none left over", "rounds the share up and loses the remainder"], ["19 tempos, with 3 wheels left over", "leaves a whole extra group sitting in the remainder"], ["18 tempos, with 4 wheels left over", "stops dividing while there is still a full group of 3 available"]],
      hints: [
        "Try 20 tempos first and see if it fits: 20 × 3 = 60 wheels. Does the factory have 60?",
        "Take the wheels away in easy chunks: 30 wheels builds 10 tempos. How many wheels are still in the crate?",
        "Keep going — 15 more wheels builds 5 tempos, then 9 wheels builds 3, then 3 wheels builds 1. Count your tempos, and look at what is left.",
      ],
      why: "10 + 5 + 3 + 1 = 19 tempos, and 1 wheel is left. It cannot be 20, because 20 tempos would need 60 wheels and only 58 arrived.",
    }),
  ],

  masteryCheck: [
    qn({
      id: "u5.m1", micro: M1, purpose: "mastery", difficulty: 1,
      prompt: "The squirrel jumps 4 steps at a time from 0. Which of these numbers will it land on?",
      visual: { kind: "number-line", from: 0, to: 40, step: 4, mark: 28 },
      correct: "28",
      wrong: [["30", "counts in fives instead of fours"], ["26", "picks a number halfway between two landings"], ["34", "adds 4 to 30 without checking 30 is a landing"]],
      why: "4 × 7 = 28, so 28 is in the 4 table. 30 is not — the squirrel goes 28 then 32.",
    }),
    qn({
      id: "u5.m2", micro: M1, purpose: "mastery", difficulty: 2,
      prompt: "The frog jumps 3 and the kangaroo jumps 8, both starting from 0. Which number do they both land on?",
      visual: { kind: "number-line", from: 0, to: 24, step: 3, mark: 24 },
      correct: "24",
      wrong: [["18", "only the frog lands here"], ["16", "only the kangaroo lands here"], ["11", "adds 3 and 8 instead of finding a shared landing"]],
      why: "24 is 8 frog-jumps and 3 kangaroo-jumps. A number both animals reach is a common multiple.",
    }),
    qn({
      id: "u5.m3", micro: M1, purpose: "mastery", difficulty: 1,
      prompt: "The Dailyfresh supermarket lays out its strawberry boxes in a tray. How many boxes are on the tray?",
      visual: { kind: "array", rows: 6, cols: 7, emoji: "🍓" },
      correct: "42",
      wrong: [["13", "adds the rows and the columns instead of multiplying"], ["36", "reads it as 6 rows of 6"], ["48", "counts 6 rows of 8"]],
      why: "6 rows with 7 in each row: 6 × 7 = 42.",
    }),
    qn({
      id: "u5.m4", micro: M2, purpose: "mastery", difficulty: 2,
      prompt: "Radha's bakery sells a tray of cupcakes for ₹45. What do 9 trays cost?",
      correct: "₹405",
      wrong: [["₹54", "adds 45 and 9 instead of multiplying"], ["₹365", "works out 40 × 9 then adds 5 instead of 5 × 9"], ["₹360", "multiplies only the tens and drops the 5"]],
      why: "40 × 9 = 360 and 5 × 9 = 45. Together that is ₹405.",
    }),
    qn({
      id: "u5.m5", micro: M2, purpose: "mastery", difficulty: 3,
      prompt: "Big electric autorickshaws can carry 8 passengers each. How many people can travel in 125 such autos?",
      correct: "1 000",
      wrong: [["133", "adds 125 and 8 instead of multiplying"], ["800", "multiplies only the hundreds and stops"], ["960", "does 100 × 8 and 20 × 8 but forgets the 5 ones"]],
      why: "Split 125: 100 × 8 = 800, 20 × 8 = 160, 5 × 8 = 40. Adding those gives 1 000.",
    }),
    qn({
      id: "u5.m6", micro: M2, purpose: "mastery", difficulty: 1,
      prompt: "Each lily flower has 3 petals. How many petals are there in 12 flowers?",
      correct: "36",
      wrong: [["15", "adds 12 and 3 instead of multiplying"], ["30", "multiplies only the ten and drops the 2 extra flowers"], ["33", "counts 11 flowers instead of 12"]],
      why: "10 × 3 = 30 and 2 × 3 = 6, so 12 × 3 = 36. The 36 is called the product.",
    }),
    qn({
      id: "u5.m7", micro: M3, purpose: "mastery", difficulty: 2,
      prompt: "Kahlu and Rabia the potters made 72 earthen kulhads and packed 6 into every crate. How many crates did they fill?",
      visual: { kind: "groups", groups: 4, per: 6, emoji: "🏺" },
      correct: "12",
      wrong: [["78", "adds 72 and 6 instead of dividing"], ["432", "multiplies instead of dividing"], ["11", "loses one whole crate when counting up in sixes"]],
      why: "The group size (6) is given, so it is 72 ÷ 6. Ten crates hold 60, two more hold 12 — that is 12 crates.",
    }),
    qn({
      id: "u5.m8", micro: M3, purpose: "mastery", difficulty: 3,
      prompt: "9 boats have to ferry 108 people across the Cauvery. Every boat carries the same number. How many people are in each boat?",
      correct: "12",
      wrong: [["117", "adds 108 and 9 instead of sharing"], ["99", "subtracts 9 instead of dividing"], ["11", "stops one person per boat short — 9 × 11 leaves 9 people on the bank"]],
      why: "The number of groups (9 boats) is given, so it is 108 ÷ 9. Take 45 people (5 each), 45 more (5 each), then 18 (2 each): 12 per boat.",
    }),
    qn({
      id: "u5.m9", micro: M4, purpose: "mastery", difficulty: 2,
      prompt: "Solve 83 ÷ 3.",
      correct: "27 remainder 2",
      wrong: [["28 with nothing left over", "rounds the share up and loses the remainder"], ["27 remainder 3", "leaves a whole group of 3 sitting in the remainder"], ["26 remainder 5", "stops dividing while a full group of 3 is still available"]],
      why: "60 makes 20 groups, 21 makes 7 more, and 2 are left. 27 × 3 = 81, and 81 + 2 = 83. A remainder must always be smaller than 3.",
    }),
    qn({
      id: "u5.m10", micro: M4, purpose: "mastery", difficulty: 3,
      prompt: "38 children are going rafting on the Ganga. Each raft holds 6 children. How many rafts are needed so that everyone goes?",
      correct: "7 rafts",
      wrong: [["6 rafts", "drops the 2 leftover children instead of giving them a raft"], ["8 rafts", "gives each leftover child a raft of their own"], ["44 rafts", "adds 38 and 6 instead of dividing"]],
      why: "38 ÷ 6 = 6 rafts with 2 children left over, and those 2 still have to travel — so a seventh raft goes out, not quite full.",
    }),
  ],

  revisionSet: [
    qn({
      id: "u5.r1", micro: M2, purpose: "revision", difficulty: 2,
      prompt: "Solve 94 × 5.",
      correct: "470",
      wrong: [["99", "adds 94 and 5 instead of multiplying"], ["450", "multiplies only 90 × 5 and drops the 4"], ["455", "does 90 × 5 then adds 5 instead of 4 × 5"]],
      why: "90 × 5 = 450 and 4 × 5 = 20. Together, 470.",
    }),
    qn({
      id: "u5.r2", micro: M3, purpose: "revision", difficulty: 3,
      prompt: "Solve 635 ÷ 5.",
      correct: "127",
      wrong: [["640", "adds instead of dividing"], ["117", "misses ten whole groups partway through"], ["127 remainder 5", "leaves a full group of 5 sitting in the remainder"]],
      why: "500 makes 100 groups, 100 makes 20 more, 35 makes 7. That is 127, with nothing left over.",
    }),
    qn({
      id: "u5.r3", micro: M4, purpose: "revision", difficulty: 2,
      prompt: "Solve 94 ÷ 4.",
      correct: "23 remainder 2",
      wrong: [["24 with nothing left over", "rounds the share up and loses the remainder"], ["23 remainder 4", "leaves a whole group of 4 in the remainder"], ["22 remainder 6", "stops dividing while a full group of 4 is still available"]],
      why: "80 makes 20 groups, 12 makes 3 more, and 2 are left. 23 × 4 = 92, and 92 + 2 = 94.",
    }),
    // Interleaved from the prerequisite unit g3.mul.raksha — §4 transfer questions
    qn({
      id: "u5.r4", micro: "g3.mul.raksha.m4", purpose: "revision", difficulty: 2,
      prompt: "45 laddoos from the Jagannath Sweet Shop are packed 5 to a box. How many boxes is that?",
      correct: "9",
      wrong: [["50", "adds 45 and 5 instead of dividing"], ["225", "multiplies instead of dividing"], ["8", "counts one box short when going up in fives"]],
      why: "45 ÷ 5 = 9, because 9 × 5 = 45. Sharing into equal boxes is division.",
    }),
    // Interleaved from the related unit g4.num.thousands — the bullock-cart answer, re-read
    qn({
      id: "u5.r5", micro: "g4.num.thousands.m3", purpose: "revision", difficulty: 2,
      prompt: "The workshop counted its rods as 18 tens and 4 ones. Which number is that?",
      correct: "184",
      wrong: [["1804", "writes the two parts side by side instead of regrouping"], ["22", "adds 18 and 4 instead of reading them as tens and ones"], ["814", "swaps the tens and the ones"]],
      why: "18 tens is 1 hundred and 8 tens. With the 4 ones that makes 184 — the same answer as 23 × 8.",
    }),
  ],
};

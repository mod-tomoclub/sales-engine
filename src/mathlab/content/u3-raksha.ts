/**
 * Unit — g3.mul.raksha "Raksha Bandhan: equal groups become multiplication"
 * NCERT Maths Mela (Class 3), Ch. 7 — Raksha Bandhan.
 *
 * Contexts are taken from the textbook itself: Gopal and Dhara making rakhis for
 * Atya's visit (1 flower, 2 threads and 4 beads each, five rakhis), the Jagannath
 * Sweet Shop laddoo box that the shopkeeper arranges in rows so Dhara can stop
 * counting one by one, the two boxes that make 18, the nine people at home sharing
 * those 18 laddoos, and the kaju katlis shared among five.
 */
import type { UnitContent } from "../types";
import { qn, step } from "./authoring";

const M1 = "g3.mul.raksha.m1";
const M2 = "g3.mul.raksha.m2";
const M3 = "g3.mul.raksha.m3";
const M4 = "g3.mul.raksha.m4";

const SC1 = "g2.mul.skip-count.m1";
const SC2 = "g2.mul.skip-count.m2";

const GT4 = "g3.ops.give-take.m4";

export const U3_RAKSHA: UnitContent = {
  unitId: "g3.mul.raksha",
  rationale:
    "Aarav already owns the meaning of multiplication — in placement he picked 5 × 2 for 'each rakhi uses 2 threads, make 5 rakhis' without hesitation. What broke was the array: shown a 3 × 3 laddoo box he answered 6, adding the rows to the columns instead of multiplying them, and on a Grade 4 question he added 8 rods and 23 carts rather than multiplying. That single habit is blocking two strands at once — Grade 4 Equal Groups, and Grade 4 fractions, which cannot start until division can find a fraction of a collection.",

  entryCheck: [
    qn({
      id: "u3.e1",
      micro: SC1,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "Gopal counts threads two at a time: 2, 4, 6, 8, __ ?",
      correct: "10",
      wrong: [
        ["9", "counts on in ones instead of taking a step of two"],
        ["12", "drops a step and lands two places along"],
        ["16", "doubles the last number instead of adding two to it"],
      ],
      why: "Every step in this count is a jump of 2, so two more than 8 is 10.",
    }),
    qn({
      id: "u3.e2",
      micro: SC1,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Dhara has five ₹10 notes in her hand. Count them in tens. How much money is that?",
      correct: "₹50",
      wrong: [
        ["₹15", "adds the 5 notes to the ₹10 instead of counting a ten for each note"],
        ["₹40", "stops one note short while counting 10, 20, 30, 40"],
        ["₹510", "writes the number of notes and their value side by side"],
      ],
      why: "One ten for each note: 10, 20, 30, 40, 50. Five notes of ₹10 make ₹50.",
    }),
    qn({
      id: "u3.e3",
      micro: SC2,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Four cycle-rickshaws are parked outside the sweet shop. Each one has 3 wheels. How many wheels altogether?",
      visual: { kind: "groups", groups: 4, per: 3, emoji: "⚙️" },
      correct: "12",
      wrong: [
        ["7", "adds the number of rickshaws to the number of wheels on one of them"],
        ["4", "counts the rickshaws and forgets the wheels"],
        ["9", "misses a whole group while skip counting 3, 6, 9"],
      ],
      why: "Four equal groups of 3: count 3, 6, 9, 12. Four rickshaws means four lots of 3 wheels.",
    }),
    qn({
      id: "u3.e4",
      micro: SC2,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "Which one of these shows equal groups?",
      correct: "3 plates with 2 laddoos on each plate",
      wrong: [
        ["3 plates holding 2, 3 and 1 laddoos", "calls any set of plates 'equal groups' without checking that each holds the same"],
        ["1 plate holding 6 laddoos", "sees a total and calls it a group"],
      ],
      why: "Groups are equal only when every group holds exactly the same number. 2, 2 and 2 is equal; 2, 3 and 1 is not.",
    }),
    qn({
      id: "u3.e5",
      micro: SC1,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Count the beads in fives: 5, 10, 15, __, __ ?",
      correct: "20, 25",
      wrong: [
        ["16, 17", "counts on in ones once the pattern gets long"],
        ["20, 30", "changes the step size from 5 to 10 partway through"],
        ["25, 30", "skips the 20 and carries on from there"],
      ],
      why: "The step never changes: five more than 15 is 20, and five more than 20 is 25.",
    }),
  ],

  experiences: [
    {
      id: "u3.x1",
      microConceptId: M1,
      role: "explainer",
      modality: "hands-on",
      isPrimary: true,
      title: "Five rakhis on the table",
      minutes: 8,
      intent: "Lay the five rakhis out physically, then write the same count three ways — repeated addition, 'times', and the × sign — so × is read as language, not as a new trick.",
      beats: [
        { kind: "say", text: "Atya is coming to visit, so Gopal and Dhara are making rakhis. For each rakhi they need one flower, 2 threads and 4 beads. They need to make 5 rakhis." },
        { kind: "do", text: "Lay out five spaces on the table, one for each rakhi. Put the pieces for one rakhi into each space. Do not count anything yet — just build all five." },
        { kind: "visual", visual: { kind: "groups", groups: 5, per: 2, emoji: "🧵" }, caption: "Five rakhis, 2 threads waiting in each one." },
        {
          kind: "worked",
          steps: [
            { line: "Flowers: 1 + 1 + 1 + 1 + 1 = 5", note: "Five 1s. We say '5 times 1', and write 5 × 1 = 5." },
            { line: "Threads: 2 + 2 + 2 + 2 + 2 = 10", note: "Five 2s. We say '5 times 2', and write 5 × 2 = 10." },
            { line: "Beads: 4 + 4 + 4 + 4 + 4 = 20", note: "Five 4s. We say '5 times 4', and write 5 × 4 = 20." },
          ],
        },
        { kind: "say", text: "Read the × sign out loud as 'times'. The number in front says how many groups there are. The number after it says how big each group is. 5 × 4 is five groups with 4 in each — it is never 5 and 4 put together." },
        { kind: "do", text: "Try it out: Atya's neighbours want 10 such rakhis. Write the three sentences for flowers, threads and beads before you work out any answer." },
        { kind: "check", text: "How much material for 10 rakhis?", answer: "10 × 1 = 10 flowers, 10 × 2 = 20 threads, 10 × 4 = 40 beads. Twice as many rakhis, so twice as much of everything." },
      ],
    },
    {
      id: "u3.x2",
      microConceptId: M2,
      role: "explainer",
      modality: "interactive",
      isPrimary: true,
      title: "The laddoo box: rows times columns",
      minutes: 9,
      intent: "The real target of the unit. Count the same 3 × 3 box three ways so the 'add the rows and the columns' answer of 6 is caught in the act of leaving a whole row behind.",
      beats: [
        { kind: "say", text: "Dhara goes to the Jagannath Sweet Shop for Atya's laddoos. She tries to count them one by one, loses her place, and starts again. So the shopkeeper puts them in a box, in neat rows." },
        { kind: "visual", visual: { kind: "array", rows: 3, cols: 3, emoji: "🟡" }, caption: "Three rows. Three laddoos sitting in each row." },
        { kind: "say", text: "Here is the trap. Plenty of people look at this box and say '3 and 3 — that's 6'. Now count the laddoos in the picture. There are 9. Three of them have gone missing from that answer. Where were they?" },
        {
          kind: "worked",
          steps: [
            { line: "3 + 3 = 6", note: "That is only two rows. The third row was never counted at all." },
            { line: "3 + 3 + 3 = 9", note: "One 3 for each row. Three rows, so three 3s." },
            { line: "3 rows of 3 = 3 × 3 = 9", note: "Rows TIMES columns. Three times three equals 9. There are 9 laddoos in this box." },
          ],
        },
        { kind: "say", text: "The column number is not something you add on. It is the size of one row. The row number tells you how many times to take that size." },
        { kind: "do", text: "Cover the bottom row of the box with your hand. Count what is left: 6. Now slide your hand away: 9. Adding rows and columns leaves a whole row of laddoos sitting in the shop." },
        { kind: "check", text: "Dhara says, 'Please give me 2 boxes of laddoos.' How many is that?", answer: "9 + 9 = 18. Two times nine equals 18, so 2 × 9 = 18." },
      ],
    },
    {
      id: "u3.x2b",
      microConceptId: M2,
      role: "explainer",
      modality: "game",
      isPrimary: false,
      title: "Beat the shopkeeper: call the tray",
      minutes: 7,
      intent: "Alternate doorway for the same micro-concept. A race where the plus answer is called out first every round, then shown to be short — and the gap grows each round.",
      beats: [
        { kind: "say", text: "A game. The shopkeeper slides a tray across the counter and you call the total before he does. One rule: you must touch each row and say the running count out loud." },
        { kind: "visual", visual: { kind: "array", rows: 2, cols: 5, emoji: "🟠" }, caption: "Round one. Two rows, five in each." },
        {
          kind: "worked",
          steps: [
            { line: "Touch row 1 and say 'five'. Touch row 2 and say 'ten'.", note: "You said 5 twice, because there are two rows of 5. So 2 × 5 = 10." },
            { line: "The plus answer would be 2 + 5 = 7.", note: "Point at sweet number eight on the tray. It is right there. The plus answer left three behind." },
          ],
        },
        { kind: "visual", visual: { kind: "array", rows: 4, cols: 3, emoji: "🟠" }, caption: "Round two. Four rows, three in each." },
        {
          kind: "worked",
          steps: [
            { line: "Touch and count: three, six, nine, twelve.", note: "Four rows, three each: 4 × 3 = 12." },
            { line: "The plus answer would be 4 + 3 = 7.", note: "Five sweets short this time. Last round the gap was three. It is getting worse, not better." },
          ],
        },
        { kind: "say", text: "That is the point of the game. Plus is not slightly wrong here — it drifts further from the truth every time the tray gets bigger, because it never counts the rows more than once." },
        { kind: "check", text: "Final round: a tray with 5 rows and 4 in each. Call it.", answer: "4, 8, 12, 16, 20 — so 5 × 4 = 20. The plus answer, 9, would have left eleven sweets on the counter." },
      ],
    },
    {
      id: "u3.x3",
      microConceptId: M3,
      role: "explainer",
      modality: "game",
      isPrimary: true,
      title: "Threads, hands and ten-rupee notes",
      minutes: 6,
      intent: "Anchor each table to something countable — 2s are threads, 5s are fingers on a hand, 10s are ₹10 notes — then drill for speed and name the 'one step short' slip.",
      beats: [
        { kind: "say", text: "A table is not a list to swallow whole. Each one is a real thing being counted in equal groups, over and over." },
        {
          kind: "worked",
          steps: [
            { line: "The 2-table is threads on rakhis: 2, 4, 6, 8, 10, 12 …", note: "Every answer is an even number. If you land on an odd number you have slipped." },
            { line: "The 5-table is fingers on a hand: 5, 10, 15, 20, 25, 30 …", note: "The answers end 5, 0, 5, 0, turn and turn about." },
            { line: "The 10-table is ₹10 notes: 10, 20, 30, 40, 50 …", note: "It is just the counting numbers with a 0 standing behind them." },
          ],
        },
        { kind: "visual", visual: { kind: "groups", groups: 6, per: 5, emoji: "🖐" }, caption: "Six hands: 5, 10, 15, 20, 25, 30. So 6 × 5 = 30." },
        { kind: "say", text: "Watch for the slip that catches nearly everybody: stopping one step short. For 7 × 5 you count 5, 10, 15, 20, 25, 30 and answer 30 — but that was only six steps. Put a finger up for every step you say, and check you have the right number of fingers before you answer." },
        { kind: "do", text: "Speed round. Someone calls out 4 × 5, 8 × 2, 6 × 10, 9 × 5, 7 × 2 in any order. Three seconds each, fingers up as you count." },
        { kind: "check", text: "Ribbon for a rakhi costs ₹10. Gopal buys 8 lengths. What does he pay?", answer: "8 × 10 = ₹80. Eight ₹10 notes: 10, 20, 30, 40, 50, 60, 70, 80." },
      ],
    },
    {
      id: "u3.x4",
      microConceptId: M4,
      role: "explainer",
      modality: "hands-on",
      isPrimary: true,
      title: "Eighteen laddoos, nine people",
      minutes: 8,
      intent: "Deal a real total out one round at a time so division is felt as 'one each, again and again, until the pile is empty', then written as ÷.",
      beats: [
        { kind: "say", text: "After Atya and the children arrive there are 9 people in the house. There are two boxes of laddoos on the table: 9 + 9 = 18. Everybody should get the same number — that is the whole rule." },
        { kind: "do", text: "Take 18 counters and set out 9 plates. Put one counter on each plate. Then go round again. Keep going until the pile is empty, and only then look at a plate." },
        {
          kind: "worked",
          steps: [
            { line: "Round one: 9 given out. 18 − 9 = 9 still in the pile.", note: "One laddoo on every plate." },
            { line: "Round two: 9 given out. 9 − 9 = 0 left.", note: "Two laddoos on every plate, and nothing over." },
            { line: "18 equally shared by 9 is 2 each. We write 18 ÷ 9 = 2 laddoos.", note: "The 9 says how many people are sharing. The 2 says what one person gets." },
          ],
        },
        { kind: "visual", visual: { kind: "groups", groups: 9, per: 2, emoji: "🟡" }, caption: "Nine plates with 2 laddoos each. Read it forwards and it is 9 × 2 = 18 — sharing undoes the times." },
        { kind: "say", text: "Atya also brought kaju katlis. Estimate first, then count: there are 20, to be shared among 5 people. The book takes them away five at a time: 20 − 5 = 15, 15 − 5 = 10, 10 − 5 = 5, 5 − 5 = 0. That is four full rounds, so 20 equally shared by 5 is 4 each. 20 ÷ 5 = 4." },
        { kind: "check", text: "Suppose only 6 people were home and the 18 laddoos still had to be shared. How many each?", answer: "18 ÷ 6 = 3 each. Fewer people sharing the same pile means a bigger share for everyone." },
      ],
    },
  ],

  guided: [
    step({
      id: "u3.g1",
      micro: M1,
      prompt: "Each rakhi uses 4 beads. Gopal is making 5 rakhis. Which sentence counts the beads?",
      correct: "5 × 4 = 20",
      wrong: [
        ["5 + 4 = 9", "adds the two numbers in the story instead of making five groups of 4"],
        ["4 × 4 = 16", "uses the beads-per-rakhi number for the rakhi count as well"],
        ["5 × 5 = 25", "uses the rakhi count twice and loses the 4 beads"],
      ],
      hints: [
        "Write out one 4 for each rakhi, in a row: 4 + 4 + 4 + 4 + 4.",
        "Count how many 4s you wrote. That count is the number that goes in front of the × sign.",
        "'5 times 4' means five lots of 4. Skip count them: 4, 8, 12, 16, 20.",
      ],
      why: "Five rakhis with 4 beads in each is 4 + 4 + 4 + 4 + 4 — five 4s. We write that as 5 × 4 = 20 beads.",
    }),
    step({
      id: "u3.g2",
      micro: M2,
      prompt: "The shopkeeper hands Dhara this box. How many laddoos are in it?",
      visual: { kind: "array", rows: 3, cols: 3, emoji: "🟡" },
      correct: "9",
      wrong: [
        ["6", "adds the 3 rows to the 3 columns instead of multiplying them"],
        ["3", "counts one row and stops, as if the rows below were the same laddoos again"],
        ["12", "counts the 3 rows and 3 columns and then adds the corners twice"],
      ],
      hints: [
        "Cover everything except the top row with your hand. How many laddoos are in that one row?",
        "Now slide your hand down a row at a time. Every row holds that same number. How many rows are there in all?",
        "Three rows, three in each, means 3 + 3 + 3. Count it up before you answer — and notice that 3 + 3 only reaches two rows.",
      ],
      why: "Each row holds 3 laddoos and there are 3 rows, so 3 + 3 + 3 = 9. It is rows times columns, never rows plus columns — adding them leaves a whole row in the shop.",
    }),
    step({
      id: "u3.g3",
      micro: M3,
      prompt: "Rakhi ribbon costs ₹5 a metre. Dhara buys 7 metres. What does she pay?",
      correct: "₹35",
      wrong: [
        ["₹30", "recalls the 5-table one step short and stops at the sixth five"],
        ["₹12", "adds the 7 metres to the ₹5 instead of multiplying"],
        ["₹57", "writes the two numbers in the story side by side"],
      ],
      hints: [
        "Count in fives and put up one finger for every step you say.",
        "5, 10, 15, 20 … keep going until seven fingers are up, not six.",
        "Six fingers gets you to ₹30, so there is one more ₹5 still to come.",
      ],
      why: "Seven fives: 5, 10, 15, 20, 25, 30, 35. So 7 × 5 = 35 and the ribbon costs ₹35.",
    }),
    step({
      id: "u3.g4",
      micro: M4,
      prompt: "Atya's 20 kaju katlis are shared equally among 5 people. How many does each person get?",
      correct: "4 each — 20 ÷ 5 = 4",
      wrong: [
        ["5 each — 20 ÷ 5 = 5", "hands each person as many sweets as there are people"],
        ["15 each — 20 − 5 = 15", "takes 5 away once instead of dealing them out round after round"],
        ["25 each — 20 + 5 = 25", "adds the people to the sweets instead of sharing"],
      ],
      hints: [
        "Deal them out like cards — one to each of the 5 people — and see what is left in the middle.",
        "Take five away for each full round: 20 − 5 = 15, 15 − 5 = 10, 10 − 5 = 5, 5 − 5 = 0.",
        "Count how many full rounds you managed before the pile ran out. That number is what one person got.",
      ],
      why: "Four full rounds of 5 empties the plate, so every person ends up with 4. 20 equally shared by 5 is 4 each, written 20 ÷ 5 = 4.",
    }),
  ],

  masteryCheck: [
    qn({
      id: "u3.m1",
      micro: M1,
      purpose: "mastery",
      difficulty: 1,
      prompt: "Each rakhi uses 2 threads and Gopal makes 5 rakhis. Which sentence says the same thing as 2 + 2 + 2 + 2 + 2?",
      visual: { kind: "groups", groups: 5, per: 2, emoji: "🧵" },
      correct: "5 × 2 = 10",
      wrong: [
        ["2 × 2 = 4", "multiplies the two numbers it can see instead of counting how many groups there are"],
        ["5 + 2 = 7", "adds the group count to the group size instead of multiplying"],
        ["5 × 5 = 25", "uses the number of rakhis for the threads as well"],
      ],
      why: "There are five 2s in that sum, so it is '5 times 2': 5 × 2 = 10 threads.",
    }),
    qn({
      id: "u3.m2",
      micro: M1,
      purpose: "mastery",
      difficulty: 2,
      prompt: "For 10 such rakhis, how many beads are needed? (Each rakhi uses 4 beads.)",
      correct: "40",
      wrong: [
        ["14", "adds the 10 rakhis to the 4 beads instead of taking 4 ten times"],
        ["20", "uses the 2 threads per rakhi instead of the 4 beads"],
        ["104", "writes the two numbers in the story side by side"],
      ],
      why: "Ten rakhis, 4 beads in each: 10 × 4 = 40. Five rakhis needed 20 beads, so ten rakhis need twice that.",
    }),
    qn({
      id: "u3.m3",
      micro: M2,
      purpose: "mastery",
      difficulty: 1,
      prompt: "A tray of sweets at the shop. How many sweets are on it?",
      visual: { kind: "array", rows: 2, cols: 5, emoji: "🟠" },
      correct: "10",
      wrong: [
        ["7", "adds the 2 rows to the 5 columns instead of multiplying them"],
        ["5", "counts the top row and treats the row below as the same sweets"],
        ["25", "uses the row length twice and forgets there are only 2 rows"],
      ],
      why: "Two rows with 5 in each: 5 + 5 = 10, or 2 × 5 = 10.",
    }),
    qn({
      id: "u3.m4",
      micro: M2,
      purpose: "mastery",
      difficulty: 2,
      prompt: "The shopkeeper lays the laddoos out like this. Which multiplication matches the tray?",
      visual: { kind: "array", rows: 6, cols: 3, emoji: "🟡" },
      correct: "6 × 3 = 18",
      wrong: [
        ["6 + 3 = 9", "adds the rows and the columns instead of multiplying them"],
        ["6 × 6 = 36", "uses the number of rows for the row length as well"],
        ["3 × 3 = 9", "uses the row length twice and ignores how many rows there are"],
      ],
      why: "Six rows with 3 in each: 3 + 3 + 3 + 3 + 3 + 3 = 18, which is 6 times 3, so 6 × 3 = 18.",
    }),
    qn({
      id: "u3.m5",
      micro: M2,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Dhara asks for 2 boxes of laddoos. Each box has 3 rows with 3 laddoos in every row. How many laddoos does she carry home?",
      correct: "18",
      wrong: [
        ["9", "works out one box correctly and then forgets the second box"],
        ["12", "adds the rows and columns in each box to get 6, then doubles that"],
        ["6", "adds the 3 rows and the 3 columns of one box and stops there"],
      ],
      why: "One box is 3 × 3 = 9 laddoos. Two boxes is 9 + 9 = 18, or 2 × 9 = 18.",
    }),
    qn({
      id: "u3.m6",
      micro: M3,
      purpose: "mastery",
      difficulty: 1,
      prompt: "What is 7 × 2?",
      correct: "14",
      wrong: [
        ["12", "recalls the 2-table one step short and stops at the sixth two"],
        ["9", "adds 7 and 2 instead of multiplying"],
        ["16", "runs one step too far along the 2-table"],
      ],
      why: "Seven twos: 2, 4, 6, 8, 10, 12, 14. Count the steps, not just the numbers.",
    }),
    qn({
      id: "u3.m7",
      micro: M3,
      purpose: "mastery",
      difficulty: 2,
      prompt: "A packet of beads costs ₹10. Gopal buys 6 packets. What does he pay?",
      correct: "₹60",
      wrong: [
        ["₹16", "adds the 6 packets to the ₹10 price instead of multiplying"],
        ["₹50", "stops one packet short while counting 10, 20, 30, 40, 50"],
        ["₹610", "writes the number of packets and the price side by side"],
      ],
      why: "Six lots of ₹10: 10, 20, 30, 40, 50, 60. So 6 × 10 = ₹60.",
    }),
    qn({
      id: "u3.m8",
      micro: M4,
      purpose: "mastery",
      difficulty: 2,
      prompt: "There are 18 laddoos and 9 people in the house. If they are shared equally, how many does each person get?",
      correct: "2 each — 18 ÷ 9 = 2",
      wrong: [
        ["9 each — 18 ÷ 9 = 9", "gives each person as many laddoos as there are people sharing"],
        ["1 each, with 9 left over", "stops after a single round of sharing instead of dealing out the whole pile"],
        ["3 each — 18 ÷ 6 = 3", "shares among the six children and forgets the three adults"],
      ],
      why: "Deal them out: nine go round once, nine go round again, and the pile is empty. 18 equally shared by 9 is 2 each.",
    }),
    qn({
      id: "u3.m9",
      micro: M4,
      purpose: "mastery",
      difficulty: 3,
      prompt: "There are 30 flowers, 30 threads and 30 beads on the table. Each rakhi needs 1 flower, 2 threads and 4 beads. How many complete rakhis can be made?",
      correct: "7",
      wrong: [
        ["30", "counts only the flowers, since each rakhi needs one, and ignores the other two piles"],
        ["15", "checks the threads with 30 ÷ 2 and never checks whether the beads will last"],
        ["90", "adds all three piles together instead of sharing each one out"],
      ],
      why: "Flowers would allow 30 rakhis and threads 30 ÷ 2 = 15, but beads run out first: 30 ÷ 4 is 7 with 2 beads left over. The smallest of the three answers is what you can actually make — 7 rakhis.",
    }),
    qn({
      id: "u3.m10",
      micro: M1,
      purpose: "mastery",
      difficulty: 3,
      prompt: "A bullock cart is built with 8 bamboo rods. Which sentence tells you how many rods are needed for 5 carts?",
      correct: "5 × 8 = 40",
      wrong: [
        ["5 + 8 = 13", "adds the two numbers in the story instead of taking 8 rods five times"],
        ["8 × 8 = 64", "uses the rods-per-cart number for the cart count as well"],
        ["8 ÷ 5", "divides, as if the 8 rods were being shared out among the carts rather than needed by each one"],
      ],
      why: "Every cart needs its own 8 rods, so it is 8 + 8 + 8 + 8 + 8 — five 8s, which is 5 × 8 = 40 rods. Adding the two numbers would build barely one cart.",
    }),
  ],

  revisionSet: [
    qn({
      id: "u3.r1",
      micro: M1,
      purpose: "revision",
      difficulty: 1,
      prompt: "Write 6 + 6 + 6 + 6 as a multiplication.",
      correct: "4 × 6 = 24",
      wrong: [
        ["6 × 6 = 36", "uses the number being repeated as the count of groups as well"],
        ["4 + 6 = 10", "adds the two numbers instead of taking 6 four times"],
        ["6 × 4 = 12", "reads '6 times 4' but then adds the two numbers"],
      ],
      why: "There are four 6s in that sum, so it is '4 times 6': 4 × 6 = 24.",
    }),
    qn({
      id: "u3.r2",
      micro: M2,
      purpose: "revision",
      difficulty: 2,
      prompt: "Beads are laid out on a cloth like this. How many beads are there?",
      visual: { kind: "array", rows: 4, cols: 5, emoji: "🔴" },
      correct: "20",
      wrong: [
        ["9", "adds the 4 rows to the 5 columns instead of multiplying them"],
        ["16", "uses the number of rows as the row length as well"],
        ["10", "counts two rows and assumes the other two are repeats"],
      ],
      why: "Four rows with 5 beads in each: 5, 10, 15, 20. So 4 × 5 = 20.",
    }),
    qn({
      id: "u3.r3",
      micro: M4,
      purpose: "revision",
      difficulty: 2,
      prompt: "24 laddoos are shared equally onto 4 plates. How many laddoos on each plate?",
      correct: "6",
      wrong: [
        ["4", "gives the number of plates as the answer instead of what one plate holds"],
        ["20", "takes 4 away once instead of dealing the laddoos out round after round"],
        ["28", "adds the plates to the laddoos instead of sharing"],
      ],
      why: "Deal one to each plate, over and over: six full rounds empty the pile. 24 ÷ 4 = 6 on each plate.",
    }),
    // Interleaved from the prerequisite unit g2.mul.skip-count — §4 transfer.
    qn({
      id: "u3.r4",
      micro: SC1,
      purpose: "revision",
      difficulty: 2,
      prompt: "Dhara has six ₹5 coins. Count them in fives. How much money is that?",
      correct: "₹30",
      wrong: [
        ["₹11", "adds the 6 coins to the ₹5 value instead of counting a five for each coin"],
        ["₹25", "stops one coin short while counting 5, 10, 15, 20, 25"],
        ["₹65", "writes the number of coins and their value side by side"],
      ],
      why: "One five for each coin: 5, 10, 15, 20, 25, 30. Six ₹5 coins make ₹30.",
    }),
    // Interleaved from the related unit g3.ops.give-take — §4 transfer.
    qn({
      id: "u3.r5",
      micro: GT4,
      purpose: "revision",
      difficulty: 3,
      prompt: "Dhara took ₹100 to the market. She spent ₹45 on laddoos and ₹18 on ribbon. How much money does she bring home?",
      correct: "₹37",
      wrong: [
        ["₹63", "adds up what she spent and stops there, forgetting to take it from the ₹100"],
        ["₹55", "subtracts only the laddoos and never uses the ribbon"],
        ["₹163", "adds everything together, including the money she started with"],
      ],
      why: "First add what went out: 45 + 18 = 63. Then take that from what she had: 100 − 63 = 37. Two steps, and the second one is a taking-away.",
    }),
  ],
};

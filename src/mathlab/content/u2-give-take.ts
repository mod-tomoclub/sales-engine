/**
 * Unit — g3.ops.give-take "Give and Take: regrouping in addition and subtraction"
 * NCERT Maths Mela (Class 3), Ch. 12 — Give and Take.
 *
 * Contexts are taken from the textbook itself: Kishan's plant nursery and the
 * saplings he brings in and sends out, the barter village of Jadupur where
 * Shaamu Kaka trades rice for vegetables and sarees before money arrives, and
 * Peter uncle's rice-and-sugar shop with its money box and its change.
 */
import type { UnitContent } from "../types";
import { qn, step } from "./authoring";

const M1 = "g3.ops.give-take.m1";
const M2 = "g3.ops.give-take.m2";
const M3 = "g3.ops.give-take.m3";
const M4 = "g3.ops.give-take.m4";

const P1 = "g2.ops.add-sub-99.m1";
const P2 = "g2.ops.add-sub-99.m2";
const H1 = "g3.num.hundreds.m1";
const H5 = "g3.num.hundreds.m5";

export const U2_GIVE_TAKE: UnitContent = {
  unitId: "g3.ops.give-take",
  rationale:
    "In placement Aarav added 364 + 52 correctly, so carrying is already intact and m1 is mostly revision. He failed 'Reena paid ₹209 from a ₹500 note' with ₹309 — he subtracted the smaller digit from the larger in every column rather than borrowing through the empty tens room, which makes m3 the real work here. This unit sits on his bridge track, not his repair track: the root gap is House of Hundreds place value, which runs just before it, so once the room-value idea underneath is repaired this should clear fast — and it is the last thing standing between him and Grade 4 Thousands Around Us and Equal Groups.",

  entryCheck: [
    qn({
      id: "u2.e1",
      micro: P1,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "Kishan already had 64 saplings in the shed and carried in 5 more. How many now?",
      correct: "69",
      wrong: [
        ["114", "lines the 5 up under the tens instead of the ones and adds 50"],
        ["59", "takes the 5 away instead of adding it on"],
        ["609", "writes the two numbers side by side instead of filling rooms"],
      ],
      why: "The 5 is 5 ones, so it goes into the ones room: 4 + 5 = 9 ones, and the 6 tens are untouched.",
    }),
    qn({
      id: "u2.e2",
      micro: P2,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Kishan had 96 saplings and sent 42 to the school. How many are left?",
      correct: "54",
      wrong: [
        ["138", "adds the two numbers instead of taking one away"],
        ["94", "does the ones column and then copies the tens column down untouched"],
        ["52", "takes the 4 away from the ones column as well as from the tens column"],
      ],
      why: "Room by room: 6 − 2 = 4 ones and 9 − 4 = 5 tens. Nothing needs breaking here, so 54 are left.",
    }),
    qn({
      id: "u2.e3",
      micro: H1,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "Peter uncle's money box holds ₹500. How many tens are sitting in the tens room of 500?",
      visual: { kind: "place-value", hundreds: 5, tens: 0, ones: 0 },
      correct: "0",
      wrong: [
        ["5", "reads the hundreds digit as if it were the tens digit"],
        ["50", "counts how many tens the whole number is worth instead of reading the tens room"],
        ["500", "reads the whole number instead of one room"],
      ],
      why: "Rooms from the right: 0 ones, 0 tens, 5 hundreds. The tens room of 500 is completely empty — which is exactly what makes taking money away from it feel hard.",
    }),
    qn({
      id: "u2.e4",
      micro: H5,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "₹500 is the same as 4 hundreds, 9 tens and how many ones?",
      correct: "10",
      wrong: [
        ["0", "leaves the ones room empty, which only makes 490"],
        ["1", "trades one ten for one single one instead of for ten ones"],
        ["100", "sends the whole hundred into the ones room"],
      ],
      why: "400 + 90 + 10 = 500. Renaming does not change the money, it just moves value into the room that needs it.",
    }),
    qn({
      id: "u2.e5",
      micro: H5,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Kishan's order card says 230 saplings. Which of these is another true name for 230?",
      correct: "1 hundred and 13 tens",
      wrong: [
        ["2 hundreds and 30 tens", "puts ten extra tens in without taking the hundred out"],
        ["1 hundred and 3 tens", "takes a hundred out but forgets to put its ten tens back"],
        ["23 hundreds", "reads the digits 2 and 3 as hundreds instead of hundreds and tens"],
      ],
      why: "100 + 130 = 230. One hundred was broken open into 10 tens, so the tens room went from 3 to 13 while the hundreds room dropped from 2 to 1.",
    }),
  ],

  experiences: [
    {
      id: "u2.x1",
      microConceptId: M1,
      role: "explainer",
      modality: "worked-example",
      isPrimary: true,
      title: "Kishan's nursery: when a room gets too full",
      minutes: 7,
      intent: "Mostly revision — re-name carrying as a trade between rooms ('combine 10 tens to form 1 hundred') so the same language is ready when subtraction has to run the trade backwards.",
      beats: [
        { kind: "say", text: "Kishan runs a plant nursery. He had 364 saplings, and he brought 52 more from the forest office. Nobody counts these one at a time — line the numbers up so each room sits above its own room." },
        { kind: "visual", visual: { kind: "column-sum", top: 364, bottom: 52, op: "+" }, caption: "Ones under ones, tens under tens. The 52 has nothing in its hundreds room." },
        {
          kind: "worked",
          steps: [
            { line: "Ones room: 4 + 2 = 6 ones", note: "Fits easily. Write 6." },
            { line: "Tens room: 6 + 5 = 11 tens", note: "A room can only hold up to 9. So combine 10 tens to form 1 hundred and slide it next door. 1 ten stays behind." },
            { line: "Hundreds room: 3 + the 1 that arrived = 4 hundreds", note: "Kishan has 416 saplings." },
          ],
        },
        { kind: "say", text: "The little 1 you write above the hundreds is not a trick and it is not a spare digit. It is ten tens that moved house." },
        {
          kind: "worked",
          steps: [
            { line: "Now 405 + 56.", note: "The tens room of 405 is empty — that is fine, an empty room still does its job." },
            { line: "Ones: 5 + 6 = 11 ones", note: "Combine 10 ones to form 1 ten. 1 one stays, 1 ten crosses over." },
            { line: "Tens: 0 + 5 + 1 = 6 tens" },
            { line: "Hundreds: 4. Answer 461." },
          ],
        },
        { kind: "do", text: "Try 265 + 9 on your own. Ask yourself first: which room will overflow?" },
        { kind: "check", text: "265 + 9?", answer: "274. 5 + 9 = 14 ones, so 4 ones stay and 1 ten moves across — the tens room goes from 6 to 7." },
      ],
    },
    {
      id: "u2.x2",
      microConceptId: M2,
      role: "explainer",
      modality: "hands-on",
      isPrimary: true,
      title: "Trays of ten: breaking one open",
      minutes: 9,
      intent: "Do the borrowing with real trays before doing it with digits, so 'break a ten' and 'break a hundred' are things the child has physically done.",
      beats: [
        { kind: "say", text: "Kishan has an order to deliver 230 saplings. Build 230 on the table the way the nursery stores them: 2 crates of a hundred, 3 trays of ten, and no loose saplings." },
        { kind: "visual", visual: { kind: "place-value", hundreds: 2, tens: 3, ones: 0 }, caption: "230 — two crates, three trays, an empty ones room." },
        { kind: "say", text: "He has already packed 75 of them. Take 75 away: that is 7 trays and 5 loose. Start with the loose ones — and there are none on the table. So change 1 ten into 10 ones: tip one tray out." },
        {
          kind: "worked",
          steps: [
            { line: "230 = 2 hundreds, 3 tens, 0 ones" },
            { line: "Tip out one tray → 2 hundreds, 2 tens, 10 ones", note: "Still 230. Nothing left the table." },
            { line: "Ones: 10 − 5 = 5" },
            { line: "Tens: 2 tens cannot give 7 tens.", note: "Open a crate: combine it back into 10 trays → 1 hundred, 12 tens." },
            { line: "Tens: 12 − 7 = 5" },
            { line: "Hundreds: 1 − 0 = 1. Kishan still needs to pack 155." },
          ],
        },
        { kind: "do", text: "Now do this one with the trays: Kishan has 456 saplings in August and distributes 63. Build 456 first — 4 crates, 5 trays, 6 loose." },
        {
          kind: "worked",
          steps: [
            { line: "Ones: 6 − 3 = 3", note: "No breaking needed here. Not every column needs it — check before you break." },
            { line: "Tens: 5 trays cannot give 6 trays.", note: "Open one crate into 10 trays → 3 hundreds, 15 tens." },
            { line: "Tens: 15 − 6 = 9. Hundreds: 3. Answer 393." },
          ],
        },
        { kind: "check", text: "How can you prove 230 − 75 = 155 without redoing it?", answer: "Put it back: 155 + 75 = 230. If the order and the packed pile add up to the whole order, the answer is right." },
      ],
    },
    {
      id: "u2.x3",
      microConceptId: M3,
      role: "explainer",
      modality: "worked-example",
      isPrimary: true,
      title: "Reena's ₹500 note: borrowing when the middle room is empty",
      minutes: 9,
      intent: "The target of the unit. Rename 500 as 4 hundreds, 9 tens and 10 ones in full, and name Aarav's ₹309 answer out loud so he can see where it comes from.",
      beats: [
        { kind: "say", text: "Reena bought groceries for ₹209 and gave Peter uncle a ₹500 note. How much should he return? Line the money up room under room." },
        { kind: "visual", visual: { kind: "column-sum", top: 500, bottom: 209, op: "-" }, caption: "₹500 on top, ₹209 to be taken away." },
        { kind: "say", text: "Ones room: you need to take 9 from 0. There is nothing there. Knock next door at the tens room — that is empty too. So you have to go one more door along, to the hundreds." },
        {
          kind: "worked",
          steps: [
            { line: "500 = 5 hundreds, 0 tens, 0 ones" },
            { line: "Break 1 hundred into 10 tens → 4 hundreds, 10 tens, 0 ones", note: "The hundreds room drops from 5 to 4. It gave something away." },
            { line: "Change 1 of those tens into 10 ones → 4 hundreds, 9 tens, 10 ones", note: "Still ₹500: 400 + 90 + 10. Count it if you doubt it." },
            { line: "Ones: 10 − 9 = 1" },
            { line: "Tens: 9 − 0 = 9" },
            { line: "Hundreds: 4 − 2 = 2. Peter uncle returns ₹291." },
          ],
        },
        { kind: "say", text: "Here is the trap, and it is worth looking straight at. If you reach the ones column, see 0 above and 9 below, and quietly do 9 − 0 because that way round is easier, you get ₹309. That answer means Reena's groceries cost her ₹191 — the shop would notice. The column tells you who is giving and who is taking, and you are not allowed to swap them." },
        {
          kind: "worked",
          steps: [
            { line: "Same shape, different numbers: 600 − 82.", note: "Both the ones and the tens rooms of 600 are empty." },
            { line: "600 → 5 hundreds, 10 tens, 0 ones → 5 hundreds, 9 tens, 10 ones" },
            { line: "Ones: 10 − 2 = 8. Tens: 9 − 8 = 1. Hundreds: 5 − 0 = 5. Answer 518." },
          ],
        },
        { kind: "check", text: "Check Reena's change without redoing the subtraction.", answer: "₹291 + ₹209 = ₹500. The change and the bill must rebuild the note." },
      ],
    },
    {
      id: "u2.x3b",
      microConceptId: M3,
      role: "explainer",
      modality: "interactive",
      isPrimary: false,
      title: "Peter uncle's way: count up to the note",
      minutes: 7,
      intent: "Alternate doorway for m3, for a child who lost the thread in the column work — same answer reached by giving change forwards, with no borrowing at all, and usable afterwards as a self-check.",
      beats: [
        { kind: "say", text: "Peter uncle has been running his shop for years and he never breaks hundreds in his head. He counts up from the bill to the note, handing money over as he goes." },
        { kind: "visual", visual: { kind: "number-line", from: 200, to: 500, step: 100, mark: 209 }, caption: "Start at the bill, ₹209. Walk forward until you reach the note, ₹500, and keep track of every step." },
        {
          kind: "worked",
          steps: [
            { line: "₹209 → ₹210", note: "Hands over ₹1. Round numbers are easier to walk from." },
            { line: "₹210 → ₹300", note: "Hands over ₹90." },
            { line: "₹300 → ₹500", note: "Hands over ₹200." },
            { line: "₹1 + ₹90 + ₹200 = ₹291", note: "The same ₹291 as the column method, with nothing broken open." },
          ],
        },
        { kind: "say", text: "Two different roads, one answer. That is the useful part: if the counting-up total and the column answer disagree, one of them slipped, and you know to look again." },
        { kind: "do", text: "Count up from ₹156 to ₹400 the same way. Take an easy step to a round number first, then a big step." },
        { kind: "check", text: "₹400 − ₹156?", answer: "₹244. ₹4 up to ₹160, then ₹40 up to ₹200, then ₹200 more. 4 + 40 + 200 = 244." },
        { kind: "say", text: "Use counting up whenever the top number is a round one like 400 or 500 — those are exactly the ones where the columns are all empty and the borrowing is longest." },
      ],
    },
    {
      id: "u2.x4",
      microConceptId: M4,
      role: "explainer",
      modality: "story",
      isPrimary: true,
      title: "Jadupur: is this a giving story or a taking story?",
      minutes: 8,
      intent: "Give a reading rule (find the whole, find the parts) instead of hunting for keywords, and add estimation and comparison as cheap checks before any column work happens.",
      beats: [
        { kind: "say", text: "Before money reached the village of Jadupur, Shaamu Kaka traded rice for vegetables and sarees. Whether you barter or pay, every problem in this chapter has one of two shapes: parts coming together, or one part being taken out of a whole." },
        { kind: "say", text: "So do not hunt for words like 'more' or 'left'. They lie. Ask instead: does the story tell me the whole, or does it tell me the pieces? If you are given the pieces and asked for the whole, add. If you are given the whole and one piece and asked for the other piece, subtract." },
        {
          kind: "worked",
          steps: [
            { line: "Peter uncle saved ₹250, then ₹125, then ₹350. How much has he saved?", note: "Three pieces, no whole given → this is a giving story. 250 + 125 + 350 = ₹725." },
            { line: "Kishan must deliver 230 saplings and has packed 75. How many more?", note: "Whole = 230, one piece = 75 → taking story. 230 − 75 = 155. The word 'more' appears, and it is still a subtraction." },
            { line: "Morning: ₹465 in the money box. Afternoon: ₹756. How much has he earned?", note: "Whole = ₹756, the piece already there = ₹465 → taking story. 756 − 465 = ₹291." },
          ],
        },
        { kind: "say", text: "Before you compute, guess to the nearest hundred. ₹756 is near ₹800 and ₹465 is near ₹500, so the earnings should land near ₹300. Now ₹291 looks right and ₹391 would look wrong before you check a single column." },
        { kind: "say", text: "Sometimes you do not need to compute at all. Which is more, 373 + 23 or 373 + 40? Both walks start from the same place, so the one that walks further ends further. 373 + 40. Circle it and move on." },
        { kind: "do", text: "Kishan buys four things at Peter uncle's shop: ₹55, ₹30, ₹28 and ₹20. Work out the bill, then find at least two different ways of handing over exactly that money." },
        { kind: "check", text: "What is the bill, and give two ways of paying it?", answer: "₹133. One way: ₹100 + ₹20 + ₹10 + ₹2 + ₹1. Another: two ₹50 notes, three ₹10 notes, a ₹2 coin and a ₹1 coin." },
      ],
    },
  ],

  guided: [
    step({
      id: "u2.g1",
      micro: M1,
      prompt: "Solve: 825 + 175",
      visual: { kind: "column-sum", top: 825, bottom: 175, op: "+" },
      correct: "1000",
      wrong: [
        ["990", "combines 10 tens into a hundred but never adds that hundred in"],
        ["9100", "writes the 10 hundreds side by side instead of trading them for a thousand"],
        ["900", "loses the carry coming out of the ones room"],
      ],
      hints: [
        "Start at the ones room: 5 + 5. That is a full ten, and the ones room cannot hold a ten.",
        "Combine those 10 ones to form 1 ten and send it left. The tens room now has 2 + 7 + 1 = 10 tens.",
        "10 tens combine to form 1 hundred. So the hundreds room has 8 + 1 + 1 = 10 hundreds — and 10 hundreds is one thousand.",
      ],
      why: "Every room fills to exactly ten and rolls over into the next one, all the way along: 825 + 175 = 1000.",
    }),
    step({
      id: "u2.g2",
      micro: M2,
      prompt: "Kishan has 456 saplings in August. He distributed 63 of them. How many are left?",
      correct: "393",
      wrong: [
        ["413", "subtracts the smaller digit from the larger in the tens column instead of breaking a hundred"],
        ["493", "breaks a hundred into 10 tens but leaves the hundreds room still showing 4"],
        ["519", "adds the two numbers instead of taking one away"],
      ],
      hints: [
        "Ones room first: 6 take away 3. That column is fine — nothing needs breaking there.",
        "Tens room: you have to take 6 tens from 5 tens, and there are not enough.",
        "Break 1 hundred into 10 tens. The tens room becomes 15 — and remember the hundreds room drops from 4 to 3.",
      ],
      why: "5 tens cannot give 6 tens, so one hundred is opened into 10 tens: 15 − 6 = 9 tens, and 3 hundreds are left. 456 − 63 = 393.",
    }),
    step({
      id: "u2.g3",
      micro: M3,
      prompt: "Reena bought groceries for ₹209 and gave Peter uncle a ₹500 note. How much money should Peter uncle return?",
      visual: { kind: "column-sum", top: 500, bottom: 209, op: "-" },
      correct: "₹291",
      wrong: [
        ["₹309", "subtracts the smaller digit from the larger in each column instead of borrowing through the empty tens room"],
        ["₹300", "rounds the bill down to ₹200 and never deals with the ₹9"],
        ["₹709", "adds the bill to the note instead of taking it away"],
      ],
      hints: [
        "You need 9 ones, but the ones room of 500 is empty. Knock next door at the tens room — is there anything there to lend?",
        "The tens room is empty too, so go one more room along: break 1 hundred into 10 tens. Now it is 4 hundreds, 10 tens, 0 ones.",
        "Now change 1 of those tens into 10 ones: 4 hundreds, 9 tens, 10 ones. That is still ₹500. Subtract room by room.",
      ],
      why: "₹500 is the same money as 4 hundreds, 9 tens and 10 ones. Then 10 − 9 = 1, 9 − 0 = 9 and 4 − 2 = 2, so Peter uncle returns ₹291.",
    }),
    step({
      id: "u2.g4",
      micro: M4,
      prompt: "In the morning Peter uncle has ₹465 in his money box. By afternoon he has ₹756. How much has he earned?",
      correct: "₹291",
      wrong: [
        ["₹1221", "adds the two amounts because the story says the money grew"],
        ["₹311", "subtracts the smaller digit from the larger in the tens column instead of breaking a hundred"],
        ["₹391", "breaks a hundred into 10 tens but leaves the hundreds room still showing 7"],
      ],
      hints: [
        "The ₹756 is everything in the box by the afternoon. The ₹465 was already in there before he sold anything. Which one is the whole?",
        "You know the whole and one piece, and you want the missing piece. That makes this a taking story, not a giving one.",
        "So it is 756 − 465. The ones are fine; in the tens room 5 cannot give 6, so break one hundred into 10 tens.",
      ],
      why: "The morning money is part of the afternoon money, so what he earned is the difference between them: 756 − 465 = ₹291.",
    }),
  ],
  masteryCheck: [
    qn({
      id: "u2.m1",
      micro: M1,
      purpose: "mastery",
      difficulty: 1,
      prompt: "Solve: 265 + 9",
      visual: { kind: "column-sum", top: 265, bottom: 9, op: "+" },
      correct: "274",
      wrong: [
        ["2614", "writes the whole 14 into the ones room instead of trading ten of them for a ten"],
        ["355", "lines the 9 up under the tens and adds 90"],
        ["275", "counts on ten instead of nine"],
      ],
      why: "5 + 9 = 14 ones. Combine 10 of them to form 1 ten: 4 ones stay and the tens room goes from 6 to 7, giving 274.",
    }),
    qn({
      id: "u2.m2",
      micro: M1,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Solve: 405 + 56",
      visual: { kind: "column-sum", top: 405, bottom: 56, op: "+" },
      correct: "461",
      wrong: [
        ["451", "adds the ones to 11 but leaves the extra ten behind"],
        ["965", "lines the 56 up under the hundreds and tens instead of the tens and ones"],
        ["4511", "writes 11 in the ones room instead of trading ten of them for a ten"],
      ],
      why: "5 + 6 = 11 ones, so 1 one stays and 1 ten crosses over. The empty tens room becomes 0 + 5 + 1 = 6 tens, giving 461.",
    }),
    qn({
      id: "u2.m3",
      micro: M1,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Peter uncle saved ₹250 in the first month, ₹125 in the second and ₹350 in the third. How much has he saved?",
      correct: "₹725",
      wrong: [
        ["₹625", "adds the tens column to 12 but carries nothing into the hundreds room"],
        ["₹375", "adds the first two months and stops before the third"],
        ["₹7125", "writes the 12 tens into the tens room instead of trading ten of them for a hundred"],
      ],
      why: "The tens add to 5 + 2 + 5 = 12 tens. Ten of those combine to form 1 hundred, so 2 tens stay and the hundreds room becomes 2 + 1 + 3 + 1 = 7. That is ₹725.",
    }),
    qn({
      id: "u2.m4",
      micro: M2,
      purpose: "mastery",
      difficulty: 1,
      prompt: "Solve: 568 − 5",
      correct: "563",
      wrong: [
        ["518", "lines the 5 up under the tens and takes away 5 tens"],
        ["573", "adds the 5 instead of taking it away"],
      ],
      why: "The 5 is 5 ones, so only the ones room changes: 8 − 5 = 3. The 56 tens and hundreds are left alone.",
    }),
    qn({
      id: "u2.m5",
      micro: M2,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Kishan had 342 saplings and gave 128 of them to the village school. How many are left?",
      visual: { kind: "column-sum", top: 342, bottom: 128, op: "-" },
      correct: "214",
      wrong: [
        ["226", "subtracts the smaller digit from the larger in the ones column instead of breaking a ten"],
        ["224", "breaks a ten for the ones column but leaves the tens room still showing 4"],
        ["470", "adds the two numbers instead of taking one away"],
      ],
      why: "2 ones cannot give 8, so 1 ten is changed into 10 ones: 12 − 8 = 4. That drops the tens room to 3, and 3 − 2 = 1, so 214 are left.",
    }),
    qn({
      id: "u2.m6",
      micro: M2,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Solve: 653 − 356",
      correct: "297",
      wrong: [
        ["303", "subtracts the smaller digit from the larger in every column"],
        ["317", "breaks a ten for the ones but then takes 4 tens from 5 tens the wrong way round"],
        ["1009", "adds the two numbers instead of taking one away"],
      ],
      why: "Both columns need opening: 13 − 6 = 7 ones, then 14 − 5 = 9 tens, then 5 − 3 = 2 hundreds. The answer is 297.",
    }),
    qn({
      id: "u2.m7",
      micro: M3,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Solve: 600 − 82",
      visual: { kind: "column-sum", top: 600, bottom: 82, op: "-" },
      correct: "518",
      wrong: [
        ["682", "subtracts the smaller digit from the larger in each column instead of breaking a hundred"],
        ["528", "leaves 10 tens in the tens room after one of them has already been changed into ones"],
        ["428", "breaks a hundred twice and drops the hundreds room from 6 all the way to 4"],
      ],
      why: "600 is the same as 5 hundreds, 9 tens and 10 ones. Then 10 − 2 = 8, 9 − 8 = 1 and 5 − 0 = 5, giving 518.",
    }),
    qn({
      id: "u2.m8",
      micro: M3,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Kishan's nursery has room for 500 saplings. 236 are already planted. How many more will fit?",
      visual: { kind: "column-sum", top: 500, bottom: 236, op: "-" },
      correct: "264",
      wrong: [
        ["336", "subtracts the smaller digit from the larger in each column instead of borrowing through the empty tens room"],
        ["274", "borrows from the hundreds but leaves 10 tens in the tens room instead of 9"],
        ["736", "adds the two numbers instead of taking one away"],
      ],
      why: "500 is the same as 4 hundreds, 9 tens and 10 ones. Then 10 − 6 = 4, 9 − 3 = 6 and 4 − 2 = 2, so 264 more saplings will fit.",
    }),
    qn({
      id: "u2.m9",
      micro: M4,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Kishan has an order to deliver 230 saplings. He has packed 75 so far. Which calculation finds how many more he still needs to pack?",
      correct: "230 − 75",
      wrong: [
        ["230 + 75", "reads the words 'how many more' as a signal to add"],
        ["75 − 230", "subtracts in the order the numbers happen to appear in the story"],
        ["230 − 75 − 75", "takes the packed saplings away twice"],
      ],
      why: "230 is the whole order and 75 is the piece already done, so the piece still missing is 230 − 75, which is 155.",
    }),
    qn({
      id: "u2.m10",
      micro: M4,
      purpose: "mastery",
      difficulty: 3,
      prompt: "At Peter uncle's shop Kishan buys things costing ₹55, ₹30, ₹28 and ₹20. He hands over a ₹200 note. How much change should he get?",
      correct: "₹67",
      wrong: [
        ["₹133", "subtracts the smaller digit from the larger in each column, so the change comes out equal to the bill"],
        ["₹77", "loses the carry while adding the four prices, making the bill ₹123"],
        ["₹333", "adds the bill to the note instead of taking it away"],
      ],
      why: "First the giving part: 55 + 30 + 28 + 20 = ₹133. Then the taking part: ₹200 − ₹133 = ₹67 change.",
    }),
  ],

  revisionSet: [
    qn({
      id: "u2.r1",
      micro: M1,
      purpose: "revision",
      difficulty: 2,
      prompt: "Without calculating either one, which is more: 373 + 23 or 373 + 40?",
      correct: "373 + 40",
      wrong: [
        ["373 + 23", "compares the ones digits, 3 against 0, instead of the amount being added on"],
        ["They are the same", "assumes that starting from the same number means landing in the same place"],
      ],
      why: "Both walks start at 373, so the one that walks further ends further along. Adding 40 beats adding 23, and no columns were needed.",
    }),
    qn({
      id: "u2.r2",
      micro: M2,
      purpose: "revision",
      difficulty: 2,
      prompt: "Peter uncle's box goes from ₹465 in the morning to ₹756 in the afternoon. Before working it out exactly, about how much has he earned, to the nearest hundred?",
      correct: "About ₹300",
      wrong: [
        ["About ₹400", "rounds ₹465 down to ₹400 by looking only at the hundreds digit"],
        ["About ₹200", "rounds ₹756 down to ₹700 by looking only at the hundreds digit"],
        ["About ₹1300", "adds the two rounded amounts instead of taking one away"],
      ],
      why: "756 is nearer 800 and 465 is nearer 500, so the answer should land near 300 — and the exact answer, ₹291, does.",
    }),
    qn({
      id: "u2.r3",
      micro: M3,
      purpose: "revision",
      difficulty: 2,
      prompt: "Solve: 400 − 156",
      visual: { kind: "column-sum", top: 400, bottom: 156, op: "-" },
      correct: "244",
      wrong: [
        ["356", "subtracts the smaller digit from the larger in each column instead of borrowing through the empty tens room"],
        ["254", "borrows from the hundreds but leaves 10 tens in the tens room instead of 9"],
        ["556", "adds the two numbers instead of taking one away"],
      ],
      why: "400 is the same as 3 hundreds, 9 tens and 10 ones. Then 10 − 6 = 4, 9 − 5 = 4 and 3 − 1 = 2, giving 244.",
    }),
    // Interleaved from the prerequisite unit g3.num.hundreds — §4 transfer.
    qn({
      id: "u2.r4",
      micro: H5,
      purpose: "revision",
      difficulty: 2,
      prompt: "Which of these is another true name for 400?",
      correct: "3 hundreds, 9 tens and 10 ones",
      wrong: [
        ["3 hundreds, 10 tens and 10 ones", "adds the ten ones on top without taking them out of the tens room"],
        ["4 hundreds, 9 tens and 10 ones", "breaks a hundred into tens but leaves the hundreds room still showing 4"],
        ["3 hundreds, 9 tens and 1 one", "trades the ten for a single one instead of for ten ones"],
      ],
      why: "300 + 90 + 10 = 400. Renaming never changes how much you have — it only moves value into the room that needs it, which is exactly what borrowing does.",
    }),
    qn({
      id: "u2.r5",
      micro: H1,
      purpose: "revision",
      difficulty: 2,
      prompt: "Peter uncle counts ₹705 in his money box. Which room of 705 is empty?",
      visual: { kind: "place-value", hundreds: 7, tens: 0, ones: 5 },
      correct: "The tens room",
      wrong: [
        ["The ones room", "counts the rooms from the left instead of from the right"],
        ["The hundreds room", "reads the 0 as sitting in the hundreds room"],
        ["No room is empty", "reads 7, 0 and 5 as three rooms that all hold something"],
      ],
      why: "Rooms from the right: 5 ones, 0 tens, 7 hundreds. The empty tens room is the one that makes subtraction feel hard — it is why 705 − 8 needs a hundred opened first.",
    }),
  ],
};

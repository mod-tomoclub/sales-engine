/**
 * Unit 4 (core track) — g4.num.thousands
 * NCERT Maths Mela (Class 4), Ch. 4 — Thousands Around Us.
 *
 * Context is verbatim from the chapter: Jaspreet and Gulnaz organising a langar at
 * their neighbourhood Gurudwara for about a thousand people, then the "1000s Around
 * Us" spread — the Thousand Pillars Temple at Moodubidiri, the Indian rhinoceros
 * count, India's 788 districts and 7500 km coastline.
 */
import type { UnitContent } from "../types";
import { qn, step } from "./authoring";

const M1 = "g4.num.thousands.m1";
const M2 = "g4.num.thousands.m2";
const M3 = "g4.num.thousands.m3";
const M4 = "g4.num.thousands.m4";
const M5 = "g4.num.thousands.m5";

export const U4_THOUSANDS: UnitContent = {
  unitId: "g4.num.thousands",
  rationale:
    "This is Aarav's core track — real Grade 4 work that runs from day one, in parallel with his repair track, so that fixing Grade 3 gaps never reads as being sent backwards. In placement he accepted '7 Thousands, 0 Hundreds, 2 Tens, 4 Ones = 724' and compared 2190 with 2910 from the right-hand end; both are the same room-value habit from House of Hundreds, showing up one place further left. Expect this unit to move quickly once the repair unit lands, because the thousands room behaves exactly like the hundreds room did.",

  entryCheck: [
    qn({
      id: "u4.e1", micro: "g3.num.hundreds.m1", purpose: "diagnostic", difficulty: 1,
      prompt: "In the number 507, which digit lives in the hundreds room?",
      visual: { kind: "place-value", hundreds: 5, tens: 0, ones: 7 },
      correct: "5",
      wrong: [
        ["7", "reads the right-hand digit as the biggest room"],
        ["0", "reads the empty tens room as the hundreds room"],
        ["507", "reads the whole number instead of one room"],
      ],
      why: "Rooms are counted from the right: 7 ones, 0 tens, 5 hundreds. The middle room being empty does not move the 5.",
    }),
    qn({
      id: "u4.e2", micro: "g3.num.hundreds.m2", purpose: "diagnostic", difficulty: 2,
      prompt: "Which is greater: 619 or 691?",
      correct: "691",
      wrong: [
        ["619", "compares from the right-hand end, so 9 ones looks bigger than 1 one"],
        ["They are equal", "sees the same three digits and reads them as the same value"],
      ],
      why: "Hundreds tie at 6. Open the next room: 9 tens is 90, 1 ten is only 10. So 691 is greater.",
    }),
    qn({
      id: "u4.e3", micro: "g3.num.hundreds.m5", purpose: "diagnostic", difficulty: 2,
      prompt: "'68 more than 300' names the same number as which of these?",
      correct: "32 less than 400",
      wrong: [
        ["68 less than 400", "reuses the same 68 for the jump back without recounting"],
        ["32 more than 400", "keeps the direction from the first phrase"],
      ],
      why: "68 more than 300 is 368. From 400 back to 368 is 32. One number, two honest names.",
    }),
    qn({
      id: "u4.e4", micro: "g3.ops.give-take.m1", purpose: "diagnostic", difficulty: 2,
      prompt: "The Gurudwara kitchen served 268 plates before noon and 157 after. How many plates in all?",
      visual: { kind: "column-sum", top: 268, bottom: 157, op: "+" },
      correct: "425",
      wrong: [
        ["3115", "writes each column's total side by side instead of carrying"],
        ["415", "forgets to carry the ten out of the ones column"],
        ["325", "forgets to carry the hundred out of the tens column"],
      ],
      why: "8 + 7 = 15, so 5 stays and a ten moves left. 6 + 5 + 1 = 12, so 2 stays and a hundred moves left. 2 + 1 + 1 = 4. That is 425.",
    }),
    qn({
      id: "u4.e5", micro: "g3.ops.give-take.m3", purpose: "diagnostic", difficulty: 3,
      prompt: "400 rotis were made. 176 have been served. How many are left?",
      visual: { kind: "column-sum", top: 400, bottom: 176, op: "-" },
      correct: "224",
      wrong: [
        ["376", "takes the smaller digit from the larger in each column instead of borrowing"],
        ["234", "borrows for both empty rooms at once and forgets the tens room is left with only 9"],
      ],
      why: "Break one hundred into 9 tens and 10 ones. Then 10 − 6 = 4, 9 − 7 = 2, 3 − 1 = 2, giving 224.",
    }),
  ],

  experiences: [
    {
      id: "u4.x1", microConceptId: M1, role: "explainer", modality: "interactive", isPrimary: true,
      title: "A new room opens: Th–H–T–O", minutes: 9,
      intent: "Introduce the thousands room as the next room left, and make the empty-room zero non-negotiable using the chapter's own Ram error.",
      beats: [
        { kind: "say", text: "Jaspreet and Gulnaz are organising the langar at their Gurudwara. They expect about 1000 people, and 55 volunteers have signed up to cook and serve. The headcount sheet has run out of columns." },
        { kind: "say", text: "You already know the trade: 10 Tens = 1 Hundred = 100. Keep going. 10 Hundreds = 1 Thousand = 1000. So a new room opens on the left, and the sheet now reads Th – H – T – O." },
        { kind: "visual", visual: { kind: "place-value", thousands: 1, hundreds: 0, tens: 0, ones: 0 }, caption: "1000 — one bundle in the thousands room, and three rooms standing empty behind it. Each empty room still needs a zero to hold its place." },
        {
          kind: "worked",
          steps: [
            { line: "Ram wrote '7 Thousand 0 Hundreds 2 Tens 4 Ones' as 724.", note: "This is the exact mistake in the textbook. Is it correct?" },
            { line: "Read his answer back: 7 hundreds, 2 tens, 4 ones.", note: "His 7 slid out of the thousands room into the hundreds room." },
            { line: "The hundreds room was empty — but empty is not missing.", note: "If you skip it, every digit to its left falls one room to the right." },
            { line: "Correct answer: 7024", note: "7 in Th, 0 in H, 2 in T, 4 in O." },
          ],
        },
        { kind: "say", text: "A zero is not 'nothing to write'. It is a guard standing in an empty room so the rooms on its left keep their value." },
        { kind: "do", text: "The langar donation box was counted as 3 Thousands, 0 Hundreds, 0 Tens, 6 Ones. Write that amount in rupees." },
        { kind: "check", text: "What did you write?", answer: "₹3006 — two guards, one in the hundreds room and one in the tens room." },
      ],
    },
    {
      id: "u4.x1b", microConceptId: M1, role: "explainer", modality: "hands-on", isPrimary: false,
      title: "Alternate doorway — four bowls on the counting table", minutes: 8,
      intent: "Re-teach path for a child who still drops the empty place: physically leave a bowl empty, then be forced to write something for it.",
      beats: [
        { kind: "say", text: "Set out four bowls on the table, left to right, and label them Th, H, T, O. This is the langar counting table." },
        { kind: "do", text: "Now load Ram's count: 7 thousand-bundles into the Th bowl, nothing into H, 2 ten-rods into T, 4 loose ones into O. Look at the row before you write anything." },
        { kind: "visual", visual: { kind: "place-value", thousands: 7, hundreds: 0, tens: 2, ones: 4 }, caption: "The H bowl is empty. It is still on the table, and it still has to be reported." },
        {
          kind: "worked",
          steps: [
            { line: "Slide the empty bowl off the table and read what is left.", note: "Th 7, T 2, O 4 — you would write 724." },
            { line: "But 724 means 7 hundreds. Count the bundles again: there are 7 thousands.", note: "Removing the bowl made the 7 worth ten times less." },
            { line: "Put the bowl back and write a 0 in it.", note: "7024. The bundles never changed; only the writing was wrong." },
          ],
        },
        { kind: "say", text: "Rule for the table: every bowl gets a digit, even the empty ones. Four bowls, four digits." },
        { kind: "check", text: "Load the bowls with 5 thousands, 0 hundreds, 0 tens, 8 ones. What do you write?", answer: "5008 — two empty bowls, two zeros.", },
      ],
    },
    {
      id: "u4.x2", microConceptId: M2, role: "explainer", modality: "worked-example", isPrimary: true,
      title: "Arrow cards: pulling a number apart and back", minutes: 8,
      intent: "Expanded form as a reversible move — build with arrow cards, then read the value out of each room.",
      beats: [
        { kind: "say", text: "Arrow cards stack on top of each other, each one starting a room further right. Slide 3000, then 400, then 50, then 2 together and the card that shows on top of each room spells the number." },
        {
          kind: "worked",
          steps: [
            { line: "3000 + 400 + 50 + 2 = 3452", note: "3 in Th, 4 in H, 5 in T, 2 in O." },
            { line: "Now pull 3254 apart instead.", note: "Same digits, different rooms — read each room in turn." },
            { line: "3254 = 3000 + 200 + 50 + 4", note: "The 2 is in the hundreds room, so it is worth 200, not 2." },
          ],
        },
        { kind: "visual", visual: { kind: "place-value", thousands: 3, hundreds: 2, tens: 5, ones: 4 }, caption: "3254 — the digit is never worth its face, only its room." },
        { kind: "say", text: "Empty rooms come apart too. 7024 = 7000 + 0 + 20 + 4. Writing the 0 keeps the four parts lined up with the four rooms." },
        { kind: "do", text: "The Thousand Pillars Temple at Moodubidiri in Karnataka was begun in the year 1430. Pull 1430 apart into rooms." },
        { kind: "check", text: "What did you get?", answer: "1000 + 400 + 30 + 0 — the ones room is empty, so its part is 0." },
      ],
    },
    {
      id: "u4.x3", microConceptId: M3, role: "explainer", modality: "hands-on", isPrimary: true,
      title: "Counting the donation box: too many in one room", minutes: 10,
      intent: "Regrouping as tidying — a room may temporarily hold more than 9, and you trade ten of them left until every room holds one digit.",
      beats: [
        { kind: "say", text: "The langar donation box is emptied onto the table: ₹10 notes in one pile, ₹1 coins in another. Nobody sorted them neatly, so a pile can hold more than nine." },
        {
          kind: "worked",
          steps: [
            { line: "6 Tens and 22 Ones", note: "22 ones is more than one room can hold." },
            { line: "Trade 20 of the ones for 2 tens. Now 8 tens and 2 ones.", note: "Ten in a room always trades for one in the room to its left." },
            { line: "= 82", note: "Nothing was added or lost — only re-packed." },
          ],
        },
        {
          kind: "worked",
          steps: [
            { line: "3 Hundreds, 14 Tens and 8 Ones", note: "The tens room is overfull." },
            { line: "14 tens = 1 hundred and 4 tens. Move that hundred left: 4 hundreds, 4 tens, 8 ones.", note: "3 + 1 = 4 hundreds." },
            { line: "= 448" },
          ],
        },
        {
          kind: "worked",
          steps: [
            { line: "1 Thousand, 5 Hundreds, 10 Tens and 17 Ones", note: "Two rooms overfull at once — always tidy from the right." },
            { line: "17 ones = 1 ten and 7 ones → now 11 tens, 7 ones.", note: "The 10 tens picked up one more." },
            { line: "11 tens = 1 hundred and 1 ten → now 6 hundreds, 1 ten, 7 ones.", note: "5 + 1 = 6 hundreds." },
            { line: "= 1617" },
          ],
        },
        { kind: "do", text: "Your turn, the hard one from the book: 12 Hundreds, 18 Tens and 2 Ones." },
        { kind: "check", text: "What number is it?", answer: "1382 — 18 tens gives 1 hundred and 8 tens, making 13 hundreds; 13 hundreds gives 1 thousand and 3 hundreds." },
        { kind: "say", text: "Always start tidying from the right-hand room. If you start on the left, a later trade sends another bundle back your way and you have to redo it." },
      ],
    },
    {
      id: "u4.x4", microConceptId: M4, role: "explainer", modality: "game", isPrimary: true,
      title: "Score cards: who scored more?", minutes: 9,
      intent: "Extend the left-room-first comparison rule to four rooms, using the chapter's cricket and mountain data; confronts the compare-from-the-right habit directly.",
      beats: [
        { kind: "say", text: "Cricket score cards, women's ODI career runs. Flip two, and the bigger total wins the pair. First rule of the game: count the rooms before you compare anything, because a 4-digit number always beats a 3-digit one." },
        {
          kind: "worked",
          steps: [
            { line: "Compare 2190 and 2910.", note: "This is the pair Aarav got wrong by reading from the right." },
            { line: "Thousands: 2 vs 2 — a tie. Hundreds: 1 vs 9.", note: "9 hundreds is 900; 1 hundred is 100. Stop here." },
            { line: "2190 < 2910", note: "The tens and ones rooms never had to be opened." },
            { line: "Compare 7087 and 7088.", note: "Th tie, H tie, T tie — only now does the ones room decide." },
            { line: "7087 < 7088", note: "The right-hand room matters last, not first." },
          ],
        },
        { kind: "say", text: "And 982 against 1024: do not even open a room. 982 has three rooms, 1024 has four. The 4-digit number wins." },
        { kind: "do", text: "Arrange these career runs in increasing order: Debbie Hockley 4064, Suzie Bates 5114, Karen Rolton 4814, Mithali Raj 7805, Charlotte 6002." },
        { kind: "check", text: "What is the order?", answer: "4064, 4814, 5114, 6002, 7805 — sort by the thousands room first; 4064 and 4814 tie at 4, so open the hundreds room: 0 < 8." },
        { kind: "say", text: "Mountain heights work the same way, just downwards. From K2 8611 and Kangchenjunga 8586: thousands tie at 8, then 6 hundreds beats 5 hundreds, so K2 is the taller of the two." },
      ],
    },
    {
      id: "u4.x5", microConceptId: M5, role: "explainer", modality: "interactive", isPrimary: true,
      title: "Walking the line to 9500", minutes: 8,
      intent: "Read a scaled number line where one tick is worth 100, and locate real 4-digit quantities between two ticks.",
      beats: [
        { kind: "say", text: "India has 788 districts and about 7500 km of coastline. Numbers this big are easier to feel on a line than in a table. But first, check what one step of the line is worth." },
        { kind: "visual", visual: { kind: "number-line", from: 0, to: 1000, step: 100, mark: 788 }, caption: "788 districts. Between the 700 and 800 ticks, and much closer to 800." },
        {
          kind: "worked",
          steps: [
            { line: "The line runs 0 to 1000 and there are 10 gaps.", note: "1000 shared into 10 gaps means each tick is 100." },
            { line: "788 is past 700 but not yet 800.", note: "The hundreds digit tells you which gap to stand in." },
            { line: "Inside the gap, 88 out of 100 is nearly all the way.", note: "So the mark sits just short of the 800 tick." },
          ],
        },
        { kind: "visual", visual: { kind: "number-line", from: 7000, to: 8000, step: 100, mark: 7500 }, caption: "7500 km of coastline — thousands room says which stretch, hundreds room says which tick." },
        { kind: "say", text: "Same two questions every time: which stretch of a thousand am I in, and how far along that stretch. 7500 is in the 7000s, and exactly halfway across." },
        { kind: "do", text: "On a line from 9000 to 9500 with a tick every 100, where does 9250 sit?" },
        { kind: "check", text: "Where?", answer: "Halfway between the 9200 and 9300 ticks — 9250 is 50 past 9200, and each gap is 100." },
      ],
    },
  ],

  guided: [
    step({
      id: "u4.g1", micro: M1,
      prompt: "Ram wrote 7 Thousand 0 Hundreds 2 Tens 4 Ones as 724. Write the correct number.",
      visual: { kind: "place-value", thousands: 7, hundreds: 0, tens: 2, ones: 4 },
      correct: "7024",
      wrong: [
        ["724", "drops the empty hundreds place instead of holding it with a zero"],
        ["7204", "writes the zero, but parks it in the tens room instead of the hundreds room"],
        ["70024", "writes a zero for each word 'Hundreds' rather than one digit per room"],
      ],
      hints: [
        "How many rooms were named? Th, H, T, O — so how many digits should the answer have?",
        "Count the digits in 724. One room has gone missing. Which one?",
        "The hundreds room is empty, not absent. Put a 0 in it and keep every other digit where it was.",
      ],
      why: "Four rooms named means four digits written. The empty hundreds room takes a 0, which keeps the 7 in the thousands room: 7024.",
    }),
    step({
      id: "u4.g2", micro: M2,
      prompt: "Write 3254 in expanded form.",
      visual: { kind: "place-value", thousands: 3, hundreds: 2, tens: 5, ones: 4 },
      correct: "3000 + 200 + 50 + 4",
      wrong: [
        ["3 + 2 + 5 + 4", "reads each digit at face value instead of by its room"],
        ["3000 + 400 + 50 + 2", "copies the arrow-card example 3452 instead of reading this number"],
        ["300 + 200 + 50 + 4", "starts the thousands room at 300"],
      ],
      hints: [
        "Name the rooms out loud from the left: thousands, hundreds, tens, ones.",
        "The 2 sits in the hundreds room. What is a 2 worth there?",
        "Write one part per room, biggest first, then check they add back to 3254.",
      ],
      why: "3 thousands is 3000, 2 hundreds is 200, 5 tens is 50, 4 ones is 4. Add them back and you return to 3254.",
    }),
    step({
      id: "u4.g3", micro: M3,
      prompt: "1 Thousand, 5 Hundreds, 10 Tens and 17 Ones is the same as which number?",
      correct: "1617",
      wrong: [
        ["1517", "tidies the ones but leaves 10 tens sitting in a room that can only hold 9"],
        ["15107", "writes each room's count side by side without trading"],
        ["1527", "trades the ones into tens but forgets to move the full ten tens on to the hundreds room"],
      ],
      hints: [
        "Start at the right-hand room. Can the ones room hold 17?",
        "17 ones = 1 ten and 7 ones. Move that ten across — how many tens are there now?",
        "11 tens is also too many for one room. Ten of them trade for one hundred.",
      ],
      why: "Tidy from the right: 17 ones becomes 1 ten + 7 ones, giving 11 tens; 11 tens becomes 1 hundred + 1 ten, giving 6 hundreds. That is 1617.",
    }),
    step({
      id: "u4.g4", micro: M4,
      prompt: "Fill the box: 2190 ▢ 2910",
      correct: "<",
      wrong: [
        [">", "compares from the right-hand end, where 0 and 0 tie and 9 tens looks like the winner"],
        ["=", "sees the same four digits in both numbers and calls them equal"],
      ],
      hints: [
        "Open the thousands room in both numbers. What do you find?",
        "Both are 2 thousands, so that room is a tie. Move one room right.",
        "Hundreds: 1 against 9. That is 100 against 900 — and once a room differs, you stop.",
      ],
      why: "Thousands tie at 2. In the hundreds room, 1 hundred is far less than 9 hundreds, so 2190 < 2910. The last two digits never get a vote.",
    }),
  ],

  masteryCheck: [
    qn({
      id: "u4.m1", micro: M1, purpose: "mastery", difficulty: 1,
      prompt: "Which number is 4 Thousands, 6 Hundreds, 0 Tens and 3 Ones?",
      visual: { kind: "place-value", thousands: 4, hundreds: 6, tens: 0, ones: 3 },
      correct: "4603",
      wrong: [
        ["463", "drops the empty tens place instead of holding it with a zero"],
        ["4630", "puts the zero at the end instead of in the empty tens room"],
      ],
      why: "Four rooms, four digits. The tens room is empty, so a 0 stands guard in it: 4603.",
    }),
    qn({
      id: "u4.m2", micro: M1, purpose: "mastery", difficulty: 2,
      prompt: "The langar committee recorded the donation as 'six thousand and nine rupees'. Write it in digits.",
      correct: "₹6009",
      wrong: [
        ["₹69", "writes only the digits it hears and drops both empty rooms"],
        ["₹600 9", "keeps the thousand and the nine apart instead of filling the rooms between them"],
        ["₹6900", "puts the 9 straight after the 6 and pads the end with zeros"],
      ],
      why: "6 goes in the thousands room and 9 in the ones room. The hundreds and tens rooms are empty, so each takes a 0: ₹6009.",
    }),
    qn({
      id: "u4.m3", micro: M2, purpose: "mastery", difficulty: 1,
      prompt: "Slide the arrow cards together: 3000 + 400 + 50 + 2 = ?",
      correct: "3452",
      wrong: [
        ["3000400502", "writes the cards side by side instead of stacking them by room"],
        ["3254", "puts the 4 and the 2 in each other's rooms"],
      ],
      why: "3 in the thousands room, 4 in the hundreds, 5 in the tens, 2 in the ones — 3452.",
    }),
    qn({
      id: "u4.m4", micro: M2, purpose: "mastery", difficulty: 2,
      prompt: "Write 7024 in expanded form.",
      visual: { kind: "place-value", thousands: 7, hundreds: 0, tens: 2, ones: 4 },
      correct: "7000 + 0 + 20 + 4",
      wrong: [
        ["700 + 20 + 4", "reads the 7 as hundreds because the hundreds room is empty"],
        ["7000 + 200 + 4", "reads the 2 as hundreds and skips the empty room"],
        ["7 + 0 + 2 + 4", "reads each digit at face value instead of by its room"],
      ],
      why: "7 thousands, an empty hundreds room, 2 tens, 4 ones. The empty room still gets its own part: 0.",
    }),
    qn({
      id: "u4.m5", micro: M3, purpose: "mastery", difficulty: 2,
      prompt: "3 Hundreds, 14 Tens and 8 Ones is the same as which number?",
      correct: "448",
      wrong: [
        ["3148", "writes each room's count side by side instead of trading the extra tens"],
        ["358", "counts 14 tens as 1 hundred and 4 tens but then forgets to add the 4 tens back"],
        ["3048", "trades all 14 tens away and leaves the tens room empty"],
      ],
      why: "14 tens is 1 hundred and 4 tens. Move that hundred left to make 4 hundreds, and you have 4 hundreds, 4 tens, 8 ones: 448.",
    }),
    qn({
      id: "u4.m6", micro: M3, purpose: "mastery", difficulty: 3,
      prompt: "12 Hundreds, 18 Tens and 2 Ones is the same as which number?",
      correct: "1382",
      wrong: [
        ["12182", "writes each room's count side by side without trading anything"],
        ["1282", "trades 18 tens into 1 hundred and 8 tens but never carries that hundred into 12"],
        ["1382 is not possible with only hundreds", "thinks a thousand can only appear if the thousands room was given"],
      ],
      why: "18 tens is 1 hundred and 8 tens, making 13 hundreds. 13 hundreds is 1 thousand and 3 hundreds. So it is 1382.",
    }),
    qn({
      id: "u4.m7", micro: M4, purpose: "mastery", difficulty: 1,
      prompt: "Fill the box: 7087 ▢ 7088",
      correct: "<",
      wrong: [
        [">", "picks the number that looks longer or fuller rather than opening the rooms"],
        ["=", "stops comparing once the first three rooms tie"],
      ],
      why: "Thousands, hundreds and tens all tie. Only then does the ones room decide: 7 is less than 8.",
    }),
    qn({
      id: "u4.m8", micro: M4, purpose: "mastery", difficulty: 3,
      prompt: "Arrange these women's ODI career runs in increasing order: Hockley 4064, Bates 5114, Rolton 4814, Mithali Raj 7805, Charlotte 6002.",
      correct: "4064, 4814, 5114, 6002, 7805",
      wrong: [
        ["6002, 4064, 5114, 7805, 4814", "orders by the ones digit instead of the thousands room"],
        ["4814, 4064, 5114, 6002, 7805", "sorts the thousands correctly but breaks the 4-thousand tie from the right"],
        ["7805, 6002, 5114, 4814, 4064", "gives decreasing order when increasing was asked for"],
      ],
      why: "Sort by the thousands room first: 4, 4, 5, 6, 7. The two 4s tie, so open the hundreds room — 0 hundreds comes before 8 hundreds, putting 4064 ahead of 4814.",
    }),
    qn({
      id: "u4.m9", micro: M5, purpose: "mastery", difficulty: 2,
      prompt: "This line runs from 1000 to 2000 and each tick is worth 100. Which number is the arrow on?",
      visual: { kind: "number-line", from: 1000, to: 2000, step: 100, mark: 1600 },
      correct: "1600",
      wrong: [
        ["1060", "counts 6 ticks but writes the 6 in the tens room"],
        ["6", "counts the ticks and ignores where the line starts"],
        ["1700", "counts the starting tick at 1000 as the first step"],
      ],
      why: "The line starts at 1000 and each tick adds 100. Six ticks along is 1000 + 600, which is 1600.",
    }),
    qn({
      id: "u4.m10", micro: M4, purpose: "mastery", difficulty: 3,
      prompt: "Using the digits 2, 3, 4 and 7 once each, what is the largest 4-digit number you can make?",
      correct: "7432",
      wrong: [
        ["2347", "builds the smallest number by putting the digits in counting order"],
        ["4732", "orders the last three rooms well but does not check which digit is biggest overall"],
        ["7234", "puts the largest digit first, then falls back into counting order"],
      ],
      why: "The biggest digit belongs in the biggest room. 7 thousands, then 4 hundreds, then 3 tens, then 2 ones. (There are 24 different numbers possible in all, and this is the top one.)",
    }),
  ],

  revisionSet: [
    qn({
      id: "u4.r1", micro: M1, purpose: "revision", difficulty: 1,
      prompt: "Which number is 5 Thousands, 0 Hundreds, 4 Tens and 0 Ones?",
      visual: { kind: "place-value", thousands: 5, hundreds: 0, tens: 4, ones: 0 },
      correct: "5040",
      wrong: [
        ["54", "drops both empty rooms instead of holding them with zeros"],
        ["5400", "moves the 4 into the hundreds room and pads the end"],
      ],
      why: "Four rooms, four digits. Zeros hold the empty hundreds and ones rooms so the 5 and the 4 stay put: 5040.",
    }),
    qn({
      id: "u4.r2", micro: M2, purpose: "revision", difficulty: 2,
      prompt: "6000 + 0 + 80 + 5 = ?",
      correct: "6085",
      wrong: [
        ["685", "leaves out the empty hundreds room when writing the number"],
        ["6805", "reads the 80 as 8 hundreds"],
      ],
      why: "6 thousands, no hundreds, 8 tens, 5 ones. The 0 part becomes the 0 digit in the hundreds room: 6085.",
    }),
    qn({
      id: "u4.r3", micro: M4, purpose: "revision", difficulty: 2,
      prompt: "Put these mountain heights in decreasing order (metres): Nanda Devi 7816, Chaukhamba I 7138, Mullayanagiri 1930.",
      correct: "7816, 7138, 1930",
      wrong: [
        ["1930, 7138, 7816", "gives increasing order when decreasing was asked for"],
        ["7138, 7816, 1930", "breaks the 7-thousand tie from the right instead of at the hundreds room"],
      ],
      why: "1930 has only 1 thousand, so it is smallest. The other two tie at 7 thousands, so open the hundreds room: 8 beats 1, putting Nanda Devi first.",
    }),
    // Interleaved from the prerequisite units — §4 transfer questions.
    qn({
      id: "u4.r4", micro: "g3.num.hundreds.m2", purpose: "revision", difficulty: 2,
      prompt: "Order these smallest to largest: 309, 390, 93",
      correct: "93, 309, 390",
      wrong: [
        ["309, 390, 93", "sorts by the ones digit and never counts the rooms"],
        ["93, 390, 309", "compares 309 and 390 from the right-hand end"],
      ],
      why: "93 has only two rooms, so it is smallest. Then 309 and 390 tie at 3 hundreds, and 0 tens is less than 9 tens.",
    }),
    qn({
      id: "u4.r5", micro: "g3.ops.give-take.m3", purpose: "revision", difficulty: 2,
      prompt: "The Gurudwara had 305 steel glasses and lent 128 to a neighbouring hall. How many are left?",
      visual: { kind: "column-sum", top: 305, bottom: 128, op: "-" },
      correct: "177",
      wrong: [
        ["223", "takes the smaller digit from the larger in each column instead of borrowing"],
        ["187", "borrows across the zero but forgets that the tens room is left with 9, not 10"],
      ],
      why: "The tens room is empty, so break a hundred into 10 tens first. Lend one of those tens to the ones: 15 − 8 = 7, 9 − 2 = 7, 2 − 1 = 1, giving 177.",
    }),
  ],
};

/**
 * Unit — g3.num.hundreds "House of Hundreds: 3-digit numbers"
 * NCERT Maths Mela (Class 3), Ch. 6 & 9 — House of Hundreds I & II.
 *
 * Contexts are taken from the textbook itself: the mela where Ajji, Teji and Jojo
 * count torans and bangles, Farooq Chacha's sweet shop, the Hop Hundreds Home
 * apartment block, the rice-sack delivery driver's place-value tiles, Akbar and
 * Birbal counting crows, and the Tambola clue game.
 */
import type { UnitContent } from "../types";
import { qn, step } from "./authoring";

const M1 = "g3.num.hundreds.m1";
const M2 = "g3.num.hundreds.m2";
const M3 = "g3.num.hundreds.m3";
const M4 = "g3.num.hundreds.m4";
const M5 = "g3.num.hundreds.m5";

const DC1 = "g3.num.double-century.m1";
const DC2 = "g3.num.double-century.m2";

export const U1_HUNDREDS: UnitContent = {
  unitId: "g3.num.hundreds",
  rationale:
    "Aarav's placement diagnostic showed he reads H–T–O blocks correctly, so place value itself is intact — m1 is only revision. What is broken is the comparison rule: he decides which number is bigger by looking at the last digit, which is why he circled 439 as the greatest of 466, 437, 439, 447 and why he called 2190 larger than 2910 in Grade 4. The same habit is what made ₹500 − ₹209 fail, so m2 is the true target of this unit and m3, m4 and m5 extend the repaired rule.",

  entryCheck: [
    qn({
      id: "u1.e1",
      micro: DC1,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "Ajji counts toffees past a hundred: 98, 99, 100, __ ?",
      correct: "101",
      wrong: [
        ["1001", "writes 100 and then 1 side by side instead of counting on"],
        ["110", "jumps a whole ten after crossing the hundred"],
        ["200", "treats the next number after 100 as the next hundred"],
      ],
      why: "After 100 the counting carries on exactly as before: one more than 100 is 101.",
    }),
    qn({
      id: "u1.e2",
      micro: DC2,
      purpose: "diagnostic",
      difficulty: 1,
      prompt: "The arrow sits on the third mark after 100. Which number is it on?",
      visual: { kind: "number-line", from: 100, to: 200, step: 10, mark: 130 },
      correct: "130",
      wrong: [
        ["13", "reads the mark without the hundred it sits inside"],
        ["103", "counts the marks as ones instead of tens"],
        ["300", "reads the 3 in the tens room as 3 hundreds"],
      ],
      why: "Each mark on this line is a jump of ten, so three marks past 100 is 130.",
    }),
    qn({
      id: "u1.e3",
      micro: DC1,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Jojo counts bangles back into the box: 152, 151, 150, __ ?",
      correct: "149",
      wrong: [
        ["159", "counts back in the tens room instead of the ones room"],
        ["140", "drops a whole ten instead of one"],
        ["151", "repeats a number already said"],
      ],
      why: "150 has no ones left, so one step back borrows a ten: 14 tens and 9 ones is 149.",
    }),
    qn({
      id: "u1.e4",
      micro: DC1,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "Write 'one hundred and seven' in digits.",
      visual: { kind: "place-value", hundreds: 1, tens: 0, ones: 7 },
      correct: "107",
      wrong: [
        ["1007", "writes 100 then 7 instead of putting 7 into the ones room"],
        ["170", "puts the 7 in the tens room"],
        ["70", "leaves out the hundred altogether"],
      ],
      why: "1 hundred, no tens, 7 ones. The empty tens room still needs a 0 to hold the hundred in place.",
    }),
    qn({
      id: "u1.e5",
      micro: DC2,
      purpose: "diagnostic",
      difficulty: 2,
      prompt: "On a line from 100 to 200 with a mark every ten, 168 sits between which two marks?",
      correct: "160 and 170",
      wrong: [
        ["100 and 200", "names the two ends of the line instead of the nearest marks"],
        ["150 and 160", "counts one mark short"],
        ["168 and 170", "uses the number itself as one of the marks"],
      ],
      why: "168 has 6 tens, so it has passed the 160 mark but not yet reached 170.",
    }),
  ],

  experiences: [
    {
      id: "u1.x1",
      microConceptId: M1,
      role: "explainer",
      modality: "hands-on",
      isPrimary: true,
      title: "Build it like the rice-sack driver",
      minutes: 8,
      intent: "Revision only — re-anchor H–T–O as three rooms, using the driver's tiles and the mela counts, so the comparison work later has something solid to stand on.",
      beats: [
        { kind: "say", text: "At the mela, Ajji, Teji and Jojo count triangular torans in jumps of ten. Two hundred are already hanging, and fifty more go up. Total triangle: 50 more than 200, which is 250." },
        { kind: "visual", visual: { kind: "place-value", hundreds: 2, tens: 5, ones: 0 }, caption: "250 — two hundred-flats, five ten-rods, and an empty ones room." },
        { kind: "say", text: "The bangle stall is the same story: 200 and 80 more is 280. Two hundreds, eight tens, no ones." },
        {
          kind: "worked",
          steps: [
            { line: "The rice-sack driver shows 832 with tiles.", note: "8 hundred-tiles, 3 ten-tiles, 2 one-tiles." },
            { line: "Now 504.", note: "5 hundred-tiles, no ten-tiles at all, 4 one-tiles. The empty room still gets a 0." },
            { line: "And 620.", note: "6 hundred-tiles, 2 ten-tiles, an empty ones room." },
            { line: "700 is the quiet one.", note: "7 hundred-tiles, and both other rooms empty." },
          ],
        },
        { kind: "do", text: "Lay out tiles the driver's way for 947 and for 726. Say each one out loud as hundreds, tens and ones before you write it." },
        { kind: "check", text: "The driver stacks 9 hundred-tiles, 4 ten-tiles and 7 one-tiles. What is on the sack?", answer: "947 — nine hundred and forty-seven." },
      ],
    },
    {
      id: "u1.x2",
      microConceptId: M2,
      role: "explainer",
      modality: "game",
      isPrimary: true,
      title: "Circle the greatest: open the biggest room first",
      minutes: 9,
      intent: "The real target of the unit. Install 'start at the hundreds room and stop at the first room where they differ' as the comparison move, using the exact textbook rows Aarav got wrong.",
      beats: [
        { kind: "say", text: "Here is the row from the book. Circle the greatest: 466, 437, 439, 447, 483." },
        { kind: "say", text: "Do not look at the whole number, and do not look at the end. Open one room at a time, starting from the left — the hundreds room first." },
        {
          kind: "worked",
          steps: [
            { line: "Hundreds room: 4, 4, 4, 4, 4", note: "All tied. Nobody has won yet, so open the next room." },
            { line: "Tens room: 6, 3, 3, 4, 8", note: "8 tens is the most. 483 wins here and the game stops." },
            { line: "Greatest is 483.", note: "The ones room was never opened. It did not need to be." },
          ],
        },
        { kind: "say", text: "Look at 439 for a second. It has the biggest ones digit in the whole row — a 9 — and it is still one of the smallest numbers there. 3 tens is 30. A 9 in the ones room is only 9." },
        { kind: "do", text: "Now the other row from the book. Circle the smallest: 374, 473, 347, 437. Hundreds room first, every time." },
        { kind: "check", text: "Which is smallest, and where did you stop?", answer: "347. Hundreds: 3, 4, 3, 4 — so 473 and 437 are out. Then tens: 7 against 4, and 347 is smaller." },
      ],
    },
    {
      id: "u1.x2b",
      microConceptId: M2,
      role: "explainer",
      modality: "worked-example",
      isPrimary: false,
      title: "Why the last digit lies to you",
      minutes: 7,
      intent: "Alternate doorway for the same micro-concept. Names Aarav's rule out loud, tests it honestly, and shows it failing — including on the Grade 4 pair he got wrong.",
      beats: [
        { kind: "say", text: "Your rule has been: whichever number ends in the bigger digit is the bigger number. Let us test it fairly instead of just saying it is wrong." },
        {
          kind: "worked",
          steps: [
            { line: "Compare 466 and 439 by the last digit: 6 against 9.", note: "That rule says 439 is bigger." },
            { line: "Now count them out properly.", note: "466 = 4 hundreds + 6 tens + 6 ones. 439 = 4 hundreds + 3 tens + 9 ones." },
            { line: "The tens room differs by 3 tens — that is 30.", note: "The ones room differs by only 3." },
            { line: "466 is 27 bigger than 439.", note: "The rule pointed the wrong way, because it looked in the smallest room." },
          ],
        },
        { kind: "visual", visual: { kind: "place-value", hundreds: 4, tens: 6, ones: 6 }, caption: "466 — six ten-rods against 439's three. That gap is worth ten times more than anything the ones room can do." },
        { kind: "say", text: "A digit is not worth its face. It is worth the room it stands in. So we always open the biggest room first." },
        {
          kind: "worked",
          steps: [
            { line: "The same rule works on bigger numbers: 2190 and 2910.", note: "Last digits are both 0, so that rule cannot even answer." },
            { line: "Thousands room: 2 against 2 — tied.", note: "Open the next room." },
            { line: "Hundreds room: 1 against 9.", note: "2910 is bigger, and we never looked at the end." },
          ],
        },
        { kind: "check", text: "447 or 439 — which is greater, and which room decided it?", answer: "447. Hundreds tie at 4; the tens room decided it, 4 tens against 3 tens." },
      ],
    },
    {
      id: "u1.x3",
      microConceptId: M3,
      role: "explainer",
      modality: "game",
      isPrimary: true,
      title: "Digit cards: biggest house, smallest house",
      minutes: 8,
      intent: "Turn the comparison rule into a building rule — the biggest digit belongs in the biggest room — and handle the zero trap before it bites.",
      beats: [
        { kind: "say", text: "Three digit cards from the Number Detective page: 9, 1 and 5. Use each card once. Make the biggest 3-digit number you can, then the smallest." },
        {
          kind: "worked",
          steps: [
            { line: "Biggest: put the biggest card in the biggest room.", note: "9 hundreds, then 5 tens, then 1 one → 951." },
            { line: "Smallest: put the smallest card in the biggest room.", note: "1 hundred, then 5 tens, then 9 ones → 159." },
            { line: "Check the gap.", note: "Same three cards, but 951 and 159 are nowhere near each other. Rooms, not faces." },
          ],
        },
        { kind: "say", text: "Now the trap. The book asks for a 3-digit number made only of the digits 4 and 0. If you put the 0 in the hundreds room you get 044, and that is just 44 — a 2-digit number wearing a costume. Zero is never allowed to lead." },
        { kind: "do", text: "With cards 4 and 0 you may repeat them. Make the smallest 3-digit number, then the biggest. Say why 0 has to move." },
        { kind: "check", text: "Smallest and biggest from 4 and 0?", answer: "Smallest 400, biggest 440. The hundreds room must hold a 4 either way." },
        { kind: "say", text: "One more riddle from the book: I have digits 9, 1 and 5, I am less than 200, and I have 9 ones. Read the clues as room instructions and the number builds itself." },
      ],
    },
    {
      id: "u1.x4",
      microConceptId: M4,
      role: "explainer",
      modality: "interactive",
      isPrimary: true,
      title: "Which two hundreds is it sitting between?",
      minutes: 8,
      intent: "Use the hundreds digit as an address on the line to 1000, so numbers stop being strings of digits and start having a position.",
      beats: [
        { kind: "say", text: "In the story, Birbal tells Akbar there are exactly nine hundred and sixty-three crows in the city. 963. Which two hundreds is it sitting between?" },
        { kind: "say", text: "Read the hundreds room. It says 9. So the number has passed 900 and has not yet reached 1000. That is the whole answer — 963 lies between 900 and 1000." },
        { kind: "visual", visual: { kind: "number-line", from: 600, to: 700, step: 10, mark: 628 }, caption: "628 lives on the stretch between 600 and 700. Two ten-marks past 620 gets you there." },
        {
          kind: "worked",
          steps: [
            { line: "Locate 628.", note: "Hundreds room says 6 → the 600-to-700 stretch. Then count 2 tens past 620... it is 8 past 620." },
            { line: "Locate 696.", note: "Still the 600 stretch, but almost at the far end — just 4 short of 700." },
            { line: "Locate 530, 540 and 590.", note: "All on the 500 stretch. 590 is the last ten-mark before 600." },
          ],
        },
        { kind: "do", text: "The sweet-shop delivery list reads 703, 721, 759, 810, 855, 887. Sort them into two piles: the 700 stretch and the 800 stretch, without writing anything else down." },
        { kind: "check", text: "Which two hundreds does 887 sit between?", answer: "800 and 900. The hundreds room says 8, so it has passed 800 and has not reached 900 — even though it is close." },
      ],
    },
    {
      id: "u1.x5",
      microConceptId: M5,
      role: "explainer",
      modality: "worked-example",
      isPrimary: true,
      title: "One number, many names",
      minutes: 7,
      intent: "Show that a number can be described from below or from above and still be the same number — the idea that later makes ₹500 − ₹209 thinkable.",
      beats: [
        { kind: "say", text: "Farooq Chacha writes the same laddoo order two different ways on two different days: '68 more than 300' and '32 less than 400'. His helper thinks these are two orders. They are one." },
        {
          kind: "worked",
          steps: [
            { line: "68 more than 300 → 300 + 68", note: "Start at 300 and walk forward 68 steps. You land on 368." },
            { line: "32 less than 400 → 400 − 32", note: "Start at 400 and walk back 32 steps. You land on 368." },
            { line: "Same spot, two directions.", note: "368 is 68 past one hundred-post and 32 short of the next." },
          ],
        },
        { kind: "visual", visual: { kind: "number-line", from: 300, to: 400, step: 10, mark: 368 }, caption: "One point on the line. 68 forward from 300, or 32 back from 400 — the arrow does not move." },
        { kind: "say", text: "Notice the two step-sizes add up to 100: 68 + 32 = 100. That is not a coincidence, it is the length of the stretch between the two hundred-posts." },
        { kind: "say", text: "The Tambola clues work the same way. 'Two more than 610' means 612. '5 less than 625' means 620. The clue tells you a landmark and a direction." },
        { kind: "do", text: "The paper-slip game: you have 6 slips and may write 100, 10 or 1 on each. 420 uses four 100-slips and two 10-slips. Now name 420 a second way, as 'so many less than 500'." },
        { kind: "check", text: "Another name for 420 using 500?", answer: "80 less than 500. Walking back 80 from 500 lands on the same slip pile." },
      ],
    },
  ],

  guided: [
    step({
      id: "u1.g1",
      micro: M1,
      prompt: "The rice-sack driver lays out 5 hundred-tiles, no ten-tiles and 4 one-tiles. Which number is on the sack?",
      visual: { kind: "place-value", hundreds: 5, tens: 0, ones: 4 },
      correct: "504",
      wrong: [
        ["54", "skips the empty tens room instead of holding it with a 0"],
        ["540", "puts the empty room at the end rather than where it belongs"],
        ["5004", "writes 500 and 4 side by side instead of filling three rooms"],
      ],
      hints: [
        "How many rooms does a 3-digit number always have? Name them from the left.",
        "The tens room here has nothing in it — but the room still exists. What do we write in an empty room?",
        "5 in the hundreds room, 0 in the tens room, 4 in the ones room. Read it left to right.",
      ],
      why: "The 0 is doing a job: it keeps the 5 in the hundreds room. Without it the 5 would slide over and mean only 50.",
    }),
    step({
      id: "u1.g2",
      micro: M2,
      prompt: "Circle the greatest number in this row: 466, 437, 439, 447",
      correct: "466",
      wrong: [
        ["439", "compares the ones digit — 9 looks the biggest"],
        ["447", "compares the ones digit after the hundreds tie, skipping the tens room"],
        ["437", "picks by the ones digit 7 without opening the tens room"],
      ],
      hints: [
        "Open the hundreds room first. All four have 4 hundreds, so that room is a tie — nobody has won yet.",
        "Now open the tens room and read only that column: 6, 3, 3, 4.",
        "6 tens is 60. That beats 3 tens and 4 tens. Once one number wins a room, the rooms to its right stop mattering.",
      ],
      why: "Hundreds tie at 4, so the tens room decides: 6 tens beats 4 tens and 3 tens. 466 is greatest, and the ones digits never came into it.",
    }),
    step({
      id: "u1.g3",
      micro: M3,
      prompt: "Use the digit cards 4, 0 and 7 once each. Make the largest 3-digit number.",
      correct: "740",
      wrong: [
        ["407", "puts the largest digit in the smallest room"],
        ["047", "starts with 0, which makes it a 2-digit number in disguise"],
        ["704", "fills the hundreds room correctly but then puts 0 before 4"],
      ],
      hints: [
        "Which room is worth the most — hundreds, tens or ones?",
        "Put your biggest card into that room first, then fill the next room with your next biggest card.",
        "7 goes in the hundreds room. Of 4 and 0, which one deserves the tens room?",
      ],
      why: "Biggest card in the biggest room: 7 hundreds, then 4 tens, then 0 ones. 740 is the largest arrangement.",
    }),
    step({
      id: "u1.g4",
      micro: M4,
      prompt: "Flat 696 in Hop Hundreds Home — which two hundreds does 696 lie between?",
      visual: { kind: "number-line", from: 600, to: 700, step: 25, mark: 696 },
      correct: "600 and 700",
      wrong: [
        ["690 and 700", "names the neighbouring tens instead of the neighbouring hundreds"],
        ["700 and 800", "rounds to 700 first and then names the stretch after it"],
        ["500 and 600", "names the stretch one hundred too low"],
      ],
      hints: [
        "Read only the hundreds room. What number does it show?",
        "6 hundreds means the number has already passed 600. Has it reached the next hundred-post yet?",
        "It is close to 700 but has not got there — 4 short. So it is still on the stretch that starts at 600.",
      ],
      why: "The hundreds digit is the address of the stretch. 696 has passed 600 and has not reached 700, so it lies between 600 and 700 — being near an end does not move it into the next stretch.",
    }),
  ],

  masteryCheck: [
    qn({
      id: "u1.m1",
      micro: M1,
      purpose: "mastery",
      difficulty: 1,
      prompt: "The driver's tiles show 3 hundred-tiles, no ten-tiles and 9 one-tiles. Which number is it?",
      visual: { kind: "place-value", hundreds: 3, tens: 0, ones: 9 },
      correct: "309",
      wrong: [
        ["39", "drops the empty tens room instead of writing 0"],
        ["390", "moves the empty room to the end"],
        ["3009", "writes 300 and 9 side by side"],
      ],
      why: "3 hundreds, an empty tens room, 9 ones. The 0 holds the 3 in the hundreds room.",
    }),
    qn({
      id: "u1.m2",
      micro: M1,
      purpose: "mastery",
      difficulty: 2,
      prompt: "At the bangle stall: 200 bangles, and 80 more. How many bangles in total?",
      correct: "280",
      wrong: [
        ["208", "reads the 80 as 8 ones instead of 8 tens"],
        ["2080", "writes 200 and 80 side by side instead of adding them into rooms"],
        ["180", "counts back from 200 instead of on"],
      ],
      why: "2 hundreds and 8 tens together make 280. The 80 fills the tens room, not the ones room.",
    }),
    qn({
      id: "u1.m3",
      micro: M2,
      purpose: "mastery",
      difficulty: 1,
      prompt: "Circle the greatest number in the row: 466, 437, 439, 447, 483",
      correct: "483",
      wrong: [
        ["439", "compares the ones digit — 9 looks the biggest"],
        ["466", "opens the tens room but stops at the first large-looking number in the row"],
        ["447", "compares the ones digit after the hundreds tie"],
      ],
      why: "All five have 4 hundreds, so the tens room decides. 8 tens beats every other tens digit in the row.",
    }),
    qn({
      id: "u1.m4",
      micro: M2,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Circle the smallest number in the row: 239, 123, 321, 456",
      correct: "123",
      wrong: [
        ["321", "compares the ones digit — 1 is the smallest ones digit in the row"],
        ["239", "compares the tens room before the hundreds room"],
      ],
      why: "Hundreds room first: 1 is smaller than 2, 3 and 4, so 123 wins straight away without opening another room.",
    }),
    qn({
      id: "u1.m5",
      micro: M2,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Arrange from smallest to biggest: 456, 389, 207, 99, 110",
      correct: "99, 110, 207, 389, 456",
      wrong: [
        ["99, 207, 110, 389, 456", "compares 110 and 207 by the ones digit, 0 against 7"],
        ["110, 99, 207, 389, 456", "counts 99 as bigger because its digits are larger than 1, 1 and 0"],
        ["99, 110, 456, 207, 389", "sorts the 3-digit numbers by their ones digits"],
      ],
      why: "99 has only two rooms, so it is smallest. After that the hundreds room settles it: 1, 2, 3, 4.",
    }),
    qn({
      id: "u1.m6",
      micro: M3,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Use the digits 5, 0 and 6 once each. What is the smallest 3-digit number you can make?",
      correct: "506",
      wrong: [
        ["056", "puts 0 in the hundreds room, which leaves only a 2-digit number"],
        ["605", "makes the largest number instead of the smallest"],
        ["560", "puts the 6 in the tens room instead of the ones room"],
      ],
      why: "0 cannot lead, so the smallest allowed card, 5, takes the hundreds room. Then 0 tens and 6 ones keeps the rest as small as possible.",
    }),
    qn({
      id: "u1.m7",
      micro: M3,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Who am I? I have the digits 9, 1 and 5. I am less than 200. I have 9 ones.",
      correct: "159",
      wrong: [
        ["195", "puts the 9 in the tens room and ignores the 'I have 9 ones' clue"],
        ["951", "builds the largest number from the cards instead of reading the clues"],
        ["519", "keeps 9 ones but ignores 'less than 200' in the hundreds room"],
      ],
      why: "Less than 200 means the hundreds room must hold the 1. 9 ones fixes the ones room. Only the 5 is left for the tens.",
    }),
    qn({
      id: "u1.m8",
      micro: M4,
      purpose: "mastery",
      difficulty: 1,
      prompt: "Sweet box number 267. Which two hundreds does it lie between?",
      visual: { kind: "number-line", from: 200, to: 300, step: 25, mark: 267 },
      correct: "200 and 300",
      wrong: [
        ["260 and 270", "names the neighbouring tens instead of the neighbouring hundreds"],
        ["300 and 400", "uses the nearer hundred as the starting post"],
      ],
      why: "The hundreds room says 2, so 267 has passed 200 and has not yet reached 300.",
    }),
    qn({
      id: "u1.m9",
      micro: M4,
      purpose: "mastery",
      difficulty: 2,
      prompt: "Birbal says there are exactly nine hundred and sixty-three crows. Between which two hundreds does 963 sit?",
      correct: "900 and 1000",
      wrong: [
        ["960 and 970", "names the neighbouring tens instead of the hundreds"],
        ["800 and 900", "names the stretch one hundred too low"],
        ["900 and 990", "uses the last ten-mark as the closing post instead of the next hundred"],
      ],
      why: "963 has 9 hundreds, so it is on the last stretch before a thousand: past 900, not yet at 1000.",
    }),
    qn({
      id: "u1.m10",
      micro: M5,
      purpose: "mastery",
      difficulty: 3,
      prompt: "Farooq Chacha's order says '68 more than 300'. Which of these names the very same number?",
      correct: "32 less than 400",
      wrong: [
        ["68 less than 400", "reuses the same step-size when the direction changes"],
        ["32 more than 300", "swaps the two numbers in the clue"],
        ["68 more than 400", "keeps the step-size but moves to the wrong landmark"],
      ],
      why: "300 + 68 = 368, and 400 − 32 = 368. The two step-sizes add to 100 because that is the gap between the hundred-posts.",
    }),
  ],

  revisionSet: [
    qn({
      id: "u1.r1",
      micro: M2,
      purpose: "revision",
      difficulty: 2,
      prompt: "Arrange from biggest to smallest: 67, 376, 294, 249, 494",
      correct: "494, 376, 294, 249, 67",
      wrong: [
        ["494, 376, 249, 294, 67", "compares 294 and 249 by the ones digit, 4 against 9"],
        ["67, 494, 376, 294, 249", "starts with 67 because 7 is the biggest ones digit in the set"],
        ["494, 294, 376, 249, 67", "compares 376 and 294 by the tens room before the hundreds room"],
      ],
      why: "67 has only two rooms so it is smallest. For the rest, the hundreds room decides: 4, 3, 2, 2 — and the last tie breaks in the tens room, 9 against 4.",
    }),
    qn({
      id: "u1.r2",
      micro: M1,
      purpose: "revision",
      difficulty: 1,
      prompt: "The driver's tiles show 6 hundred-tiles, 2 ten-tiles and no one-tiles. Which number is it?",
      visual: { kind: "place-value", hundreds: 6, tens: 2, ones: 0 },
      correct: "620",
      wrong: [
        ["62", "drops the empty ones room"],
        ["602", "puts the empty room in the middle instead of at the end"],
        ["6200", "writes 600 and 20 side by side"],
      ],
      why: "6 hundreds, 2 tens, no ones. The 0 at the end is what keeps the 2 in the tens room.",
    }),
    qn({
      id: "u1.r3",
      micro: M5,
      purpose: "revision",
      difficulty: 2,
      prompt: "Tambola clue: '5 less than 625'. Which number should you cross off?",
      correct: "620",
      wrong: [
        ["630", "counts on instead of back"],
        ["624", "steps back one instead of five"],
        ["575", "takes away 50 instead of 5"],
      ],
      why: "'Less than' means walk backwards from the landmark. Five steps back from 625 lands on 620.",
    }),
    // Interleaved from the prerequisite unit g3.num.double-century — §4 transfer.
    qn({
      id: "u1.r4",
      micro: DC1,
      purpose: "revision",
      difficulty: 1,
      prompt: "The mela count reads 298 + 1 = 299. What is 299 + 1?",
      correct: "300",
      wrong: [
        ["2910", "writes the digits out instead of counting one more"],
        ["200", "restarts the count at the hundred below"],
        ["390", "rolls over the tens room but not the hundreds room"],
      ],
      why: "The ones room is full at 9 and so is the tens room, so both roll over together and a new hundred is made: 300.",
    }),
    qn({
      id: "u1.r5",
      micro: DC2,
      purpose: "revision",
      difficulty: 2,
      prompt: "Ajji hangs torans in tens along a line to 200: 120, 130, 140, __. Which mark comes next?",
      visual: { kind: "number-line", from: 100, to: 200, step: 10, mark: 150 },
      correct: "150",
      wrong: [
        ["141", "adds one instead of a whole ten"],
        ["145", "adds five, half a mark"],
        ["240", "adds a hundred instead of a ten"],
      ],
      why: "Each mark on this line is a jump of ten, and only the tens room changes: 14 tens becomes 15 tens, so 150.",
    }),
  ],
};

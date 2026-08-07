/**
 * Subtopic 1 · "Force & its effects" — authored Concept Block content for the
 * Level 1 demo (Grade 7 · Force, Motion & Energy · ICSE; anchor unit
 * science-g7-phy-u2, prereq G6 "Simple Machines and Force").
 *
 * The Learn phase is an ACTIVE dialogue graph: the tutor opens with a
 * prediction, branches on the student's reasoning, switches doorway when one
 * fails, breaks into smaller steps, and deepens for a strong start. Content is
 * illustrative and pipeline-pending (human approval before any child sees it).
 */
import type { ConceptBlockContent } from "../types";

export const FORCE_EFFECTS: ConceptBlockContent = {
  conceptId: "l1-fme-s1",
  title: "Force & its effects",
  subtopic: "Subtopic 1 of Force, Motion & Energy",
  boardRef: "CISCE framework · G7 Physics (anchor: Motion, speed and time; prereq G6 Simple Machines and Force)",

  misconceptions: [
    { tag: "M-FME-01", belief: "Moving things stop on their own; a force is needed to keep them moving" },
    { tag: "M-FME-02", belief: "A push stays inside the object and slowly gets used up" },
    { tag: "M-FME-03", belief: "If nothing is moving, no forces are acting (balanced = none)" },
    { tag: "M-FME-04", belief: "A force has only one effect — it can change speed but not direction or shape" },
  ],

  learn: {
    start: "L1",
    nodes: [
      {
        id: "L1",
        doorway: "everyday-example",
        tutor:
          "Before any definitions, a quick experiment in your head. A carrom striker sits on the board. You flick it once — and your finger leaves it. What happens to the striker after your finger has left?",
        visual: "carrom board · striker · one flick",
        options: [
          {
            id: "a",
            text: "It keeps sliding until something slows it down",
            next: "L2_DEEP",
            quality: "secure",
            reaction: "That's a sharp prediction — most people miss the 'until something' part. Let's push it further.",
          },
          {
            id: "b",
            text: "It slides a little and then stops on its own",
            next: "L2_CONTRAST",
            quality: "misconception",
            misconceptionTag: "M-FME-01",
            reaction: "It does stop — you're right about that. But here's my claim: nothing stops on its own. Let me show you.",
          },
          {
            id: "c",
            text: "It stops the moment my finger leaves it",
            next: "L2_CONTRAST",
            quality: "misconception",
            misconceptionTag: "M-FME-01",
            reaction: "Try it tonight — it definitely keeps going for a bit! The interesting question is what makes it stop. Watch this.",
          },
        ],
      },
      {
        id: "L2_CONTRAST",
        doorway: "diagram-contrast",
        tutor:
          "Same flick, two boards. Board one is sprinkled with fine powder — slippery. Board two is rough, unpolished wood. On which board does the striker travel farther?",
        visual: "two boards side by side · powdered vs rough",
        options: [
          {
            id: "a",
            text: "Farther on the powdered board",
            next: "L3_NAME",
            quality: "secure",
            reaction: "Exactly. Same flick, different boards, different distance — so the board is doing something to the striker.",
          },
          {
            id: "b",
            text: "Farther on the rough board",
            next: "L2_HANDS",
            quality: "partial",
            reaction: "Let's test that with your own hands instead of the diagram.",
          },
          {
            id: "c",
            text: "The same on both",
            next: "L2_HANDS",
            quality: "partial",
            reaction: "If the board made no difference, carrom players wouldn't sprinkle powder! Feel it for yourself.",
          },
        ],
      },
      {
        id: "L2_HANDS",
        doorway: "act-it-out",
        tutor:
          "Rub your palm across a rough desk, then across a smooth one. Which surface rubs back against your hand harder?",
        visual: "try it at your desk",
        options: [
          {
            id: "a",
            text: "The rough one rubs back harder",
            next: "L3_NAME",
            quality: "secure",
            reaction: "You just felt it — that rubbing-back is real, and it's stronger on rough surfaces.",
          },
          {
            id: "b",
            text: "The smooth one",
            next: "L3_NAME",
            quality: "partial",
            reaction: "Try it once more slowly — rough surfaces grip and drag. That drag is what I want you to notice. Hold that thought.",
          },
        ],
      },
      {
        id: "L3_NAME",
        doorway: "diagram-contrast",
        tutor:
          "That rubbing-back force has a name: friction. It acts on the striker the whole time it slides. So finish the idea — what actually makes the striker stop?",
        options: [
          {
            id: "a",
            text: "Friction from the board slowly takes away its motion",
            next: "L4_LOCK",
            quality: "secure",
            resolves: "M-FME-01",
            reaction: "That's the whole idea. The striker doesn't stop on its own — friction, a real force, stops it.",
          },
          {
            id: "b",
            text: "The push I gave it runs out",
            next: "L3_IMPETUS",
            quality: "misconception",
            misconceptionTag: "M-FME-02",
            reaction: "That's the most common idea in your whole grade — and it's worth taking apart carefully.",
          },
        ],
      },
      {
        id: "L3_IMPETUS",
        doorway: "thought-experiment",
        tutor:
          "A push isn't a thing the striker carries — it only acts while your finger touches it. After that, the only force on it is friction. So imagine a perfectly smooth, endless board: zero friction. You flick the striker once. When does it stop?",
        visual: "endless frictionless board",
        options: [
          {
            id: "a",
            text: "Never — nothing is there to stop it",
            next: "L4_LOCK",
            quality: "secure",
            resolves: "M-FME-01",
            reaction: "Yes. Take away the stopping force and the motion simply continues. Pushes don't get 'used up' — forces act from outside.",
          },
          {
            id: "b",
            text: "Eventually — everything stops in the end",
            next: "L4_LOCK",
            quality: "misconception",
            misconceptionTag: "M-FME-01",
            reaction: "That instinct is exactly what we'll test in practise. Watch what happens when we remove the stopping force piece by piece.",
          },
        ],
      },
      {
        id: "L2_DEEP",
        doorway: "thought-experiment",
        tutor:
          "Then here's the deeper puzzle. If moving things keep moving until something slows them — why does everything around us always seem to stop anyway?",
        options: [
          {
            id: "a",
            text: "Because friction and air push against motion nearly everywhere",
            next: "L4_LOCK",
            quality: "secure",
            resolves: "M-FME-01",
            reaction: "Precisely. Stopping is not natural — it's caused. On Earth, friction is just very hard to escape.",
          },
          {
            id: "b",
            text: "Because the push slowly fades away",
            next: "L3_IMPETUS",
            quality: "misconception",
            misconceptionTag: "M-FME-02",
            reaction: "Interesting — strong start, but this hidden idea needs surgery. Let's test it properly.",
          },
        ],
      },
      {
        id: "L4_LOCK",
        doorway: "everyday-example",
        tutor:
          "Lock it in. A force is a push or a pull. A force can start motion, stop it, change its direction, or change an object's shape. And nothing stops 'on its own' — a force does the stopping. Ready to try some without me answering for you?",
        options: [
          {
            id: "a",
            text: "Start practise →",
            next: null,
            quality: "secure",
            reaction: "I'll be right here if you want a hint — but the thinking is yours.",
          },
        ],
      },
    ],
  },

  practise: [
    {
      id: "P1",
      prompt: "A football rolling across the school field slows down and stops. Why does it stop?",
      options: [
        { id: "a", text: "Friction from the grass and air resistance act against its motion", correct: true },
        { id: "b", text: "The force of the kick gets used up", misconceptionTag: "M-FME-02" },
        { id: "c", text: "It stops because nobody keeps pushing it", misconceptionTag: "M-FME-01" },
      ],
      hints: [
        "List the forces touching the ball while it rolls. Is anything acting against its motion?",
        "The grass rubs against the ball the whole way. What do we call that rubbing force?",
        "One option names a real, measurable force; the others treat the kick as fuel. Which is the real force?",
      ],
    },
    {
      id: "P2",
      prompt: "A batter hits a ball that was coming toward them, and it flies back the other way. What did the force from the bat change?",
      options: [
        { id: "a", text: "Both the ball's speed and its direction", correct: true },
        { id: "b", text: "Only its speed — direction changes by itself", misconceptionTag: "M-FME-04" },
        { id: "c", text: "Only its shape", misconceptionTag: "M-FME-04" },
      ],
      hints: [
        "Picture the ball just before the bat and just after. What is different about its motion?",
        "It was moving toward the batter; now it moves away. That's one change — is there another?",
        "A single force can have more than one effect at the same time. Which option allows that?",
      ],
    },
    {
      id: "P3",
      prompt: "In tug-of-war, both teams pull hard but the rope does not move. Why not?",
      options: [
        { id: "a", text: "The two pulls are equal and opposite, so they balance out", correct: true },
        { id: "b", text: "No forces are acting on the rope", misconceptionTag: "M-FME-03" },
        { id: "c", text: "The rope soaks up both forces", misconceptionTag: "M-FME-02" },
      ],
      hints: [
        "Are the teams pulling or not? Start from what you can see.",
        "Two real forces act on the rope — one from each side. In which directions?",
        "Equal and opposite forces are both there, yet the effect on motion is zero. Which option says that?",
      ],
    },
    {
      id: "P4",
      prompt: "A cyclist stops pedalling on a flat road but keeps rolling, slowly coming to a stop. While she rolls, the forces acting along the road are…",
      options: [
        { id: "a", text: "Friction and air resistance, pushing backwards against her motion", correct: true },
        { id: "b", text: "The leftover pedalling force, still pushing her forwards", misconceptionTag: "M-FME-02" },
        { id: "c", text: "No forces at all — she is just coasting", misconceptionTag: "M-FME-03" },
      ],
      hints: [
        "Her feet are off the pedals — so is anything still pushing her forwards? Check each option against that.",
        "She is slowing down. A change in motion needs a force. In which direction must it act?",
        "The carrom striker and this cyclist are the same problem. What stopped the striker?",
      ],
    },
  ],

  check: [
    {
      id: "C1",
      skill: "recall",
      aiFree: true,
      prompt: "A force is best described as…",
      options: [
        { id: "a", text: "A push or a pull acting on an object", correct: true },
        { id: "b", text: "Energy stored inside a moving object", misconceptionTag: "M-FME-02" },
        { id: "c", text: "The speed of an object", misconceptionTag: "M-FME-04" },
      ],
    },
    {
      id: "C2",
      skill: "apply",
      aiFree: true,
      prompt: "You squeeze a ball of clay and it flattens. Which effect of force is this?",
      options: [
        { id: "a", text: "A change of shape", correct: true },
        { id: "b", text: "A change of speed", misconceptionTag: "M-FME-04" },
        { id: "c", text: "No force is involved — clay is just soft", misconceptionTag: "M-FME-03" },
      ],
    },
    {
      id: "C3",
      skill: "reason",
      aiFree: true,
      prompt: "The same marble is flicked equally hard across a smooth floor and across a carpet. On which does it stop sooner, and why?",
      options: [
        { id: "a", text: "On the carpet — it pushes back with more friction", correct: true },
        { id: "b", text: "On the carpet — soft things absorb the flick", misconceptionTag: "M-FME-02" },
        { id: "c", text: "On the smooth floor — it moves faster so it finishes sooner", misconceptionTag: "M-FME-01" },
      ],
    },
    {
      id: "C4",
      skill: "transfer",
      aiFree: true,
      prompt: "An astronaut far out in space, away from everything, throws a wrench. After it leaves her hand, the wrench…",
      options: [
        { id: "a", text: "Keeps moving at a steady speed — nothing acts to stop it", correct: true },
        { id: "b", text: "Slows and stops as the throw wears off", misconceptionTag: "M-FME-02" },
        { id: "c", text: "Stops almost immediately once her hand is gone", misconceptionTag: "M-FME-01" },
      ],
    },
    {
      id: "C5",
      skill: "boundary",
      aiFree: true,
      prompt: "In which situation is there NO unbalanced force acting?",
      options: [
        { id: "a", text: "A book resting still on a table", correct: true },
        { id: "b", text: "A striker sliding and slowing on a carrom board", misconceptionTag: "M-FME-03" },
        { id: "c", text: "A ball changing direction after being hit", misconceptionTag: "M-FME-04" },
      ],
    },
  ],
};

/**
 * Meera's scripted Session 1 — the "needs a bit of help here and there" child.
 * Used by the auto-play demo control; a live student can play by hand instead.
 * Learn: misconception surfaced → doorway switch works → impetus idea appears →
 * resolved in thought experiment. Practise: one hint on P1, clean P2, one wrong
 * try on P3, clean P4. Check: 4/5 with the transfer item missed.
 */
export const MEERA_SESSION1 = {
  learn: { L1: "b", L2_CONTRAST: "a", L3_NAME: "b", L3_IMPETUS: "a", L4_LOCK: "a" } as Record<string, string>,
  practise: {
    P1: { hintsBefore: 1, picks: ["a"] },
    P2: { hintsBefore: 0, picks: ["a"] },
    P3: { hintsBefore: 0, picks: ["b", "a"] },
    P4: { hintsBefore: 0, picks: ["a"] },
  } as Record<string, { hintsBefore: number; picks: string[] }>,
  check: { C1: "a", C2: "a", C3: "a", C4: "b", C5: "a" } as Record<string, string>,
};

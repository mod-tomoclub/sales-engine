/**
 * Level 1 · Live Tutor — the AI-driven Learn phase (§9 Tomoe, §15 AI Gateway).
 *
 * Pure TS, no React, no network. This file owns:
 *  - the lesson brief the tutor teaches from (Subtopic 2 · "Motion, speed & time",
 *    Grade 7 ICSE, anchor unit science-g7-phy-u2), including specific
 *    misconception tags — vague tags are banned, same rule as the scripted block;
 *  - the wire contract between the browser and the tutor endpoint;
 *  - the structured TutorTurn the model must return every turn, and the mapping
 *    from that turn into typed EvidenceRecords for the Student Context Engine.
 *
 * The model never decides progression. It returns an utterance, the tactic it
 * used, optional evidence, and a `learnComplete` flag; the engine/UI decide
 * what happens next. Check stays AI-free — this file is never used there.
 */
import { z } from "zod/v4";
import type { Doorway, EvidenceRecord, MisconceptionDef } from "./types";

/* ------------------------------------------------------------------ */
/* Lesson brief                                                        */
/* ------------------------------------------------------------------ */

export type Tactic = "predict" | "observe" | "explain-back" | "apply" | "transfer" | "repair";

export const TACTICS: Tactic[] = ["predict", "observe", "explain-back", "apply", "transfer", "repair"];

export const DOORWAYS: Doorway[] = ["everyday-example", "diagram-contrast", "act-it-out", "thought-experiment"];

export interface LearningGoal {
  id: string;
  text: string;
}

export interface LiveLessonBrief {
  conceptId: string;
  title: string;
  subtopic: string;
  boardRef: string;
  grade: number;
  /** What the student must be able to do by the end of Learn (the tutor checks these off). */
  goals: LearningGoal[];
  /** Facts the tutor may rely on, stated at Grade 7 level. Nothing outside this list. */
  knowledge: string[];
  misconceptions: MisconceptionDef[];
  /** Everyday contexts the tutor should prefer (Indian classroom). */
  contexts: string[];
}

export const MOTION_SPEED_TIME: LiveLessonBrief = {
  conceptId: "l1-fme-s2",
  title: "Motion, speed & time",
  subtopic: "Subtopic 2 of Force, Motion & Energy",
  boardRef: "CISCE framework · G7 Physics · anchor unit science-g7-phy-u2 (prereq G6 Simple Machines and Force)",
  grade: 7,
  goals: [
    { id: "G1", text: "Explain that motion is a change of position relative to a reference point" },
    { id: "G2", text: "Use speed = distance ÷ time, with units (m/s, km/h), to compare two movers" },
    { id: "G3", text: "Tell uniform from non-uniform motion and say what 'average speed' hides" },
    { id: "G4", text: "Read a distance–time graph: steeper line = faster, flat line = stopped" },
  ],
  knowledge: [
    "An object is in motion if its position changes with time relative to a reference point; the same object can be at rest relative to one thing and moving relative to another (a passenger is at rest relative to the bus, moving relative to the road).",
    "Speed = distance travelled ÷ time taken. SI unit m/s; km/h is common for vehicles. 1 m/s = 3.6 km/h.",
    "Uniform motion: equal distances in equal intervals of time (speed is constant). Non-uniform motion: unequal distances in equal intervals.",
    "Average speed = total distance ÷ total time. It does not tell you the speed at any moment.",
    "Distance–time graph: time on the horizontal axis, distance on the vertical axis. A straight sloped line means uniform motion; the steeper the line, the faster the object; a horizontal line means the object is at rest; a curve means speed is changing.",
    "Instruments: a speedometer shows speed at that instant; an odometer shows total distance covered.",
    "Typical speeds for sense-checking: walking ≈ 1.5 m/s (≈ 5 km/h), cycling ≈ 4 m/s (≈ 15 km/h), city bus ≈ 10 m/s (≈ 36 km/h), express train ≈ 30 m/s (≈ 110 km/h).",
  ],
  misconceptions: [
    { tag: "M-MST-01", belief: "If two things are moving, the one that is ahead is the faster one" },
    { tag: "M-MST-02", belief: "Speed is the same thing as distance — going further means going faster" },
    { tag: "M-MST-03", belief: "A higher line on a distance–time graph means a faster object (confusing height with slope)" },
    { tag: "M-MST-04", belief: "Average speed is just the middle of the fastest and slowest speeds" },
    { tag: "M-MST-05", belief: "Something is either moving or not — motion does not depend on what you compare it to" },
  ],
  contexts: [
    "school bus vs a bicycle on the same road",
    "100 m race on sports day",
    "Mumbai local train vs an auto-rickshaw",
    "cricket ball thrown from the boundary",
    "walking to school with a friend who stops at a shop",
    "the Vande Bharat express vs a passenger train",
  ],
};

/* ------------------------------------------------------------------ */
/* Manipulative the tutor can summon                                   */
/* ------------------------------------------------------------------ */

/** A two-lane race the UI renders as a track + live distance–time graph.
 *  The student can change speeds / add a stop; the UI reports what they did
 *  back to the tutor as a student event. */
export const RaceVisualSchema = z.object({
  kind: z.literal("race"),
  a: z.object({ label: z.string(), speedKmh: z.number(), startAtKm: z.number().optional() }),
  b: z.object({ label: z.string(), speedKmh: z.number(), startAtKm: z.number().optional() }),
  /** Total race distance in km. */
  distanceKm: z.number(),
  /** If set, mover `b` stops for this many minutes at the given km mark. */
  stopB: z.object({ atKm: z.number(), minutes: z.number() }).optional(),
});
export type RaceVisual = z.infer<typeof RaceVisualSchema>;

/* ------------------------------------------------------------------ */
/* Structured turn (what the model must return)                        */
/* ------------------------------------------------------------------ */

export const TurnEvidenceSchema = z.object({
  kind: z.enum(["prediction", "misconception", "doorway"]),
  /** prediction: secure | partial | misconception */
  quality: z.enum(["secure", "partial", "misconception"]).optional(),
  /** misconception: the tag from the brief; status of that tag now. */
  tag: z.string().optional(),
  status: z.enum(["surfaced", "persisting", "resolved"]).optional(),
  /** doorway: which representation, and whether it landed. */
  doorway: z.enum(["everyday-example", "diagram-contrast", "act-it-out", "thought-experiment"]).optional(),
  worked: z.boolean().optional(),
  /** One specific sentence about what the student actually said/did. */
  note: z.string(),
});
export type TurnEvidence = z.infer<typeof TurnEvidenceSchema>;

export const TutorTurnSchema = z.object({
  /** What the tutor says out loud. ≤ 60 words, ends with exactly one question unless learnComplete. */
  say: z.string(),
  tactic: z.enum(["predict", "observe", "explain-back", "apply", "transfer", "repair"]),
  doorway: z.enum(["everyday-example", "diagram-contrast", "act-it-out", "thought-experiment"]),
  /** Goals from the brief the student has now demonstrated (cumulative). */
  goalsMet: z.array(z.string()),
  evidence: z.array(TurnEvidenceSchema),
  /** Summon or update the race manipulative; null leaves the current visual as is. */
  visual: RaceVisualSchema.nullable(),
  /** True only when every goal is met independently — the UI then ends Learn. */
  learnComplete: z.boolean(),
});
export type TutorTurn = z.infer<typeof TutorTurnSchema>;

/* ------------------------------------------------------------------ */
/* Wire contract                                                       */
/* ------------------------------------------------------------------ */

export interface LiveLine {
  speaker: "tutor" | "student";
  text: string;
  /** How the student line arrived — matters for the Context Engine (§brief: HOW, not just what). */
  via?: "voice" | "typed" | "manipulative";
  tactic?: Tactic;
  doorway?: Doorway;
}

export interface TutorRequest {
  student: { name: string; grade: number };
  brief: LiveLessonBrief;
  transcript: LiveLine[];
  /** Evidence captured so far, so the tutor never repeats a failed doorway (Math Lab invariant 5). */
  evidenceSoFar: EvidenceRecord[];
  goalsMet: string[];
  /** Current state of the manipulative, if one is on screen. */
  visual: RaceVisual | null;
}

export interface TutorResponse {
  turn: TutorTurn;
  /** Model + token usage for the demo's cost strip. */
  usage: { model: string; inputTokens: number; outputTokens: number; cacheReadTokens: number };
}

/* ------------------------------------------------------------------ */
/* Evidence mapping (model output → Context Engine records)            */
/* ------------------------------------------------------------------ */

const BANNED_NOTE_WORDS = ["careless", "wrong answer", "silly mistake"];

/** Turn the model's evidence into typed records. Drops anything that does not
 *  fit the brief (unknown tags, vague notes) — the Context Engine only stores
 *  evidence it can cite. Returns the new records and the next sequence number. */
export function evidenceFromTurn(
  turn: TutorTurn,
  brief: LiveLessonBrief,
  existing: EvidenceRecord[],
  seq: number,
): { records: EvidenceRecord[]; seq: number } {
  const records: EvidenceRecord[] = [];
  const nextId = () => `E${String(++seq).padStart(2, "0")}`;
  const knownTags = new Set(brief.misconceptions.map((m) => m.tag));
  const hasPrediction = existing.some((e) => e.kind === "prediction");

  for (const ev of turn.evidence) {
    const note = ev.note.trim();
    if (!note || BANNED_NOTE_WORDS.some((w) => note.toLowerCase().includes(w))) continue;

    if (ev.kind === "prediction" && ev.quality && !hasPrediction && !records.some((r) => r.kind === "prediction")) {
      records.push({ id: nextId(), phase: "learn", kind: "prediction", nodeId: "live", quality: ev.quality, note });
    } else if (ev.kind === "misconception" && ev.tag && knownTags.has(ev.tag)) {
      const seen = [...existing, ...records].some((e) => e.kind === "misconception" && e.tag === ev.tag);
      let status = ev.status ?? (seen ? "persisting" : "surfaced");
      // A tag cannot "persist" before it has surfaced, and cannot be resolved unseen.
      if (!seen && status !== "surfaced") status = "surfaced";
      records.push({ id: nextId(), phase: "learn", kind: "misconception", tag: ev.tag, status, where: `Learn · ${turn.tactic}`, note });
    } else if (ev.kind === "doorway" && ev.doorway && typeof ev.worked === "boolean") {
      records.push({ id: nextId(), phase: "learn", kind: "doorway", doorway: ev.doorway, worked: ev.worked, note });
    }
  }
  return { records, seq };
}

/** Doorways that have failed so far — the tutor must not repeat them. */
export function failedDoorways(evidence: EvidenceRecord[]): Doorway[] {
  const out: Doorway[] = [];
  for (const e of evidence) {
    if (e.kind !== "doorway") continue;
    if (!e.worked && !out.includes(e.doorway)) out.push(e.doorway);
    if (e.worked) {
      const i = out.indexOf(e.doorway);
      if (i >= 0) out.splice(i, 1);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Prompt (shared by server + tests so the contract is visible in one place) */
/* ------------------------------------------------------------------ */

export function tutorSystemPrompt(brief: LiveLessonBrief): string {
  return [
    `You are Tomoe, the AI tutor inside Tomo School, teaching one Grade ${brief.grade} student (ICSE, India) the concept "${brief.title}" by voice. The student hears you read aloud, so speak the way a warm, sharp teacher speaks — short sentences, no markdown, no bullet points, no emojis.`,
    "",
    "HOW YOU TEACH (non-negotiable):",
    "- You LEAD. Never wait to be asked. Every turn ends with exactly one question or one thing for the student to do.",
    "- Never lecture. At most two sentences of telling before the next question. The student should be talking or doing more than listening.",
    "- Start with a PREDICTION in a concrete everyday situation before any definition or formula.",
    "- When the student is wrong, do not correct them. Give a contrasting case or a small experiment that makes the idea break, then ask again (tactic: repair). Name the misconception tag in evidence.",
    "- When the student is right, make them EXPLAIN-BACK in their own words, then APPLY to a new situation, then TRANSFER to a situation that looks different.",
    "- If a representation is not landing, switch doorway (everyday-example → diagram-contrast → act-it-out → thought-experiment). Never repeat a doorway listed as failed.",
    "- Use the race manipulative when comparing movers or reading graphs: set `visual` to a race and ask the student to watch, change a speed, or read the graph. When the student changes it, react to what they did.",
    "- Keep every `say` under 60 words. Use the student's name sometimes, not every turn. Indian contexts (see below). Metric units only.",
    "- Stay inside the knowledge list below. Do not introduce acceleration, velocity as a vector, or equations of motion — those are later units.",
    "- You are not allowed to give a quiz, a score, or a grade. Learn has no marks. Check happens later without you.",
    "",
    "GOALS the student must demonstrate (report `goalsMet` cumulatively, only when the student has shown it themselves, not when you have said it):",
    ...brief.goals.map((g) => `- ${g.id}: ${g.text}`),
    "",
    "KNOWLEDGE you may use:",
    ...brief.knowledge.map((k) => `- ${k}`),
    "",
    "MISCONCEPTION TAGS (use these exact tags in evidence; never invent tags, never use vague words like careless):",
    ...brief.misconceptions.map((m) => `- ${m.tag}: ${m.belief}`),
    "",
    "PREFERRED CONTEXTS: " + brief.contexts.join("; ") + ".",
    "",
    "EVIDENCE you return each turn is for the Student Context Engine, which decides what happens in the next session. Record only what the student actually said or did: their opening prediction (once, quality secure/partial/misconception), any misconception tag surfaced/persisting/resolved, and whether the doorway you used landed. Each note must be one specific sentence quoting or paraphrasing the student.",
    "",
    "Set `learnComplete` true only when all goals are met by the student's own words. Then `say` is a one-sentence wrap-up with no question.",
  ].join("\n");
}

/** Serialise the request into the user-visible conversation for the model. */
export function tutorMessages(req: TutorRequest): { role: "user" | "assistant"; content: string }[] {
  const failed = failedDoorways(req.evidenceSoFar);
  const header = [
    `Student: ${req.student.name}, Grade ${req.student.grade}.`,
    `Goals met so far: ${req.goalsMet.length ? req.goalsMet.join(", ") : "none"}.`,
    `Failed doorways (do not repeat): ${failed.length ? failed.join(", ") : "none"}.`,
    `Evidence so far: ${
      req.evidenceSoFar.length
        ? req.evidenceSoFar.map((e) => `${e.id} ${e.kind}${"tag" in e ? " " + e.tag + " " + e.status : ""}: ${e.note}`).join(" | ")
        : "none"
    }.`,
    req.visual ? `Manipulative on screen: ${JSON.stringify(req.visual)}.` : "No manipulative on screen.",
  ].join("\n");

  const msgs: { role: "user" | "assistant"; content: string }[] = [];
  if (req.transcript.length === 0) {
    msgs.push({ role: "user", content: `${header}\n\nThe session is starting. Open the lesson.` });
    return msgs;
  }
  // Fold the header into the first user message; then replay the dialogue.
  let first = true;
  for (const line of req.transcript) {
    if (line.speaker === "tutor") {
      msgs.push({ role: "assistant", content: line.text });
    } else {
      const via = line.via === "manipulative" ? "[student changed the manipulative] " : line.via === "typed" ? "[typed] " : "";
      const content = `${via}${line.text}`;
      msgs.push({ role: "user", content: first ? `${header}\n\n${content}` : content });
      first = false;
    }
  }
  // If the transcript starts with the tutor (it always does), make sure the first message is a user message.
  if (msgs[0]?.role !== "user") msgs.unshift({ role: "user", content: `${header}\n\nThe session is starting. Open the lesson.` });
  // The final message must be from the student for the model to respond.
  const last = msgs[msgs.length - 1];
  if (last.role !== "user") msgs.push({ role: "user", content: "(The student is silent. Nudge them with a smaller, easier question.)" });
  return msgs;
}

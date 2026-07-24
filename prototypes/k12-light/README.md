# Tomo K–12 prototype — Student AI + teacher surfaces

## Iteration 2 — Student AI dashboard (Kabir Shah, Grade 5)

The same single file now opens on **Student AI**, a complete student dashboard for
one Grade 5 demonstration student, alongside the preserved teacher experience
(demo bar switches roles). Branding uses the official Tomo logo (embedded as a
data URI, unaltered) with the brand red used sparingly as the student-side accent.

**Grounding.** Subject, topic and PATH taxonomy come verbatim from the two supplied
workbooks: `Concept_Block (2).xlsx` (ICSE Concept-Block map — English, Mathematics,
Hindi, Science, Social Studies, Computer; the demo strand is Science G5 U7 *Light:
Reflection and Refraction* → G6 U2 *Physics: Light — reflection basics* → G7 U7) and
`PATH_Blocks (3).xlsm` (Scholar/Builder/Explorer/Communicator/Artist/Athlete,
Sample→Specialise→Master stages, Deepen/Broaden/Connect/Move/Switch next steps,
elementary rhythm of 2 Concept Blocks + 6 PATH Blocks daily).

**Student profile.** Enrolled Grade 5; diagnostic working levels: English G3
(foundation track), Mathematics G4 (prerequisite repair woven in), Science G6
(accelerated after mastery), Hindi G5, Social Science G5. Levels are shown as
per-subject ribbons, never one overall score, and are explicitly starting
estimates that move with evidence.

**Surfaces.** Sidebar: Home · Schedule (week/month/year) · Learning Map ·
Concept Blocks (6 subjects) · PATH Blocks (6 areas) · Assignments · Teacher
messages, plus a diagnostic walkthrough (not started → in progress → results →
map updated). The Science topic has its own **Mastery Map** (G4 prereq → 5
subtopics → Grade 5 Mastery Check → locked G6/G7), distinct from the overall
Learning Map. The Concept Block player keeps Learn → Practice → Check for
Understanding, now with format placeholders, a "why this is personalised"
disclosure, and three working practice formats (MCQ, arrange-in-order, match
columns). Micro-activities (English main-idea foundation, Maths fractions check
with G4 refresher), a Builder PATH Block with evidence logging, assignment
submission, and teacher messaging all write to the same shared state, so the
Learning Map's "Recent changes" feed reflects everything.

---

## Iteration 1 — Grade 6 Science · Light (teacher + 5-student class)

Single-file interactive prototype (`index.html`, no build step) demonstrating the
integrated Tomo learning system: curriculum mapping → Concept Blocks → Mastery
Checks → individual Learning Maps → live teacher intervention → AI-supported
personalization. Open the file in any browser; state persists in `localStorage`
(`Reset demo` in the demo bar returns to the starting scenario).

## Phase 1 — interface architecture (as built)

**Scenario.** Grade 6 Science · *Light: shadows, images and reflection* — five
sequenced ~20-minute subtopics → Grade 6 Mastery Check → locked **Grade 7
Light: Reflection and images** → locked **Grade 8 Light: Refraction and the eye**.
15-school-day stipulated topic window; the demo opens on day 9.

**Roles & navigation.**
- Teacher (Ms. Iyer): rail nav — Home & schedule (year/month/week/day) ·
  Class detail · Live Concept Block · Class progress. A slide-in student-support
  drawer opens from any student row.
- Student: tabs — Today · Concept Block · Mastery Check · My Learning Map.
- A bottom demo bar switches role/student, advances the simulated day, and resets.

**Shared state.** One JSON object (`tomo-k12-light-v1` in localStorage): per-student
subtopic records (learning / practice / CFU + score), mastery-check state machine
(`locked → window → passed`), support log, unlocked advanced strands, live-session
telemetry, and saved in-progress player position. Teacher and student views render
from the same object, so every action is visible on both sides.

**Statuses.** Not started · In progress · Completed · Needs support ·
Ready for Mastery Check · Mastered · Accelerated content unlocked.

**Concept Block loop.** Revision of the previous subtopic → personalized learning
material (with a visible "Why this version?" rationale) → practice (includes one
revision item) → Check for Understanding (includes one revision item; saved to the
Learning Map). Completing all five subtopics auto-opens the Mastery Check with an
8-day window. The Mastery Check is one item per Bloom level (Remember → Create),
supervised, AI-free, pass at ≥80% → unlocks the Grade 7 strand.

**Five students.**
| Student | Role in the demo | Personalization |
|---|---|---|
| Sana Kapoor | expected pace | standard sequence, diagram-first entry |
| Dev Sharma | prerequisite gap (G5 transparent/translucent/opaque) | inline prerequisite repair + worked examples |
| Meera Nair | vocabulary support, same objectives | glossed terms, reduced reading load, paired diagrams |
| Rohan Verma | scaffolding + live teacher intervention, behind timeline | chunked one-idea steps, check-ins, additional class |
| Anika Rao | early finisher | compacted core, open investigation, early Mastery Check → Grade 7 unlock |

**Live Concept Block.** Deterministic 25-minute scripted session (1.5 s per
simulated minute, or step with “+1 min”): per-student progress, stuck detection
(repeated wrong attempts), help requests, the 20-minute non-completion alert, and a
session feed. Teacher actions (record intervention, assign practice, schedule an
additional class) write to the student's support log and Learning Map immediately.

**AI boundaries.** Tomoé hints and questions, never answers; it is disabled during
the Mastery Check; every AI suggestion in the teacher drawer is labelled editable
and requires the teacher to act. No leaderboards, no permanent learner labels.

## Deliberately out of scope
Full K–12 map, real assessment bank, parent/principal dashboards, auth/backend.
The data layer (`SUBTOPICS`, `STUDENTS`, `QB`, `MC_ITEMS`) is structured so real
curriculum and student records can replace the placeholders without UI changes.

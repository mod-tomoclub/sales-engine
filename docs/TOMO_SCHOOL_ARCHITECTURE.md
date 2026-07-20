# Tomo School — Product Architecture v1

**Purpose of this document.** This is the founding architecture spec for the Tomo School product. It is written to be consumed by Claude Code as the single source of truth for structure, domain model, engines, and build order. It synthesizes three source artifacts — the Concept Block curriculum map, the PATH Blocks personalized progression system, and the PlayBook (strategy + product roadmap) — plus the Bloomy reference product for the student loop and motivation mechanics.

**Thesis being implemented.** Bloom's 2-sigma via AI-supported 1:1 tutoring + mastery-based progression, deployed as a trust-first brownfield transformation of a real school. Product = Academics + Tech. Three layers: **School AI** (operating backbone), **Student AI** (living profile + Tomoe companion), **Learning Map** (action layer for humans). Mastery gate = 90%, verified **over time (1-3-7 days), never on the same day alone**. Teachers motivate, guide, coach and unblock — they do not deliver unified direct instruction.

---

## 1. System context

```
                        ┌──────────────────────────────────────────────┐
                        │                 TOMO SCHOOL OS               │
                        │                                              │
  Students ────────────▶│  STUDENT APP (Tomoe companion, mastery loop) │
  Teachers ────────────▶│  TEACHER CONSOLE (live block view, coaching) │
  Exec Coaches ────────▶│  COACH DASHBOARD (1:40, check-ins, flags)    │
  Parents ─────────────▶│  PARENT APP (curated progress, rewards)      │
  Academic Head ───────▶│  SCHOOL AI STUDIO (content, approvals, TT)   │
  Ops/Admin ───────────▶│  ADMIN (org, devices, print/scan, audit)     │
                        │                                              │
                        │  ENGINES: Baseline · Session Planner ·       │
                        │  Mastery/Retention · Guided Practice ·       │
                        │  Summation · PATH · Motivation · Learning Map│
                        │                                              │
                        │  FOUNDATIONS: Curriculum Graph · Student     │
                        │  Model · AI Gateway · Event Bus · Audit Trail│
                        └──────────────────────────────────────────────┘
```

Two structural loops run for every child:

1. **Concept Blocks** (board-aligned academic floor): Baseline → Personalized Plan → per-session loop (AI-first instruction → guided practice → summation ≥90%) → 1-3-7 retention verification → confirmed mastery → unlock next units. Parallel units are managed by the Session Planner.
2. **PATH Blocks** (personalized depth, no content ceiling): Profile → Taste → Recommend 3 → Commit 12 weeks → Route (M0–M4) → Work + Evidence capture → Midpoint (wk 6) → Gate (wk 12) → Deepen / Broaden / Connect / Move / Switch.

The **Motivation Engine** (Bloomy-style currency, goals, streaks, rewards store, PATH-time credits) and **Learning Map** (heatmaps + action lists) wrap both loops.

---

## 2. The three product layers

| Layer | Role | Owns | First version (per PlayBook) |
|---|---|---|---|
| **School AI** | Operating backbone of the school | Curriculum graph, timetable engine, lesson-plan + instruction-script + guided-practice generation, teacher-support insights ("who to help now"), admin workflows, AI audit trail | Curriculum & timetable digitised; lesson plan + guided practice generation; teacher dashboard |
| **Student AI** | The child's living profile + tutor (**Tomoe**) | Baseline results, mastery & retention states, interests/confidence, session history, PATH record, multi-year memory; delivers personalized instruction, practice, and next-session planning | Profile (marks, attendance, baseline, interests, notes) + pilot AI tutor |
| **Learning Map** | Action layer for humans | Student/class/grade/campus mastery views, misconception & gap heatmaps, teacher action lists, intervention tracking, leadership dashboards | Class heatmap: gaps, misconceptions, teacher action list |

Human review rules (non-negotiable, from PlayBook): Academic Head approves all curriculum maps and AI content before any child sees it; coach reviews anything parent-facing; AI recommends but a human approves progression decisions in PATH; every child-facing AI artifact carries version + reviewer + date in the audit trail.

---

## 3. Personas and surfaces

| Persona | Surface | Core jobs |
|---|---|---|
| Student (PreK–12) | Student App | See "Up Next", run the mastery loop with Tomoe, do retention checks, track goals/streaks/coins, browse Skill Library (per policy), PATH workspace + portfolio |
| Teacher | Teacher Console | Live Concept Block view: who is stuck, misconception flags, whom to support next (School AI insight feed); approve/adjust practice levels; fallback print mode |
| Executive Coach (1:40) | Coach Dashboard | Flags, goals, 15-day check-in scheduler with fixed note format (1 strength, 1 gap, 1 small goal, next action), parent loop, PATH reviews |
| Parent | Parent App | Curated progress stories (never raw flags/rankings), learning gap report, monthly growth note, reward store config + redemption approvals, referral |
| Academic Head / Principal | School AI Studio | Content pipeline approvals, unit library versioning, timetable, fidelity audits, grade reviews |
| Ops / IT | Admin | Org/campus setup, devices, Wi-Fi/print/scan health, data import, privacy controls |
| Founder / Leadership | Learning Map (campus view) | KPI dashboards mapped to PlayBook success metrics |

Age policy is enforced at the platform level (from Concept Block README + PlayBook): **PreK–2 = no 1:1 screens** (smartboard + named printed guided practice via print/scan pipeline); 1:1 devices from Grade 3; AI-doorway-first delivery begins Grades 4–5 and is standard from middle school; PATH AI access follows the developmental table (coach-facing only in K–2 → professional-tool use with disclosure in 11–12).

---

## 4. Domain model (core entities)

### 4.1 Curriculum Graph (the "track")

Seeded directly from `Concept_Block.xlsx` (one row = one Unit; `Concept_Blocks` column = ordered granular nodes; ` | ` separator).

| Entity | Key fields | Notes |
|---|---|---|
| `Subject` | name, gradeRange, aiInteractionStyle | Style per PlayBook: English = conversational phonics/reading; Math = intro→questions→responses; Science = experiment simulations; Social = story/narrative |
| `Unit` | subjectId, grade, unitNo, title, deliveryCodes[T,A,M,R,L,N,P,O,U,C], practiceSpec, masteryProofSpec (**always AI-free**), boardRef, estHours, scholarDepthSpec, pathLockCriteria | The unit is the mastery-gated node; "working level" in a subject = furthest unit proven |
| `ConceptNode` | unitId, seq, title | Granular node a child masters one by one inside a unit |
| `PrereqEdge` | fromUnitId → toUnitId, type: {prerequisite, unlocks} | Cross-grade edges exist (e.g., G1 U2 → G2 U2); this graph is what enables **parallel units** |
| `ContentAsset` | unitId/conceptNodeId, kind: {instructionScript, practiceItem, summationForm, retentionItem, lessonPlan}, level (L1–L6 / scaffolded–standard–extension), language, version, status: {draft, approved, retired}, reviewerId, approvedAt | Nothing reaches a child unless status = approved; versioned for multi-campus reuse |

### 4.2 Student Model (Student AI substrate)

| Entity | Key fields | Notes |
|---|---|---|
| `Student` | grade, band {PreK2, Elem, Middle, High}, guardians, coachId, devicePolicy, languages | |
| `BaselineResult` | subject, workingLevelUnitId, gapUnitIds[], confidenceBand, administeredAt | Output of the Baseline Engine (§6) |
| `StudentUnitState` | unitId, state machine (§7), plannedStart/actualStart, provisionalMasteryAt, confirmedMasteryAt, attempts, timeSpent | The central progression record |
| `RetentionCheck` | studentUnitStateId, offsetDays {1,3,7, 21, 60}, dueAt, status, score | The 1-3-7 (+ longitudinal) verification pipeline |
| `SessionPlan` | studentId, slotId, date, segments[] (mapped to 60-min SOP), generatedAt, consumedAt | Recomputed after every interaction (§8) |
| `InteractionEvent` | sessionId, type {instruction, checkQ, practiceAttempt, hintRequest, reflection, retentionAttempt, summationAttempt}, payload, correctness, latency | Telemetry feeding planner + Learning Map |
| `InterestProfile` | interests[], doorways[], confidenceSurvey, teacherNotes {strength, gap, confidence} | Feeds AI-doorway instruction + PATH recommendation |
| `Flag` | source {AI, teacher, coach}, kind {misconception, stuck, disengaged, wellbeing}, status, ownerId | Interventions tracked to closure in Learning Map |

### 4.3 PATH record (from PATH Blocks workbook, sheet 10 "minimum PATH record")

| Entity | Key fields |
|---|---|
| `PathEnrollment` | path {Builder, Explorer, Scholar, Artist, Communicator, Athlete}, domain, stage {Sample, Specialise, Master}, evidenceProfile (6 dims: technicalSkill, quality, iteration, independence, authenticity, judgement), challenge {brief, milestones, audience, modality M0–M4, safetyLevel, completionDate}, commitmentWindow {start, midpointAt, gateAt}, coachMap {studioCoach, skillCoach, expertMentor, externalReviewer}, nextStepDecision {Deepen, Broaden, Connect, Move, Switch}, aiAuthorshipRecord |
| `EvidenceItem` | pathEnrollmentId, type {workProduct, processHistory, coachEvidence, studentExplanation, externalEvidence, teamEvidence}, media, reflection, reviewerId |
| `AthleteGate` | ageCategory (actual federation category, e.g. U-13), healthReview, loadStatus, facilityId, coachQualification | Grade is never a substitute for eligibility; ≤Grade 5 capped at Sample/Specialise |

### 4.4 Motivation, school ops, and governance

`CurrencyLedger` (earn/spend transactions, reason codes), `Goal` (daily/weekly, per band), `Streak`, `StoreItem` (school- and parent-configured), `Redemption` (queue + approval), `PathTimeCredit`; `TimetableSlot`, `LessonPlan`, `PrintPack` + `ScanRecord` (barcode → student linkage, 48-hour SLA back into Learning Map); `AuditLog` (every child-facing AI artifact: prompt version, model, reviewer, edits, error flags); `Consent`/`PrivacyPolicy` records (DPDP-aligned).

---

## 5. Reference mapping: Bloomy → Tomo

Bloomy is the closest working reference for the **student loop**; Tomo deliberately diverges where the PlayBook demands it.

| Bloomy mechanic | Tomo equivalent | Deliberate difference |
|---|---|---|
| Base Camp (learn) | Instruction segment (AI-first, 20 min in SOP) | Subject-specific interaction styles; interest-doorway framing; teacher coaches in parallel in a physical room |
| Climb (practice) | Guided Practice segment (25 min) | 3-level ladders; print+scan for PreK–2; collaborative grouping allowed by competency match |
| Summit (90% to unlock) | Summation (90% gate) | **Summation is AI-free** and proctored per unit's Mastery_Proof spec; passing yields *provisional* mastery only |
| — (Bloomy confirms same-day) | **1-3-7 retention pipeline** | Mastery confirmed only after D+3 and D+7 checks pass; longitudinal probes at D+21/D+60 inside mixed reviews |
| Compass Check (placement + periodic mixed review) | Baseline Engine + Compass Reviews | Baseline is multi-grade adaptive placement per subject; periodic mixed reviews double as retention probes |
| BloomyBot (hints, explains, never gives answers) | **Tomoe** companion | Persona per subject; disabled during summation; PATH authorship/disclosure rules; multi-year memory |
| Bloomy Bucks + store + parent redemption queue | Tomo currency + rewards store + redemption queue | Extra earn rule for **retention passes** (reward remembering, not just same-day); **PATH-time credits**: master fast → banked PATH time |
| Daily/weekly goals + streaks | Same, tuned per band | Streak = "at least one meaningful mastery action/day", not "one skill/day", to avoid gaming |
| Parent Learning Map heatmap (Placed/Low/Med/High/Complete) | Learning Map (student/class/grade/campus) | Adds teacher action lists, intervention tracking, leadership views; parents see curated summaries only |
| Self-directed mode / Show Skill Library toggles | Per-child policy overrides | Same pattern: school defaults + per-child overrides |

---

## 6. Baseline Engine (everything starts here)

**Goal.** Before any personalization, establish where each child's learning actually stands — per subject, potentially below their enrolled grade — and generate (a) the parent-facing Learning Gap Report (a named trust asset: "50% trust gain") and (b) the seed of the personalized plan.

**Design.**

1. **Item bank** tagged to `Unit` / `ConceptNode` across grades. Items reuse the summation/practice banks but are marked `baselineEligible`.
2. **Adaptive routing.** Start at enrolled-grade entry units; step down the prerequisite graph on failure, up on success (graph-adaptive, not IRT-pure — the prerequisite edges *are* the adaptive structure). Stop per subject-domain when the working level is bracketed with acceptable confidence, or on a time cap per sitting (multiple short sittings, band-appropriate).
3. **PreK–2 mode.** Oral/manipulative checklists administered by the teacher, captured on the teacher console (low-screen policy holds even for baselining).
4. **Outputs.**
   - `BaselineResult` per subject: working-level unit + ordered `gapUnitIds[]` (units below working level not yet secure).
   - **Personalized Plan**: a projected sequence of units per subject with estimated hours (from `estHours`), gap-remediation units front-loaded, parallel-unit lanes computed from the graph, and a projected pace ("some students spend more time in Concept Blocks; some pick speed and bank PATH time").
   - **Learning Gap Report** (parent asset) + teacher/coach view in Learning Map.
5. **Also in Year 0 scope:** confidence & interest survey (feeds `InterestProfile` and PATH recommendation) and the teacher skills map (School AI side).
6. **Re-baselining.** Compass Reviews (periodic mixed assessments) continuously re-estimate working level; a full re-baseline is only triggered on anomalies (e.g., long absence, transfer).

---

## 7. Mastery + Retention Engine (the 90% / 1-3-7 state machine)

Per `(student, unit)`:

```
 LOCKED ──prereqs provisionally mastered──▶ READY
 READY ──planner schedules──▶ INSTRUCTION (AI-first exposure, concept nodes in seq)
 INSTRUCTION ──all nodes exposed + checks ok──▶ PRACTICE (ladder L1..Ln, adaptive)
 PRACTICE ──ladder criteria met──▶ SUMMATION_DUE
 SUMMATION_DUE ──AI-free proof ≥90%──▶ PROVISIONAL_MASTERY   (else → PRACTICE with targeted remediation)
 PROVISIONAL_MASTERY:
     • unlocks dependent units immediately (progress is never blocked on retention)
     • schedules RetentionChecks at D+1 (light retrieval), D+3 (revision set), D+7 (reiteration + transfer items)
 all retention checks passed ──▶ CONFIRMED_MASTERY
     • enters longitudinal pool: probes at ~D+21 and ~D+60 inside Compass Reviews / warm-ups
 any retention/longitudinal failure ──▶ REFRESH_NEEDED
     • targeted micro-loop (re-explain weak nodes + short practice + re-check)
     • dependents are NOT re-locked; a flag is raised if the same unit decays twice
```

**Rules.**
- 90% is the gate on the summation instrument defined by the unit's `Mastery_Proof` column (written check, oral teach-back, construction within tolerance, board-format problems, etc.). Where the proof is oral/physical, the teacher records the outcome on the console — the gate is still data.
- Retention thresholds default to ≥80% on D+3/D+7 sets (configurable per band/subject); D+1 is formative (feeds planner, never blocks).
- The 1-3-7 cadence follows the PlayBook example (taught Monday → revised Thursday → reiterated next Monday); the scheduler snaps offsets to the student's actual timetable slots for that subject.
- "No proof, no mastery" — every state transition carries evidence pointers; fake-mastery detection (anomaly patterns: speed, hint abuse, answer similarity) raises integrity flags for teacher review.

**Parallel units.** Always parallel across subjects (each subject has its own active lane per the timetable). Within a subject, the planner may open a second active unit when the graph allows (independent branch, e.g., a Geometry unit alongside a Number unit) and WIP limits permit (default: max 2 active units/subject for Grades 3+, 1 for PreK–2). Retention tails of previously passed units always run in parallel with new instruction — this is the normal state of the system, not an exception.

---

## 8. Session Planner (the "next session is planned from every interaction" engine)

The planner is the beating heart of Student AI. After **every** interaction event (and at minimum after every block), it recomputes the student's next session.

**Inputs:** timetable slot (subject, duration, band SOP), `StudentUnitState`s + retention queue, last-session telemetry (errors, misconceptions, hint usage, confidence tick), flags, modality (device vs print pack), teacher overrides.

**Output:** a `SessionPlan` shaped to the 60-minute Concept Block SOP:

| SOP segment | Planner fills it with |
|---|---|
| 3 min — settle + launch | School-AI-prepared note: today's goal, yesterday's win, 1-item warm-up retrieval (often a D+1 check) |
| 20 min — mastery-progression block | Instruction for the next `ConceptNode`(s) in the active unit, in the subject's interaction style, through the child's interest doorway; embedded comprehension checks |
| 5 min — Q time / movement reset | Prompted; observation only |
| 25 min — guided practice | Interleaved set: today's nodes + due D+3/D+7 retention items + ladder progression; individual or competency-matched group task; print pack for PreK–2 |
| 7 min — reflection | Summary, confidence check (feedback ticket: 3–5 Qs + confidence), homework, next-session preview; **1-3-7 scheduling commits here**; Learning Map updates |

**Planning policy (tunable per band):** target mix ≈ 60% new instruction / 30% retention + mixed practice / 10% summation; a due summation or an at-risk retention check preempts new instruction; if the student is flagged stuck, the planner swaps in remediation and notifies the teacher console ("support Dhairye at min 12, misconception: borrowing across zeros").

The same planner, with a different template, produces **PATH session plans** (challenge milestones, technique clinics, evidence-capture prompts) and the coach's 15-day check-in agenda.

---

## 9. Tomoe — the student AI companion

Tomoe is the child-facing personality of Student AI, present in Concept Blocks (instruction, hints, explanations) and PATH work (planning, critique, rehearsal) under strict boundaries.

- **Pedagogy:** Socratic; explains why answers are right/wrong; gives hints and strategies, never final answers during practice; "think first, then ask" framing (Bloomy's rule, kept).
- **Subject styles** per PlayBook (§4.1 table) — the persona, prompt template, and interaction pattern are per-subject assets in the content registry, versioned and approved.
- **Doorways:** uses `InterestProfile` to introduce concepts through the child's interests (AI-doorway-first from Grade 4–5), then hands to the canonical treatment. Explicitly *not* "learning styles" — locked vocabulary rule from Research sheet: that phrase never appears anywhere.
- **Hard boundaries:**
  - Disabled during summation and retention *scoring* items (AI-free mastery proof).
  - PATH authorship rules per PATH workbook: AI supports, never ghost-creates; every PATH artifact carries an AI-use disclosure; process history is evidence.
  - Age gates: coach-facing only K–2; supervised/limited 3–5; disclosed tutor use 6–8; process-logged 9–10; professional-with-disclosure 11–12.
  - Never diagnoses (health, injury, "talent"), never sets athletic loads, never decides progression — recommends only; humans approve.
- **Memory:** multi-year student memory (mastery history, interests, effective explanations, coach goals) with privacy scoping; memory is part of the Student AI profile, not the model.
- **Safety rail:** all Tomoe outputs logged; sampled + flagged outputs reviewed; content generation pipeline (School AI) is where creativity lives — runtime Tomoe operates within approved scripts + bounded improvisation.

---

## 10. Guided Practice + Summation engines

**Guided Practice engine.** Three levels per unit (scaffolded / standard / extension) with answer keys; adaptive ladder L1–L6 inside the digital experience; benchmarked "against the top 5% national benchmark" for extension ceilings; group-task variants for competency-matched collaboration. Elementary: named printed packs → barcode print/scan pipeline → OCR-assisted capture → results in Learning Map within 48h. Teacher approves question sets and levels; acceptance-without-rework is the quality metric.

**Summation engine.** Generates/serves AI-free proof instruments per unit `Mastery_Proof` spec; proctoring modes: on-device locked mode, paper (scan), oral/performance (teacher-recorded rubric). Board-format sets for Grades 9–12 (ICSE/ISC refs carried on each unit). Scoring: auto where objective, teacher-confirmed where rubric-based. Emits `PROVISIONAL_MASTERY` events → currency, unlocks, retention scheduling.

---

## 11. PATH Engine

Implements the 9-step navigation flow as a workflow engine:

1. **Profile** — from Student AI (interests, prior work, stage, tool access, support needs, coach observations).
2. **Taste** — curated menu (demos, prior student work, trials, expert talks) rendered from the PATH domain catalog (seeded from the six PATH sheets: 10 domains each with modality tags and evidence-of-progression definitions).
3. **Recommend** — scoring over interest × recent evidence × prerequisite skills × modality availability × coach capacity × safety → exactly **3 options**; coach approves before the student sees them.
4. **Choose + Commit** — 12-week commitment object: milestones, material limits, team responsibilities.
5. **Route** — decision tree to lane: home studio (M0/M1) / expert-supported (remote clinic) / specialist facility (M2) / external (M3) / sport-gated (M4). Athlete uses `AthleteGate`, never academic grade.
6. **Work** — personalized brief/difficulty inside a peer studio; Tomoe supports within AI boundaries.
7. **Evidence capture** — portfolio items across the 6 evidence types → Student 360.
8. **Midpoint (wk 6)** — adjust challenge/support/role; no casual switching.
9. **Gate (wk 12)** — evidence review against the 6 dimensions → one of **Deepen / Broaden / Connect / Move / Switch** (the student must always be able to see which). Stage transitions (Sample→Specialise→Master) require coach approval; Athlete stage caps by grade band enforced in code.

**Reporting rule (enforced in the schema):** PATH is never rendered as a single percentage or rank. Reports = current stage + evidence profile + strong-work examples + next-step decision + coach narrative.

Band time allocation from the day model: Elementary 3h/day (all six), Middle 2h (choose 3 commitments/yr), High 1h (primary + secondary).

---

## 12. Motivation Engine

Bloomy-proven mechanics, Tomo-tuned. All parameters live in config, reviewed by teacher + coach ("review reward patterns" is a named human-review rule).

**Earn (defaults, per band-tuned table):**

| Event | Coins |
|---|---|
| Instruction check correct | +1 |
| Practice item correct (first try) | +2 |
| Summation passed (provisional mastery) | +10 |
| **D+3 retention passed** | +3 |
| **D+7 retention passed (unit → confirmed)** | +5 |
| Daily streak maintained | +bonus (escalating, capped) |
| Weekly goal completed | +bonus |
| PATH milestone accepted by coach | +bonus |

**Goals.** Daily: complete today's instruction, complete practice, clear due retention checks, earn N coins. Weekly: confirm N units, keep streak, PATH milestone. Rendered exactly like Bloomy's sidebar goals.

**Spend.**
- **Rewards store**: school-level catalog + parent-added items; redemption queue with parent/school approval; permissions panel (mirrors Bloomy's Redemption Queue / Store Catalog / Prices / Permissions).
- **PATH-time credits**: the strategic reward — finishing Concept mastery efficiently banks extra PATH time ("do mastery quick and get more time for PATHs"). Credits are minutes, scheduled by the timetable engine into the child's week, coach-visible.

**Guardrails.** No leaderboards, no class ranks, no public comparison (locked rule). Coins never purchase progression. Anti-gaming: no coins on items where hints were used to terminal step; velocity anomaly detection; retention failures claw back nothing (never punish) but pause streak-multipliers. Streak definition = "one meaningful mastery action per school day" with sickness/holiday freezes (coach-grantable), to build consistency without anxiety.

---

## 13. Learning Map (the action layer)

- **Student view:** per-subject mastery strip (unit states: Locked / Ready / In-progress / Provisional / Confirmed / Refresh-needed), working level vs enrolled grade, retention health, time-in-block trends — the Tomo equivalent of Bloomy's domain × grade heatmap, but state-machine-true.
- **Class view (teacher):** live block heatmap; misconception clusters; "support next" ranked list (School AI insight); intervention log with owners and closure.
- **Grade/campus view (leadership):** mastery velocity, retention pass rates, fidelity metrics (SOP adherence, feedback-ticket submission ≥90%), PATH evidence coverage, PlayBook success metrics as first-class KPIs.
- **Parent projection:** curated only — strengths, one gap, what the teacher is doing, what the coach is doing, next steps. Never raw flags. Generated as narratives, coach-approved.

---

## 14. School AI Studio (content + operations backbone)

1. **Curriculum ingestion.** Importers parse the three source workbooks into the graph (this is build task #1 — the spreadsheets are the seed data). Versioned unit library = reusable asset for the next campus.
2. **Content pipeline.** Generators (lesson plans on the 60-min SOP template; instruction scripts per subject style; guided-practice 3-level sets; summation forms; retention item sets) → human review queue (Academic Head) → approve/edit/reject → versioned publish → audit trail. Zero unreviewed content ever reaches a child (success metric, verbatim).
3. **Timetable engine.** Builds the steady-state day (Concept/PATH/fitness/lunch by band; coach slots; intervention slots; PATH-time credit placement); version history; principal approves logic.
4. **Print/scan workflow.** Barcode-named packs → scan station → OCR-assist → student linkage ≥95% accuracy → Learning Map within 48h; error queue owned by scanning lead.
5. **Teacher insight service.** Crunches live telemetry into "which teachers/guides should support which students during the block" — the defining School AI job in the PlayBook.
6. **Admin.** SIS basics (import from existing software audit), attendance, calendars, comms hooks (weekly parent update templates), multi-campus tenancy from day one (Y1-Q4 goal: repeatable deployment).

---

## 15. AI platform layer

- **AI Gateway:** single service brokering all model calls (Anthropic API primary); per-use-case routing (tutor turn / content gen / insight summarization / scan OCR assist); token + cost metering per school; PII redaction on egress.
- **Prompt & persona registry:** versioned prompts per subject/band/use-case; changes flow through the same approval + audit pipeline as content.
- **Evaluation harness:** golden-set evals for tutor pedagogy (never-give-answer compliance, hint quality), content generation accuracy vs unit specs, misconception-flag precision; run pre-release and on model upgrades.
- **Guardrails:** age filters, refusal policies, assessment-mode lockout, PATH authorship disclosure injection, jailbreak monitoring; all child-facing outputs logged to `AuditLog`.
- **Data boundary:** no child PII in prompts beyond pedagogic necessity; DPDP-aligned consent records; parent-visible AI policy.

---

## 16. Non-functional requirements

| Concern | Requirement |
|---|---|
| Offline/degraded | Classroom mode tolerates Wi-Fi loss (local queue + sync); print fallback is a first-class flow, "a fallback session is not a failure" |
| Latency | Tutor turn < 2s perceived (streaming); planner recompute async, plan pre-generated before block start |
| Privacy | India DPDP; children's data minimization; parent consent; no raw dashboards to parents; role-scoped access |
| Auditability | Every AI artifact: version, reviewer, date; every mastery transition: evidence pointer |
| Multilingual | English + Hindi at launch (second language per curriculum); content assets carry language variants |
| Scale | Single school (~all grades) Y1 → multi-campus tenancy Y2; unit library and workflows reusable |
| Integrity | AI-free summation enforcement, anomaly detection, honest-data culture ("fake mastery data destroys the whole system") |

---

## 17. Suggested repo structure (for Claude Code)

```
tomo-school/
├── CLAUDE.md                     # working agreement for Claude Code (derive from this doc)
├── docs/
│   ├── TOMO_SCHOOL_ARCHITECTURE.md   # this file
│   ├── engines/                      # one deep spec per engine as it's built
│   └── decisions/                    # ADRs
├── seed/
│   ├── concept_block.xlsx        # curriculum graph source
│   ├── path_blocks.xlsm          # PATH taxonomy source
│   └── playbook.xlsx             # KPI + SOP source
├── packages/
│   ├── domain/                   # shared types, zod schemas, state machines
│   ├── curriculum-graph/         # graph model + importers + queries
│   ├── mastery-engine/           # §7 state machine + retention scheduler
│   ├── session-planner/          # §8
│   ├── motivation/               # §12 ledger, goals, streaks
│   └── ui/                       # design system (student/teacher/parent themes)
├── services/
│   ├── api/                      # core REST/RPC API (auth, org, student model)
│   ├── ai-gateway/               # §15
│   ├── content-pipeline/         # §14.2 generation + approval workflow
│   ├── insight/                  # teacher-support + learning-map aggregation
│   └── scan/                     # print/scan OCR pipeline
├── apps/
│   ├── student/                  # student app (web-first, tablet-friendly)
│   ├── teacher/                  # teacher console
│   ├── coach/                    # coach dashboard
│   ├── parent/                   # parent app
│   └── studio/                   # School AI studio + admin
└── infra/                        # IaC, CI, seed scripts
```

**Stack recommendation (pragmatic, replaceable):** TypeScript monorepo (pnpm + Turborepo); Next.js apps; NestJS or tRPC API; PostgreSQL (+ Prisma) with the prerequisite graph as an edge table (add a graph lib only if traversals demand it); Redis for queues/scheduling (retention checks, planner jobs); S3-compatible storage for evidence/scans; event bus (outbox → NATS or Redis streams) for `InteractionEvent` fan-out; Anthropic API via ai-gateway. Everything multi-tenant by `campusId` from the first migration.

---

## 18. Build phases (mapped to the PlayBook timeline)

| Phase | Scope | PlayBook alignment |
|---|---|---|
| **P0 — Foundations** | Monorepo, auth/org/tenancy, domain package, **curriculum importers** (all 3 workbooks → graph in DB), unit library browser in Studio | Y0 Oct–Nov: audit + data cleanup + School AI setup plan |
| **P1 — Baseline** | Item bank tagging, adaptive baseline runner (digital + teacher-administered mode), BaselineResult + personalized plan generation, **Learning Gap Report** | Y0 Dec: "Baseline analysis identifies learning gaps and sets each child on their own mastery path" |
| **P2 — Concept Block loop** | Session Planner v1, Tomoe tutor v1 (Math + Science first), guided-practice engine + print/scan, summation engine, **mastery/retention state machine with 1-3-7 scheduler**, feedback tickets, teacher console live view | Y0 Dec pilot: Grades 6–8, Math + Science, 4 teachers; fidelity + fallback mandatory |
| **P3 — Learning Map + Studio** | Class heatmaps, action lists, intervention tracking; content pipeline with approval + audit trail; lesson-plan generator; training sandbox | Y0 Jan–Mar: test + validate, train all teachers |
| **P4 — Motivation + PATH** | Currency ledger, goals, streaks, store + redemption queue, PATH-time credits; PATH engine (profile→gate workflow), portfolio, coach dashboard | Y1 Apr onward: full model live; "solve for student motivation"; PATH timetable |
| **P5 — Parent + Scale** | Parent app (curated narratives, approvals, referrals), leadership dashboards, multi-campus tooling, deployment playbook automation | Y1 Q2–Q4: parent portal v1, Learning Map v2, repeatability |

Each phase should end with the PlayBook's own success metric wired into the campus dashboard (e.g., P2: "80% of students progress on their mastery path per block"; P3: "zero unreviewed content reaches a child"; P4: "students stay engaged on their own path"; feedback tickets ≥90% submission).

---

## 19. Open product decisions (flagged before build)

1. **Within-subject parallelism policy** — default WIP limit of 2 proposed here; confirm per band and per subject (Math branches well; Hindi may not).
2. **Retention thresholds & consequences** — 80% D+3/D+7 proposed; confirm whether two consecutive decays should soft-lock new instruction in that subject or only flag.
3. **Currency ↔ PATH-time exchange rate** and weekly caps — needs coach-led modeling to avoid rushing behavior on summations.
4. **Summation proctoring for oral/physical proofs at scale** — teacher-recorded rubric capacity math at 1:many during blocks.
5. **High-school rollout scope** — PlayBook marks "full K-12 or phases (avoid board years?)" as an open founder decision; architecture supports either (band-scoped feature flags).
6. **NIOS acceleration flow** — where a child significantly exceeds grade level, the parent-facing accelerated-options workflow needs its own spec.
7. **Regional language tab** — known curriculum gap; schema supports additional language subjects without migration.

---

*Sources: Concept_Block.xlsx (Tomo ICSE Concept-Block Map v1, Jul 15 2026), PATH_Blocks.xlsm (Tomo PATH Blocks Personalized Progression v2), PlayBook.xlsx (Thesis, Y0+Y1 Plan, Ops, Academic, Product, Communication, Research), Bloomy product screenshots (Jul 2026).*

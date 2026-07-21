/**
 * Curriculum importer — build task #1 (TOMO_SCHOOL_ARCHITECTURE §14.1).
 *
 * Parses seed/concept_block.xlsx into the Curriculum Graph JSON consumed by the
 * app: Subjects, Units (with concept nodes, delivery codes, mastery-proof spec,
 * prereqs, board refs, est hours) and PrereqEdges (the structure that enables
 * cross-grade + parallel units).
 *
 * Output: src/data/curriculum.json  (committed as shipped seed — no DB needed).
 *
 * Run: npm run import:curriculum
 */
import XLSX from "xlsx";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "seed", "concept_block.xlsx");
const OUT = join(ROOT, "src", "data", "curriculum.json");

if (!existsSync(SRC)) {
  console.error(`\n  Missing seed workbook: ${SRC}`);
  console.error("  Place the ICSE Concept-Block workbook there and re-run.\n");
  process.exit(1);
}

/** Sheet name -> subject definition. aiInteractionStyle per §4.1 PlayBook table. */
const SUBJECT_SHEETS = [
  { sheet: "Mathematics",    key: "math",     name: "Mathematics",   aiInteractionStyle: "intro-questions-responses" },
  { sheet: "English",        key: "english",  name: "English",       aiInteractionStyle: "conversational-phonics-reading" },
  { sheet: "Hindi",          key: "hindi",    name: "Hindi",         aiInteractionStyle: "conversational-phonics-reading" },
  { sheet: "Science 1-8",    key: "science",  name: "Science",       aiInteractionStyle: "experiment-simulation" },
  { sheet: "PCB 9-12",       key: "pcb",      name: "Science (PCB)", aiInteractionStyle: "experiment-simulation" },
  { sheet: "Social Studies", key: "social",   name: "Social Studies", aiInteractionStyle: "story-narrative" },
  { sheet: "Computer",       key: "computer", name: "Computer",      aiInteractionStyle: "intro-questions-responses" },
];

/** Streams that restart Unit_No within a grade (PCB). */
const STREAMS = [
  { code: "PHY", re: /^physics\b/i, hint: /\b(phy|physics)\b/i },
  { code: "CHE", re: /^chemistry\b/i, hint: /\b(che|chem|chemistry)\b/i },
  { code: "BIO", re: /^biology\b/i, hint: /\b(bio|biology)\b/i },
];

/**
 * Fallback legend. The authoritative one is parsed from the workbook README
 * ("Delivery codes" row) so the app always reflects the curriculum team's own
 * definitions rather than our guesses.
 */
const FALLBACK_LEGEND = {
  T: "teacher-first",
  A: "AI-doorway-first",
  M: "manipulatives/physical",
  R: "adaptive practice ladder",
  L: "lab/experiment",
  N: "nature/outdoor",
  P: "project",
  O: "oral/discussion/performance",
  U: "unplugged (computer science without screens)",
  C: "computer lab",
};

/** Parse "T = teacher-first · A = AI-doorway-first (…) · M = …" into a legend map. */
function parseLegend(readmeRows) {
  const line = readmeRows
    .map((r) => (Array.isArray(r) ? r.filter(Boolean).join(" ") : ""))
    .find((t) => /(^|\s)T\s*=\s*teacher/i.test(t));
  if (!line) return { legend: { ...FALLBACK_LEGEND }, raw: "" };
  const legend = {};
  for (const part of line.split("·")) {
    const m = part.match(/^\s*([A-Z])\s*=\s*(.+?)\s*$/);
    if (m) legend[m[1]] = m[2];
  }
  return { legend: Object.keys(legend).length ? legend : { ...FALLBACK_LEGEND }, raw: line };
}

/** Pull the narrative notes the curriculum team wrote, for provenance display. */
function parseNotes(readmeRows) {
  const text = (i) => (Array.isArray(readmeRows[i]) ? readmeRows[i].filter(Boolean).join(" ").trim() : "");
  const find = (re) => {
    for (const r of readmeRows) {
      const t = Array.isArray(r) ? r.filter(Boolean).join(" ").trim() : "";
      if (re.test(t)) return t;
    }
    return "";
  };
  return {
    title: text(0),
    purpose: find(/^Every subject, Grades 1-12/i),
    howToRead: find(/^One row = one unit/i),
    designRule: find(/^Design rule:/i),
    sourcing: find(/^Grades 9-10: unit names follow/i),
    version: find(/^Version:/i),
    scopeDecisions: readmeRows
      .map((r) => (Array.isArray(r) ? r.filter(Boolean).join(" ").trim() : ""))
      .filter((t) => /^\d+\.\s/.test(t)),
  };
}

const clean = (v) => (v === undefined || v === null ? "" : String(v).trim());
const slug = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function streamOf(title) {
  for (const s of STREAMS) if (s.re.test(title)) return s.code;
  return null;
}

function unitId(subjectKey, grade, stream, unitNo) {
  return stream
    ? `${subjectKey}-g${grade}-${stream.toLowerCase()}-u${unitNo}`
    : `${subjectKey}-g${grade}-u${unitNo}`;
}

/** Parse "M+T+O, low-screen; counters" -> { codes:["M","T","O"], note:"low-screen; counters" } */
function parseDelivery(raw, legend) {
  const s = clean(raw);
  if (!s) return { codes: [], note: "" };
  const firstSeg = s.split(/[,;]/)[0].trim();
  const codes = firstSeg.split("+").map((c) => c.trim().toUpperCase()).filter((c) => legend[c]);
  const note = s.slice(firstSeg.length).replace(/^[,;\s]+/, "").trim();
  return { codes: [...new Set(codes)], note };
}

/**
 * Parse unit references out of Prerequisites / Unlocks free text.
 * Handles: "G3 U2; G4 U1", "G9 Phy U2", "G8 Science (Measurement)", "None".
 * Returns array of { grade, stream|null, unitNo|null, raw }.
 */
function parseRefs(raw) {
  const s = clean(raw);
  if (!s || /^none$/i.test(s)) return [];
  const refs = [];
  const re = /G\s*(\d+)\s*(phy|physics|che|chem|chemistry|bio|biology)?\.?\s*U\.?\s*(\d+)/gi;
  let m;
  while ((m = re.exec(s)) !== null) {
    let stream = null;
    if (m[2]) {
      const h = m[2].toLowerCase();
      stream = h.startsWith("phy") ? "PHY" : h.startsWith("che") || h.startsWith("chem") ? "CHE" : "BIO";
    }
    refs.push({ grade: Number(m[1]), stream, unitNo: Number(m[3]), raw: m[0].trim() });
  }
  return refs;
}

function main() {
  const wb = XLSX.readFile(SRC);

  // Authoritative delivery-code legend + provenance notes come from the workbook.
  const readmeRows = wb.Sheets["README"]
    ? XLSX.utils.sheet_to_json(wb.Sheets["README"], { header: 1, defval: "" })
    : [];
  const { legend: CODE_LEGEND, raw: legendRaw } = parseLegend(readmeRows);
  const notes = parseNotes(readmeRows);
  console.log(`  legend: ${Object.keys(CODE_LEGEND).sort().join("")} (${legendRaw ? "from README" : "fallback"})`);

  const subjects = [];
  const units = [];
  const edges = [];
  // index for resolving refs: subjectKey -> `${grade}:${stream||''}:${unitNo}` -> unitId
  const index = new Map();

  for (const subj of SUBJECT_SHEETS) {
    const ws = wb.Sheets[subj.sheet];
    if (!ws) { console.warn(`  ! sheet not found: ${subj.sheet}`); continue; }
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const headerRow = rows.findIndex((r) => Array.isArray(r) && r.includes("Grade") && r.includes("Unit_No"));
    if (headerRow < 0) { console.warn(`  ! header not found in ${subj.sheet}`); continue; }
    const head = rows[headerRow].map(clean);
    const col = (n) => head.indexOf(n);
    const c = {
      grade: col("Grade"), unitNo: col("Unit_No"), unit: col("Unit"),
      blocks: col("Concept_Blocks"), prereq: col("Prerequisites"), delivery: col("Delivery"),
      practice: col("Practice"), proof: col("Mastery_Proof"), unlocks: col("Unlocks"),
      pathLock: col("Path_Lock"), scholar: col("Scholar_Depth"), board: col("Board_Ref"), hours: col("Est_Hours"),
    };

    const codeSet = new Set();
    let count = 0;
    const subjIndex = new Map();
    index.set(subj.key, subjIndex);

    for (let i = headerRow + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || clean(r[c.grade]) === "" || clean(r[c.unit]) === "") continue;
      const grade = Number(r[c.grade]);
      if (!Number.isFinite(grade)) continue;
      const unitNo = Number(r[c.unitNo]) || count + 1;
      const title = clean(r[c.unit]);
      const stream = streamOf(title);
      const id = unitId(subj.key, grade, stream, unitNo);

      const delivery = parseDelivery(r[c.delivery], CODE_LEGEND);
      delivery.codes.forEach((cd) => codeSet.add(cd));

      const conceptNodes = clean(r[c.blocks])
        .split("|").map((t) => t.trim()).filter(Boolean)
        .map((t, seq) => ({ id: `${id}-n${seq + 1}`, seq: seq + 1, title: t }));

      const estHours = Number(String(r[c.hours]).replace(/[^\d.]/g, "")) || null;

      units.push({
        id, subjectKey: subj.key, grade, unitNo, stream,
        title,
        conceptNodes,
        deliveryCodes: delivery.codes,
        deliveryNote: delivery.note,
        practiceSpec: clean(r[c.practice]),
        masteryProofSpec: clean(r[c.proof]),   // AI-free proof instrument
        pathLockCriteria: clean(r[c.pathLock]),
        scholarDepthSpec: clean(r[c.scholar]),
        boardRef: clean(r[c.board]),
        estHours,
        prereqRaw: clean(r[c.prereq]),
        unlocksRaw: clean(r[c.unlocks]),
      });

      subjIndex.set(`${grade}:${stream || ""}:${unitNo}`, id);
      count++;
    }

    subjects.push({
      key: subj.key, name: subj.name, aiInteractionStyle: subj.aiInteractionStyle,
      unitCount: count, deliveryCodes: [...codeSet].sort(),
    });
    console.log(`  ${subj.name.padEnd(16)} ${String(count).padStart(3)} units`);
  }

  // ---- Resolve edges (prereq + unlocks) now that all units are indexed ----
  const resolve = (subjectKey, ref) => {
    const si = index.get(subjectKey);
    if (!si) return null;
    // Exact (grade + stream + unitNo). Non-stream refs use "" for stream, which
    // matches non-stream units directly.
    const exact = si.get(`${ref.grade}:${ref.stream || ""}:${ref.unitNo}`);
    if (exact) return exact;
    // A stream-less ref in a streamed subject (e.g. PCB "G9 U2") is ambiguous —
    // leave unresolved rather than guessing a stream.
    return null;
  };

  let unresolved = 0;
  const seen = new Set();
  for (const u of units) {
    // prerequisite edges: prereqUnit -> u
    for (const ref of parseRefs(u.prereqRaw)) {
      const from = resolve(u.subjectKey, ref);
      if (from && from !== u.id) {
        const k = `${from}->${u.id}:prerequisite`;
        if (!seen.has(k)) { seen.add(k); edges.push({ from, to: u.id, type: "prerequisite" }); }
      } else if (!from) unresolved++;
    }
    // unlocks edges: u -> unlockedUnit
    for (const ref of parseRefs(u.unlocksRaw)) {
      const to = resolve(u.subjectKey, ref);
      if (to && to !== u.id) {
        const k = `${u.id}->${to}:unlocks`;
        if (!seen.has(k)) { seen.add(k); edges.push({ from: u.id, to, type: "unlocks" }); }
      } else if (!to) unresolved++;
    }
  }

  // Derive a prereq map that is the union of explicit prerequisite edges and the
  // inverse of unlocks edges (both express the same dependency; belt & suspenders).
  const prereqOf = new Map(); // unitId -> Set(prereqUnitId)
  for (const e of edges) {
    const to = e.type === "prerequisite" ? e.to : e.to;
    const from = e.from;
    if (e.type === "prerequisite") {
      if (!prereqOf.has(e.to)) prereqOf.set(e.to, new Set());
      prereqOf.get(e.to).add(e.from);
    } else {
      // unlocks: from unlocks to  => from is prereq of to
      if (!prereqOf.has(e.to)) prereqOf.set(e.to, new Set());
      prereqOf.get(e.to).add(e.from);
    }
    void to; void from;
  }
  for (const u of units) u.prereqUnitIds = [...(prereqOf.get(u.id) || [])];

  // ---- Coverage matrix: units + estimated teaching hours by grade x subject ----
  const grades = [...new Set(units.map((u) => u.grade))].sort((a, b) => a - b);
  const coverage = grades.map((grade) => {
    const bySubject = {};
    for (const s of subjects) {
      const rows = units.filter((u) => u.grade === grade && u.subjectKey === s.key);
      bySubject[s.key] = {
        units: rows.length,
        hours: rows.reduce((sum, u) => sum + (u.estHours ?? 0), 0),
      };
    }
    const totalUnits = Object.values(bySubject).reduce((a, b) => a + b.units, 0);
    const totalHours = Object.values(bySubject).reduce((a, b) => a + b.hours, 0);
    return { grade, bySubject, totalUnits, totalHours };
  });

  const totalHours = units.reduce((sum, u) => sum + (u.estHours ?? 0), 0);

  const out = {
    meta: {
      source: "seed/concept_block.xlsx",
      title: notes.title || "Tomo ICSE Concept-Block Map v1",
      generatedBy: "scripts/import-curriculum.mjs",
      codeLegend: CODE_LEGEND,
      legendRaw,
      notes,
      counts: {
        subjects: subjects.length,
        units: units.length,
        edges: edges.length,
        conceptNodes: units.reduce((a, u) => a + u.conceptNodes.length, 0),
        hours: totalHours,
        grades: grades.length,
      },
    },
    coverage,
    subjects,
    units,
    edges,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n  subjects=${subjects.length} units=${units.length} edges=${edges.length} (unresolved refs=${unresolved})`);
  console.log(`  -> ${OUT}\n`);
}

main();

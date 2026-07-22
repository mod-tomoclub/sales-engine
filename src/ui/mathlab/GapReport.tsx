/** Step 2 — what placement found: the frontier per strand, and the real gaps. */
import { DIAGNOSTIC_BANK } from "../../mathlab/diagnostic";
import type { DiagnosticState, StrandResult } from "../../mathlab/engine";
import { getUnit, prereqsOf, STRAND_META } from "../../mathlab/graph";
import { StatTile } from "../components";

const STATUS: Record<StrandResult["status"], { label: string; color: string }> = {
  gap: { label: "Gap found", color: "var(--bad)" },
  "on-track": { label: "On track", color: "var(--warn)" },
  ahead: { label: "Ready to move up", color: "var(--good)" },
};

export function GapReport({ diag, onNext }: { diag: DiagnosticState; onNext: () => void }) {
  const results = Object.values(diag.frontier) as StrandResult[];
  const wrong = diag.attempts.filter((a) => !a.correct);
  const misconceptions = [...new Set(wrong.map((a) => a.misconception).filter(Boolean))] as string[];
  const gapUnits = [...new Set(results.map((r) => r.gapUnitId).filter(Boolean))] as string[];
  const lowest = results.length ? Math.min(...results.map((r) => r.workingGrade)) : 0;

  return (
    <div className="stack gap-16">
      <div className="grid four-col">
        <StatTile label="Enrolled grade" value={`Grade 4`} sub="CBSE · what the exam covers" />
        <StatTile
          label="Actually working at"
          value={`Grade ${lowest}–3`}
          sub="varies by strand — that is the point"
          accent="var(--warn)"
        />
        <StatTile label="Distinct gaps" value={gapUnits.length} sub="root causes, not symptoms" accent="var(--bad)" />
        <StatTile label="Questions asked" value={diag.attempts.length} sub={`${wrong.length} answered wrong`} />
      </div>

      <div className="card card-pad stack gap-12">
        <h3 style={{ fontSize: 15 }}>Mastery frontier, strand by strand</h3>
        <p className="small muted" style={{ maxWidth: 720 }}>
          One number for "Aarav's maths level" would be a lie. He sits above grade in one strand and two
          years below in another. The frontier is per strand, and the plan is built from it.
        </p>
        <div className="stack gap-8">
          {results.map((r) => {
            const meta = STRAND_META[r.strand];
            const s = STATUS[r.status];
            return (
              <div key={r.strand} className="row gap-12 wrap" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <div className="stack" style={{ minWidth: 190 }}>
                  <strong style={{ fontSize: 14 }}>{meta.label}</strong>
                  <span className="small muted">Working at Grade {r.workingGrade}</span>
                </div>
                <div className="stack grow" style={{ minWidth: 240 }}>
                  <span className="small">
                    <span className="muted">Proven: </span>
                    {r.provenUnitId ? getUnit(r.provenUnitId).title : "nothing yet"}
                  </span>
                  <span className="small">
                    <span className="muted">Real gap: </span>
                    {r.gapUnitId ? (
                      <strong style={{ color: "var(--bad)" }}>{getUnit(r.gapUnitId).title}</strong>
                    ) : (
                      <span style={{ color: "var(--good)" }}>none — ready to move on</span>
                    )}
                  </span>
                </div>
                <span className="chip" style={{ borderColor: s.color, color: s.color, fontWeight: 700 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid two-col">
        <div className="card card-pad stack gap-12">
          <h3 style={{ fontSize: 15 }}>Rule 3 — the gap is not where the failure showed up</h3>
          <p className="small muted">
            Aarav failed four Grade 4 questions. Walking down the prerequisite edges collapses those four
            failures onto just {gapUnits.length} root cause{gapUnits.length === 1 ? "" : "s"}. Teaching the
            Grade 4 unit again would have fixed none of them.
          </p>
          <div className="stack gap-12">
            {gapUnits.map((gid) => {
              const strands = results.filter((r) => r.gapUnitId === gid);
              const u = getUnit(gid);
              return (
                <div key={gid} className="stack gap-8" style={{ background: "var(--bg-sunken)", borderRadius: 12, padding: "12px 14px" }}>
                  <div className="row gap-8 wrap">
                    <strong style={{ fontSize: 14 }}>{u.title}</strong>
                    <span className="chip">Grade {u.board.grade}</span>
                  </div>
                  <span className="small muted">{u.board.chapterRef}</span>
                  <div className="row gap-4 wrap small">
                    <span className="muted">Blocks:</span>
                    {strands.map((s) => (
                      <span key={s.strand} className="chip" style={{ borderColor: STRAND_META[s.strand].color, color: STRAND_META[s.strand].color }}>
                        {STRAND_META[s.strand].label}
                      </span>
                    ))}
                  </div>
                  <div className="small muted">
                    Prerequisites, all proven: {prereqsOf(gid).map((p) => getUnit(p).title).join(", ") || "none"} —
                    which is what makes this the bottom of the chain.
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad stack gap-12">
          <h3 style={{ fontSize: 15 }}>What his wrong answers actually revealed</h3>
          <p className="small muted">
            Every distractor carries a misconception tag, so a wrong answer is diagnostic rather than
            just a lost mark. These tags are what make re-teaching targeted.
          </p>
          <div className="stack gap-8">
            {misconceptions.map((m) => {
              const example = wrong.find((a) => a.misconception === m);
              const q = DIAGNOSTIC_BANK.find((x) => x.id === example?.questionId);
              return (
                <div key={m} className="stack gap-4" style={{ borderLeft: "3px solid var(--bad)", paddingLeft: 12 }}>
                  <strong className="small">{m}</strong>
                  {q && <span className="small muted">on: {q.prompt}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button className="btn" style={{ alignSelf: "flex-start" }} onClick={onNext}>
        Build the study plan →
      </button>
    </div>
  );
}

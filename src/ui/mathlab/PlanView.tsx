/** Step 3 — the study plan: two parallel tracks, 60/40, on 20-day windows. */
import {
  CHECKPOINTS,
  deferredUnits,
  scheduleRevisions,
  TWENTY_DAY_WINDOW,
  type DiagnosticState,
  type PlanEntry,
} from "../../mathlab/engine";
import { getUnit, STRAND_META } from "../../mathlab/graph";
import { AARAV } from "../../mathlab/student";
import type { Track } from "../../mathlab/types";

const TRACK: Record<Track, { label: string; color: string; note: string }> = {
  repair: { label: "Repair", color: "var(--bad)", note: "diagnosed gap" },
  bridge: { label: "Bridge", color: "var(--warn)", note: "on the path, not the gap" },
  core: { label: "Core", color: "var(--good)", note: `Grade ${AARAV.grade}` },
};

function Gantt({ entry }: { entry: PlanEntry }) {
  const horizon = 46;
  const left = (entry.startDay / horizon) * 100;
  const width = (TWENTY_DAY_WINDOW / horizon) * 100;
  const revisions = scheduleRevisions(entry.unitId, entry.deadlineDay - 4);
  return (
    <div style={{ position: "relative", height: 34, background: "var(--bg-sunken)", borderRadius: 8 }}>
      <div
        style={{
          position: "absolute", left: `${left}%`, width: `${width}%`, top: 6, height: 22,
          background: TRACK[entry.track].color, opacity: 0.18, borderRadius: 6,
          border: `1px solid ${TRACK[entry.track].color}`,
        }}
      />
      {CHECKPOINTS.map((c) => (
        <div
          key={c.day}
          title={`Day ${c.day} checkpoint — ${c.rule}`}
          style={{
            position: "absolute", left: `${((entry.startDay + c.day) / horizon) * 100}%`,
            top: 4, width: 2, height: 26, background: "var(--ink-3)",
          }}
        />
      ))}
      {revisions.map((r) => (
        <div
          key={r.stage}
          title={`1-3-7 revision, stage D+${r.stage} (day ${r.dueDay})`}
          style={{
            position: "absolute", left: `${(r.dueDay / horizon) * 100}%`, top: 11,
            width: 12, height: 12, marginLeft: -6, borderRadius: 999,
            background: "var(--bg-elev)", border: "2px solid var(--accent)",
          }}
        />
      ))}
      <span className="small mono muted" style={{ position: "absolute", right: 8, top: 8 }}>
        day {entry.startDay}–{entry.deadlineDay}
      </span>
    </div>
  );
}

export function PlanView({ plan, diag, onNext }: { plan: PlanEntry[]; diag: DiagnosticState; onNext: () => void }) {
  const repairShare = plan.filter((p) => p.track !== "core").reduce((a, p) => a + p.sharePct, 0);
  const coreShare = plan.filter((p) => p.track === "core").reduce((a, p) => a + p.sharePct, 0);
  const deferred = deferredUnits(plan, AARAV.grade);
  void diag;

  return (
    <div className="stack gap-16">
      <div className="card card-pad stack gap-12">
        <h3 style={{ fontSize: 15 }}>Rule 3 — remediation is a parallel track, not a demotion</h3>
        <p className="small muted" style={{ maxWidth: 780 }}>
          Aarav is not sent back to Grade 3. His session time splits roughly 60 / 40: Grade 4 work runs
          from day one, while the repair track quietly closes the chain underneath it. The moment a gap
          unit is proven, its dependents unlock and the freed time flows into going deeper.
        </p>
        <div className="row" style={{ height: 34, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div className="row" style={{ width: `${coreShare}%`, background: "var(--good-soft)", justifyContent: "center", borderRight: "1px solid var(--line)" }}>
            <span className="small" style={{ fontWeight: 700, color: "var(--good)" }}>{coreShare}% Grade 4 core</span>
          </div>
          <div className="row" style={{ width: `${repairShare}%`, background: "var(--bad-soft)", justifyContent: "center" }}>
            <span className="small" style={{ fontWeight: 700, color: "var(--bad)" }}>{repairShare}% repair</span>
          </div>
        </div>
      </div>

      <div className="stack gap-12">
        {plan.map((entry) => {
          const u = getUnit(entry.unitId);
          const t = TRACK[entry.track];
          const meta = STRAND_META[u.strand];
          return (
            <div key={entry.unitId} className="card card-pad stack gap-12">
              <div className="row gap-12 wrap" style={{ justifyContent: "space-between" }}>
                <div className="row gap-12">
                  <div
                    className="row"
                    style={{
                      width: 32, height: 32, borderRadius: 999, justifyContent: "center",
                      background: t.color, color: "#fff", fontWeight: 750, flex: "0 0 auto",
                    }}
                  >
                    {entry.order + 1}
                  </div>
                  <div className="stack">
                    <strong style={{ fontSize: 15 }}>{u.title}</strong>
                    <span className="small muted">{u.board.chapterRef}</span>
                  </div>
                </div>
                <div className="row gap-8 wrap">
                  <span className="chip" style={{ borderColor: meta.color, color: meta.color }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="chip" style={{ background: t.color, color: "#fff", borderColor: t.color }}>
                    {t.label} · {t.note}
                  </span>
                  <span className="chip mono">{entry.sharePct}% of session</span>
                </div>
              </div>

              <p className="small" style={{ color: "var(--ink-2)" }}>{entry.reason}</p>
              <Gantt entry={entry} />
              <div className="row gap-16 wrap small muted">
                <span>│ Day 7 and Day 14 pacing checkpoints</span>
                <span>◯ 1-3-7 revision events</span>
                <span>{u.microConcepts.length} micro-concepts</span>
                {entry.unlocks.length > 0 && (
                  <span>Unlocks: {entry.unlocks.map((x) => getUnit(x).title).join(", ")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid two-col">
        <div className="card card-pad stack gap-8">
          <h3 style={{ fontSize: 15 }}>Rule 4 — the 1-3-7 revision chain</h3>
          <p className="small muted">
            The moment a unit is mastered on day D, three events are enqueued: D+1, D+3 and D+7. Each is a
            short mixed quiz over the unit's micro-concepts plus one or two interleaved questions from
            older related units. Pass and advance; score under 70% and the missed micro-concepts flip to
            <em> decayed</em>, targeted practice is inserted, and the chain restarts for those concepts only.
          </p>
          <p className="small muted">
            This is why a 90% mastery check alone never counts as mastery — a hot streak in one sitting is
            not evidence. Mastery is delayed evidence, by construction.
          </p>
        </div>
        <div className="card card-pad stack gap-8">
          <h3 style={{ fontSize: 15 }}>Rule 5 — the 20-day window</h3>
          <p className="small muted">
            Each unit's clock starts when teaching starts, and the deadline is 20 days later. Two
            checkpoints keep Day 20 from being a surprise: by Day 7 about 40% of micro-concepts should be
            at <em>practiced</em>, and by Day 14 the first mastery check should have been attempted. Miss
            either and a teacher alert is raised.
          </p>
          <p className="small muted">
            If the deadline passes without mastery, the unit is flagged for intervention and a scaffold
            plan is auto-generated. The teacher decides extend or park-and-revisit. Nothing floats silently.
          </p>
        </div>
      </div>

      {deferred.length > 0 && (
        <div className="card card-pad stack gap-8">
          <h3 style={{ fontSize: 15 }}>Deliberately not in this plan yet</h3>
          <p className="small muted">
            These Grade 4 units sit directly behind the five above. They are not blocked by Aarav's grade —
            only by prerequisites still on his plan. They unlock by Rule 2 the moment those clear.
          </p>
          <div className="row gap-8 wrap">
            {deferred.map((id) => (
              <span key={id} className="chip">{getUnit(id).title}</span>
            ))}
          </div>
        </div>
      )}

      <button className="btn" style={{ alignSelf: "flex-start" }} onClick={onNext}>
        Open a unit →
      </button>
    </div>
  );
}

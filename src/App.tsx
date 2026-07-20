import { useApp, ops, type Persona } from "./state/AppContext";
import { SegmentedControl } from "./ui/components";
import { StudentApp } from "./ui/student/StudentApp";
import { TeacherConsole } from "./ui/teacher/TeacherConsole";
import { LearningMap } from "./ui/map/LearningMap";

const PERSONA_OPTS: { value: Persona; label: string }[] = [
  { value: "student", label: "🎒 Student" },
  { value: "teacher", label: "🧑‍🏫 Teacher" },
  { value: "map", label: "🗺️ Learning Map" },
];

export function App() {
  const app = useApp();
  const { persona, setPersona, state, students, activeStudentId, setActiveStudent } = app;

  return (
    <div data-persona={persona} style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="row gap-12">
            <div className="brand">
              <span className="brand-mark">とも</span>
              <div className="stack" style={{ lineHeight: 1.1 }}>
                <strong style={{ fontSize: 15 }}>Tomo School</strong>
                <span className="small muted">Mastery OS</span>
              </div>
            </div>
          </div>

          <SegmentedControl value={persona} options={PERSONA_OPTS} onChange={setPersona} />

          <div className="row gap-12">
            {persona === "student" && (
              <select
                className="student-select"
                value={activeStudentId}
                onChange={(e) => setActiveStudent(e.target.value)}
                aria-label="Select student"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.avatar}  {s.name} · G{s.grade}
                  </option>
                ))}
              </select>
            )}
            <div className="daybox" title="Simulated school-day clock — advance to see the 1-3-7 retention pipeline come due.">
              <span className="small muted">Day</span>
              <strong className="mono">{state.day}</strong>
              <button className="btn sm secondary" onClick={() => app.setState(ops.advanceDay)}>Next day →</button>
            </div>
            <button className="btn sm ghost" onClick={app.resetDemo} title="Reset demo campus">↺</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {persona === "student" && <StudentApp />}
        {persona === "teacher" && <TeacherConsole />}
        {persona === "map" && <LearningMap />}
      </main>

      {/* Toast layer */}
      <div className="toast-layer">
        {app.toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind} animate-in`}>
            {t.kind === "coin" && <span style={{ color: "var(--coin)" }}>◉</span>}
            {t.kind === "confirm" && <span>✅</span>}
            {t.kind === "unlock" && <span>🔓</span>}
            {t.kind === "flag" && <span>⚑</span>}
            <span>{t.text}</span>
            {typeof t.amount === "number" && <strong className="mono" style={{ marginLeft: "auto" }}>+{t.amount}</strong>}
          </div>
        ))}
      </div>

      <footer className="app-footer">
        <span className="muted small">
          Illustrative build of the Tomo School architecture · {app.graph.meta.counts.units} units ·{" "}
          {app.graph.meta.counts.edges} prerequisite edges · content shown is pipeline-pending, not board-approved
        </span>
      </footer>
    </div>
  );
}

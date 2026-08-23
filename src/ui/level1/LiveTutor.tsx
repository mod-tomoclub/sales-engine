/**
 * Level 1 · Live Tutor — Subtopic 2 "Motion, speed & time" taught by Claude.
 *
 * The student talks (push-to-talk, Web Speech API) or types; the tutor answers
 * out loud (speechSynthesis) and can summon a race manipulative the student
 * plays with. Every tutor turn is structured: tactic, doorway, goals met, and
 * evidence that flows straight into the Student Context Engine (right rail).
 *
 * Rules kept from the scripted block: the tutor leads, never grades, never
 * repeats a failed doorway; the model never decides progression; Check stays
 * AI-free and lives elsewhere.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deriveContext } from "../../level1/engine";
import {
  evidenceFromTurn,
  MOTION_SPEED_TIME,
  type LiveLine,
  type RaceVisual,
  type TutorRequest,
  type TutorResponse,
  type TutorTurn,
} from "../../level1/live-tutor";
import type { ConceptBlockContent, EvidenceRecord } from "../../level1/types";
import { SectionTitle } from "../components";

const BRIEF = MOTION_SPEED_TIME;

/** Minimal content shell so the existing Context Engine derivation can run on live evidence. */
const CONTENT_SHELL: ConceptBlockContent = {
  conceptId: BRIEF.conceptId,
  title: BRIEF.title,
  subtopic: BRIEF.subtopic,
  boardRef: BRIEF.boardRef,
  misconceptions: BRIEF.misconceptions,
  learn: { start: "live", nodes: [] },
  practise: [],
  check: [],
};

interface Session {
  student: string;
  transcript: LiveLine[];
  evidence: EvidenceRecord[];
  seq: number;
  goalsMet: string[];
  visual: RaceVisual | null;
  lastTurn: TutorTurn | null;
  learnComplete: boolean;
  usage: { calls: number; input: number; output: number; cached: number };
}

function freshSession(student: string): Session {
  return { student, transcript: [], evidence: [], seq: 0, goalsMet: [], visual: null, lastTurn: null, learnComplete: false, usage: { calls: 0, input: 0, output: 0, cached: 0 } };
}

/* ------------------------------------------------------------------ */
/* Browser speech helpers                                              */
/* ------------------------------------------------------------------ */

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

function recognitionCtor(): (new () => Recognition) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    voices.find((v) => v.lang === "en-IN" && /female|Veena|Rishi/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang.startsWith("en-GB")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

function speak(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return onEnd?.();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = 0.98;
  u.pitch = 1.05;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

/* ------------------------------------------------------------------ */
/* Main surface                                                        */
/* ------------------------------------------------------------------ */

export function LiveTutor() {
  const [name, setName] = useState("Meera");
  const [s, setS] = useState<Session>(() => freshSession("Meera"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [typed, setTyped] = useState("");
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const started = s.transcript.length > 0;
  const canListen = useMemo(() => recognitionCtor() !== null, []);

  useEffect(() => {
    // Voices load asynchronously in Chrome; warm the list.
    window.speechSynthesis?.getVoices?.();
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [s.transcript.length, interim]);

  const model = useMemo(() => deriveContext(s.student, CONTENT_SHELL, s.evidence), [s.student, s.evidence]);

  /** Send the current session to the tutor and fold its structured turn back in. */
  const askTutor = useCallback(
    async (session: Session) => {
      setBusy(true);
      setError(null);
      const req: TutorRequest = {
        student: { name: session.student, grade: BRIEF.grade },
        brief: BRIEF,
        transcript: session.transcript,
        evidenceSoFar: session.evidence,
        goalsMet: session.goalsMet,
        visual: session.visual,
      };
      try {
        const res = await fetch("/api/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
        const data = (await res.json()) as TutorResponse | { error: string };
        if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : `HTTP ${res.status}`);
        const { turn, usage } = data;
        const { records, seq } = evidenceFromTurn(turn, BRIEF, session.evidence, session.seq);
        const goalsMet = [...new Set([...session.goalsMet, ...turn.goalsMet.filter((g) => BRIEF.goals.some((x) => x.id === g))])];
        const next: Session = {
          ...session,
          transcript: [...session.transcript, { speaker: "tutor", text: turn.say, tactic: turn.tactic, doorway: turn.doorway }],
          evidence: [...session.evidence, ...records],
          seq,
          goalsMet,
          visual: turn.visual ?? session.visual,
          lastTurn: turn,
          // The engine, not the model, has the final word: every goal must be on the list.
          learnComplete: turn.learnComplete && BRIEF.goals.every((g) => goalsMet.includes(g.id)),
          usage: { calls: session.usage.calls + 1, input: session.usage.input + usage.inputTokens, output: session.usage.output + usage.outputTokens, cached: session.usage.cached + usage.cacheReadTokens },
        };
        setS(next);
        if (!muted) {
          setSpeaking(true);
          speak(turn.say, () => setSpeaking(false));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [muted],
  );

  const studentSays = useCallback(
    (text: string, via: LiveLine["via"]) => {
      const t = text.trim();
      if (!t || busy) return;
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      const next: Session = { ...s, transcript: [...s.transcript, { speaker: "student", text: t, via }] };
      setS(next);
      void askTutor(next);
    },
    [s, busy, askTutor],
  );

  const start = () => {
    const fresh = freshSession(name.trim() || "Student");
    setS(fresh);
    void askTutor(fresh);
  };

  /* ---- push-to-talk ---- */
  const stopListening = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || busy) return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(finalText + interimText);
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted" && e.error !== "no-speech") setError(`Microphone: ${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      recRef.current = null;
      if (finalText.trim()) studentSays(finalText, "voice");
    };
    recRef.current = rec;
    setListening(true);
    setInterim("");
    rec.start();
  }, [busy, studentSays]);

  const toggleListening = () => (listening ? stopListening() : startListening());

  /* ---- manipulative ---- */
  const onVisualChange = (v: RaceVisual, what: string) => {
    setS((cur) => ({ ...cur, visual: v }));
    studentSays(what, "manipulative");
  };

  return (
    <div className="stack gap-16" style={{ maxWidth: "var(--maxw)", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div className="card card-pad row gap-12 wrap">
        <div className="stack" style={{ lineHeight: 1.2 }}>
          <strong>Level 1 · {BRIEF.title} · live tutor</strong>
          <span className="small muted">{BRIEF.subtopic} · Grade {BRIEF.grade} · ICSE — Claude behind the TutorProvider seam</span>
        </div>
        <div className="grow" />
        <div className="row gap-8 wrap">
          {BRIEF.goals.map((g) => (
            <span
              key={g.id}
              className="chip mono"
              title={g.text}
              style={s.goalsMet.includes(g.id) ? { background: "var(--good-soft, var(--accent-soft))", borderColor: "var(--good)", color: "var(--good)", fontWeight: 600 } : undefined}
            >
              {s.goalsMet.includes(g.id) ? "✓ " : ""}
              {g.id}
            </span>
          ))}
          <span className="chip mono" title="Typed evidence records captured so far">evidence · {s.evidence.length}</span>
        </div>
        <div className="row gap-8">
          <button className="btn sm ghost" onClick={() => setMuted((m) => !m)} title={muted ? "Unmute tutor voice" : "Mute tutor voice"}>
            {muted ? "🔇" : "🔊"}
          </button>
          <button className="btn sm ghost" onClick={() => { window.speechSynthesis?.cancel(); setS(freshSession(name)); }} title="Restart">↺</button>
        </div>
      </div>

      <div className="row gap-16 wrap" style={{ alignItems: "flex-start" }}>
        {/* Conversation */}
        <div className="card card-pad stack gap-12" style={{ flex: "2 1 520px", minWidth: 0 }}>
          <SectionTitle
            right={
              s.lastTurn && (
                <span className="row gap-8">
                  <span className="chip">tactic · {s.lastTurn.tactic}</span>
                  <span className="chip">doorway · {s.lastTurn.doorway.replace("-", " ")}</span>
                </span>
              )
            }
          >
            Learn — talk it through with Tomoe
          </SectionTitle>

          {!started && (
            <div className="stack gap-12" style={{ padding: "8px 0" }}>
              <p style={{ margin: 0, maxWidth: "64ch" }}>
                Tomoe will teach you <strong>{BRIEF.title}</strong> the way a good teacher does: she asks you to predict, makes you
                explain, and changes the example when one does not land. Press the mic and just talk.
              </p>
              <div className="row gap-8 wrap">
                <label className="small muted">Your name</label>
                <input className="student-select" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 140 }} />
                <button className="btn" onClick={start} disabled={busy}>
                  {busy ? "Tomoe is thinking…" : "▶ Start the lesson"}
                </button>
              </div>
              {!canListen && (
                <span className="small" style={{ color: "var(--warn)" }}>
                  Voice input needs Chrome or Edge (Web Speech API). You can still type.
                </span>
              )}
            </div>
          )}

          <div className="stack gap-8" style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
            {s.transcript.map((line, i) =>
              line.speaker === "tutor" ? (
                <div key={i} className="row gap-8" style={{ alignItems: "flex-start" }}>
                  <span className="tomoe-face" aria-hidden>◕‿◕</span>
                  <div className="tomoe" style={{ padding: "10px 14px", maxWidth: "72ch" }}>{line.text}</div>
                </div>
              ) : (
                <div
                  key={i}
                  className="card"
                  style={{ alignSelf: "flex-end", maxWidth: "60ch", padding: "10px 14px", background: "var(--accent-soft)", borderColor: "var(--accent)" }}
                >
                  <span className="small muted mono" style={{ marginRight: 6 }}>
                    {line.via === "voice" ? "🎙" : line.via === "manipulative" ? "🎛" : "⌨"}
                  </span>
                  {line.text}
                </div>
              ),
            )}
            {interim && (
              <div className="card" style={{ alignSelf: "flex-end", maxWidth: "60ch", padding: "10px 14px", opacity: 0.6, borderStyle: "dashed" }}>
                🎙 {interim}…
              </div>
            )}
            {busy && started && (
              <div className="row gap-8" style={{ alignItems: "flex-start" }}>
                <span className="tomoe-face" aria-hidden>◕‿◕</span>
                <div className="tomoe small muted" style={{ padding: "8px 12px" }}>thinking…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {s.visual && <RaceLab v={s.visual} onChange={onVisualChange} disabled={busy || s.learnComplete} />}

          {error && (
            <div className="small" style={{ color: "var(--warn)", border: "1px solid var(--warn)", borderRadius: 10, padding: "8px 12px" }}>
              {error}
              {/not configured|rejected/i.test(error) && <> — add <code>ANTHROPIC_API_KEY</code> to <code>.env.local</code> and restart the dev server.</>}
            </div>
          )}

          {started && !s.learnComplete && (
            <div className="row gap-8 wrap" style={{ marginTop: 4 }}>
              <button
                className="btn"
                onClick={toggleListening}
                disabled={!canListen || busy}
                style={listening ? { background: "var(--warn)", borderColor: "var(--warn)" } : undefined}
                title={listening ? "Stop and send" : "Speak your answer"}
              >
                {listening ? "● Listening… tap to send" : speaking ? "🎙 Interrupt & answer" : "🎙 Hold the floor"}
              </button>
              <form
                className="row gap-8 grow"
                onSubmit={(e) => {
                  e.preventDefault();
                  studentSays(typed, "typed");
                  setTyped("");
                }}
              >
                <input
                  className="student-select grow"
                  placeholder="…or type your answer"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  disabled={busy}
                />
                <button className="btn sm secondary" type="submit" disabled={busy || !typed.trim()}>Send</button>
              </form>
            </div>
          )}

          {s.learnComplete && (
            <div className="chip" style={{ alignSelf: "flex-start", color: "var(--good)", borderColor: "var(--good)" }}>
              ✓ Learn complete — all four goals shown in your own words. Next: guided Practise, then an AI-free Check.
            </div>
          )}
        </div>

        {/* Context Engine rail */}
        <div className="stack gap-12" style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div className="card card-pad stack gap-8">
            <SectionTitle>Student Context Engine</SectionTitle>
            <span className="small muted">Evidence the tutor's turns produce — what the next session is planned from.</span>
            <div className="stack gap-4">
              <strong className="small">Misconceptions</strong>
              {model.misconceptions.length === 0 && <span className="small muted">none surfaced yet</span>}
              {model.misconceptions.map((m) => (
                <div key={m.tag} className="small row gap-8" style={{ alignItems: "flex-start" }}>
                  <span className="chip mono" style={{ color: m.status === "resolved" ? "var(--good)" : "var(--warn)" }}>{m.tag} · {m.status}</span>
                  <span className="muted">{m.belief}</span>
                </div>
              ))}
            </div>
            <div className="stack gap-4">
              <strong className="small">Doorways</strong>
              {model.doorways.length === 0 && <span className="small muted">no representation judged yet</span>}
              {model.doorways.map((d) => (
                <span key={d.doorway} className="small">
                  {d.worked ? "✓" : "✗"} {d.doorway.replace("-", " ")}
                </span>
              ))}
            </div>
          </div>
          <div className="card card-pad stack gap-8">
            <SectionTitle>Evidence log</SectionTitle>
            {s.evidence.length === 0 && <span className="small muted">empty until the student says something</span>}
            <div className="stack gap-8" style={{ maxHeight: 300, overflowY: "auto" }}>
              {s.evidence.map((e) => (
                <div key={e.id} className="small stack" style={{ borderLeft: "3px solid var(--line-strong)", paddingLeft: 8 }}>
                  <span className="mono muted">
                    {e.id} · {e.kind}
                    {e.kind === "misconception" ? ` · ${e.tag} · ${e.status}` : e.kind === "prediction" ? ` · ${e.quality}` : e.kind === "doorway" ? ` · ${e.doorway} · ${e.worked ? "worked" : "failed"}` : ""}
                  </span>
                  <span>{e.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="small muted mono" style={{ textAlign: "center" }}>
            {s.usage.calls} turns · {s.usage.input.toLocaleString()} in / {s.usage.output.toLocaleString()} out · {s.usage.cached.toLocaleString()} cached
          </div>
        </div>
      </div>

      <p className="small muted" style={{ textAlign: "center" }}>
        Tutor turns are generated live by Claude against the approved lesson brief; Check stays AI-free. Content is illustrative
        and pipeline-pending.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Race manipulative: two movers + live distance–time graph            */
/* ------------------------------------------------------------------ */

function RaceLab({ v, onChange, disabled }: { v: RaceVisual; onChange: (v: RaceVisual, what: string) => void; disabled: boolean }) {
  const [t, setT] = useState(0); // minutes elapsed
  const [playing, setPlaying] = useState(false);
  const [draft, setDraft] = useState<RaceVisual>(v);
  useEffect(() => { setDraft(v); setT(0); setPlaying(false); }, [v]);

  // Positions in km at minute t.
  const pos = (m: { speedKmh: number; startAtKm?: number }, stop: RaceVisual["stopB"] | undefined, minutes: number) => {
    const start = m.startAtKm ?? 0;
    const perMin = m.speedKmh / 60;
    if (!stop) return Math.min(draft.distanceKm, start + perMin * minutes);
    const reachStop = (stop.atKm - start) / perMin;
    if (minutes <= reachStop) return Math.min(draft.distanceKm, start + perMin * minutes);
    if (minutes <= reachStop + stop.minutes) return stop.atKm;
    return Math.min(draft.distanceKm, stop.atKm + perMin * (minutes - reachStop - stop.minutes));
  };
  const maxMin = useMemo(() => {
    const need = (m: { speedKmh: number; startAtKm?: number }, extra = 0) => ((draft.distanceKm - (m.startAtKm ?? 0)) / Math.max(1, m.speedKmh)) * 60 + extra;
    return Math.ceil(Math.max(need(draft.a), need(draft.b, draft.stopB?.minutes ?? 0)));
  }, [draft]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setT((x) => (x >= maxMin ? (setPlaying(false), x) : x + Math.max(0.25, maxMin / 240))), 40);
    return () => window.clearInterval(id);
  }, [playing, maxMin]);

  const W = 420, H = 150, PAD = 28;
  const gx = (m: number) => PAD + (m / maxMin) * (W - PAD - 8);
  const gy = (km: number) => H - PAD + 8 - (km / draft.distanceKm) * (H - PAD - 8);
  const path = (m: RaceVisual["a"], stop?: RaceVisual["stopB"]) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const mm = (i / 60) * Math.min(t, maxMin);
      pts.push(`${gx(mm).toFixed(1)},${gy(pos(m, stop, mm)).toFixed(1)}`);
    }
    return "M" + pts.join(" L");
  };
  const pa = pos(draft.a, undefined, t), pb = pos(draft.b, draft.stopB, t);

  const commit = (next: RaceVisual, what: string) => { setDraft(next); setT(0); setPlaying(false); onChange(next, what); };

  return (
    <div className="stack gap-8" style={{ border: "1.5px dashed var(--line-strong)", borderRadius: 12, padding: 12 }}>
      <div className="row gap-8 wrap">
        <strong className="small">Race lab · {draft.distanceKm} km</strong>
        <span className="small muted mono">t = {t.toFixed(0)} min</span>
        <div className="grow" />
        <button className="btn sm secondary" onClick={() => { if (t >= maxMin) setT(0); setPlaying((p) => !p); }}>{playing ? "⏸ Pause" : "▶ Run"}</button>
        <button className="btn sm ghost" onClick={() => { setT(0); setPlaying(false); }}>↺</button>
      </div>
      {/* Track */}
      <svg viewBox={`0 0 ${W} 54`} width="100%" style={{ maxWidth: W, display: "block" }}>
        {[{ m: draft.a, p: pa, y: 14, c: "var(--accent)" }, { m: draft.b, p: pb, y: 40, c: "var(--warn)" }].map(({ m, p, y, c }) => (
          <g key={m.label}>
            <line x1={PAD} y1={y} x2={W - 8} y2={y} stroke="var(--line-strong)" strokeWidth={2} />
            <circle cx={PAD + (p / draft.distanceKm) * (W - PAD - 8)} cy={y} r={7} fill={c} />
            <text x={PAD} y={y - 9} fontSize={10} fill="var(--ink-3)">{m.label} · {m.speedKmh} km/h{p >= draft.distanceKm ? " · finished" : ""}</text>
          </g>
        ))}
      </svg>
      {/* Graph */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}>
        <line x1={PAD} y1={gy(0)} x2={W - 8} y2={gy(0)} stroke="var(--ink-3)" />
        <line x1={PAD} y1={gy(0)} x2={PAD} y2={8} stroke="var(--ink-3)" />
        <text x={W - 8} y={gy(0) + 12} fontSize={9} textAnchor="end" fill="var(--ink-3)">time (min) →</text>
        <text x={PAD + 4} y={14} fontSize={9} fill="var(--ink-3)">distance (km) ↑</text>
        <path d={path(draft.a)} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        <path d={path(draft.b, draft.stopB)} fill="none" stroke="var(--warn)" strokeWidth={2.5} />
      </svg>
      {/* Controls */}
      <div className="row gap-12 wrap small">
        {(["a", "b"] as const).map((k) => (
          <label key={k} className="row gap-8">
            <span style={{ color: k === "a" ? "var(--accent)" : "var(--warn)", fontWeight: 600 }}>{draft[k].label}</span>
            <input
              type="range" min={2} max={120} step={2} value={draft[k].speedKmh} disabled={disabled}
              onChange={(e) => setDraft({ ...draft, [k]: { ...draft[k], speedKmh: Number(e.target.value) } })}
              onMouseUp={(e) => commit({ ...draft, [k]: { ...draft[k], speedKmh: Number((e.target as HTMLInputElement).value) } }, `I set ${draft[k].label} to ${(e.target as HTMLInputElement).value} km/h and watched the race`)}
              onTouchEnd={() => commit(draft, `I set ${draft[k].label} to ${draft[k].speedKmh} km/h and watched the race`)}
            />
            <span className="mono">{draft[k].speedKmh} km/h</span>
          </label>
        ))}
        <button
          className="btn sm ghost" disabled={disabled}
          onClick={() =>
            draft.stopB
              ? commit({ ...draft, stopB: undefined }, `I removed ${draft.b.label}'s stop`)
              : commit({ ...draft, stopB: { atKm: Math.round(draft.distanceKm / 2), minutes: 5 } }, `I made ${draft.b.label} stop for 5 minutes halfway`)
          }
        >
          {draft.stopB ? `remove ${draft.b.label}'s stop` : `make ${draft.b.label} stop halfway`}
        </button>
      </div>
    </div>
  );
}

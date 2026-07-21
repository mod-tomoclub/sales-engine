/**
 * App wiring — loads the curriculum graph + engines + store and exposes the
 * progression actions to every surface. This is the composition root; swapping
 * LocalCampusStore for an API-backed store is the only change needed to move off
 * the browser.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import curriculum from "../data/curriculum.json";
import { CurriculumGraph } from "../curriculum/graph";
import type { CurriculumGraphData } from "../domain/curriculum";
import type { Student } from "../domain/student";
import { GraphItemBank } from "../engines/tutor/items";
import { RuleBasedTomoe } from "../engines/tutor/tomoe";
import { LocalCampusStore } from "../store/localStore";
import { buildInitialCampusState, DEMO_STUDENTS, INTEREST_PROFILES, COACH } from "../data/demo";
import * as P from "../engines/progression";
import type { CampusState, StepResult, Toast } from "../engines/progression";

export type Persona = "student" | "teacher" | "map" | "curriculum" | "school";

interface ToastItem extends Toast {
  id: number;
}

interface AppApi {
  graph: CurriculumGraph;
  itemBank: GraphItemBank;
  tomoe: RuleBasedTomoe;
  coach: typeof COACH;
  state: CampusState;
  students: Student[];
  interestProfiles: typeof INTEREST_PROFILES;
  activeStudentId: string;
  setActiveStudent: (id: string) => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  toasts: ToastItem[];
  run: (fn: (s: CampusState) => StepResult) => void;
  setState: (fn: (s: CampusState) => CampusState) => void;
  resetDemo: () => void;
}

const Ctx = createContext<AppApi | null>(null);

const graph = new CurriculumGraph(curriculum as unknown as CurriculumGraphData);
const itemBank = new GraphItemBank(graph);
const tomoe = new RuleBasedTomoe();
const store = new LocalCampusStore();

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<CampusState>(() => store.load() ?? buildInitialCampusState(graph));
  const [activeStudentId, setActiveStudent] = useState<string>(DEMO_STUDENTS[0].id);
  const [persona, setPersona] = useState<Persona>("student");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeq = useRef(0);

  useEffect(() => {
    store.save(state);
  }, [state]);

  const pushToasts = useCallback((items: Toast[]) => {
    if (!items.length) return;
    const withIds = items.map((t) => ({ ...t, id: (toastSeq.current += 1) }));
    setToasts((prev) => [...prev, ...withIds]);
    withIds.forEach((t) => {
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    });
  }, []);

  const run = useCallback(
    (fn: (s: CampusState) => StepResult) => {
      setStateRaw((prev) => {
        const { state: next, toasts: emitted } = fn(prev);
        pushToasts(emitted);
        return next;
      });
    },
    [pushToasts],
  );

  const setState = useCallback((fn: (s: CampusState) => CampusState) => setStateRaw(fn), []);

  const resetDemo = useCallback(() => {
    store.clear();
    setStateRaw(buildInitialCampusState(graph));
    pushToasts([{ kind: "info", text: "Demo campus reset" }]);
  }, [pushToasts]);

  const api = useMemo<AppApi>(
    () => ({
      graph,
      itemBank,
      tomoe,
      coach: COACH,
      state,
      students: DEMO_STUDENTS,
      interestProfiles: INTEREST_PROFILES,
      activeStudentId,
      setActiveStudent,
      persona,
      setPersona,
      toasts,
      run,
      setState,
      resetDemo,
    }),
    [state, activeStudentId, persona, toasts, run, setState, resetDemo],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp(): AppApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}

/** Convenience: the currently-selected student object. */
export function useActiveStudent(): Student {
  const { students, activeStudentId } = useApp();
  return students.find((s) => s.id === activeStudentId) ?? students[0];
}

/** Re-export progression ops so surfaces import actions from one place. */
export const ops = P;

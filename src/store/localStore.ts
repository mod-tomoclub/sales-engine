/**
 * localStorage adapter for CampusStore. Validates the persisted snapshot shape
 * on load (zod) and drops corrupt state gracefully rather than crashing.
 * Interaction telemetry is kept in-memory only (not persisted) to bound size.
 */
import type { CampusState } from "../engines/progression";
import type { CampusStore } from "./port";
import { PersistedStateSchema } from "../domain/schemas";

const KEY = "tomo-school:campus:v1";

export class LocalCampusStore implements CampusStore {
  load(): CampusState | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const check = PersistedStateSchema.safeParse(parsed.persisted ?? parsed);
      if (!check.success) return null;
      // Non-validated, non-critical fields carried through as-is.
      return {
        version: check.data.version,
        day: check.data.day,
        unitStates: parsed.unitStates ?? {},
        retentionChecks: check.data.retentionChecks,
        ledger: check.data.ledger as CampusState["ledger"],
        flags: check.data.flags,
        streaks: check.data.streaks,
        interactions: parsed.interactions ?? [],
      };
    } catch {
      return null;
    }
  }

  save(state: CampusState): void {
    try {
      const persisted = {
        version: state.version,
        day: state.day,
        unitStates: Object.values(state.unitStates),
        retentionChecks: state.retentionChecks,
        ledger: state.ledger,
        flags: state.flags,
        streaks: state.streaks,
      };
      // Persist the validated slice plus the maps the schema doesn't cover.
      localStorage.setItem(
        KEY,
        JSON.stringify({
          persisted,
          unitStates: state.unitStates,
          interactions: state.interactions.slice(-500),
        }),
      );
    } catch {
      // Storage full / unavailable — run in-memory for this session.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
}

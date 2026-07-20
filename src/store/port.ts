/**
 * Persistence port. The app depends on this interface, not on any concrete
 * storage. The localStorage adapter ships now (deployable, no DB); a Postgres/
 * API adapter (per §17 stack) implements the same contract later with zero
 * changes to engines or UI.
 */
import type { CampusState } from "../engines/progression";

export interface CampusStore {
  load(): CampusState | null;
  save(state: CampusState): void;
  clear(): void;
}

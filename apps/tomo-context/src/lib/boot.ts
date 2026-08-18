import 'server-only';
import { seedIfEmpty } from '../context-engine/seed';

let done = false;

/**
 * Seed on first boot. Idempotent, and cheap enough to call from any server
 * component — one command to install, one to run, seeded on first boot.
 */
export function boot() {
  if (done) return;
  seedIfEmpty();
  done = true;
}

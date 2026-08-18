/**
 * Student Context Engine — public interface.
 *
 * This is the product. Everything else in the app is a window onto it.
 * Nothing in here imports React, Next or any UI concern, so the module lifts
 * out of this repo unchanged.
 */

export * from './types';
export * from './store';
export { diffSnapshots } from './diff';
export type { SnapshotDiff, MasteryDiffRow, MisconceptionDiffRow, FieldDiffRow } from './diff';
export { getDb, resetDb } from './db';
export { seedIfEmpty, SEED_STUDENTS } from './seed';

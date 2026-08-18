/** `npm run seed` — populates the SQLite file. Safe to re-run. */
import { seedIfEmpty } from './seed';
import { listStudents } from './store';

const { seeded, skipped } = seedIfEmpty();
if (seeded.length) console.log(`seeded: ${seeded.join(', ')}`);
if (skipped.length) console.log(`already present, left alone: ${skipped.join(', ')}`);

console.log('\nstudents:');
for (const s of listStudents()) {
  console.log(`  ${s.name.padEnd(14)} v${s.current_version}  ${s.snapshot?.summary ?? '— no context yet —'}`);
}

import { boot } from '../lib/boot';
import { listStudents } from '../context-engine/store';
import { bandOf, type MasteryBand } from '../context-engine/types';
import { ALL_SUB_CONCEPTS } from '../curriculum';
import { nextClassroomFor } from '../lib/progression';
import { StudentList, type StudentRow } from '../components/StudentList';

export const dynamic = 'force-dynamic';

export default function StudentsPage() {
  boot();

  const rows: StudentRow[] = listStudents().map((s) => {
    const bands: Record<MasteryBand, number> = { strong: 0, shaky: 0, gap: 0, untouched: 0 };
    const seen = new Map((s.snapshot?.mastery ?? []).map((m) => [m.concept_id, m]));
    for (const sc of ALL_SUB_CONCEPTS) {
      const m = seen.get(sc.id);
      bands[m ? bandOf(m) : 'untouched'] += 1;
    }

    return {
      id: s.id,
      name: s.name,
      grade: s.grade,
      board: s.board,
      section: s.section,
      version: s.current_version,
      last_activity_at: s.last_activity_at,
      summary: s.snapshot?.summary ?? 'No context yet — run the diagnostic to build Context v1.',
      bands,
      open_misconceptions: (s.snapshot?.misconceptions ?? []).filter((m) => m.status !== 'resolved').length,
      next_classroom: s.current_version ? (nextClassroomFor(s.id)?.title ?? 'Theme complete') : null,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Students</h1>
        <p className="mt-1 max-w-[72ch] text-[13.5px] leading-relaxed text-ink-soft">
          Grade 7 Physics · <span className="text-ink">Force and Pressure : Motion</span> (ICSE). Every row is a
          live context. The one-line summary is written by the engine at the last snapshot, not by a teacher.
        </p>
      </div>
      <StudentList rows={rows} />
    </div>
  );
}

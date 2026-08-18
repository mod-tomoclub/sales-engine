import { notFound } from 'next/navigation';
import { boot } from '../../../lib/boot';
import { getStudent, listSnapshots } from '../../../context-engine/store';
import { CLASSROOMS } from '../../../curriculum';
import { nextClassroomFor } from '../../../lib/progression';
import { StudentDetail } from '../../../components/StudentDetail';

export const dynamic = 'force-dynamic';

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  boot();
  const { id } = await params;

  const student = getStudent(id);
  if (!student) notFound();

  const snapshots = listSnapshots(id);
  const next = nextClassroomFor(id);

  return (
    <StudentDetail
      student={{
        id: student.id,
        name: student.name,
        grade: student.grade,
        board: student.board,
        section: student.section,
        last_activity_at: student.last_activity_at,
      }}
      snapshots={snapshots}
      classroomTitles={Object.fromEntries(CLASSROOMS.map((c) => [c.concept_id, c.title]))}
      nextClassroom={next ? { id: next.concept_id, title: next.title } : null}
    />
  );
}

import { getD1 } from './index';

export type CourseInstructorView = {
  name: string;
  officialSourceUrl: string;
};

export type CourseView = {
  id: string;
  universityId: string;
  term: string;
  courseCode: string;
  name: string;
  department: string;
  officialSourceUrl: string;
  departmentSourceUrl: string;
  instructors: CourseInstructorView[];
  averageRating: number | null;
  averageLearning: number | null;
  averageWorkload: number | null;
  averageExamDifficulty: number | null;
  averageGradingStandard: number | null;
  ratingCount: number;
};

type CourseRow = {
  id: string;
  university_id: string;
  term: string;
  course_code: string;
  name: string;
  department: string;
  official_source_url: string;
  department_source_url: string;
  average_rating: number | null;
  average_learning: number | null;
  average_workload: number | null;
  average_exam_difficulty: number | null;
  average_grading_standard: number | null;
  rating_count: number;
};

type InstructorRow = { course_id: string; instructor_name: string; official_source_url: string };

const numericOrNull = (value: number | null) => value === null ? null : Number(value);

function mapCourse(row: CourseRow, instructors: CourseInstructorView[]): CourseView {
  return {
    id: row.id,
    universityId: row.university_id,
    term: row.term,
    courseCode: row.course_code,
    name: row.name,
    department: row.department,
    officialSourceUrl: row.official_source_url,
    departmentSourceUrl: row.department_source_url,
    instructors,
    averageRating: numericOrNull(row.average_rating),
    averageLearning: numericOrNull(row.average_learning),
    averageWorkload: numericOrNull(row.average_workload),
    averageExamDifficulty: numericOrNull(row.average_exam_difficulty),
    averageGradingStandard: numericOrNull(row.average_grading_standard),
    ratingCount: Number(row.rating_count),
  };
}

async function attachInstructors(rows: CourseRow[]) {
  if (rows.length === 0) return [];
  const placeholders = rows.map(() => '?').join(', ');
  const result = await getD1().prepare(`
    SELECT course_id, instructor_name, official_source_url
    FROM course_instructors
    WHERE course_id IN (${placeholders})
    ORDER BY course_id, instructor_name
  `).bind(...rows.map((row) => row.id)).all<InstructorRow>();
  const byCourse = new Map<string, CourseInstructorView[]>();
  for (const row of result.results) {
    byCourse.set(row.course_id, [...(byCourse.get(row.course_id) ?? []), {
      name: row.instructor_name,
      officialSourceUrl: row.official_source_url,
    }]);
  }
  return rows.map((row) => mapCourse(row, byCourse.get(row.id) ?? []));
}

const selectWithRatings = `
  SELECT c.id, c.university_id, c.term, c.course_code, c.name, c.department,
    c.official_source_url, c.department_source_url,
    ROUND(AVG((cr.learning_score + cr.workload_score + cr.exam_difficulty_score + cr.grading_standard_score) / 4.0), 1) AS average_rating,
    ROUND(AVG(cr.learning_score), 1) AS average_learning,
    ROUND(AVG(cr.workload_score), 1) AS average_workload,
    ROUND(AVG(cr.exam_difficulty_score), 1) AS average_exam_difficulty,
    ROUND(AVG(cr.grading_standard_score), 1) AS average_grading_standard,
    COUNT(cr.id) AS rating_count
  FROM courses c
  LEFT JOIN course_ratings cr ON cr.course_id = c.id
`;

export async function listCourses(filters: { universityId?: string; department?: string; search?: string }) {
  const conditions: string[] = [];
  const values: string[] = [];
  if (filters.universityId) {
    conditions.push('c.university_id = ?');
    values.push(filters.universityId);
  }
  if (filters.department) {
    conditions.push('c.department LIKE ?');
    values.push(`%${filters.department}%`);
  }
  if (filters.search) {
    conditions.push(`(c.name LIKE ? OR c.course_code LIKE ? OR c.department LIKE ? OR EXISTS (
      SELECT 1 FROM course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_name LIKE ?
    ))`);
    const needle = `%${filters.search}%`;
    values.push(needle, needle, needle, needle);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await getD1().prepare(`${selectWithRatings}
    ${where}
    GROUP BY c.id
    ORDER BY rating_count DESC, c.term DESC, c.department, c.name, c.course_code
    LIMIT 100
  `).bind(...values).all<CourseRow>();
  return attachInstructors(result.results);
}

export async function getCourse(id: string) {
  const row = await getD1().prepare(`${selectWithRatings}
    WHERE c.id = ?
    GROUP BY c.id
  `).bind(id).first<CourseRow>();
  if (!row) return null;
  return (await attachInstructors([row]))[0] ?? null;
}

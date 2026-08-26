import { getD1 } from './index';

export type ProfessorView = {
  id: string;
  universityId: string;
  department: string;
  name: string;
  averageRating: number | null;
  ratingCount: number;
};

type ProfessorRow = {
  id: string;
  university_id: string;
  department: string;
  name: string;
  average_rating: number | null;
  rating_count: number;
};

function mapProfessor(row: ProfessorRow): ProfessorView {
  return {
    id: row.id,
    universityId: row.university_id,
    department: row.department,
    name: row.name,
    averageRating: row.average_rating === null ? null : Number(row.average_rating),
    ratingCount: Number(row.rating_count),
  };
}

export async function listProfessors(filters: { universityId?: string; department?: string; search?: string }) {
  const conditions: string[] = [];
  const values: string[] = [];
  if (filters.universityId) {
    conditions.push('p.university_id = ?');
    values.push(filters.universityId);
  }
  if (filters.department) {
    conditions.push('p.department LIKE ?');
    values.push(`%${filters.department}%`);
  }
  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.department LIKE ?)');
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await getD1().prepare(`
    SELECT p.id, p.university_id, p.department, p.name,
      ROUND(AVG(pr.easy_to_pass_score), 1) AS average_rating,
      COUNT(pr.id) AS rating_count
    FROM professors p
    LEFT JOIN professor_ratings pr ON pr.professor_id = p.id
    ${where}
    GROUP BY p.id
    ORDER BY p.university_id, p.department, p.name
    LIMIT 200
  `).bind(...values).all<ProfessorRow>();
  return result.results.map(mapProfessor);
}

export async function getProfessor(id: string) {
  const row = await getD1().prepare(`
    SELECT p.id, p.university_id, p.department, p.name,
      ROUND(AVG(pr.easy_to_pass_score), 1) AS average_rating,
      COUNT(pr.id) AS rating_count
    FROM professors p
    LEFT JOIN professor_ratings pr ON pr.professor_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `).bind(id).first<ProfessorRow>();
  return row ? mapProfessor(row) : null;
}

export function validateCourseRating(body) {
  const fields = [
    ['learningScore', 'learning_score', '學習收穫'],
    ['workloadScore', 'workload_score', '作業量'],
    ['examDifficultyScore', 'exam_difficulty_score', '考試難度'],
    ['gradingStandardScore', 'grading_standard_score', '給分標準'],
    ['attendanceFrequencyScore', 'attendance_frequency_score', '點名頻率'],
  ];
  const value = {};
  for (const [camelKey, snakeKey, label] of fields) {
    const rawScore = Object.hasOwn(body, camelKey) ? body[camelKey] : body[snakeKey];
    const score = typeof rawScore === 'number'
      ? rawScore
      : typeof rawScore === 'string' && /^\d{1,3}$/.test(rawScore.trim())
        ? Number(rawScore.trim())
        : Number.NaN;
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return { ok: false, error: `${label}評分需為 0 至 100 的整數。` };
    }
    value[camelKey] = score;
  }
  return { ok: true, value };
}

const officialDomains = {
  ntu: 'ntu.edu.tw', nthu: 'nthu.edu.tw', nycu: 'nycu.edu.tw', ncu: 'ncu.edu.tw',
  nchu: 'nchu.edu.tw', ccu: 'ccu.edu.tw', nsysu: 'nsysu.edu.tw', ntust: 'ntust.edu.tw',
  ntut: 'ntut.edu.tw', niu: 'niu.edu.tw', cycu: 'cycu.edu.tw', tku: 'tku.edu.tw',
  yzu: 'yzu.edu.tw', fcu: 'fcu.edu.tw',
};

export function validateCourseSubmission(body) {
  const universityId = String(body.universityId ?? body.university_id ?? '').trim().toLowerCase();
  const semester = String(body.semester ?? '').trim();
  const department = String(body.department ?? '').trim();
  const name = String(body.name ?? body.courseName ?? '').trim();
  const instructorName = String(body.instructorName ?? body.instructor_name ?? '').trim();
  const officialSourceUrl = String(body.officialSourceUrl ?? body.official_source_url ?? '').trim();
  if (!/^[a-z0-9-]{2,20}$/.test(universityId)) return { ok: false, error: '學校代碼格式不正確。' };
  if (semester !== '1' && semester !== '2') return { ok: false, error: '請選擇上學期或下學期。' };
  if (department.length < 2 || department.length > 80) return { ok: false, error: '請選擇有效系所。' };
  if (name.length < 2 || name.length > 100) return { ok: false, error: '課程名稱需為 2 至 100 字。' };
  if (name.includes('專題研究')) return { ok: false, error: '不收錄專題研究課程。' };
  if (instructorName.length < 2 || instructorName.length > 80) return { ok: false, error: '授課教師姓名需為 2 至 80 字。' };
  if (/助\s*教|待\s*聘|未\s*定|教師姓名|授課教師/.test(instructorName)) return { ok: false, error: '請填寫實際授課教師姓名。' };
  if (officialSourceUrl) {
    let source;
    try { source = new URL(officialSourceUrl); } catch { return { ok: false, error: '官方來源網址格式不正確。' }; }
    const domain = officialDomains[universityId];
    if (source.protocol !== 'https:' || !domain || (source.hostname !== domain && !source.hostname.endsWith(`.${domain}`))) {
      return { ok: false, error: '來源網址必須是該校官方 HTTPS 網站。' };
    }
  }
  return { ok: true, value: { universityId, semester, department, name, instructorName, officialSourceUrl } };
}

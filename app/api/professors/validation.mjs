export function validateProfessorRating(body) {
  const fields = [
    ['attitudeScore', 'attitude_score', '老師態度'],
    ['learningScore', 'learning_score', '學習收穫'],
    ['workloadScore', 'workload_score', '作業量'],
    ['examDifficultyScore', 'exam_difficulty_score', '考試難易'],
    ['gradingStandardScore', 'grading_standard_score', '給分標準'],
  ];
  const value = {};
  for (const [camelKey, snakeKey, label] of fields) {
    const score = typeof body[camelKey] === 'number' ? body[camelKey] : Number(body[snakeKey]);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return { ok: false, error: `${label}評分需為 1 至 5。` };
    }
    value[camelKey] = score;
  }
  return { ok: true, value };
}

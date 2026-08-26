export function validateProfessorRating(body) {
  const score = typeof body.easyToPassScore === 'number'
    ? body.easyToPassScore
    : Number(body.easy_to_pass_score ?? body.easyToPassScore);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { ok: false, error: '好不好過評分需為 1 至 5。' };
  }
  return { ok: true, value: { easyToPassScore: score } };
}

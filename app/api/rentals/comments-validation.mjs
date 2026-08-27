/**
 * @param {{ content?: unknown }} input
 * @returns {{ ok: false, error: string } | { ok: true, value: { content: string } }}
 */
export function validateRentalComment(input) {
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  if (content.length < 4 || content.length > 500) {
    return { ok: false, error: '評論需為 4–500 個字。' };
  }
  return { ok: true, value: { content } };
}

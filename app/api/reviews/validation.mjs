/**
 * Validate an anonymous rental review before it reaches SQLite/D1.
 * @param {{ listingId?: unknown, authorName?: unknown, rating?: unknown, content?: unknown }} input
 * @returns {{ ok: false, error: string } | { ok: true, value: { listingId: string, authorName: string, rating: number, content: string } }}
 */
export function validateReview(input) {
  const listingId = typeof input.listingId === 'string' ? input.listingId.trim() : '';
  const authorName = typeof input.authorName === 'string' ? input.authorName.trim() : '';
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  const rating = typeof input.rating === 'number' ? input.rating : Number(input.rating);

  if (!/^[a-z0-9-]{2,40}$/.test(listingId)) return { ok: false, error: '租屋項目格式不正確。' };
  if (authorName.length < 1 || authorName.length > 24) return { ok: false, error: '暱稱需為 1–24 個字。' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: '請選擇 1–5 顆星。' };
  if (content.length < 4 || content.length > 300) return { ok: false, error: '留言需為 4–300 個字。' };

  return { ok: true, value: { listingId, authorName, rating, content } };
}

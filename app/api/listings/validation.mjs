const roomTypes = new Set(['獨立套房', '分租雅房', '合租雅房', '整層住家']);
const contactMethods = new Set(['LINE', '電話', 'Email']);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * @param {Record<string, unknown>} input
 * @returns {{ ok: false, error: string } | { ok: true, value: { universityId: string, title: string, address: string, description: string, monthlyRent: number, roomType: string, areaPing: number, walkMinutes: number, latitude: number, longitude: number, highlights: string[], contactMethod: string, contactValue: string } }}
 */
export function validateListing(input) {
  const universityId = text(input.universityId);
  const title = text(input.title);
  const address = text(input.address);
  const description = text(input.description);
  const roomType = text(input.roomType);
  const contactMethod = text(input.contactMethod);
  const contactValue = text(input.contactValue);
  const monthlyRent = Number(input.monthlyRent);
  const areaPing = Number(input.areaPing);
  const walkMinutes = Number(input.walkMinutes);
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const highlights = Array.isArray(input.highlights)
    ? [...new Set(input.highlights.map(text).filter(Boolean))]
    : [];

  if (!/^[a-z0-9-]{2,20}$/.test(universityId)) return { ok: false, error: '學校代碼格式不正確。' };
  if (title.length < 4 || title.length > 60) return { ok: false, error: '標題需為 4–60 個字。' };
  if (address.length < 4 || address.length > 120) return { ok: false, error: '地址需為 4–120 個字。' };
  if (description.length < 10 || description.length > 1000) return { ok: false, error: '房源說明需為 10–1000 個字。' };
  if (!Number.isInteger(monthlyRent) || monthlyRent < 1000 || monthlyRent > 100000) return { ok: false, error: '月租需為 1,000–100,000 元。' };
  if (!roomTypes.has(roomType)) return { ok: false, error: '房型不正確。' };
  if (!Number.isFinite(areaPing) || areaPing < 1 || areaPing > 100) return { ok: false, error: '坪數需為 1–100 坪。' };
  if (!Number.isInteger(walkMinutes) || walkMinutes < 1 || walkMinutes > 60) return { ok: false, error: '步行時間需為 1–60 分鐘。' };
  if (!Number.isFinite(latitude) || latitude < 21.5 || latitude > 26.5 || !Number.isFinite(longitude) || longitude < 119 || longitude > 123) return { ok: false, error: '房源座標需位於臺灣範圍。' };
  if (highlights.length > 6 || highlights.some((item) => item.length > 12)) return { ok: false, error: '特色最多 6 個，每個不超過 12 字。' };
  if (!contactMethods.has(contactMethod)) return { ok: false, error: '聯絡方式不正確。' };
  if (contactValue.length < 2 || contactValue.length > 120) return { ok: false, error: '聯絡資訊需為 2–120 個字。' };

  return { ok: true, value: { universityId, title, address, description, monthlyRent, roomType, areaPing, walkMinutes, latitude, longitude, highlights, contactMethod, contactValue } };
}

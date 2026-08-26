const SCHOOL_ID = /^[a-z0-9-]{2,20}$/;

const numberValue = (value) => typeof value === 'number' ? value : Number(value);

export function validateRentalLocation(body) {
  const universityId = String(body.universityId ?? body.university_id ?? '').trim();
  const address = String(body.address ?? '').normalize('NFKC').trim();
  const latitude = numberValue(body.latitude);
  const longitude = numberValue(body.longitude);
  if (!SCHOOL_ID.test(universityId)) return { ok: false, error: '學校代碼格式不正確。' };
  if (address.length < 6 || address.length > 120) return { ok: false, error: '地址需為 6 至 120 個字。' };
  if (!Number.isFinite(latitude) || latitude < 21.8 || latitude > 25.5) return { ok: false, error: '緯度不在臺灣合理範圍內。' };
  if (!Number.isFinite(longitude) || longitude < 119.3 || longitude > 122.1) return { ok: false, error: '經度不在臺灣合理範圍內。' };
  return { ok: true, value: { universityId, address, latitude, longitude } };
}

export function validateRentalReport(body) {
  const monthlyRent = numberValue(body.monthlyRent ?? body.monthly_rent);
  const overallRating = numberValue(body.overallRating ?? body.overall_rating);
  if (!Number.isInteger(monthlyRent) || monthlyRent < 1000 || monthlyRent > 200000) {
    return { ok: false, error: '月租金需為 1,000 至 200,000 元的整數。' };
  }
  if (!Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
    return { ok: false, error: '整體評分需為 1 至 5。' };
  }
  return { ok: true, value: { monthlyRent, overallRating } };
}

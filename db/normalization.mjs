/** Normalize Taiwan addresses for deterministic de-duplication. */
export function normalizeAddress(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[台臺]/g, '臺')
    .replace(/[\s,，、。．]/g, '')
    .replace(/[-－—]/g, '之')
    .trim();
}

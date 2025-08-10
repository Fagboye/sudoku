export function weekStartUtc(referenceDate: Date = new Date()): string {
  const utc = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
    0, 0, 0, 0,
  ));
  const day = utc.getUTCDay(); // 0 = Sunday
  utc.setUTCDate(utc.getUTCDate() - day);
  // Return YYYY-MM-DD
  return utc.toISOString().slice(0, 10);
}



/**
 * makeStamp – generates audit stamp string
 * Format: ACTION USERID YYYY-MM-DD HH:MM
 * e.g. "ADDED user2 2025-10-20 14:30"
 *
 * stamp column is VARCHAR(60) — userId is truncated to fit.
 * If userId is a UUID, uses first 8 chars (e.g. "eee715b8")
 * If userId is a short string (e.g. "user1"), uses as-is.
 */
export function makeStamp(action, userId) {
  const now    = new Date();
  const date   = now.toISOString().slice(0, 10);       // YYYY-MM-DD  (10)
  const time   = now.toTimeString().slice(0, 5);        // HH:MM       (5)

  // Truncate userId so total stamp fits within VARCHAR(60)
  // action(max 11) + space(1) + userId + space(1) + date(10) + space(1) + time(5) <= 60
  // userId budget = 60 - 11 - 1 - 1 - 10 - 1 - 5 = 31 chars max
  const shortId = (userId ?? 'unknown').slice(0, 31);

  return `${action} ${shortId} ${date} ${time}`;
}
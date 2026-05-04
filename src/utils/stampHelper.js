// src/utils/stampHelper.js
export function makeStamp(action, userId) {
  const now    = new Date();
  const date   = now.toISOString().slice(0, 10);  // YYYY-MM-DD
  const time   = now.toTimeString().slice(0, 5);   // HH:MM

  // Truncate userId to fit VARCHAR(60) constraint
  // action(max 11) + space + userId + space + date(10) + space + time(5) = 60
  // userId budget = 60 - 11 - 1 - 1 - 10 - 1 - 5 = 31 chars max
  const shortId = (userId ?? 'unknown').slice(0, 31);

  return `${action} ${shortId} ${date} ${time}`;
}
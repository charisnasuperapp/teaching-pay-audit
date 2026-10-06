const longFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthKey(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function formatMonthKey(monthKey) {
  return longFormatter.format(parseMonthKey(monthKey));
}

export function shiftMonth(monthKey, delta) {
  const date = parseMonthKey(monthKey);
  date.setMonth(date.getMonth() + delta);
  return toMonthKey(date);
}

export function getDaysInMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export function getMonthKeysForYear(year) {
  return Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`);
}

export function getYear(monthKey) {
  return Number(monthKey.slice(0, 4));
}

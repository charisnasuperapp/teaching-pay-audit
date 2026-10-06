import { calculatePay, summarizeMonth } from './calculations.js';
import { formatMonthKey, getMonthKeysForYear } from './date.js';

function download(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportMonthCsv(month) {
  const rows = [
    ['Date', 'Class', 'Hours', 'Hourly Rate (USD)', 'Amount (USD)', 'Notes'],
    ...Object.values(month.entries).map((entry) => [
      entry.day,
      entry.className,
      entry.hours,
      month.hourlyRate,
      calculatePay(entry.hours, month.hourlyRate),
      entry.notes,
    ]),
  ];
  const summary = summarizeMonth(month);
  rows.push([]);
  rows.push(['MONTHLY TOTAL', '', summary.totalHours, '', summary.totalPay, '']);
  download(`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}`, 'text/csv;charset=utf-8', `piola-salary-monthly-${month.monthKey}.csv`);
}

export function exportYearCsv(database, year) {
  const rows = [['Month', 'Teaching Days', 'Total Hours', 'Average Hours/Day', 'Hourly Rate (USD)', 'Total Pay (USD)']];
  let totalDays = 0;
  let totalHours = 0;
  let totalPay = 0;
  for (const monthKey of getMonthKeysForYear(year)) {
    const month = database.months[monthKey];
    const summary = month ? summarizeMonth(month) : { activeDays: 0, totalHours: 0, averageHours: 0, totalPay: 0 };
    totalDays += summary.activeDays;
    totalHours += summary.totalHours;
    totalPay += summary.totalPay;
    rows.push([
      formatMonthKey(monthKey),
      summary.activeDays,
      summary.totalHours,
      summary.averageHours,
      month?.hourlyRate ?? database.settings.defaultHourlyRate,
      summary.totalPay,
    ]);
  }
  rows.push([]);
  rows.push([`TOTAL ${year}`, totalDays, Math.round(totalHours * 100) / 100, '', '', Math.round(totalPay * 100) / 100]);
  download(`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}`, 'text/csv;charset=utf-8', `piola-salary-annual-${year}.csv`);
}

export function exportBackup(database) {
  download(
    JSON.stringify({ application: 'Piola Salary - Teaching Pay Audit', exportedAt: new Date().toISOString(), data: database }, null, 2),
    'application/json',
    `piola-salary-backup-${new Date().toISOString().slice(0, 10)}.json`,
  );
}

export async function readBackup(file) {
  const parsed = JSON.parse(await file.text());
  return parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
}

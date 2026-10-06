import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createMonth } from '../src/lib/database.js';
import { buildMonthXlsxBytes } from '../src/lib/xlsx-export.js';
import { buildMonthReportPdf } from '../src/lib/pdf-report.js';

const ONE_PIXEL_PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl5sAAAAASUVORK5CYII=', 'base64'));

function latin1(bytes) { return new TextDecoder('latin1').decode(bytes); }

test('professional Excel export is a real XLSX ZIP with styled sheets and embedded analytics image', () => {
  const month = createMonth('2026-10', 10);
  month.entries[1] = { day: 1, className: 'English A1', hours: 4, notes: 'Morning class' };
  month.entries[2] = { day: 2, className: 'Math', hours: 2, notes: '' };
  const bytes = buildMonthXlsxBytes(month, 'Ipul', ONE_PIXEL_PNG);
  const text = latin1(bytes);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  assert.match(text, /xl\/worksheets\/sheet1\.xml/);
  assert.match(text, /xl\/worksheets\/sheet3\.xml/);
  assert.match(text, /xl\/media\/chart1\.png/);
  assert.match(text, /MONTHLY TOTAL/);
  assert.match(text, /Daily Details/);
  assert.match(text, /Analytics/);
});

test('PDF report embeds the supplied brand mark as a transparent watermark resource', () => {
  const month = createMonth('2026-10', 10);
  month.entries[1] = { day: 1, className: 'English A1', hours: 4, notes: '' };
  const text = latin1(buildMonthReportPdf(month, 'Ipul', new Date('2026-10-07T00:56:00Z')));
  assert.match(text, /\/BrandMark/);
  assert.match(text, /\/Subtype \/Image/);
  assert.match(text, /\/ExtGState/);
  assert.match(text, /Monthly Teaching Pay Report/);
});

test('UI exposes CSV, Excel, PNG, and PDF exports without developer identity text', async () => {
  const app = await readFile(resolve(import.meta.dirname, '..', 'src/app.js'), 'utf8');
  assert.match(app, /export-month-xlsx/);
  assert.match(app, /export-month-png/);
  assert.match(app, /export-year-xlsx/);
  assert.match(app, /export-year-png/);
  assert.match(app, /brand-mark\.png/);
  assert.doesNotMatch(app, /Developed by/i);
});

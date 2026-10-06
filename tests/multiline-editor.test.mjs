import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const styleSource = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
const pdfSource = await readFile(new URL('../src/lib/pdf-report.js', import.meta.url), 'utf8');

test('class and notes editors are multiline auto-growing textareas', () => {
  assert.match(appSource, /<textarea class="table-input table-textarea class-textarea"/);
  assert.match(appSource, /data-field="className" data-auto-grow="true"/);
  assert.match(appSource, /<textarea class="table-input table-textarea notes-textarea"/);
  assert.match(appSource, /function resizeAutoGrowTextarea/);
  assert.match(styleSource, /white-space:\s*pre-wrap/);
  assert.match(styleSource, /overflow-wrap:\s*anywhere/);
});

test('cloud UI updates do not replace an active textarea while the user is typing', () => {
  assert.match(appSource, /if \(isEditableField\(active\) && root\.contains\(active\)\) updateCloudUi\(\)/);
});

test('PDF keeps user-entered line breaks in class and notes fields', () => {
  assert.match(pdfSource, /className: wrapText\(row\.className/);
  assert.match(pdfSource, /notes: wrapText\(row\.notes/);
  assert.match(pdfSource, /preparedLines/);
});

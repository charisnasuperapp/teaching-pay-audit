import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BRAND, BRAND_TITLE } from '../src/brand.js';

test('Ayesha customer branding is centralized and complete', async () => {
  assert.equal(BRAND.appName, 'Ayesha Salary');
  assert.equal(BRAND.ownerName, 'Ayesha');
  assert.equal(BRAND.developerName, 'Charisna');
  assert.equal(BRAND.slug, 'ayesha-salary');
  assert.equal(BRAND_TITLE, 'Ayesha Salary - Teaching Pay Audit');

  const sourceFiles = [
    'src/app.js',
    'src/lib/export.js',
    'src/lib/pdf-core.js',
    'src/lib/pdf-report.js',
    'src/index.html',
    'src/manifest.webmanifest',
  ];
  for (const relativePath of sourceFiles) {
    const contents = await readFile(resolve(import.meta.dirname, '..', relativePath), 'utf8');
    assert.match(contents, /BRAND|__APP_|Ayesha|Teaching Pay Audit/, `${relativePath} must participate in centralized branding or customer identity`);
  }
});

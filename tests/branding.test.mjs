import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BRAND, BRAND_TITLE } from '../src/brand.js';

test('multi-user product branding is centralized and customer-neutral', async () => {
  assert.equal(BRAND.appName, 'MySalary');
  assert.equal(BRAND.productName, 'Teaching Pay Audit');
  assert.equal(BRAND.version, '2.3.0');
  assert.equal('developerName' in BRAND, false);
  assert.equal(BRAND.slug, 'mysalary');
  assert.equal(BRAND_TITLE, 'MySalary — Teaching Pay Audit');

  const sourceFiles = [
    'src/app.js',
    'src/lib/export.js',
    'src/lib/pdf-core.js',
    'src/lib/pdf-report.js',
    'src/lib/report-image.js',
    'src/lib/xlsx-export.js',
    'src/index.html',
    'src/manifest.webmanifest',
  ];
  for (const relativePath of sourceFiles) {
    const contents = await readFile(resolve(import.meta.dirname, '..', relativePath), 'utf8');
    assert.match(contents, /BRAND|__APP_|Teaching Pay Audit|MySalary/, `${relativePath} must use centralized product branding`);
    assert.doesNotMatch(contents, /Ayesha Salary|Piola Salary|Developed by/i, `${relativePath} must not contain customer-specific or developer-identifying branding`);
  }
});

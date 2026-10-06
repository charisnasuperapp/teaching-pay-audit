import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BRAND, BRAND_TITLE } from '../src/brand.js';

test('multi-user product branding is centralized and customer-neutral', async () => {
  assert.equal(BRAND.appName, 'Teaching Pay Audit');
  assert.equal(BRAND.productName, 'Professional Teaching Hours & Pay Workspace');
  assert.equal(BRAND.version, '2.1.0');
  assert.equal(BRAND.developerName, 'Charisna');
  assert.equal(BRAND.slug, 'teaching-pay-audit');
  assert.equal(BRAND_TITLE, 'Teaching Pay Audit');

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
    assert.match(contents, /BRAND|__APP_|Teaching Pay Audit/, `${relativePath} must use centralized product branding`);
    assert.doesNotMatch(contents, /Ayesha Salary|Piola Salary/, `${relativePath} must not contain customer-specific product branding`);
  }
});

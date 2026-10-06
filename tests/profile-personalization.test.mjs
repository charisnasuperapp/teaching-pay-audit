import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('registration requires a display name and persists the user profile', async () => {
  const app = await readFile(resolve(root, 'src/app.js'), 'utf8');
  const firebase = await readFile(resolve(root, 'src/lib/firebase-rest.js'), 'utf8');

  assert.match(app, /name="displayName"/);
  assert.match(app, /await cloud\.saveProfile/);
  assert.match(app, /currentDisplayName\(\)/);
  assert.match(firebase, /#userRoot\(session\.uid\)/);
  assert.match(firebase, /profile\/account/);
});

test('Firestore rules isolate profile and salary data by authenticated UID', async () => {
  const rules = await readFile(resolve(root, 'firebase/firestore.rules'), 'utf8');
  assert.match(rules, /request\.auth\.uid == userId/);
  assert.match(rules, /match \/users\/\{userId\}\/profile\/account/);
  assert.match(rules, /match \/users\/\{userId\}\/salaryAudit\/database/);
  assert.match(rules, /match \/users\/\{userId\}\/salaryAuditMonths\/\{monthKey\}/);
});

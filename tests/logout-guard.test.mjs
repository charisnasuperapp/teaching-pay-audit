import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertCloudLogoutReady,
  assertNoPendingChanges,
  assertRevisionConfirmed,
} from '../src/lib/logout-guard.js';

test('safe sign out is blocked while the device is offline', () => {
  assert.throws(
    () => assertCloudLogoutReady({ online: false, authenticated: true }),
    /internet connection is unavailable/,
  );
});

test('safe sign out is blocked while month changes are pending', () => {
  assert.throws(
    () => assertNoPendingChanges({ dirtyMonthKeys: new Set(['2026-08']), settingsDirty: false }),
    /have not been uploaded/,
  );
});

test('safe sign out accepts a state with no pending changes', () => {
  assert.doesNotThrow(() => assertNoPendingChanges({ dirtyMonthKeys: new Set(), settingsDirty: false }));
});

test('cloud revision verification requires an exact match', () => {
  assert.equal(assertRevisionConfirmed('2026-08-02T12:00:00.000Z', '2026-08-02T12:00:00.000Z'), true);
  assert.throws(
    () => assertRevisionConfirmed('2026-08-02T12:00:00.000Z', '2026-08-02T11:59:59.000Z'),
    /has not confirmed the latest data revision/,
  );
});

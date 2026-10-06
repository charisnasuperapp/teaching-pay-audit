export function assertCloudLogoutReady({ online, authenticated }) {
  if (!authenticated) {
    throw new Error('The cloud session is not active. Reload the app and sign in again before signing out.');
  }
  if (!online) {
    throw new Error('The internet connection is unavailable. Sign out is paused until Firebase can verify the latest data.');
  }
}

export function assertNoPendingChanges({ dirtyMonthKeys, settingsDirty }) {
  const pendingMonths = Number(dirtyMonthKeys?.size || 0);
  if (pendingMonths > 0 || Boolean(settingsDirty)) {
    throw new Error('Some changes have not been uploaded to Firebase. Synchronize again before signing out.');
  }
}

export function assertRevisionConfirmed(expectedRevision, actualRevision) {
  const expected = String(expectedRevision || '').trim();
  const actual = String(actualRevision || '').trim();
  if (!expected || !actual || expected !== actual) {
    throw new Error('Firebase has not confirmed the latest data revision. Sign out was cancelled to prevent unsaved changes.');
  }
  return true;
}

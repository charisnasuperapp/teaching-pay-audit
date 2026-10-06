import { BRAND, BRAND_CREATED_FOR } from './brand.js';
import { calculatePay, formatCurrency, formatHours, summarizeMonth, validateEntry } from './lib/calculations.js';
import { createDatabase, createMonth, ensureMonth, markMonthEdited, markSettingsEdited, mergeDatabases, sanitizeDatabase } from './lib/database.js';
import { formatMonthKey, getMonthKeysForYear, getYear, shiftMonth, toMonthKey } from './lib/date.js';
import { exportBackup, exportMonthCsv, exportYearCsv, readBackup } from './lib/export.js';
import { exportMonthPdf, exportYearPdf } from './lib/pdf-report.js';
import { FirebaseRestClient } from './lib/firebase-rest.js';
import { clearDatabase, loadDatabase, loadDatabaseOrNull, saveDatabase } from './lib/storage.js';
import { assertCloudLogoutReady, assertNoPendingChanges, assertRevisionConfirmed } from './lib/logout-guard.js';

const root = document.querySelector('#app');
const backupInput = document.querySelector('#backup-input');
const firebaseConfig = window.__AUDIT_GAJI_CONFIG__?.firebase || {};
const cloud = new FirebaseRestClient(firebaseConfig);

const state = {
  database: null,
  monthKey: toMonthKey(new Date()),
  selectedYear: new Date().getFullYear(),
  view: 'monthly',
  settingsOpen: false,
  mobileMenuOpen: false,
  cloudStatus: 'disabled',
  cloudError: '',
  authStatus: cloud.configured ? 'checking' : 'configuration-error',
  authMode: 'login',
  authError: '',
  authNotice: '',
  authEmail: '',
  passwordVisible: false,
  logoutDialogOpen: false,
  logoutPhase: 'idle',
  logoutError: '',
  currentUser: null,
  localScope: 'legacy',
  legacyMigrationPending: false,
  busy: false,
};

const CLOUD_SAVE_DEBOUNCE_MS = 250;
const ACTIVE_POLL_MS = 2500;
const IDLE_POLL_MS = 15000;
const HIDDEN_POLL_MS = 60000;
const ACTIVE_WINDOW_MS = 120000;
const EPOCH = '1970-01-01T00:00:00.000Z';
const MIGRATION_KEY_PREFIX = 'audit-gaji-login-migrated-v1:';

const dirtyMonthKeys = new Set();
const syncChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('audit-gaji-cloud-sync-v2') : null;
let settingsDirty = false;
let localSaveTimer;
let cloudSaveTimer;
let cloudFlushPromise = null;
let cloudFlushQueued = false;
let pollTimer;
let pollGeneration = 0;
let pollInFlight = false;
let lastCloudRevision = EPOCH;
let activeUntil = Date.now() + ACTIVE_WINDOW_MS;
let toastTimer;

await initialize();

async function initialize() {
  state.database = ensureMonth(await loadDatabase('legacy'), state.monthKey);
  registerEvents();
  render();

  if (cloud.configured) {
    const session = await cloud.restoreSession();
    if (session) await activateAuthenticatedSession(session, { silent: true });
    else {
      state.authStatus = 'signed-out';
      state.cloudStatus = 'disabled';
      render();
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}

function registerEvents() {
  root.addEventListener('click', handleClick);
  root.addEventListener('input', handleInput);
  root.addEventListener('change', handleChange);
  root.addEventListener('submit', handleSubmit);
  backupInput.addEventListener('change', handleBackupFile);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('pointerdown', markUserActive, { passive: true });
  document.addEventListener('keydown', markUserActive, { passive: true });
  syncChannel?.addEventListener('message', (event) => {
    if (cloud.authenticated && event.data?.uid === cloud.user?.uid) pullRemoteChanges({ silent: true });
  });
}

async function handleClick(event) {
  if (event.target instanceof Element && event.target.matches('[data-backdrop]')) {
    state.settingsOpen = false;
    render();
    return;
  }

  const button = event.target instanceof Element ? event.target.closest('[data-action]') : null;
  if (!button || state.busy) return;
  const action = button.dataset.action;

  if (action === 'show-login') {
    setAuthMode('login');
  } else if (action === 'show-register') {
    setAuthMode('register');
  } else if (action === 'show-reset') {
    setAuthMode('reset');
  } else if (action === 'toggle-password') {
    state.passwordVisible = !state.passwordVisible;
    const type = state.passwordVisible ? 'text' : 'password';
    root.querySelectorAll('input[name="password"], input[name="confirmPassword"]').forEach((input) => { input.type = type; });
    button.innerHTML = icon(state.passwordVisible ? 'eye-off' : 'eye', 18);
    button.setAttribute('aria-label', `${state.passwordVisible ? 'Hide' : 'Show'} password`);
  } else if (action === 'monthly-view') {
    state.view = 'monthly';
    state.mobileMenuOpen = false;
    render();
  } else if (action === 'yearly-view') {
    state.view = 'yearly';
    state.mobileMenuOpen = false;
    render();
  } else if (action === 'previous-month') {
    changeMonth(shiftMonth(state.monthKey, -1));
  } else if (action === 'next-month') {
    changeMonth(shiftMonth(state.monthKey, 1));
  } else if (action === 'previous-year') {
    state.selectedYear -= 1;
    render();
  } else if (action === 'next-year') {
    state.selectedYear += 1;
    render();
  } else if (action === 'open-month') {
    changeMonth(button.dataset.month);
    state.view = 'monthly';
    render();
  } else if (action === 'open-settings') {
    state.settingsOpen = true;
    render();
  } else if (action === 'close-settings') {
    state.settingsOpen = false;
    render();
  } else if (action === 'toggle-mobile-menu') {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    render();
  } else if (action === 'export-csv') {
    exportMonthCsv(currentMonth());
  } else if (action === 'export-year-csv') {
    exportYearCsv(state.database, state.selectedYear);
  } else if (action === 'export-month-pdf') {
    try {
      exportMonthPdf(currentMonth(), state.database.settings.teacherName);
      showToast('Monthly PDF downloaded successfully.', 'success');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    }
  } else if (action === 'export-year-pdf') {
    try {
      exportYearPdf(state.database, state.selectedYear);
      showToast('Annual PDF downloaded successfully.', 'success');
    } catch (error) {
      showToast(errorMessage(error), 'error');
    }
  } else if (action === 'backup') {
    exportBackup(state.database);
  } else if (action === 'restore') {
    backupInput.click();
  } else if (action === 'clear-month') {
    clearCurrentMonth();
  } else if (action === 'sync-now') {
    await syncNow();
  } else if (action === 'sign-out') {
    openLogoutDialog();
  } else if (action === 'cancel-sign-out') {
    closeLogoutDialog();
  } else if (action === 'confirm-sign-out') {
    await signOutCurrentUser();
  }
}

function setAuthMode(mode) {
  state.authMode = ['login', 'register', 'reset'].includes(mode) ? mode : 'login';
  state.authError = '';
  state.authNotice = '';
  state.passwordVisible = false;
  render();
}

async function handleSubmit(event) {
  const form = event.target instanceof HTMLFormElement ? event.target : null;
  if (!form?.dataset.authForm || state.busy) return;
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  state.authEmail = email;
  state.authError = '';
  state.authNotice = '';
  state.busy = true;
  render();

  try {
    if (form.dataset.authForm === 'reset') {
      await cloud.sendPasswordReset(email);
      state.authMode = 'login';
      state.authNotice = `A password reset link has been sent to ${email}.`;
      return;
    }

    if (form.dataset.authForm === 'register' && password !== confirmPassword) {
      throw new Error('Password confirmation does not match.');
    }

    const session = form.dataset.authForm === 'register'
      ? await cloud.signUp(email, password)
      : await cloud.signIn(email, password);
    await activateAuthenticatedSession(session, { silent: false });
  } catch (error) {
    if (state.authStatus === 'authenticated') {
      cloud.signOut();
      state.currentUser = null;
      state.localScope = 'legacy';
      state.database = ensureMonth(await loadDatabase('legacy'), state.monthKey);
    }
    state.authStatus = 'signed-out';
    state.authError = errorMessage(error);
  } finally {
    state.busy = false;
    render();
  }
}

async function activateAuthenticatedSession(session, { silent = false } = {}) {
  state.currentUser = { uid: session.uid, email: session.email || '' };
  state.authStatus = 'authenticated';
  state.authError = '';
  state.authNotice = '';
  state.cloudStatus = navigator.onLine ? 'syncing' : 'error';
  state.cloudError = navigator.onLine ? '' : 'This device is offline. Local data will sync when an internet connection is available.';

  const scope = `user:${session.uid}`;
  const userDatabase = (await loadDatabaseOrNull(scope)) || createDatabase();
  const alreadyMigrated = hasCompletedLoginMigration(session.uid);
  state.legacyMigrationPending = !alreadyMigrated;
  state.database = ensureMonth(
    state.legacyMigrationPending ? mergeDatabases(userDatabase, state.database) : userDatabase,
    state.monthKey,
  );
  state.localScope = scope;
  await saveDatabase(state.database, state.localScope);
  render();

  if (navigator.onLine) await connectAndSync({ silent });
  startRemotePolling();
}

function hasCompletedLoginMigration(uid) {
  try {
    return localStorage.getItem(`${MIGRATION_KEY_PREFIX}${uid}`) === '1';
  } catch {
    return false;
  }
}

async function completeLoginMigration() {
  const uid = cloud.user?.uid;
  if (!uid || !state.legacyMigrationPending) return;
  try {
    localStorage.setItem(`${MIGRATION_KEY_PREFIX}${uid}`, '1');
  } catch {}
  await clearDatabase('legacy');
  state.legacyMigrationPending = false;
}

function openLogoutDialog() {
  state.logoutDialogOpen = true;
  state.logoutPhase = 'idle';
  state.logoutError = '';
  state.mobileMenuOpen = false;
  render();
}

function closeLogoutDialog() {
  if (state.busy) return;
  state.logoutDialogOpen = false;
  state.logoutPhase = 'idle';
  state.logoutError = '';
  render();
}

async function signOutCurrentUser() {
  state.busy = true;
  state.logoutPhase = 'saving';
  state.logoutError = '';
  render();

  try {
    clearTimeout(localSaveTimer);
    clearTimeout(cloudSaveTimer);
    await saveDatabase(state.database, state.localScope);

    assertCloudLogoutReady({ online: navigator.onLine, authenticated: cloud.authenticated });

    state.logoutPhase = 'syncing';
    render();

    if (cloudFlushPromise) await cloudFlushPromise;
    if (dirtyMonthKeys.size || settingsDirty) {
      await flushCloudChanges({ immediate: true, throwOnError: true });
    }
    assertNoPendingChanges({ dirtyMonthKeys, settingsDirty });

    state.logoutPhase = 'verifying';
    render();

    await cloud.connect();
    const remote = await cloud.fetchSnapshot();
    state.database = ensureMonth(mergeDatabases(state.database, remote.database), state.monthKey);
    await saveDatabase(state.database, state.localScope);
    lastCloudRevision = await cloud.syncAll(state.database);
    const confirmedRevision = await cloud.fetchRevision();
    assertRevisionConfirmed(lastCloudRevision, confirmedRevision);

    dirtyMonthKeys.clear();
    settingsDirty = false;
    state.cloudStatus = 'synced';
    state.cloudError = '';
  } catch (error) {
    state.busy = false;
    state.logoutPhase = 'error';
    state.logoutError = errorMessage(error);
    state.cloudStatus = 'error';
    state.cloudError = state.logoutError;
    render();
    return;
  }

  cloud.signOut();
  clearTimeout(cloudSaveTimer);
  clearTimeout(pollTimer);
  pollGeneration += 1;
  dirtyMonthKeys.clear();
  settingsDirty = false;
  cloudFlushQueued = false;
  cloudFlushPromise = null;
  lastCloudRevision = EPOCH;
  state.currentUser = null;
  state.localScope = 'legacy';
  state.database = ensureMonth(createDatabase(), state.monthKey);
  state.settingsOpen = false;
  state.mobileMenuOpen = false;
  state.logoutDialogOpen = false;
  state.logoutPhase = 'idle';
  state.logoutError = '';
  state.cloudStatus = 'disabled';
  state.cloudError = '';
  state.authStatus = 'signed-out';
  state.authMode = 'login';
  state.authError = '';
  state.authNotice = 'All data was saved and the account was signed out safely.';
  state.passwordVisible = false;
  state.busy = false;
  render();
}

function handleInput(event) {
  const input = event.target;
  if (!isEditableField(input)) return;
  if (input instanceof HTMLTextAreaElement && input.dataset.autoGrow === 'true') resizeAutoGrowTextarea(input);

  if (input.dataset.field && input.dataset.day) {
    const day = Number(input.dataset.day);
    const entry = currentMonth().entries[day];
    if (!entry) return;
    if (input.dataset.field === 'hours') {
      entry.hours = Math.min(24, Math.max(0, Number(input.value) || 0));
      if (Number(input.value) > 24 || Number(input.value) < 0) input.value = entry.hours ? String(entry.hours) : '';
    }
    else entry[input.dataset.field] = input.value;
    markMonthEdited(currentMonth());
    markChanged({ monthKey: state.monthKey });
    updateMonthlyComputed();
    return;
  }

  if (input.dataset.monthRate === 'true') {
    currentMonth().hourlyRate = Math.max(0, Number(input.value) || 0);
    markMonthEdited(currentMonth());
    markChanged({ monthKey: state.monthKey });
    updateMonthlyComputed();
    return;
  }

  if (input.dataset.setting) {
    const key = input.dataset.setting;
    state.database.settings[key] = key === 'defaultHourlyRate'
      ? Math.max(0, Number(input.value) || 0)
      : input.value.slice(0, 100);
    markSettingsEdited(state.database.settings);
    markChanged({ settings: true });
  }
}

function handleChange(event) {
  const input = event.target;
  if (input instanceof HTMLInputElement && input.dataset.monthPicker && input.value) changeMonth(input.value);
}

function isEditableField(element) {
  return element instanceof HTMLInputElement
    || (typeof HTMLTextAreaElement !== 'undefined' && element instanceof HTMLTextAreaElement);
}

function resizeAutoGrowTextarea(textarea) {
  textarea.style.height = 'auto';
  const minimumHeight = 38;
  const maximumHeight = 180;
  const nextHeight = Math.min(maximumHeight, Math.max(minimumHeight, textarea.scrollHeight));
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maximumHeight ? 'auto' : 'hidden';
}

function scheduleAutoGrowTextareas() {
  const resizeAll = () => {
    root.querySelectorAll('textarea[data-auto-grow="true"]').forEach((textarea) => resizeAutoGrowTextarea(textarea));
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(resizeAll);
  else resizeAll();
}

async function handleBackupFile() {
  const file = backupInput.files?.[0];
  backupInput.value = '';
  if (!file) return;
  if (!window.confirm('Restore this backup? Data will be merged using the newest version of each month.')) return;

  try {
    const imported = sanitizeDatabase(await readBackup(file));
    state.database = ensureMonth(mergeDatabases(state.database, imported), state.monthKey);
    await saveDatabase(state.database, state.localScope);
    if (cloud.authenticated) {
      lastCloudRevision = await cloud.syncAll(state.database);
      dirtyMonthKeys.clear();
      settingsDirty = false;
      syncChannel?.postMessage({ type: 'cloud-updated', revision: lastCloudRevision, uid: cloud.user?.uid || '' });
    }
    render();
    showToast('The backup was restored and merged successfully.', 'success');
  } catch {
    showToast('The backup file is invalid or corrupted.', 'error');
  }
}

function changeMonth(monthKey) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) return;
  state.monthKey = monthKey;
  state.selectedYear = getYear(monthKey);
  state.database = ensureMonth(state.database, monthKey);
  markChanged();
  render();
}

function clearCurrentMonth() {
  if (!window.confirm(`Clear all data for ${formatMonthKey(state.monthKey)}? This action cannot be undone without a backup.`)) return;
  const rate = currentMonth().hourlyRate;
  state.database.months[state.monthKey] = createMonth(state.monthKey, rate);
  markMonthEdited(state.database.months[state.monthKey]);
  markChanged({ monthKey: state.monthKey });
  render();
  showToast('The selected month was cleared successfully.', 'success');
}

async function connectAndSync({ silent = false } = {}) {
  if (!cloud.configured || !cloud.authenticated) return;
  state.cloudStatus = 'syncing';
  state.cloudError = '';
  updateCloudUi();
  try {
    await cloud.connect();
    const remote = await cloud.fetchSnapshot();
    state.database = ensureMonth(mergeDatabases(state.database, remote.database), state.monthKey);
    await saveDatabase(state.database, state.localScope);
    lastCloudRevision = await cloud.syncAll(state.database);
    dirtyMonthKeys.clear();
    settingsDirty = false;
    state.cloudStatus = 'synced';
    state.cloudError = '';
    await completeLoginMigration();
    markUserActive();
    if (!silent) showToast('Signed in successfully. Your data is synchronized.', 'success');
    renderAfterCloudSync();
  } catch (error) {
    state.cloudStatus = 'error';
    state.cloudError = errorMessage(error);
    updateCloudUi();
    if (!silent || state.settingsOpen) showToast(errorMessage(error), 'error');
  }
}

async function syncNow() {
  if (!cloud.configured || !cloud.authenticated) return;
  state.busy = true;
  state.cloudStatus = 'syncing';
  state.cloudError = '';
  render();
  try {
    await flushCloudChanges({ immediate: true });
    await cloud.connect();
    const remote = await cloud.fetchSnapshot();
    state.database = ensureMonth(mergeDatabases(state.database, remote.database), state.monthKey);
    await saveDatabase(state.database, state.localScope);
    lastCloudRevision = await cloud.syncAll(state.database);
    dirtyMonthKeys.clear();
    settingsDirty = false;
    state.cloudStatus = 'synced';
    state.cloudError = '';
    await completeLoginMigration();
    markUserActive();
    syncChannel?.postMessage({ type: 'cloud-updated', revision: lastCloudRevision, uid: cloud.user?.uid || '' });
    showToast('Synchronization completed.', 'success');
  } catch (error) {
    state.cloudStatus = 'error';
    state.cloudError = errorMessage(error);
    showToast(errorMessage(error), 'error');
  } finally {
    state.busy = false;
    render();
  }
}

function markChanged({ monthKey = '', settings = false } = {}) {
  clearTimeout(localSaveTimer);
  localSaveTimer = setTimeout(() => saveDatabase(state.database, state.localScope).catch(() => showToast('Data could not be saved on this device.', 'error')), 100);

  if (monthKey) dirtyMonthKeys.add(monthKey);
  if (settings) settingsDirty = true;
  if (!monthKey && !settings) return;

  markUserActive();
  if (!cloud.configured || !cloud.authenticated) return;
  state.cloudStatus = navigator.onLine ? 'syncing' : 'error';
  state.cloudError = navigator.onLine ? '' : 'This device is offline. Your data remains stored locally and will be uploaded when the connection returns.';
  updateCloudUi();
  scheduleCloudFlush(CLOUD_SAVE_DEBOUNCE_MS);
}

function scheduleCloudFlush(delay = CLOUD_SAVE_DEBOUNCE_MS) {
  clearTimeout(cloudSaveTimer);
  if (!cloud.configured || !cloud.authenticated || !navigator.onLine || (!dirtyMonthKeys.size && !settingsDirty)) return;
  cloudSaveTimer = setTimeout(() => flushCloudChanges(), Math.max(0, delay));
}

async function flushCloudChanges({ keepalive = false, immediate = false, throwOnError = false } = {}) {
  clearTimeout(cloudSaveTimer);
  if (!cloud.configured || !cloud.authenticated || !navigator.onLine || (!dirtyMonthKeys.size && !settingsDirty)) return;
  if (keepalive && !cloud.connected) return;

  if (cloudFlushPromise) {
    cloudFlushQueued = true;
    return cloudFlushPromise;
  }

  const monthKeys = [...dirtyMonthKeys];
  const hadSettingsChange = settingsDirty;
  for (const monthKey of monthKeys) dirtyMonthKeys.delete(monthKey);
  if (hadSettingsChange) settingsDirty = false;
  const snapshot = sanitizeDatabase(state.database);

  state.cloudStatus = 'syncing';
  state.cloudError = '';
  updateCloudUi();

  cloudFlushPromise = (async () => {
    try {
      lastCloudRevision = await cloud.saveChanges(snapshot, monthKeys, { keepalive });
      state.cloudStatus = 'synced';
      state.cloudError = '';
      syncChannel?.postMessage({ type: 'cloud-updated', revision: lastCloudRevision, uid: cloud.user?.uid || '' });
    } catch (error) {
      for (const monthKey of monthKeys) dirtyMonthKeys.add(monthKey);
      if (hadSettingsChange) settingsDirty = true;
      state.cloudStatus = 'error';
      state.cloudError = errorMessage(error);
      if (!keepalive) showToast(state.cloudError, 'error');
      if (throwOnError) throw error;
    } finally {
      cloudFlushPromise = null;
      updateCloudUi();
      if (cloudFlushQueued || dirtyMonthKeys.size || settingsDirty) {
        cloudFlushQueued = false;
        scheduleCloudFlush(immediate ? 0 : 100);
      }
    }
  })();

  return cloudFlushPromise;
}

async function pullRemoteChanges({ silent = true } = {}) {
  if (!cloud.configured || !cloud.authenticated || !navigator.onLine || state.busy || pollInFlight) return;
  pollInFlight = true;
  try {
    if (dirtyMonthKeys.size || settingsDirty) await flushCloudChanges({ immediate: true });
    const revision = await cloud.fetchRevision();
    if (revision === lastCloudRevision) return;
    if (revision === EPOCH && lastCloudRevision === EPOCH) return;

    const remote = await cloud.fetchSnapshot();
    if (remote.revision === lastCloudRevision) return;
    state.database = ensureMonth(mergeDatabases(state.database, remote.database), state.monthKey);
    await saveDatabase(state.database, state.localScope);
    lastCloudRevision = remote.revision;
    state.cloudStatus = 'synced';
    state.cloudError = '';
    renderAfterCloudSync();
    if (!silent) showToast('Changes from another device have been received.', 'success');
  } catch (error) {
    state.cloudStatus = 'error';
    state.cloudError = errorMessage(error);
    updateCloudUi();
  } finally {
    pollInFlight = false;
  }
}

function startRemotePolling() {
  clearTimeout(pollTimer);
  const generation = ++pollGeneration;
  if (!cloud.configured || !cloud.authenticated) return;
  const run = async () => {
    await pullRemoteChanges({ silent: true });
    if (generation !== pollGeneration) return;
    const delay = document.hidden
      ? HIDDEN_POLL_MS
      : Date.now() < activeUntil ? ACTIVE_POLL_MS : IDLE_POLL_MS;
    pollTimer = setTimeout(run, delay);
  };
  pollTimer = setTimeout(run, ACTIVE_POLL_MS);
}

function markUserActive() {
  activeUntil = Date.now() + ACTIVE_WINDOW_MS;
}

function handleOnline() {
  if (!cloud.authenticated) return;
  markUserActive();
  connectAndSync({ silent: true }).then(() => scheduleCloudFlush(0));
  startRemotePolling();
}

function handleOffline() {
  state.cloudStatus = cloud.authenticated ? 'error' : 'disabled';
  state.cloudError = cloud.authenticated ? 'This device is offline. Your data remains safe on this device.' : '';
  updateCloudUi();
}

function handleFocus() {
  if (!cloud.authenticated) return;
  markUserActive();
  pullRemoteChanges({ silent: true });
  startRemotePolling();
}

function handleVisibilityChange() {
  if (document.hidden) {
    void saveDatabase(state.database, state.localScope);
    void flushCloudChanges({ keepalive: true, immediate: true });
  } else {
    handleFocus();
  }
}

function handlePageHide() {
  void saveDatabase(state.database, state.localScope);
  void flushCloudChanges({ keepalive: true, immediate: true });
}

function handleBeforeUnload(event) {
  if (!cloud.authenticated) return;
  void saveDatabase(state.database, state.localScope);
  void flushCloudChanges({ keepalive: true, immediate: true });
  if (dirtyMonthKeys.size || settingsDirty || state.cloudStatus === 'syncing') {
    event.preventDefault();
    event.returnValue = '';
  }
}

function currentMonth() {
  return state.database.months[state.monthKey];
}

function render() {
  if (state.authStatus !== 'authenticated') {
    root.innerHTML = renderAuthScreen();
    return;
  }

  const main = state.view === 'monthly' ? renderMonthly() : renderYearly();
  root.innerHTML = `
    <div class="app-shell">
      ${renderHeader()}
      <main class="content">${main}</main>
      ${state.settingsOpen ? renderSettings() : ''}
      ${state.logoutDialogOpen ? renderLogoutDialog() : ''}
      <footer class="app-footer"><span>${icon('signature', 14)} ${BRAND_CREATED_FOR}</span><span>${icon('database', 14)} Offline-first</span><span>${icon('shield', 14)} Private automatic synchronization</span></footer>
    </div>`;
  scheduleAutoGrowTextareas();
}

function renderAuthScreen() {
  if (state.authStatus === 'checking') {
    return `<main class="auth-shell"><div class="auth-loading"><div class="auth-logo">${icon('money', 34)}</div><span class="spinner"></span><h1>${escapeHtml(BRAND.productName)}</h1><p>Checking your session and preparing synchronization...</p></div></main>`;
  }

  if (state.authStatus === 'configuration-error') {
    return `<main class="auth-shell"><section class="auth-card configuration-card"><div class="auth-brand"><div class="auth-logo">${icon('money', 34)}</div><div><span>${escapeHtml(BRAND.appName.toUpperCase())}</span><h1>${escapeHtml(BRAND.productName)}</h1></div></div><div class="auth-copy"><span class="eyebrow">CONFIGURATION REQUIRED</span><h2>Firebase is not connected</h2><p>The sign-in page requires Firebase configuration in your Vercel deployment.</p></div><div class="auth-alert error"><strong>Add the following two environment variables:</strong><code>VITE_FIREBASE_API_KEY</code><code>VITE_FIREBASE_PROJECT_ID</code></div><p class="auth-footnote">After saving the variables, redeploy the Production deployment.</p></section></main>`;
  }

  const isRegister = state.authMode === 'register';
  const isReset = state.authMode === 'reset';
  const title = isRegister ? `Set up ${BRAND.ownerName}'s workspace` : isReset ? 'Recover account access' : `Welcome, ${BRAND.ownerName}`;
  const description = isRegister
    ? 'Create one private account to access the same data on your phone, tablet, computer, and any other browser.'
    : isReset
      ? 'A recovery link will be sent to the email address registered for this workspace.'
      : 'Sign in to access teaching-hour records, pay audits, and reports that synchronize automatically.';
  const passwordType = state.passwordVisible ? 'text' : 'password';
  const submitLabel = isRegister ? 'Create account & sync' : isReset ? 'Send reset link' : 'Sign in & sync';

  return `<main class="auth-shell">
    <section class="auth-showcase"><div class="showcase-content"><div class="auth-brand inverse"><div class="auth-logo">${icon('money', 34)}</div><div><span>${escapeHtml(BRAND.appName.toUpperCase())}</span><h1>${escapeHtml(BRAND.productName)}</h1></div></div><div class="creator-badge">${icon('signature', 16)} <span>PERSONAL WORKSPACE</span></div><span class="showcase-eyebrow">CREATED EXCLUSIVELY FOR ${escapeHtml(BRAND.ownerName.toUpperCase())}</span><h2>Created by ${escapeHtml(BRAND.developerName)}.<br>Designed for ${escapeHtml(BRAND.ownerName)}.</h2><p>This private workspace was created by ${escapeHtml(BRAND.developerName)} exclusively for ${escapeHtml(BRAND.ownerName)} to track teaching hours, audit earnings, and keep every report organized across devices.</p><div class="showcase-features"><span>${icon('signature', 18)} A personal ${escapeHtml(BRAND.developerName)} × ${escapeHtml(BRAND.ownerName)} workspace</span><span>${icon('refresh', 18)} Every change synchronizes automatically</span><span>${icon('shield', 18)} Data stays safe when the connection is interrupted</span></div><div class="showcase-status-card"><div><span>WORKSPACE STATUS</span><strong>Private & connected</strong></div><div class="status-orb"><i></i> Auto sync</div></div></div></section>
    <section class="auth-panel"><div class="auth-panel-inner"><div class="mobile-auth-brand"><div class="auth-logo">${icon('money', 30)}</div><div><strong>${escapeHtml(BRAND.productName)}</strong><span>${escapeHtml(BRAND.appName)}</span></div></div><div class="mobile-creator-note">${icon('signature', 16)} ${escapeHtml(BRAND.ownerName)}'s private workspace, created by ${escapeHtml(BRAND.developerName)}.</div><span class="eyebrow">PRIVATE WORKSPACE ACCESS</span><h2>${title}</h2><p class="auth-description">${description}</p>
      ${state.authError ? `<div class="auth-alert error">${icon('warning', 18)}<span>${escapeHtml(state.authError)}</span></div>` : ''}
      ${state.authNotice ? `<div class="auth-alert success">${icon('check', 18)}<span>${escapeHtml(state.authNotice)}</span></div>` : ''}
      <form class="auth-form" data-auth-form="${isReset ? 'reset' : isRegister ? 'register' : 'login'}">
        <label>Email<input name="email" type="email" inputmode="email" autocomplete="email" required maxlength="254" value="${escapeAttribute(state.authEmail)}" placeholder="name@example.com"></label>
        ${isReset ? '' : `<label>Password<div class="password-field"><input name="password" type="${passwordType}" autocomplete="${isRegister ? 'new-password' : 'current-password'}" required minlength="6" maxlength="4096" placeholder="At least 6 characters"><button type="button" data-action="toggle-password" aria-label="${state.passwordVisible ? 'Hide' : 'Show'} password">${icon(state.passwordVisible ? 'eye-off' : 'eye', 18)}</button></div></label>`}
        ${isRegister ? `<label>Confirm password<input name="confirmPassword" type="${passwordType}" autocomplete="new-password" required minlength="6" maxlength="4096" placeholder="Re-enter password"></label>` : ''}
        <button class="button primary auth-submit" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? '<span class="spinner"></span> Processing...' : `${icon(isReset ? 'mail' : isRegister ? 'user-plus' : 'login', 18)} ${submitLabel}`}</button>
      </form>
      <div class="auth-links">
        ${isReset ? `<button type="button" data-action="show-login">Back to sign in</button>` : isRegister ? `<span>Already have an account?</span><button type="button" data-action="show-login">Sign in</button>` : `<button type="button" data-action="show-reset">Forgot password?</button><span>Don't have an account?</span><button type="button" data-action="show-register">Create account</button>`}
      </div>
      <div class="auth-security-note">${icon('lock', 16)} Your session is saved in this browser so you do not need to sign in every time. Use Sign Out on shared or public devices.</div>
    </div></section>
  </main>`;
}

function renderHeader() {
  const statusLabel = cloudStatusLabel();
  return `<header class="app-header">
    <div class="brand-block"><div class="brand-logo">${icon('money', 26)}</div><div><h1>${escapeHtml(BRAND.productName)}</h1><p>${escapeHtml(BRAND.ownerName)}'s private workspace</p></div></div>
    <nav class="main-nav ${state.mobileMenuOpen ? 'open' : ''}">
      <button data-action="monthly-view" class="${state.view === 'monthly' ? 'active' : ''}">${icon('calendar', 18)} Monthly</button>
      <button data-action="yearly-view" class="${state.view === 'yearly' ? 'active' : ''}">${icon('history', 18)} Annual Summary</button>
    </nav>
    <div class="header-actions"><div id="cloud-indicator" class="cloud-indicator ${state.cloudStatus}"><span></span>${statusLabel}</div><button class="header-signout-button" data-action="sign-out" aria-label="Sign out safely">${icon('logout', 17)}<span>Sign Out</span></button><button class="icon-button" data-action="open-settings" aria-label="Open settings">${icon('settings', 20)}</button><button class="icon-button mobile-menu-button" data-action="toggle-mobile-menu" aria-label="Open menu">${icon('menu', 20)}</button></div>
  </header>`;
}

function renderMonthly() {
  const month = currentMonth();
  const summary = summarizeMonth(month);
  const invalidCount = Object.values(month.entries).filter((entry) => validateEntry(entry)).length;
  return `
    <section class="page-title-row">
      <div><span class="eyebrow">MONTHLY REPORT</span><h2>${formatMonthKey(state.monthKey)}</h2><p>Enter the class name and teaching hours. Pay is calculated automatically using hours × this month's hourly rate.</p></div>
      <div class="month-switcher"><button data-action="previous-month" aria-label="Previous month">${icon('left', 19)}</button><input data-month-picker="true" type="month" value="${state.monthKey}" aria-label="Select month"><button data-action="next-month" aria-label="Next month">${icon('right', 19)}</button></div>
    </section>
    <section class="summary-grid">
      ${summaryCard('calendar', 'Teaching Days', String(summary.activeDays), 'days recorded', 'summary-days')}
      ${summaryCard('clock', 'Total Hours', `${formatHours(summary.totalHours)} hours`, `Average ${formatHours(summary.averageHours)} hours/day`, 'summary-hours')}
      ${summaryCard('money', 'Total Pay', formatCurrency(summary.totalPay), `${formatCurrency(month.hourlyRate)} per hour`, 'summary-pay')}
    </section>
    <section class="data-card">
      <div class="card-toolbar"><div><h3>Daily Details</h3><p>Data is saved automatically on this device.</p></div><div class="toolbar-actions">
        <span id="audit-status" class="audit-status ${invalidCount ? 'warning' : 'clean'}">${invalidCount ? `${invalidCount} ${invalidCount === 1 ? 'row requires' : 'rows require'} review` : `${icon('check', 14)} Audit clear`}</span>
        <label class="rate-control">This month's rate <span>$</span><input data-month-rate="true" type="number" min="0" step="0.25" value="${month.hourlyRate || ''}" aria-label="Hourly rate for this month"></label>
        <button class="button secondary compact" data-action="export-csv">${icon('sheet', 17)} CSV</button>
        <button class="button secondary compact" data-action="export-month-pdf">${icon('pdf', 17)} Download PDF</button>
      </div></div>
      <div class="table-wrapper"><table class="entry-table"><thead><tr><th class="date-column">Date</th><th>Class</th><th class="hours-column">Hours</th><th class="rate-column">Rate</th><th class="amount-column">Amount</th><th>Notes</th></tr></thead><tbody>
        ${Object.values(month.entries).map(renderEntryRow).join('')}
      </tbody><tfoot><tr><td colspan="2">TOTAL ${formatMonthKey(state.monthKey).toUpperCase()}</td><td id="footer-hours">${formatHours(summary.totalHours)}</td><td></td><td id="footer-pay">${formatCurrency(summary.totalPay)}</td><td id="footer-days">${summary.activeDays} teaching days</td></tr></tfoot></table></div>
    </section>`;
}

function renderEntryRow(entry) {
  const error = validateEntry(entry);
  const month = currentMonth();
  return `<tr data-row="${entry.day}" class="${error ? 'invalid-row' : ''}">
    <td class="date-cell"><span>${entry.day}</span></td>
    <td class="multiline-editor-cell"><textarea class="table-input table-textarea class-textarea" data-day="${entry.day}" data-field="className" data-auto-grow="true" placeholder="Example: English A1&#10;Press Enter for another line" maxlength="500" rows="1" aria-label="Class for day ${entry.day}">${escapeHtml(entry.className)}</textarea><small data-error="${entry.day}">${escapeHtml(error)}</small></td>
    <td><input class="table-input number-input" data-day="${entry.day}" data-field="hours" type="number" min="0" max="24" step="0.25" inputmode="decimal" value="${entry.hours || ''}" placeholder="0" aria-label="Hours for day ${entry.day}"></td>
    <td class="muted-cell" data-rate-cell="${entry.day}">${formatCurrency(month.hourlyRate)}</td>
    <td class="amount-cell" data-amount="${entry.day}">${formatCurrency(calculatePay(entry.hours, month.hourlyRate))}</td>
    <td class="multiline-editor-cell"><textarea class="table-input table-textarea notes-textarea" data-day="${entry.day}" data-field="notes" data-auto-grow="true" placeholder="Optional notes&#10;Press Enter for another line" maxlength="500" rows="1" aria-label="Notes for day ${entry.day}">${escapeHtml(entry.notes)}</textarea></td>
  </tr>`;
}

function renderYearly() {
  const rows = getMonthKeysForYear(state.selectedYear).map((monthKey) => {
    const month = state.database.months[monthKey];
    return month ? summarizeMonth(month) : { monthKey, activeDays: 0, totalHours: 0, totalPay: 0, averageHours: 0 };
  });
  const total = rows.reduce((sum, row) => ({ days: sum.days + row.activeDays, hours: sum.hours + row.totalHours, pay: sum.pay + row.totalPay }), { days: 0, hours: 0, pay: 0 });

  return `<section class="page-title-row"><div><span class="eyebrow">ANNUAL SUMMARY</span><h2>${state.selectedYear} Overview</h2><p>Compare teaching hours and earnings across every month.</p></div><div class="year-switcher"><button data-action="previous-year">${icon('left', 19)}</button><strong>${state.selectedYear}</strong><button data-action="next-year">${icon('right', 19)}</button></div></section>
    <section class="summary-grid yearly-summary">${summaryCard('calendar', 'Total Days', formatHours(total.days), 'teaching days this year')}${summaryCard('clock', 'Total Hours', `${formatHours(total.hours)} hours`, 'combined across 12 months')}${summaryCard('money', 'Total Earnings', formatCurrency(total.pay), 'total pay for the year')}</section>
    <section class="data-card"><div class="card-toolbar"><div><h3>Monthly Breakdown</h3><p>Select a month to open its daily details.</p></div><div class="toolbar-actions"><button class="button secondary compact" data-action="export-year-csv">${icon('sheet', 17)} Annual CSV</button><button class="button secondary compact" data-action="export-year-pdf">${icon('pdf', 17)} Download Annual PDF</button></div></div><div class="table-wrapper"><table class="year-table"><thead><tr><th>Month</th><th>Teaching Days</th><th>Total Hours</th><th>Average/Day</th><th>Total Pay</th><th></th></tr></thead><tbody>
      ${rows.map((row) => `<tr><td><strong>${formatMonthKey(row.monthKey)}</strong></td><td>${row.activeDays}</td><td>${formatHours(row.totalHours)}</td><td>${formatHours(row.averageHours)}</td><td class="amount-cell">${formatCurrency(row.totalPay)}</td><td><button class="text-button" data-action="open-month" data-month="${row.monthKey}">Open</button></td></tr>`).join('')}
    </tbody><tfoot><tr><td>TOTAL ${state.selectedYear}</td><td>${total.days}</td><td>${formatHours(total.hours)}</td><td></td><td>${formatCurrency(total.pay)}</td><td></td></tr></tfoot></table></div></section>`;
}

function renderSettings() {
  return `<div class="drawer-backdrop" data-backdrop="true"><aside class="settings-drawer" aria-label="Settings">
    <div class="drawer-header"><div><h2>Settings</h2><p>Profile, backup, and synchronization.</p></div><button class="icon-button" data-action="close-settings">${icon('close', 21)}</button></div>
    <div class="drawer-content">
      <section class="settings-section"><div class="section-heading">${icon('settings', 20)}<div><h3>Profile and rates</h3><p>The default rate is used when a new month is created.</p></div></div>
        <label class="field-label">Teacher name<input data-setting="teacherName" value="${escapeAttribute(state.database.settings.teacherName)}" placeholder="Full name"></label>
        <label class="field-label">Default hourly rate (USD)<input data-setting="defaultHourlyRate" type="number" min="0" step="0.25" value="${state.database.settings.defaultHourlyRate || ''}"></label>
        <div class="notice-box subtle">Changing the default rate does not modify previous months. Update the current month's rate from the Monthly page.</div>
      </section>
      <section class="settings-section"><div class="section-heading">${icon('shield', 20)}<div><h3>Backup and restore</h3><p>Save a copy of your data regularly.</p></div></div><div class="button-grid"><button class="button secondary" data-action="backup">${icon('download', 17)} Download JSON backup</button><button class="button secondary" data-action="restore">${icon('upload', 17)} Restore backup</button></div></section>
      ${renderCloudSettings()}
      <section class="settings-section danger-zone"><div class="section-heading">${icon('trash', 20)}<div><h3>Danger zone</h3><p>Only the currently selected month's data will be deleted.</p></div></div><button class="button danger-outline" data-action="clear-month">${icon('trash', 17)} Clear this month</button></section>
    </div>
    <div class="drawer-footer"><div>${icon('save', 16)}<span>Saved automatically</span></div><button class="button primary" data-action="close-settings">Done</button></div>
  </aside></div>`;
}

function renderCloudSettings() {
  const email = cloud.user?.email || state.currentUser?.email || '-';
  const statusText = cloudStatusText();
  return `<section class="settings-section"><div class="section-heading">${icon('cloud', 20)}<div><h3>Account and synchronization</h3><p>Every browser signed in with the same account uses the same cloud data.</p></div></div>
    <div class="account-summary"><div class="account-avatar">${escapeHtml((email[0] || 'A').toUpperCase())}</div><div><strong>${escapeHtml(email)}</strong><span>Private Firebase account</span></div></div>
    <div class="sync-pill ${state.cloudStatus}">${statusText}</div>
    ${state.cloudStatus === 'error' ? `<div class="notice-box warning-box"><strong>Cloud synchronization is delayed.</strong> ${escapeHtml(state.cloudError || 'Your data remains safe on this device and will be retried when the connection returns.')}</div>` : ''}
    <div class="notice-box subtle">Changes are saved locally first, then uploaded automatically about 250 ms after you stop typing. Before signing out, the app saves, synchronizes, and verifies the latest cloud revision.</div>
    <div class="button-row stacked-mobile"><button class="button secondary" data-action="sync-now">${icon('refresh', 17)} Sync now</button><button class="button danger-outline" data-action="sign-out">${icon('logout', 17)} Save & sign out</button></div>
  </section>`;
}

function renderLogoutDialog() {
  const phase = state.logoutPhase;
  const isWorking = state.busy && ['saving', 'syncing', 'verifying'].includes(phase);
  const localState = phase === 'saving' ? 'active' : ['syncing', 'verifying'].includes(phase) ? 'done' : '';
  const cloudState = phase === 'syncing' ? 'active' : phase === 'verifying' ? 'done' : '';
  const verifyState = phase === 'verifying' ? 'active' : '';
  const actionLabel = phase === 'saving'
    ? 'Saving on this device...'
    : phase === 'syncing'
      ? 'Uploading to Firebase...'
      : phase === 'verifying'
        ? 'Verifying cloud data...'
        : 'Save everything & sign out';

  return `<div class="modal-backdrop logout-backdrop"><section class="safe-logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title">
    <div class="logout-dialog-icon">${icon('logout', 24)}</div>
    <span class="eyebrow">SAFE SIGN OUT</span>
    <h2 id="logout-title">Confirm all data is saved before signing out</h2>
    <p>The session will remain active until local data is saved, pending changes are uploaded, and the latest cloud revision is verified.</p>
    <div class="logout-progress" aria-live="polite">
      ${logoutProgressRow('save', 'Save on this device', 'Preserve the complete local copy', localState)}
      ${logoutProgressRow('cloud-upload', 'Upload pending changes', 'Send all queued data to the cloud', cloudState)}
      ${logoutProgressRow('shield-check', 'Verify Firebase', 'Confirm the cloud received the latest revision', verifyState)}
    </div>
    ${state.logoutError ? `<div class="logout-error">${icon('warning', 18)}<div><strong>Sign out was cancelled to protect your data.</strong><span>${escapeHtml(state.logoutError)}</span></div></div>` : ''}
    <div class="logout-actions"><button class="button secondary" data-action="cancel-sign-out" ${isWorking ? 'disabled' : ''}>Stay signed in</button><button class="button primary safe-logout-primary" data-action="confirm-sign-out" ${isWorking ? 'disabled' : ''}>${isWorking ? '<span class="spinner"></span>' : icon('logout', 17)} ${actionLabel}</button></div>
    <div class="logout-footnote">${icon('lock', 14)} Cloud data is not deleted. You can sign in again from any device using the same account.</div>
  </section></div>`;
}

function logoutProgressRow(iconName, title, detail, status) {
  const statusIcon = status === 'done' ? icon('check', 15) : status === 'active' ? '<span class="spinner"></span>' : '';
  return `<div class="logout-progress-row ${status}"><div class="logout-progress-icon">${icon(iconName, 18)}</div><div><strong>${title}</strong><span>${detail}</span></div><div class="logout-progress-state">${statusIcon}</div></div>`;
}

function summaryCard(iconName, label, value, helper, valueId = '') {
  return `<article class="summary-card"><div class="summary-icon">${icon(iconName, 21)}</div><div><p>${label}</p><strong ${valueId ? `id="${valueId}"` : ''}>${value}</strong><span>${helper}</span></div></article>`;
}

function updateMonthlyComputed() {
  if (state.view !== 'monthly') return;
  const month = currentMonth();
  const summary = summarizeMonth(month);
  setText('#summary-days', summary.activeDays);
  setText('#summary-hours', `${formatHours(summary.totalHours)} hours`);
  setText('#summary-pay', formatCurrency(summary.totalPay));
  setText('#footer-hours', formatHours(summary.totalHours));
  setText('#footer-pay', formatCurrency(summary.totalPay));
  setText('#footer-days', `${summary.activeDays} teaching days`);

  let invalidCount = 0;
  for (const entry of Object.values(month.entries)) {
    const amount = document.querySelector(`[data-amount="${entry.day}"]`);
    const rate = document.querySelector(`[data-rate-cell="${entry.day}"]`);
    const row = document.querySelector(`[data-row="${entry.day}"]`);
    const errorNode = document.querySelector(`[data-error="${entry.day}"]`);
    const error = validateEntry(entry);
    if (error) invalidCount += 1;
    if (amount) amount.textContent = formatCurrency(calculatePay(entry.hours, month.hourlyRate));
    if (rate) rate.textContent = formatCurrency(month.hourlyRate);
    if (row) row.classList.toggle('invalid-row', Boolean(error));
    if (errorNode) errorNode.textContent = error;
  }
  const audit = document.querySelector('#audit-status');
  if (audit) {
    audit.className = `audit-status ${invalidCount ? 'warning' : 'clean'}`;
    audit.innerHTML = invalidCount ? `${invalidCount} ${invalidCount === 1 ? 'row requires' : 'rows require'} review` : `${icon('check', 14)} Audit clear`;
  }
}

function updateCloudUi() {
  updateCloudIndicator();
  const pill = document.querySelector('.sync-pill');
  if (pill) {
    pill.className = `sync-pill ${state.cloudStatus}`;
    pill.innerHTML = cloudStatusText();
  }
}

function updateCloudIndicator() {
  const indicator = document.querySelector('#cloud-indicator');
  if (!indicator) return;
  indicator.className = `cloud-indicator ${state.cloudStatus}`;
  indicator.innerHTML = `<span></span>${cloudStatusLabel()}`;
}

function cloudStatusLabel() {
  if (!cloud.authenticated) return 'Sign in';
  if (state.cloudStatus === 'synced') return 'Cloud active';
  if (state.cloudStatus === 'syncing') return 'Synchronizing';
  return 'Cloud delayed';
}

function cloudStatusText() {
  if (state.cloudStatus === 'syncing') return '<span class="spinner"></span> Synchronizing...';
  if (state.cloudStatus === 'synced') return `${icon('check', 14)} Automatically synchronized`;
  if (state.cloudStatus === 'error') return `${icon('warning', 14)} Waiting for connection`;
  return 'Not connected';
}

function renderAfterCloudSync() {
  const active = document.activeElement;
  if (isEditableField(active) && root.contains(active)) updateCloudUi();
  else render();
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = String(value);
}

function showToast(message, type = 'success') {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon(type === 'success' ? 'check' : 'warning', 19)} ${escapeHtml(message)}`;
  document.body.appendChild(toast);
  toastTimer = setTimeout(() => toast.remove(), 3600);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : 'An unknown error occurred.';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function icon(name, size = 20) {
  const paths = {
    money: '<circle cx="12" cy="12" r="9"/><path d="M16 8h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8m4-10v12"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M8 8h8M8 12h6"/>',
    sheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M10 9H8"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 15h2.4a1.6 1.6 0 0 0 0-3.2H8V17"/><path d="M14 11.8V17h1.5a2.6 2.6 0 0 0 0-5.2H14z"/>',
    check: '<path d="m5 12 4 4L19 6"/>', warning: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>', cloud: '<path d="M17.5 19H7a5 5 0 1 1 1.2-9.8A7 7 0 0 1 21 12.5 4.5 4.5 0 0 1 17.5 19Z"/>',
    'cloud-off': '<path d="m3 3 18 18M8.5 8.5A5 5 0 0 0 7 18h10.5c.5 0 1-.1 1.4-.2M10 5.3A7 7 0 0 1 21 12.5c0 .6-.1 1.1-.3 1.6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2 3.1M6.6 6.6C3.6 8.5 2 12 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/>',
    refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    'user-plus': '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    signature: '<path d="M4 19c4-7 6-10 8-10 1.5 0 1.2 2.2.3 4.1-.8 1.8-.7 3.4.5 3.4 1.6 0 2.9-3.5 4.3-3.5 1.1 0 .8 2 .2 3.2-.4.9.1 1.4 1 1.1L21 17"/><path d="M4 22h16"/>',
    'cloud-upload': '<path d="M17.5 19H7a5 5 0 1 1 1.2-9.8A7 7 0 0 1 21 12.5 4.5 4.5 0 0 1 17.5 19Z"/><path d="M12 16V9M9 12l3-3 3 3"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.money}</svg>`;
}

import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

class FakeElement {}
class FakeInputElement extends FakeElement {}
class FakeFormElement extends FakeElement {}

function createEventTarget() {
  return {
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
  };
}

test('the dashboard remains protected until sign-in and the English sign-in screen is displayed', async () => {
  const root = {
    ...createEventTarget(),
    innerHTML: '',
    contains: () => false,
    querySelectorAll: () => [],
  };
  const backupInput = { ...createEventTarget(), files: [], value: '' };
  const documentTarget = createEventTarget();
  const windowTarget = createEventTarget();

  globalThis.Element = FakeElement;
  globalThis.HTMLInputElement = FakeInputElement;
  globalThis.HTMLFormElement = FakeFormElement;
  globalThis.localStorage = new MemoryStorage();
  globalThis.BroadcastChannel = undefined;
  globalThis.document = {
    ...documentTarget,
    hidden: false,
    activeElement: null,
    querySelector(selector) {
      if (selector === '#app') return root;
      if (selector === '#backup-input') return backupInput;
      return null;
    },
  };
  globalThis.window = {
    ...windowTarget,
    __AUDIT_GAJI_CONFIG__: { firebase: { apiKey: 'test-key', projectId: 'test-project' } },
    confirm: () => true,
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { onLine: true },
  });

  await import(`../src/app.js?smoke=${Date.now()}`);

  assert.match(root.innerHTML, /Welcome back/);
  assert.match(root.innerHTML, /MySalary/);
  assert.match(root.innerHTML, /Professional reports/);
  assert.match(root.innerHTML, /Automatic cloud sync/);
  assert.match(root.innerHTML, /Create account/);
  assert.doesNotMatch(root.innerHTML, /MONTHLY REPORT/);
});

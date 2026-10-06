import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyncCode, formatSyncCode, isValidSyncCode, normalizeSyncCode, syncCodeToVaultCredentials } from '../src/lib/sync-vault.js';

const deterministicRandom = {
  getRandomValues(bytes) {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = index;
    return bytes;
  },
};

test('kode sinkronisasi dibuat dengan checksum yang valid', () => {
  const code = createSyncCode(deterministicRandom);
  assert.equal(code, 'AG1_AAECAwQFBgcICQoLDA0ODw_EBESExQVFhcYGRobHB0eHw_17ucukv');
  assert.equal(isValidSyncCode(code), true);
});

test('kesalahan satu karakter terdeteksi', () => {
  const code = createSyncCode(deterministicRandom);
  const changed = `${code.slice(0, 10)}Z${code.slice(11)}`;
  assert.equal(isValidSyncCode(changed), false);
});

test('kode dapat dinormalisasi dan diformat untuk tampilan', () => {
  const code = createSyncCode(deterministicRandom);
  const formatted = formatSyncCode(code);
  assert.equal(normalizeSyncCode(formatted), code);
  assert.match(formatted, /^AG1_/);
  assert.match(formatted, / /);
});

test('kode menghasilkan vault id dan proof hash yang stabil', async () => {
  const code = createSyncCode(deterministicRandom);
  const first = await syncCodeToVaultCredentials(code);
  const second = await syncCodeToVaultCredentials(code);
  assert.deepEqual(first, second);
  assert.equal(first.vaultId, 'v_AAECAwQFBgcICQoLDA0ODw');
  assert.match(first.secretHash, /^[A-Za-z0-9_-]{43}$/);
});

const SYNC_CODE_PREFIX = 'AG1';
const VAULT_BYTE_LENGTH = 16;
const SECRET_BYTE_LENGTH = 16;
const PART_LENGTH = 22;
const CHECKSUM_LENGTH = 7;
const SYNC_CODE_PATTERN = /^AG1_([A-Za-z0-9_-]{22})_([A-Za-z0-9_-]{22})_([a-z0-9]{7})$/;

export function createSyncCode(randomSource = globalThis.crypto) {
  if (!randomSource?.getRandomValues) {
    throw new Error('Browser tidak mendukung generator kode sinkronisasi yang aman.');
  }
  const bytes = new Uint8Array(VAULT_BYTE_LENGTH + SECRET_BYTE_LENGTH);
  randomSource.getRandomValues(bytes);
  const vaultPart = bytesToBase64Url(bytes.slice(0, VAULT_BYTE_LENGTH));
  const secretPart = bytesToBase64Url(bytes.slice(VAULT_BYTE_LENGTH));
  const payload = `${SYNC_CODE_PREFIX}_${vaultPart}_${secretPart}`;
  return `${payload}_${checksum(payload)}`;
}

export function normalizeSyncCode(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

export function isValidSyncCode(value) {
  const normalized = normalizeSyncCode(value);
  const match = normalized.match(SYNC_CODE_PATTERN);
  if (!match) return false;
  const payload = `${SYNC_CODE_PREFIX}_${match[1]}_${match[2]}`;
  return checksum(payload) === match[3];
}

export function formatSyncCode(value) {
  const normalized = normalizeSyncCode(value);
  if (!isValidSyncCode(normalized)) return normalized;
  const [, vaultPart, secretPart, codeChecksum] = normalized.match(SYNC_CODE_PATTERN);
  return `${SYNC_CODE_PREFIX}_${group(vaultPart)}_${group(secretPart)}_${codeChecksum}`;
}

export async function syncCodeToVaultCredentials(value, cryptoSource = globalThis.crypto) {
  const normalized = normalizeSyncCode(value);
  if (!isValidSyncCode(normalized)) throw new Error('Kode sinkronisasi tidak valid.');
  if (!cryptoSource?.subtle?.digest) throw new Error('Browser tidak mendukung enkripsi kode sinkronisasi.');
  const [, vaultPart, secretPart] = normalized.match(SYNC_CODE_PATTERN);
  const digest = await cryptoSource.subtle.digest('SHA-256', new TextEncoder().encode(`${SYNC_CODE_PREFIX}:${secretPart}`));
  return {
    vaultId: `v_${vaultPart}`,
    secretHash: bytesToBase64Url(new Uint8Array(digest)),
  };
}

function checksum(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).padStart(CHECKSUM_LENGTH, '0').slice(-CHECKSUM_LENGTH);
}

function group(value) {
  return value.match(/.{1,4}/g).join(' ');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export const syncCodeConstants = Object.freeze({
  prefix: SYNC_CODE_PREFIX,
  partLength: PART_LENGTH,
  checksumLength: CHECKSUM_LENGTH,
});

import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'src');
const output = resolve(root, 'dist');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const firebase = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
};

const config = `window.__AUDIT_GAJI_CONFIG__ = ${JSON.stringify({ firebase }, null, 2)};\n`;
await writeFile(resolve(output, 'config.js'), config, 'utf8');
console.log(`Build completed: ${output}`);
console.log(firebase.apiKey && firebase.projectId ? 'Firebase sign-in and cloud sync: enabled' : 'Firebase sign-in: disabled (environment variables are required for production)');

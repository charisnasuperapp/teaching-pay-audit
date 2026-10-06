# Ayesha Salary - Teaching Pay Audit

A private, offline-first workspace created by Charisna for Ayesha to record teaching hours, calculate monthly pay, review annual earnings, export professional reports, and keep data synchronized across devices.

## Core features

- Firebase Email/Password sign-in before the dashboard is displayed.
- Automatic local saving and Firebase synchronization after each change.
- Monthly teaching-hour and pay tracking at a configurable USD hourly rate.
- Annual summary with teaching days, total hours, average hours per teaching day, and total earnings.
- Professional English monthly and annual PDF reports.
- English CSV exports and JSON backup/restore.
- Safe sign out that saves locally, uploads pending changes, and verifies the latest Firestore revision before closing the session.
- PWA support for Android, tablets, Windows, and modern desktop browsers.
- Firebase Spark compatible; no Cloud Functions, Firebase Storage, or Blaze-only services are required.

## v1.8.0 direct PDF downloads

- PDF reports download immediately as real `.pdf` files.
- The old `about:blank` print preview and browser print dialog were removed.
- Monthly reports use improved spacing, multiline rows, signatures, repeated headers, and page numbers.
- Annual reports use a compact one-page A4 landscape layout with non-overlapping insights and footer.
- PDF generation remains local, offline-capable, and free of third-party document services.

## v1.7.0 multiline daily details

- Long Class and Notes content wraps inside the table.
- Press Enter to create another line.
- Both fields expand automatically up to a practical maximum height.
- Line breaks are retained in PDF and CSV exports.

## v1.6.0 report changes

- The complete application interface is now in English.
- Monthly and annual PDF content is now fully in English.
- Redundant PDF summary cards were removed because the report table already contains the final totals.
- The explanatory calculation note below the monthly table was removed.
- The ambiguous **Unique Classes** metric was removed from the dashboard, annual summary, CSV exports, and PDF reports.
- The annual PDF is optimized as a clean single-page A4 landscape report.
- Existing teaching records, Firebase paths, authentication sessions, and backup data remain compatible.

## Folder structure

```text
src/                    Production source files
  lib/                  Calculations, storage, Firebase, exports, and PDF reports
firebase/               Firestore Security Rules and indexes
tests/                  Unit and smoke tests
scripts/                Build, syntax-check, and local-server scripts
docs/                   Architecture, deployment, API, PDF, and QA documentation
dist/                   Generated production output after npm run build
```

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run check
npm test
npm run dev
```

The local server starts at `http://localhost:4173` by default.

## Production build

```bash
npm run build
```

Vercel configuration:

```text
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
```

Required environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

## Firebase requirements

1. Enable **Authentication -> Email/Password**.
2. Create the default Cloud Firestore database.
3. Publish `firebase/firestore.rules`.
4. Add the Vercel production domain to Firebase Authentication authorized domains when required.

Detailed instructions are available in `docs/FIREBASE_SETUP.md` and `docs/DEPLOYMENT.md`.

## Data safety

- Every edit is written to local storage first.
- Cloud changes are queued independently per month.
- The app uploads changes shortly after typing stops.
- When the page is hidden or closed, the app attempts a final keepalive upload.
- Safe Sign Out is cancelled when Firebase cannot confirm the latest revision.
- JSON backups remain recommended before major updates.

## Compatibility

- Infinix Note 40 Pro+ and other modern Android phones.
- Huawei MatePad SE 11 and Android tablets.
- Windows 10/11 with Chrome or Edge.
- Modern Chromium-based desktop browsers.
- Vercel static hosting and Firebase Spark plan.


## Rebrand for another customer

Runtime branding is centralized in `src/brand.js`. For the next customer, change the values in that one file, then run `npm run build`. The application UI, login screen, PDF metadata, PDF/CSV/backup filenames, PWA title, manifest, browser title, and generated report identity use that configuration.

Firebase remains customer-specific. Every customer should have a separate Firebase project and Vercel environment variables. Do not reuse Ayesha's Firebase project for another customer.

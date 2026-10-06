# Teaching Pay Audit v2.2.0

Teaching Pay Audit is a multi-user, offline-first web application for teachers, tutors, and hourly instructors to record teaching activity, calculate pay, synchronize private account data across devices, and export polished business-ready reports.

## Core features

- Public Email/Password sign-up and sign-in
- Required display name for personalized reports
- In-app password change with current-password verification
- Password reset by email
- Persistent browser session
- Safe sign-out with local save, cloud upload, and revision verification
- Per-user Firestore isolation by Firebase UID
- Offline-first local storage
- Automatic Firebase synchronization
- Monthly teaching hours and pay calculations
- Annual pay summary
- Multiline Class and Notes fields
- Direct professional PDF download
- Share-ready PNG report download
- Professional Excel `.xlsx` workbooks with Summary, Details, Analytics, formulas, formatting, and an embedded activity chart
- Clean UTF-8 CSV export for interoperability
- JSON backup/restore
- Responsive Android phone, Android tablet, desktop, and web UI
- PWA installation
- Firebase Spark-compatible architecture
- Vercel static deployment

## v2.2.0 reporting upgrade

This release rebuilds the reporting/export layer for commercial use:

- PDF spacing and hierarchy were redesigned to prevent title and metadata overlap.
- Monthly PDF metadata now uses a readable 2x2 information grid.
- The supplied brand mark is embedded as a very light watermark behind PDF content.
- PNG reports can be downloaded directly for messaging and quick sharing.
- Excel export now creates a real `.xlsx` workbook instead of relying on CSV formatting.
- Monthly Excel exports contain `Summary`, `Daily Details`, and `Analytics` sheets.
- Annual Excel exports contain `Summary`, `Monthly Breakdown`, and `Analytics` sheets.
- Workbook totals use formulas and the Analytics sheet includes a generated chart image.
- CSV remains available as a clean, portable raw-data format.
- Public developer-name attribution was removed from the runtime UI and replaced by the supplied visual mark.

## Multi-user data model

```text
users/{uid}/profile/account
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{YYYY-MM}
```

Each authenticated user may access only documents under their own UID when `firebase/firestore.rules` is published.

## Required Vercel environment variables

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

Never commit real production values to `.env.example`.

## Development

Requires Node.js 20 or newer.

```bash
npm test
npm run check
npm run build
npm run dev
```

Production output is generated in `dist/` and is intentionally ignored by Git.

## Branding

Product branding is centralized in `src/brand.js`. The white-label visual mark used by the runtime footer and report watermark is stored in `src/brand-mark.png`.

User identity is dynamic and comes from the authenticated profile. No customer-specific name is hardcoded in runtime source.

## Security notes

- Firebase Email/Password Authentication
- Firestore rules scoped to `request.auth.uid`
- No Firebase Admin/service-account credentials in the browser
- Password changes require current-password reauthentication
- Local-first writes before cloud synchronization
- Safe sign-out is blocked if pending changes cannot be verified
- Report generation occurs locally in the browser; no third-party PDF/PNG/Excel service is required

See `docs/FIREBASE_SETUP.md`, `docs/IMPLEMENTATION_NOTES.md`, `docs/PDF_REPORTS.md`, `docs/AUTH_API.md`, and `docs/QA_CHECKLIST.md`.

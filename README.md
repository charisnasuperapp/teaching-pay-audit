# MySalary v2.3.1 — Teaching Pay Audit

MySalary is a multi-user, offline-first teaching-hours and pay workspace for teachers, tutors, and hourly instructors. It records teaching activity, calculates earnings automatically, synchronizes private account data across devices, and exports polished reports.

## Core features

- Public Email/Password sign-up and sign-in
- Required display name for personalized dashboards and reports
- In-app password change with current-password verification
- Password reset by email
- Persistent browser session
- Safe sign-out with local save, cloud upload, and revision verification
- Per-user Firestore isolation by Firebase UID
- Offline-first local storage
- Fast automatic Firebase synchronization
- Monthly teaching hours and pay calculations
- Annual pay summary
- Multiline Class and Notes fields
- Direct professional PDF download
- Share-ready PNG report download
- Professional Excel `.xlsx` workbooks with Summary, Details, Analytics, formulas, formatting, and an embedded activity chart
- Clean UTF-8 CSV export
- JSON backup/restore
- Responsive Android phone, Android tablet, desktop, and web UI
- PWA installation
- Firebase Spark-compatible architecture
- Vercel static deployment

## v2.3.1 report reliability & branding polish

- Public-facing product brand is now **MySalary** with **Teaching Pay Audit** as the functional descriptor.
- The supplied brand mark replaces generic money icons in the landing page, loading state, mobile auth header, and signed-in app header.
- A subtle translucent brand watermark is integrated into the desktop landing hero without reducing headline readability.
- PWA icons now use the supplied brand mark on the product gradient.
- Password-reset messaging is privacy-safe: the UI no longer confirms whether an email address exists.
- Login, registration, and recovery copy is polished for an international commercial audience.
- Runtime UI contains no personal developer-name attribution.
- Firebase email-template copy is documented in `docs/FIREBASE_EMAIL_TEMPLATES.md`.
- PDF/PNG report headers now use the MySalary logo instead of a generic currency icon.
- Watermarks are rendered as a final low-opacity overlay so opaque table/card backgrounds cannot hide them.
- Annual PNG export reserves a dedicated footer safety zone, preventing footer/total overlap on phone and PC.
- Monthly PNG totals use a merged label area so `MONTHLY TOTAL` is always shown in full.

## Reporting/export layer

- Professional monthly and annual PDF reports with subtle brand watermark
- Direct PNG export for quick sharing
- Excel `.xlsx` export with Summary, Details/Breakdown, Analytics, formulas, formatting, and visual chart
- CSV export for portable raw-data workflows
- All report generation runs locally in the browser; no paid report service is required

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

Product branding is centralized in `src/brand.js`.

- Brand: `MySalary`
- Descriptor: `Teaching Pay Audit`
- Brand mark: `src/brand-mark.png`
- PWA icons: `src/icon-192.png` and `src/icon-512.png`

User identity is dynamic and comes from the authenticated profile. No customer-specific user name is hardcoded in runtime source.

## Security notes

- Firebase Email/Password Authentication
- Firestore rules scoped to `request.auth.uid`
- No Firebase Admin/service-account credentials in the browser
- Password changes require current-password reauthentication
- Local-first writes before cloud synchronization
- Safe sign-out is blocked if pending changes cannot be verified
- Report generation occurs locally in the browser

See `docs/FIREBASE_SETUP.md`, `docs/FIREBASE_EMAIL_TEMPLATES.md`, `docs/IMPLEMENTATION_NOTES.md`, `docs/PDF_REPORTS.md`, `docs/AUTH_API.md`, and `docs/QA_CHECKLIST.md`.

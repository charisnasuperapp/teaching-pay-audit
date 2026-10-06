# Teaching Pay Audit v2.0.0

Teaching Pay Audit is a multi-user, offline-first web application for teachers and hourly instructors to record teaching activity, calculate pay, synchronize data across devices, and export professional monthly and annual reports.

## Multi-user model

The application is customer-neutral. Every user creates an account with:

- Your Name
- Email
- Password
- Password confirmation

The user's name is stored in their private Firestore profile and automatically personalizes the dashboard, Settings, monthly/annual PDF reports, CSV exports, and backup metadata. Users sharing the same deployment do not share salary data; all records are isolated by Firebase Authentication UID.

## Core features

- Public Email/Password sign-up and sign-in
- Per-user display name/profile
- Password reset
- Persistent browser session
- Safe sign-out with local save, cloud upload, and revision verification
- Offline-first local storage
- Automatic Firebase synchronization
- Cross-device account data
- Monthly teaching hours and salary calculations
- Annual salary summary
- Multiline Class and Notes fields
- Direct professional PDF downloads
- CSV export
- JSON backup/restore
- Responsive Android phone, Android tablet, desktop, and web UI
- PWA installation
- Firebase Spark-compatible architecture
- Vercel static deployment

## Data layout

```text
users/{uid}/profile/account
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{YYYY-MM}
```

Each authenticated user may only access documents under their own UID when the included Firestore rules are published.

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

Product branding is centralized in:

```text
src/brand.js
```

User identity is dynamic and comes from the authenticated profile, so no customer name should be hardcoded in runtime source.

## Security

- Firebase Email/Password Authentication
- Firestore rules scoped to `request.auth.uid`
- No service-account/private admin credentials in the client
- Local-first writes before cloud synchronization
- Safe sign-out blocked if pending changes cannot be verified

See `docs/FIREBASE_SETUP.md`, `docs/IMPLEMENTATION_NOTES.md`, and `docs/QA_CHECKLIST.md` for deployment and validation details.

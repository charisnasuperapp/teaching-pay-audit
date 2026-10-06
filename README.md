# Teaching Pay Audit v2.1.0

Teaching Pay Audit is a multi-user, offline-first web application for teachers, tutors, and hourly instructors to record teaching activity, calculate pay, synchronize private account data across devices, and export professional reports.

## Core features

- Public Email/Password sign-up and sign-in
- Required user display name for personalization
- In-app password change with current-password verification
- Password reset by email
- Persistent browser session
- Safe sign-out with local save, cloud upload, and revision verification
- Per-user Firestore data isolation by Firebase UID
- Offline-first local storage
- Automatic Firebase synchronization
- Monthly teaching hours and pay calculations
- Annual pay summary
- Multiline Class and Notes fields
- Direct professional PDF downloads
- CSV export
- JSON backup/restore
- Responsive Android phone, Android tablet, desktop, and web UI
- PWA installation
- Firebase Spark-compatible architecture
- Vercel static deployment

## v2.1.0 product polish

The public account-access page has been redesigned for a stronger commercial presentation with clearer product positioning, professional feature cards, trust indicators, polished spacing, and improved sign-in/sign-up copy.

Settings now includes a dedicated **Account security** section where a signed-in user can change their password without leaving the application. The current password is re-authenticated before Firebase accepts the new password, and the refreshed session remains active after a successful change.

## Multi-user data model

Every user creates an account with:

- Your Name
- Email
- Password
- Password confirmation

The display name is stored in the user's private Firestore profile and personalizes the dashboard, Settings, PDF reports, CSV exports, and backup metadata.

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

Product branding is centralized in:

```text
src/brand.js
```

User identity is dynamic and comes from the authenticated profile. No customer-specific name should be hardcoded in runtime source.

## Security notes

- Firebase Email/Password Authentication
- Firestore rules scoped to `request.auth.uid`
- No Firebase Admin/service-account credentials in the browser
- Password changes require current-password reauthentication
- Local-first writes before cloud synchronization
- Safe sign-out is blocked if pending changes cannot be verified

See `docs/FIREBASE_SETUP.md`, `docs/IMPLEMENTATION_NOTES.md`, `docs/AUTH_API.md`, and `docs/QA_CHECKLIST.md` for deployment and validation details.

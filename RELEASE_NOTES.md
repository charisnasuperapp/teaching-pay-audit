# Teaching Pay Audit v2.1.0 — Commercial UI & Account Security

This release focuses on product presentation and day-to-day account security while preserving the stable multi-user architecture introduced in v2.0.0.

## Highlights

- More professional public login and sign-up experience suitable for a commercial deployment.
- New educator-focused product copy and feature presentation.
- New Account security section in Settings.
- Password changes require the current password before Firebase updates credentials.
- Successful password changes refresh the active session automatically.
- New passwords and new account registrations require at least 8 characters at the application layer.
- Settings now presents profile, security, pay settings, backup, cloud synchronization, About information, and the danger zone more clearly.
- Existing Firebase Authentication, Firestore UID isolation, auto-sync, safe sign-out, offline-first storage, PDF, CSV, backup, and multiline editing are unchanged.

## Firebase impact

No new Firebase service is required and no Blaze Plan feature is introduced.

Existing deployment requirements remain:

```text
Authentication: Email/Password enabled
Firestore: Production database
Vercel: VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID
```

The existing v2.0 Firestore rules remain compatible because password changes are handled by Firebase Authentication rather than Firestore.

## Validation

- Automated tests include password reauthentication/update coverage.
- Syntax validation passed.
- Production build passed.

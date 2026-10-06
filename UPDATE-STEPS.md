# Teaching Pay Audit v2.1.0 — Update / Deployment Steps

This is a source update only. Existing Firebase user data and Firestore documents do not need migration.

1. Download a JSON backup from the currently deployed application as a precaution.
2. Replace the GitHub repository source with the contents of this v2.1.0 package.
3. Do not upload `dist/`; Vercel creates it during deployment.
4. Commit the update, for example:

```text
Teaching Pay Audit v2.1.0 - commercial UI and password security
```

5. Confirm Vercel still contains:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

6. Push to `main` and allow Vercel to build automatically.
7. Confirm the Production deployment reaches `Ready`.
8. Open the production URL and hard refresh once if an older PWA shell is cached.
9. Test Sign In and Create Account.
10. Open **Settings → Account security** and test Change Password using a non-production test account.
11. Confirm the old password fails after the change and the new password succeeds.
12. Confirm the current session remains signed in immediately after a successful password change.
13. Test monthly data entry, automatic sync, PDF, CSV, backup, and Save & Sign Out.

## Firebase changes

No Firestore rules change is required specifically for v2.1.0 if the v2.0 multi-user rules are already published.

Email/Password Authentication must remain enabled.

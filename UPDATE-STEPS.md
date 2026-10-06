# MySalary v2.3.0 — Update / Deployment Steps

This is a source-only update. Existing Firebase users and Firestore salary data do not require migration.

1. Download a JSON backup from the currently deployed application as a precaution.
2. Replace the GitHub repository source with the contents of this package.
3. Do not upload `dist/`; Vercel generates it during deployment.
4. Commit the update, for example:

```text
MySalary v2.3.0 - brand and authentication polish
```

5. Confirm Vercel still contains:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

6. Push to `main` and allow Vercel to build automatically.
7. Confirm Production reaches `Ready`.
8. Hard refresh once after deployment so the updated service-worker cache and PWA icons are used.
9. Verify `https://www.mysalary.my.id` and the root-domain redirect.
10. Test sign-up, sign-in, password reset, password change, cloud sync, and Save & Sign Out.
11. Test monthly PDF, PNG, Excel, CSV, and annual exports.
12. Confirm the new logo is visible on the landing page and app header without reducing text readability.

## Firebase email branding

Open:

```text
Firebase → Authentication → Templates
```

Use the exact recommended sender names, subjects, and messages in:

```text
docs/FIREBASE_EMAIL_TEMPLATES.md
```

Also set the Firebase public-facing name to:

```text
MySalary
```

Keep these Authorized domains:

```text
mysalary.my.id
www.mysalary.my.id
```

## Firestore

No Firestore rules change is required for v2.3.0 if the current multi-user rules are already published.

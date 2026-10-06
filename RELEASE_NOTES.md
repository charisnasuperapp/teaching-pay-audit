# MySalary v2.3.0 — Brand, Auth & Commercial Polish

This release consolidates the reporting upgrades from v2.2 with a stronger commercial identity and more professional authentication experience.

## Highlights

- MySalary is now the public-facing product brand.
- Teaching Pay Audit remains the product descriptor/reporting purpose.
- Supplied brand mark is used in the landing header, loading screen, mobile authentication header, signed-in header, footer, PDF watermark, and report imagery.
- Desktop landing page includes a low-opacity branded hero watermark.
- PWA/app icons now use the supplied logo instead of the old generic document/money artwork.
- Password-reset success messaging is privacy-safe and does not disclose whether an account exists.
- Login, registration, and recovery copy was refined for an international commercial audience.
- Professional Firebase email-template copy is included in documentation.
- Existing PDF, PNG, Excel, CSV, backup, cloud-sync, password-change, and safe-sign-out functionality is preserved.

## Firebase impact

No Firestore schema migration is required and no paid Firebase service is introduced.

Keep:

```text
Authentication: Email/Password enabled
Firestore: UID-scoped production rules
Vercel: VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID
Authorized domains: mysalary.my.id + www.mysalary.my.id
```

For email branding, set the Firebase public-facing name and sender name to `MySalary`; see `docs/FIREBASE_EMAIL_TEMPLATES.md`.

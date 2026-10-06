# Teaching Pay Audit v2.0.0 — Update / Deployment Steps

1. Keep the GitHub repository private while preparing production.
2. Replace the previous customer-specific source with this v2.0.0 package.
3. Do not upload `dist/`; Vercel builds it automatically.
4. In Firebase Authentication, enable Email/Password.
5. Create Cloud Firestore in Production mode.
6. Publish `firebase/firestore.rules`.
7. Register one Firebase Web App.
8. Import the GitHub repository into Vercel.
9. Configure:

```text
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
```

10. Add Vercel environment variables:

```text
VITE_FIREBASE_API_KEY=<Firebase Web API key>
VITE_FIREBASE_PROJECT_ID=<Firebase project ID>
```

11. Deploy.
12. Create two test accounts with different names/emails.
13. Confirm each account sees only its own records.
14. Confirm the profile name appears in the dashboard and PDF.
15. Confirm synchronization works between two browsers using the same account.
16. Confirm safe sign-out completes only after cloud verification.

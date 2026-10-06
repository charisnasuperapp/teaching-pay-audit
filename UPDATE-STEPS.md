# Ayesha Salary - Deployment Steps

1. Keep the `Ayesha-salary` GitHub repository private.
2. Upload this package so `package.json`, `vercel.json`, `src/`, `firebase/`, `docs/`, `scripts/`, and `tests/` are at repository root.
3. Create a separate Firebase project owned by Ayesha/customer.
4. Enable Firebase Authentication -> Email/Password.
5. Create Cloud Firestore in Production mode.
6. Publish `firebase/firestore.rules`.
7. Register a Firebase Web App and copy its `apiKey` and `projectId`.
8. Import the `Ayesha-salary` repository into Ayesha's Vercel account.
9. Add `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` to Vercel Environment Variables.
10. Deploy using `npm run build` with output directory `dist`.
11. Test account creation, login, cross-browser synchronization, offline/online recovery, safe sign-out, CSV, JSON backup, monthly PDF, and annual PDF before handover.

## Future customer copies

Change customer-facing identity in `src/brand.js` before creating the next customer's Firebase/Vercel stack. Each customer must use a separate Firebase project.

# Teaching Pay Audit v2.2.0 - Update / Deployment Steps

This is a source-only update. Existing Firebase users and Firestore data do not require migration.

1. Download a JSON backup from the currently deployed application as a precaution.
2. Replace the GitHub repository source with the contents of this v2.2.0 package.
3. Do not upload `dist/`; Vercel generates it during deployment.
4. Commit the update, for example:

```text
Teaching Pay Audit v2.2.0 - reporting and export upgrade
```

5. Confirm Vercel still contains:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

6. Push to `main` and allow Vercel to build automatically.
7. Confirm Production reaches `Ready`.
8. Hard refresh once if an older PWA shell is cached.
9. Confirm monthly export buttons show `CSV`, `Excel`, `PNG`, and `PDF`.
10. Test a monthly PDF with long Class and Notes content.
11. Confirm the watermark is faint and text remains readable.
12. Download PNG and verify it opens as a normal shareable image.
13. Download Excel and verify the Summary, Daily Details/Monthly Breakdown, and Analytics sheets.
14. Confirm workbook totals recalculate if Hours are edited in the details sheet.
15. Test CSV, JSON backup, auto-sync, password change, and Save & Sign Out.

## Firebase changes

No Firestore rules change is required specifically for v2.2.0 if the current multi-user rules are already published.

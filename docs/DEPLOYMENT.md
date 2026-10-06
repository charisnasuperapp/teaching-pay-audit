# Deployment

## Vercel

Import the GitHub repository and configure:

```text
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
```

Set environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

Redeploy after changing environment variables.

## Post-deployment validation

1. Open the Production URL in a clean browser.
2. Create an account with a test name.
3. Record hours and confirm salary calculation.
4. Open a second browser and sign in with the same account.
5. Confirm data appears and updates automatically.
6. Create a second account and confirm no data from the first account appears.
7. Download monthly and annual PDFs.
8. Test JSON backup/restore.
9. Test safe sign-out.

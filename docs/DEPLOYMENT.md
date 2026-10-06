# Vercel Deployment

## Project configuration

```text
Framework Preset: Other
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: Default
```

When `package.json` is inside a repository subfolder, select that subfolder as the Vercel Root Directory.

## Environment variables

```text
VITE_FIREBASE_API_KEY=<Firebase Web API Key>
VITE_FIREBASE_PROJECT_ID=<Firebase Project ID>
```

Enable both variables for Production and Preview, save them, and redeploy.

## Firebase prerequisites

1. Enable **Authentication -> Email/Password**.
2. Create the default Cloud Firestore database.
3. Publish `firebase/firestore.rules`.
4. Add the production Vercel domain to Authentication authorized domains when required.

## Production update procedure

1. Download a JSON backup from the browser containing the most complete data.
2. Upload all v1.8.0 files to the existing repository.
3. Commit the changes.
4. Wait until the Vercel deployment is **Ready**.
5. Close old browser tabs and PWA windows.
6. Reopen the production URL.
7. Sign in using the existing account.
8. Wait for **Cloud active** before editing from another browser.

## PWA cache

The Service Worker uses cache `audit-gaji-v1.8.0` with a network-first strategy. Older caches are removed during activation. When an old interface remains visible:

1. Close every Ayesha Salary tab and PWA window.
2. Reopen the production URL.
3. Perform one hard refresh.
4. On Android, force-close the PWA and reopen it.

## Rollback

Account data remains stored under the authenticated UID paths. A rollback to anonymous-sync versions will not read those paths. Always keep a JSON backup before rollback.

## Safe Sign Out

Safe Sign Out requires an internet connection because Firestore must confirm the latest revision. When the device is offline, the session intentionally remains active until verification is possible.

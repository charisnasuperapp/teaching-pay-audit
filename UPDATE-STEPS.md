# MySalary v2.3.1 - Update / Deployment Steps

## Before updating

1. Open the current production app and wait until cloud synchronization is complete.
2. Download a JSON backup from Settings.
3. Keep the current Vercel and Firebase settings unchanged.

## GitHub update

1. Extract the MySalary v2.3.1 ZIP.
2. Upload the extracted project files to the root of the existing `teaching-pay-audit` repository, replacing the old source files.
3. Do not upload a generated `dist/` directory.
4. Commit with, for example:

   `MySalary v2.3.1 - report layout and watermark hotfix`

5. Push/commit to `main` and wait for Vercel Production to become **Ready**.

## After Vercel deploys

1. Open `https://www.mysalary.my.id` (or your selected production domain).
2. Perform one hard refresh (`Ctrl + Shift + R`) on desktop. On mobile/PWA, fully close and reopen the app so the v2.3.1 service-worker cache activates.
3. Export one monthly PDF and PNG and one annual PDF and PNG.
4. Confirm:
   - report logo appears in the header;
   - watermark is faint but visible;
   - `MONTHLY TOTAL` is displayed in full;
   - annual footer is separated from the total row;
   - no report text overlaps on phone or PC.

## Backend

No changes are required to Firebase Authentication, Firestore Rules, Firestore data, Vercel environment variables, or custom-domain DNS for this release.

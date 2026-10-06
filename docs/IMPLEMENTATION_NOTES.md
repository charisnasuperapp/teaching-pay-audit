# Implementation Notes

## Architecture

Teaching Pay Audit is a static Progressive Web App deployed on Vercel. Firebase provides account authentication and private cloud persistence. No custom application server is required.

## Identity

Product identity is static in `src/brand.js`. User identity is dynamic and comes from Firestore profile data.

Registration sequence:

1. Validate name, email, password, and confirmation.
2. Create Firebase Email/Password account.
3. Save `users/{uid}/profile/account`.
4. Activate the user-scoped local database.
5. Merge local/cloud salary data.
6. Synchronize the latest account snapshot.

## Offline-first model

Salary edits are stored locally first. Cloud changes are queued and normally sent roughly 250 ms after editing stops. When offline, local data remains usable and pending changes are retried after connectivity returns.

## Profile synchronization

The canonical display name is stored in the profile document. A mirrored name and profile revision are stored in salary metadata so an already-open second device can update its visible name through the existing cloud revision polling without an additional high-frequency profile read.

## Safe sign-out

Sign-out is cancelled if the app cannot:

1. Save local data.
2. Flush pending cloud writes.
3. Fetch the remote snapshot.
4. Upload the merged snapshot.
5. Confirm the final cloud revision.

## PDF

PDFs are generated directly in-browser using the local PDF engine. No third-party PDF service is used.

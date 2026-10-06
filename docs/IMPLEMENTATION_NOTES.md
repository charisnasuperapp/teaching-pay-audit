# Implementation Notes

## Architecture

Teaching Pay Audit is a static Progressive Web App deployed on Vercel. Firebase provides Email/Password Authentication and private Firestore persistence. No custom application server or paid cloud service is required.

## Identity

Product identity is static in `src/brand.js`. User identity is dynamic and comes from Firestore profile data.

Registration sequence:

1. Validate name, email, password, and confirmation.
2. Require at least 8 password characters in the UI/application layer.
3. Create Firebase Email/Password account.
4. Save `users/{uid}/profile/account`.
5. Activate the user-scoped local database.
6. Merge local/cloud salary data.
7. Synchronize the latest account snapshot.

## Password changes

Settings provides an Account security form with current password, new password, and confirmation.

The client does not blindly update a password from an existing long-lived session. It reauthenticates the current account with the supplied current password, then sends the new password using a fresh Firebase ID token. The returned tokens replace the existing local session so the user can continue working without unnecessary logout.

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

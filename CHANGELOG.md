# Changelog

## 2.1.0 — Commercial UI & Account Security

- Redesigned the public login/sign-up experience with more professional product positioning and spacing.
- Added clearer educator-focused feature cards and trust indicators.
- Improved sign-in, sign-up, and password-reset copy.
- Increased the application-side minimum password length for new registrations to 8 characters.
- Added **Settings → Account security → Change password**.
- Added current-password reauthentication before password updates.
- Added Firebase Identity Toolkit `accounts:update` integration for password changes.
- Preserved the active authenticated session after a successful password update.
- Added Account, Workspace, Data, Sync, About, and Danger-zone organization improvements in Settings.
- Added visible app version and developer information in Settings.
- Added automated tests for password-change authentication flow and Settings integration.
- Preserved multi-user isolation, offline-first behavior, fast synchronization, professional PDF exports, CSV, backup/restore, and safe sign-out.

## 2.0.0 — Multi-User Edition

- Converted Teaching Pay Audit from customer-specific branding to a customer-neutral multi-user product.
- Added required display name during account registration.
- Added per-user Firestore profile at `users/{uid}/profile/account`.
- Added editable profile name in Settings.
- Personalized dashboard, PDF, CSV, and backup metadata using the active profile.
- Updated Firestore rules for profile isolation and validation.
- Preserved offline-first operation, fast auto-sync, safe sign-out, direct PDF export, CSV export, JSON backup, and multiline Class/Notes fields.

## 1.9.0

- Customer-specific centralized branding edition used as the migration base for v2.0.0.

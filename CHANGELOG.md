# Changelog

## 2.0.0 — Multi-User Edition

- Converted Teaching Pay Audit from customer-specific branding to a customer-neutral multi-user product.
- Added required display name during account registration.
- Added per-user Firestore profile at `users/{uid}/profile/account`.
- Added editable profile name in Settings.
- Personalized dashboard, PDF, CSV, and backup metadata using the active profile.
- Added profile-name synchronization across devices via account metadata revision flow.
- Updated Firestore rules for profile isolation and validation.
- Preserved offline-first operation, fast auto-sync, safe sign-out, direct PDF export, CSV export, JSON backup, and multiline Class/Notes fields.
- Increased automated coverage for profile persistence.

## 1.9.0

- Customer-specific centralized branding edition used as the migration base for v2.0.0.

# Teaching Pay Audit v2.0.0 — Multi-User Edition

This release converts the previous customer-specific build into a reusable multi-user product.

## Highlights

- Removed customer-specific runtime branding.
- Added `Your Name` to account registration.
- Added private Firestore user profiles.
- Dashboard and header personalize themselves from the signed-in user's name.
- Monthly and annual PDFs use the active profile name.
- CSV exports and JSON backup metadata use the active profile name.
- Settings now lets the user update their profile name.
- Profile-name changes are mirrored into account metadata so other signed-in devices receive the updated name through the normal synchronization flow.
- Maintains fast autosync, offline-first storage, multiline editors, professional direct PDF downloads, backup/restore, and safe verified sign-out.
- Added Firestore profile rules and profile REST tests.

## Firebase paths

```text
users/{uid}/profile/account
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{monthKey}
```

## Validation

- Syntax check passed.
- Automated unit/smoke tests passed.
- Production build passed.

# Authentication API

Teaching Pay Audit uses Firebase Identity Toolkit REST endpoints for Email/Password authentication.

## Supported workflows

- Create account
- Sign in
- Refresh session token
- Send password reset email
- Change password inside Settings
- Sign out locally after verified data synchronization

## Password change flow

The in-app password change intentionally verifies the user's current password before updating credentials:

1. Read the signed-in account email from the current session.
2. Reauthenticate using `accounts:signInWithPassword` and the current password.
3. Use the fresh ID token with `accounts:update` to set the new password.
4. Store the refreshed Firebase session returned by the password update.
5. Keep the user signed in after success.

The application enforces an 8-character minimum for new registrations and in-app password changes. Firebase itself may have different server-side minimums, but the stricter application rule is used for product consistency.

## Security boundary

The browser never receives Firebase Admin credentials or service-account private keys. Firestore access remains protected by authenticated UID rules independent of password-management requests.

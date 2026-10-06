# Authentication API

Teaching Pay Audit uses Firebase Identity Toolkit REST endpoints for Email/Password authentication.

Supported workflows:

- Create account
- Sign in
- Refresh session token
- Send password reset email
- Sign out locally

After registration, the app stores a user profile in Firestore under the authenticated UID. The browser never receives Firebase Admin credentials or service-account private keys.

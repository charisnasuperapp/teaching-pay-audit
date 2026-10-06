# Firebase Authentication Email Templates — MySalary

Use these values in Firebase Console under:

```text
Authentication → Templates
```

The built-in Firebase editor controls the action link. Keep the Firebase-generated action link/placeholder exactly as shown by the console; only replace the surrounding copy.

## Public-facing name

Set the Firebase public-facing project/app name to:

```text
MySalary
```

This keeps `%APP_NAME%` and Firebase-generated labels consistent.

## Sender name

Use the same sender name for all authentication emails:

```text
MySalary
```

The default `From` address can remain the Firebase `noreply@...firebaseapp.com` address on the Spark plan. Custom SMTP is optional and not required for this application.

## 1. Email address verification

**Subject**

```text
Verify your MySalary email address
```

**Message**

```text
Hello %DISPLAY_NAME%,

Welcome to MySalary.

Please verify your email address to confirm your account and help keep your teaching records secure.

Use the verification link below:

%LINK%

If you did not create a MySalary account, you can safely ignore this email.

Thank you,
MySalary Team
```

If the Firebase editor displays a generated verification URL instead of `%LINK%`, keep that generated link in the same position.

## 2. Password reset

**Subject**

```text
Reset your MySalary password
```

**Message**

```text
Hello,

We received a request to reset the password for your MySalary account associated with %EMAIL%.

Use the secure link below to create a new password:

%LINK%

If you did not request a password reset, you can safely ignore this email. Your account will remain unchanged.

For your security, the reset link may expire after a limited time.

Thank you,
MySalary Team
```

If the Firebase editor displays a generated reset URL instead of `%LINK%`, preserve that generated link.

## 3. Email address change

**Subject**

```text
Your MySalary sign-in email was changed
```

**Message**

```text
Hello %DISPLAY_NAME%,

The sign-in email address for your MySalary account was changed to %NEW_EMAIL%.

If you made this change, no further action is required.

If you did not request this change, use the secure link below to restore your previous sign-in email and protect your account:

%LINK%

We also recommend changing your password immediately if you do not recognize this activity.

Thank you,
MySalary Team
```

## Authorized domains

For the current production setup, keep both custom domains authorized:

```text
mysalary.my.id
www.mysalary.my.id
```

The Vercel fallback domain may also remain authorized if it is used for testing.

## Branding limitation

Firebase's built-in Authentication email templates are text-oriented and do not provide full custom HTML/logo layout control. The app therefore uses professional copy and the `MySalary` sender name without introducing a paid email service or Blaze-only backend.

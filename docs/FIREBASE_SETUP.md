# Firebase Setup — MySalary

MySalary uses Firebase Authentication and Cloud Firestore through REST APIs and remains compatible with the Firebase Spark plan within its free quotas.

## 1. Authentication

Enable:

```text
Authentication → Sign-in method → Email/Password
```

Anonymous authentication, Phone Authentication, Cloud Functions, and Firebase Hosting are not required.

## 2. Authentication branding

Set the public-facing name to:

```text
MySalary
```

Then configure the built-in authentication email templates using:

```text
docs/FIREBASE_EMAIL_TEMPLATES.md
```

For the current production domain, Authorized domains should include:

```text
mysalary.my.id
www.mysalary.my.id
```

## 3. Firestore

Create the default Cloud Firestore database in Production mode and publish:

```text
firebase/firestore.rules
```

Do not manually create collections. Documents are created after users register and save data.

## 4. Web App

Register one Firebase Web App and obtain:

```text
apiKey
projectId
```

Add those values to Vercel as:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
```

## 5. Data isolation

Each account uses its Firebase UID:

```text
users/{uid}/profile/account
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{YYYY-MM}
```

The supplied security rules only permit the signed-in user to read/write their own UID path.

## 6. Profile

The profile document contains:

```json
{
  "displayName": "Ipul",
  "email": "ipul@example.com",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

The display name personalizes the MySalary dashboard, reports, exports, and profile UI.

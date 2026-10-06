# Firebase Setup

Teaching Pay Audit uses Firebase Authentication and Cloud Firestore through REST APIs and is compatible with the Firebase Spark plan within its free quotas.

## 1. Authentication

Enable:

```text
Authentication → Sign-in method → Email/Password
```

Anonymous authentication, Phone Authentication, Cloud Functions, and Firebase Hosting are not required.

## 2. Firestore

Create the default Cloud Firestore database in Production mode and publish:

```text
firebase/firestore.rules
```

Do not manually create collections. Documents are created after users register and save data.

## 3. Web App

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

## 4. Data isolation

Each account uses its Firebase UID:

```text
users/{uid}/profile/account
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{YYYY-MM}
```

The supplied security rules only permit the signed-in user to read/write their own UID path.

## 5. Profile

The profile document contains:

```json
{
  "displayName": "Ipul",
  "email": "ipul@example.com",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

The display name is used to personalize the app and reports.

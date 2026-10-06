# Firebase Spark Setup

Ayesha Salary uses Firebase Authentication and Cloud Firestore through REST APIs. It does not require Cloud Functions, Firebase Storage, or the Blaze plan.

## 1. Create or open the Firebase project

Use the existing `ayesha-salary` project or create a new Firebase project on the Spark plan. Google Analytics is optional and not required by the application.

## 2. Register a Web application

From **Project settings -> General -> Your apps**, register a Web application. Firebase provides a configuration object containing `apiKey` and `projectId`.

Only these values are required by the current static build:

```text
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_PROJECT_ID=<projectId>
```

Store them in Vercel Environment Variables. Do not commit service-account keys or administrator credentials.

## 3. Enable Email/Password authentication

Open:

```text
Authentication -> Sign-in method -> Email/Password
```

Enable Email/Password and save the provider configuration.

## 4. Create Cloud Firestore

Open **Firestore Database**, create the default database, and select Production mode. Choose a suitable nearby region because the database location cannot be changed later.

## 5. Publish Security Rules

Open the Firestore **Rules** tab and publish the complete contents of:

```text
firebase/firestore.rules
```

The rules:

- require an authenticated Email/Password account;
- isolate every account by Firebase UID;
- reject list operations;
- validate metadata and month-document shapes;
- restrict month IDs to `YYYY-MM`.

## 6. Authorized domains

In **Authentication -> Settings -> Authorized domains**, add the production Vercel hostname when it is not already present.

Example:

```text
ayesha-salary.vercel.app
```

Do not include `https://` or a trailing slash.

## 7. Redeploy

After adding or changing Vercel environment variables, create a new deployment. Existing deployments do not receive newly added build-time variables automatically.

## 8. Functional test

1. Create an account or sign in.
2. Enter a class and teaching hours.
3. Wait for **Cloud active**.
4. Open the application in a second browser.
5. Sign in using the same account.
6. Confirm the same records appear.
7. Edit one value and confirm the other browser receives the update.

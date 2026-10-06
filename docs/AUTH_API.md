# Authentication and Cloud API

Ayesha Salary calls Firebase REST endpoints directly so the production build remains static and lightweight without the Firebase JavaScript SDK.

## Authentication endpoints

### Create account

```text
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}
```

Payload:

```json
{
  "email": "owner@example.com",
  "password": "user-password",
  "returnSecureToken": true
}
```

### Sign in

```text
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}
```

### Refresh ID token

```text
POST https://securetoken.googleapis.com/v1/token?key={API_KEY}
Content-Type: application/x-www-form-urlencoded
```

Payload:

```text
grant_type=refresh_token&refresh_token={REFRESH_TOKEN}
```

### Send password-reset email

```text
POST https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={API_KEY}
```

Payload:

```json
{
  "requestType": "PASSWORD_RESET",
  "email": "owner@example.com"
}
```

## Firestore endpoints

### Read document

```text
GET https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{DOCUMENT_PATH}
Authorization: Bearer {ID_TOKEN}
```

### Atomic commit

```text
POST https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:commit
Authorization: Bearer {ID_TOKEN}
```

Month documents and account metadata are sent in one `writes` array so each synchronization commit is atomic.

## Account document paths

```text
users/{uid}/salaryAudit/database
users/{uid}/salaryAuditMonths/{YYYY-MM}
```

## Error handling

Firebase error codes are mapped to clear English messages for:

- registered or unregistered email addresses;
- invalid email format;
- incorrect or weak passwords;
- disabled accounts;
- disabled Email/Password provider;
- expired sessions;
- excessive attempts;
- quota errors;
- Firestore permission denial.

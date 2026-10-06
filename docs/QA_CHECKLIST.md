# QA Checklist - v2.3.1

## Authentication & data

- Create account with display name
- Sign in on another browser
- Confirm UID isolation between two accounts
- Change password from Settings
- Verify old password fails and new password succeeds
- Verify safe sign-out blocks while unsynchronized

## Monthly report

- Enter multiline Class and Notes values
- Confirm pay totals
- Download PDF and inspect spacing/wrapping
- Confirm watermark is visible but does not interfere with text
- Download PNG and open it
- Download Excel and verify Summary, Daily Details, Analytics
- Edit Hours in Excel and confirm Amount/Total formulas recalculate
- Download CSV and verify UTF-8 text/newlines

## Annual report

- Confirm 12-month breakdown
- Download annual PDF, PNG, Excel, and CSV
- Verify annual totals and analytics

## Offline/PWA

- Open once online
- Go offline and edit data
- Confirm local persistence
- Return online and verify synchronization
- Confirm report/export modules remain available from cached application shell

## Visual

- Desktop
- Android phone width
- Tablet width
- Long names and long Class/Notes values
- No visible personal developer name in login, Settings, footer, or report metadata

## MySalary landing branding
- Brand mark replaces generic auth/loading/header iconography.
- Hero watermark remains subtle and never reduces text readability.
- PWA icon uses the brand mark.
- Password-reset UI uses privacy-safe success messaging.
- Runtime UI contains no personal developer-name attribution.

# Implementation Notes

## Architecture

Ayesha Salary is a static Progressive Web App with no custom backend server.

```text
UI and event handling
  -> local IndexedDB/localStorage persistence
  -> per-month dirty queue
  -> Firebase Authentication REST
  -> Firestore REST atomic commit
  -> adaptive remote revision polling
```

## Offline-first persistence

Each edit is saved locally before cloud synchronization. IndexedDB is preferred, with localStorage used as a fallback when IndexedDB is restricted. Local data is scoped by authenticated Firebase UID.

## Synchronization

- Input changes are debounced for approximately 250 ms.
- Changed months are queued independently.
- Settings and month documents are committed atomically with metadata.
- Active browsers poll revision metadata approximately every 2.5 seconds.
- Polling slows while idle or hidden to reduce Spark-plan reads.
- BroadcastChannel notifies other tabs in the same browser.
- Page-hide and page-close events attempt a keepalive upload.

## Conflict strategy

Database merging uses per-document `updatedAt` timestamps. A newer intentionally cleared month remains authoritative and is not mistaken for an automatically created empty month.

## Safe Sign Out

The sign-out process:

1. saves the complete database locally;
2. blocks sign out while offline;
3. uploads every pending month and settings change;
4. reads the latest cloud snapshot;
5. merges and writes the complete local state;
6. reads the Firestore revision again;
7. removes the session only when the revisions match.

## English localization

Version 1.6.0 standardizes user-facing text, date formatting, month names, validation messages, PWA metadata, exports, and PDF reports to English. Internal legacy keys such as `audit-gaji-*` and `window.__AUDIT_GAJI_CONFIG__` are intentionally retained to preserve existing local data and deployments.

## Removed Unique Classes metric

The prior metric split class names using commas, semicolons, slashes, and pipes. That could misrepresent a single class containing punctuation or multiple classes entered in one field. Because it was ambiguous and not essential to pay auditing, v1.6.0 removes it from calculations and all reports instead of presenting a potentially misleading number.

## Security

- No administrator keys are stored in the browser.
- Firestore Security Rules isolate records by UID.
- Content Security Policy restricts external connections to required Firebase endpoints.
- User-entered PDF content is HTML-escaped.
- Authentication sessions are removed only after verified Safe Sign Out.

## Multiline daily entry architecture (v1.7.0)

The Class and Notes controls use native `<textarea>` elements rather than content-editable regions. This keeps keyboard behavior, accessibility, validation, autosave, Firebase synchronization, backup, and CSV export predictable. A delegated input handler updates the existing month entry model and resizes the active field from its `scrollHeight`, capped at 180 px to prevent one row from taking over the entire screen. Additional content remains scrollable inside the field.

The synchronization renderer treats both input and textarea controls as active editors. Cloud status updates therefore do not replace the table DOM while the user is typing, which avoids focus loss and cursor jumps. PDF cells use `white-space: pre-wrap` so intentional line breaks remain visible in exported reports.

## Direct PDF engine architecture (v1.8.0)

The old report path wrote HTML into an `about:blank` popup and invoked `window.print()`. That design conflicted with the production Content Security Policy because the generated popup relied on inline CSS and JavaScript. It also depended on browser print-dialog behavior and could not guarantee a direct file download.

The replacement separates responsibilities:

```text
pdf-report.js
- converts application data into report models;
- owns monthly and annual business layout;
- handles table pagination and repeated headers.

pdf-core.js
- creates PDF catalog, page, stream, font, metadata, and xref objects;
- provides drawing primitives and text wrapping;
- converts bytes to a Blob and starts a direct browser download.
```

The engine uses standard Helvetica and Helvetica Bold PDF fonts. This keeps startup fast, avoids large dependencies, works offline, and requires no Vercel server function or paid service. Text is normalized to a safe WinAnsi-compatible representation before being written into PDF streams.


# Changelog

## 2.2.0 - Reporting & White-Label Export Upgrade

- Redesigned monthly PDF layout to remove overlapping header, title, status, and metadata content.
- Simplified the report hierarchy and moved metadata into a stable 2x2 card grid.
- Added the supplied visual mark as a low-opacity PDF watermark on monthly and annual reports.
- Added direct monthly and annual PNG report downloads.
- Added real `.xlsx` Excel exports for monthly and annual reporting.
- Added formatted workbook summary, detail/breakdown, and analytics sheets.
- Added workbook formulas for totals so exported sheets remain editable and recalculate in Excel.
- Added an embedded analytics chart image to Excel workbooks.
- Improved CSV structure, metadata, dates, totals, UTF-8 compatibility, and removal of unused empty daily rows.
- Replaced public developer-name attribution with the supplied visual brand mark.
- Removed developer-identifying runtime metadata from Settings and login/footer copy.
- Updated responsive export controls for CSV, Excel, PNG, and PDF.
- Updated service-worker caching for new report modules and brand assets.
- Preserved multi-user isolation, offline-first behavior, password security, safe sign-out, and Firebase Spark compatibility.

## 2.1.0 - Commercial UI & Account Security

- Redesigned the public login/sign-up experience.
- Added Account security and in-app password changes with reauthentication.
- Increased the application-side minimum password length for new registrations to 8 characters.
- Preserved multi-user isolation, offline-first behavior, fast synchronization, reports, backup/restore, and safe sign-out.

## 2.0.0 - Multi-User Edition

- Converted the application to a customer-neutral multi-user product.
- Added user profile names and UID-scoped Firestore data.
- Personalized dashboard, reports, exports, and backups using the active profile.

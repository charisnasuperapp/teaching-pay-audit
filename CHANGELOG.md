## 2.3.1 - Report Layout & Watermark Reliability Hotfix
- Fixed annual PNG footer overlap by increasing the report canvas and reserving a safe footer zone.
- Fixed the monthly PNG total row so the `MONTHLY TOTAL` label is never truncated into a narrow first column.
- Replaced generic dollar report-header artwork with the MySalary brand mark in PDF and PNG reports.
- Changed PDF and PNG watermark rendering order so the supplied logo remains subtly visible above opaque table/card backgrounds.
- Tuned watermark opacity to stay light while remaining visible on phones, PCs, PDF viewers, and exported PNGs.
- Compacted annual PDF row/card spacing to preserve a clear footer and insight section on a single A4 landscape page.
- Re-ran automated tests, syntax validation, production build, and rendered PDF visual verification.

## 2.3.0 - MySalary Brand, Auth & Commercial Polish
- Promoted MySalary to the public-facing product brand while retaining Teaching Pay Audit as the functional descriptor.
- Replaced generic auth/loading/header artwork with the supplied brand mark.
- Added a subtle hero watermark and branded PWA icons.
- Improved password-reset privacy messaging and commercial authentication copy.
- Added complete Firebase Authentication email-template documentation.
- Preserved all v2.2 PDF, PNG, Excel, CSV, offline, sync, password-change, and safe-sign-out functionality.

## v2.2.1 - Landing Brand Integration
- Replaced generic auth/loader symbols with the supplied brand logo.
- Added a subtle logo watermark to the landing showcase for a more professional branded first impression.
- Kept the right-side login panel clean while strengthening brand identity across desktop and mobile auth views.

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

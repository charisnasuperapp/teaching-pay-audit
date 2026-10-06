# Changelog

## 1.9.0 - Ayesha customer edition

- Prepared the complete customer edition for Ayesha Salary.
- Added centralized runtime branding in `src/brand.js` for faster future customer duplication.
- Browser title, PWA metadata, login screen, dashboard, PDF identity, CSV/PDF/backup filenames, and report metadata now follow the central brand configuration.
- Removed stale sample PDF files from the source package.
- Preserved Firebase Authentication, Firestore synchronization, offline-first behavior, safe logout, multiline fields, CSV/JSON export, and direct PDF download.
- Bumped the service-worker cache to avoid stale customer assets after deployment.

## 1.8.0 - Direct PDF Download and Report Layout Refinement

- Replaced the CSP-sensitive `about:blank` print preview with direct client-side PDF generation.
- Added a small offline PDF engine for PDF objects, standard fonts, drawing, wrapping, pagination, and file download.
- Changed monthly and annual export buttons to direct-download actions.
- Added success notifications after PDF download begins.
- Increased report spacing and table readability.
- Added dynamic monthly row heights and repeated headers on additional pages.
- Added page numbering and generation metadata to every page.
- Prevented annual insight cards and footers from overlapping.
- Added PDF structure, pagination, and direct-download automated tests.
- Updated the Service Worker cache to v1.8.0 and cached `pdf-core.js`.

## 1.7.0 - Multiline Daily Details

- Changed Class and Notes from single-line inputs to auto-growing textareas.
- Added line wrapping and Enter-key line breaks.
- Increased Class capacity from 150 to 500 characters.
- Preserved multiline content in PDF and CSV exports.
- Prevented cloud-sync UI refreshes from interrupting active textarea editing.
- Updated the Service Worker cache to v1.7.0.

## 1.6.0 - English Interface and Streamlined Reports

### Changed

- Converted the complete user interface, validation messages, synchronization states, authentication flows, exports, and PWA metadata to English.
- Converted monthly and annual PDF reports to English.
- Removed redundant summary cards from both PDF report templates.
- Removed the monthly calculation explanation block below the table.
- Removed the ambiguous Unique Classes metric from calculations, dashboard cards, annual tables, CSV files, and PDF reports.
- Optimized the annual PDF to remain on one A4 landscape page without a nearly empty trailing page.
- Updated month names and hour formatting to the `en-US` locale.
- Updated CSV and backup filenames to use the Ayesha Salary naming convention.
- Updated Service Worker cache to v1.6.0.

### Compatibility

- No Firebase migration is required.
- No Firestore Rules change is required from v1.5.0.
- Existing account data and JSON backups remain readable.
- Internal legacy storage keys are intentionally retained to prevent data loss during the update.

### Quality

- Syntax validation passed.
- 19 unit and smoke tests passed.
- Production build passed.
- Monthly and annual PDFs were rendered and visually reviewed.

## 1.5.0 - Professional PDF Reports

- Added monthly A4 portrait and annual A4 landscape reports.
- Added multi-page table handling and repeated table headers.
- Fixed monthly totals above 24 cumulative hours.

## 1.4.0 - Personal UI and Safe Sign Out

- Added personalized Charisna/Ayesha branding.
- Added verified Safe Sign Out.

## 1.3.0 - Account Login and Cross-Browser Sync

- Added Firebase Email/Password login.
- Added account-scoped local cache and automatic cloud synchronization.

## 1.2.0 - Fast Synchronization

- Reduced synchronization debounce and added adaptive polling, BroadcastChannel updates, atomic commits, and keepalive uploads.

## 1.0.0 - Initial Release

- Added monthly entries, annual summaries, exports, backups, offline-first storage, and optional Firebase synchronization.

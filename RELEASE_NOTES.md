# Release Notes - v1.8.0

## Direct PDF Download and Improved Report Spacing

The previous PDF workflow opened an `about:blank` print-preview window and depended on the browser print dialog. In some browsers and installed PWAs, the **Save as PDF** button did not trigger a reliable download, while the preview could lose its stylesheet because the production Content Security Policy blocks inline styles and scripts.

Version 1.8.0 replaces that workflow with a native client-side PDF generator.

### Improvements

- Monthly and annual reports now download directly as `.pdf` files.
- No popup, `about:blank` page, print dialog, or printer selection is required.
- PDF generation remains offline-first and does not send salary data to an external service.
- Report spacing, row padding, metadata cards, signatures, and footer placement were redesigned.
- Long Class and Notes content wraps automatically and retains manual line breaks.
- Long monthly reports create additional pages and repeat the report/table header.
- Every page includes a page number and generation timestamp.
- The annual report remains a clean one-page A4 landscape document.
- Buttons now clearly say **Download PDF** and **Download Annual PDF**.

### Compatibility

- No Firebase migration is required.
- No Firestore Rules change is required.
- No additional Vercel Environment Variables are required.
- Existing records, accounts, backups, CSV exports, and synchronization remain compatible.

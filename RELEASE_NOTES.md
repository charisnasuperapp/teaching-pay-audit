# Teaching Pay Audit v2.2.0 - Reporting & White-Label Export Upgrade

This release focuses on report quality, shareability, spreadsheet usefulness, and white-label presentation while preserving the stable multi-user architecture.

## Highlights

- Cleaner monthly and annual PDF layouts with no overlapping header or metadata content.
- Subtle visual watermark using the supplied brand mark.
- Direct PNG download for quick sharing through messaging apps.
- Professional Excel `.xlsx` export with multiple sheets, formulas, formatting, and an embedded analytics chart.
- Improved CSV output for raw-data workflows.
- Runtime developer-name attribution removed and replaced with the brand mark.
- CSV, Excel, PNG, and PDF export options available from both monthly and annual reporting views.

## Firebase impact

No Firestore schema migration is required. No paid Firebase or Vercel service is introduced.

Existing requirements remain:

```text
Authentication: Email/Password enabled
Firestore: Production database with UID-scoped rules
Vercel: VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID
```

## Validation

- Automated test suite includes PDF watermark, Excel workbook structure, and export UI coverage.
- JavaScript syntax validation passes.
- Production build passes.
- Monthly and annual PDFs were rendered and visually inspected.
- Generated Excel workbook was imported and inspected successfully with no formula errors.

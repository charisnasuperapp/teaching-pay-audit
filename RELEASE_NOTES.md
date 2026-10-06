# MySalary v2.3.1 - Report Layout & Watermark Reliability Hotfix

This maintenance release fixes the report-export issues observed on both mobile and desktop while preserving all MySalary v2.3.0 functionality.

## Fixed

- Annual PNG exports now reserve enough vertical space so the footer never overlaps the annual total row.
- Monthly PNG totals use a merged label area, so `MONTHLY TOTAL` is displayed in full.
- PDF annual layout is more compact and leaves a clean safety margin above the footer.
- PDF and PNG watermarks are drawn as a final low-opacity overlay so opaque report cards and table rows no longer hide them.
- The watermark remains deliberately subtle, but it is now visibly present in the report body.
- PDF and PNG report headers use the supplied MySalary brand mark instead of the generic dollar icon.

## Preserved

- Multi-user Firebase Authentication and UID-isolated Firestore data.
- Offline-first local persistence and fast cloud synchronization.
- Safe verified sign-out and in-app password changes.
- CSV, Excel, PNG, and direct PDF export.
- Professional Excel workbook and analytics output.
- MySalary commercial branding and custom-domain compatibility.

No Firebase schema, Authentication, Firestore Rules, or Vercel environment-variable changes are required.

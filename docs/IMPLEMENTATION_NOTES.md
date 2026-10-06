# Implementation Notes

## Architecture

MySalary remains a static offline-first application deployed to Vercel and synchronized with Firebase Authentication + Firestore on the Spark plan.

## Reporting modules

- `src/lib/pdf-core.js` - local PDF writer with fonts, transparent graphics state, and embedded JPEG image resources.
- `src/lib/pdf-report.js` - monthly and annual PDF layout.
- `src/lib/report-image.js` - Canvas-based PNG report renderer.
- `src/lib/xlsx-export.js` - dependency-free OOXML/XLSX generator, ZIP container writer, workbook styling, formulas, analytics data, and embedded chart image.
- `src/lib/export.js` - CSV and JSON backup output.
- `src/lib/brand-art.js` - embedded report watermark image data.
- `src/brand-mark.png` - runtime white-label visual mark.

## Excel design

The XLSX generator intentionally avoids remote CDN dependencies so exports continue to work offline after the PWA has cached the application.

Monthly workbooks:

1. Summary
2. Daily Details
3. Analytics

Annual workbooks:

1. Summary
2. Monthly Breakdown
3. Analytics

Totals use formulas where appropriate. Analytics charts are rendered locally to PNG and embedded into the XLSX drawing layer.

## White-label behavior

No personal developer name is displayed in the runtime interface. The supplied visual mark is used in the footer and reports instead.

## Compatibility

The application remains responsive on Android phone/tablet, Windows desktop, and modern web browsers. Report generation relies only on standard browser APIs and locally bundled code.

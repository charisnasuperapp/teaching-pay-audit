# PDF Reports

## Purpose

The PDF module creates consistent English-language audit reports directly on the user's device. It does not require Cloud Functions, Firebase Storage, a paid PDF API, a print driver, or an external document service.

## Architecture

```text
app.js
  -> exportMonthPdf / exportYearPdf
  -> pdf-report.js (report model and layout)
  -> pdf-core.js (PDF objects, fonts, text wrapping, drawing, pagination)
  -> Blob URL + HTML download attribute
  -> direct .pdf file download
```

Public report functions:

```text
exportMonthPdf(month, teacherName)
exportYearPdf(database, year)
buildMonthReportPdf(month, teacherName, generatedAt)
buildYearReportPdf(database, year, generatedAt)
createMonthReportModel(month, teacherName, generatedAt)
createYearReportModel(database, year, generatedAt)
```

## Monthly report

- A4 portrait.
- Piola Salary identity and reporting metadata.
- Daily table: number, date, class, hours, rate, amount, and notes.
- Multiline Class and Notes content with automatic wrapping.
- Dynamic row heights and automatic page continuation.
- Repeated table headers on continuation pages.
- One Monthly Total row after the final entry.
- Prepared-by and reviewed-by signature areas.
- Page number and generation timestamp on every page.

## Annual report

- A4 landscape.
- Twelve English month rows.
- Teaching days, total hours, average hours per day, hourly rate, and total pay.
- One annual total row.
- Highest-earning month, average monthly pay, and active-month insights.
- Optimized for one page without footer or insight overlap.

## Direct download behavior

The report is generated as a `Uint8Array`, converted to a PDF `Blob`, and downloaded through a temporary `<a download>` element created during the user's click event.

This avoids:

- popup blockers;
- `about:blank` preview windows;
- blocked inline preview styles/scripts;
- browser print-dialog inconsistencies;
- manual selection of **Save as PDF** or **Microsoft Print to PDF**.

## Security and privacy

- Report data never leaves the device during PDF generation.
- No third-party PDF service is called.
- No HTML is executed inside the PDF.
- Text is normalized and escaped for PDF string syntax.
- Unsupported characters are replaced safely instead of corrupting the document.
- Standard embedded PDF font references keep files small and offline-compatible.

## Quality checks

Automated tests verify:

- correct PDF header, objects, fonts, xref table, and page count;
- accurate monthly and annual calculations;
- direct browser download-link behavior;
- manual line-break preservation;
- multi-page monthly pagination;
- all twelve annual month rows;
- absence of the old preview, print button, and Unique Classes metric.

Visual QA renders generated PDFs to PNG images to check spacing, clipping, wrapping, totals, signatures, insights, and footer placement.

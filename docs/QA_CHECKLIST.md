# QA Checklist

## Authentication

- [ ] Dashboard is not visible before sign-in.
- [ ] Existing account can sign in.
- [ ] Account creation works.
- [ ] Password-reset request works.
- [ ] Session persists after reopening the browser.
- [ ] Safe Sign Out completes only after cloud verification.

## Monthly records

- [ ] English month name is displayed.
- [ ] Class and hours can be entered for every day.
- [ ] Pay equals hours multiplied by the monthly hourly rate.
- [ ] Decimal hours work correctly.
- [ ] Missing class name is flagged when hours are entered.
- [ ] Teaching Days, Total Hours, and Total Pay update immediately.
- [ ] No Unique Classes card is displayed.
- [ ] Monthly total above 24 cumulative hours remains correct.

## Annual summary

- [ ] All twelve English month names are displayed.
- [ ] Teaching days, total hours, average per day, and total pay are correct.
- [ ] No class-count column is displayed.
- [ ] Selecting a month opens its daily details.

## Synchronization

- [ ] Local save occurs before cloud upload.
- [ ] Cloud indicator returns to **Cloud active**.
- [ ] A second browser receives the same account data.
- [ ] Offline edits remain available locally.
- [ ] Reconnection uploads pending changes.
- [ ] Same-browser tabs receive BroadcastChannel refreshes.

## Exports and backup

- [ ] Monthly CSV uses English headers.
- [ ] Annual CSV uses English headers and has no Unique Classes column.
- [ ] JSON backup downloads successfully.
- [ ] JSON restore merges the latest month versions.

## Monthly PDF

- [ ] Report is fully in English.
- [ ] Redundant summary cards are absent.
- [ ] Calculation explanation is absent.
- [ ] Unique Classes metric is absent.
- [ ] Daily rows and Monthly Total are correct.
- [ ] Clicking **Download PDF** starts a real `.pdf` download without opening `about:blank`.
- [ ] No browser print dialog is required.
- [ ] Long tables continue without clipping and repeat the table header.
- [ ] Multiline Class and Notes content wraps with comfortable vertical spacing.
- [ ] Signatures and footer do not overlap report content.

## Annual PDF

- [ ] Report is fully in English.
- [ ] All twelve months are present.
- [ ] Unique Classes column is absent.
- [ ] Annual total matches the dashboard.
- [ ] Clicking **Download Annual PDF** starts a real `.pdf` download.
- [ ] Landscape layout does not clip columns.
- [ ] Insight cards and footer do not overlap.

## Compatibility

- [ ] Android phone/PWA.
- [ ] Android tablet.
- [ ] Windows Chrome.
- [ ] Windows Edge.
- [ ] Vercel production deployment.

## Multiline fields (v1.7.0)

- Enter creates a new line in Class and Notes.
- Long text wraps without horizontal clipping.
- Textareas grow from one line up to the configured maximum height.
- Content beyond the maximum height remains vertically scrollable.
- Autosave and cloud synchronization continue while editing multiline text.
- A cloud status refresh does not remove textarea focus.
- JSON backup, CSV export, and PDF export preserve line breaks.
- Existing single-line records load without migration or data loss.


## Direct PDF download (v1.8.0)

- [ ] Monthly button label is **Download PDF**.
- [ ] Annual button label is **Download Annual PDF**.
- [ ] Downloaded files begin with a valid `%PDF-1.4` header.
- [ ] Monthly filename contains the selected `YYYY-MM` period.
- [ ] Annual filename contains the selected year.
- [ ] PDF generation works while the app is offline after the PWA shell is cached.
- [ ] No popup permission is required.

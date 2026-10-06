# PDF and Image Reporting

## PDF layout

Monthly reports use A4 portrait. Annual reports use A4 landscape.

The report engine uses a fixed safe margin, repeatable table headers, dynamic row heights for multiline Class/Notes values, page-number footers, and a simplified hierarchy to prevent overlapping content.

Monthly metadata is rendered in a 2x2 grid:

- Teacher
- Reporting Period
- Hourly Rate
- Generated On

The supplied visual mark is embedded into every PDF page as a low-opacity watermark overlay. It is intentionally faint (roughly 3-4% opacity), but it is drawn after opaque table/card backgrounds so it remains visible in common desktop and mobile PDF viewers without obscuring report text.

The report header also uses the MySalary brand mark instead of a generic currency glyph.

## PNG export

PNG reports are generated locally using the Canvas API. Monthly PNG height expands with report content instead of forcing a page break. The monthly total label uses a merged area so it cannot be truncated by the narrow `No.` column.

Annual PNG uses a landscape report layout with additional bottom safety space so the total row and footer never overlap. The same low-opacity MySalary watermark is drawn as a final overlay for consistent visibility across phone and PC exports.

No server-side image generation is used.

## Privacy

PDF and PNG generation occurs entirely on the user's device. No report data is sent to an external report-rendering service.

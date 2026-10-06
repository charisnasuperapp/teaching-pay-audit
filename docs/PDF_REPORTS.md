# PDF and Image Reporting

## PDF layout

Monthly reports use A4 portrait. Annual reports use A4 landscape.

The report engine uses a fixed safe margin, repeatable table headers, dynamic row heights for multiline Class/Notes values, page-number footers, and a simplified hierarchy to prevent overlapping content.

Monthly metadata is rendered in a 2x2 grid:

- Teacher
- Reporting Period
- Hourly Rate
- Generated On

The supplied visual mark is embedded into every PDF page as a background image with approximately 4-5% opacity. It is intentionally faint and placed behind report content.

## PNG export

PNG reports are generated locally using the Canvas API. Monthly PNG height expands with report content instead of forcing a page break. Annual PNG uses a landscape report layout.

No server-side image generation is used.

## Privacy

PDF and PNG generation occurs entirely on the user's device. No report data is sent to an external report-rendering service.

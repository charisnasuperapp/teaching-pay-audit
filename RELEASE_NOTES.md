# Ayesha Salary v1.9.0

A customer-ready edition of Teaching Pay Audit for Ayesha. The application keeps the full v1.8.0 feature set while moving visible customer identity into a centralized branding configuration.

## Highlights

- Ayesha-specific login, dashboard, exports, and professional PDF reports.
- Fast automatic Firebase synchronization across browsers and devices.
- Offline-first local persistence and safe verified sign-out.
- Direct PDF download, CSV export, and JSON backup/restore.
- Multiline Class and Notes fields.
- Central branding file: `src/brand.js`.

## Backend separation

This source package does not contain Ayesha's Firebase credentials. Create a dedicated Firebase project for Ayesha and provide `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` in Ayesha's Vercel project.

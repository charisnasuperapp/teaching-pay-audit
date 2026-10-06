# QA Checklist

## Account

- [ ] Sign-up requires Your Name, Email, Password, Confirm Password.
- [ ] New registration rejects passwords shorter than 8 characters.
- [ ] Mismatched password confirmation is rejected.
- [ ] Existing email shows a useful error.
- [ ] Password reset sends successfully.
- [ ] Profile name is restored after sign-in on another browser.
- [ ] Editing profile name updates dashboard and reports.

## Change password

- [ ] Settings contains Account security / Change Password.
- [ ] Incorrect current password is rejected without destroying the current session.
- [ ] New password shorter than 8 characters is rejected.
- [ ] New password must match confirmation.
- [ ] New password must differ from the current password.
- [ ] Correct current password successfully changes the Firebase password.
- [ ] Current session remains active after a successful change.
- [ ] Old password no longer signs in after logout.
- [ ] New password signs in successfully.

## Security

- [ ] User A cannot read User B data.
- [ ] Firestore Rules are published.
- [ ] No Firebase Admin/service-account secrets are in source.
- [ ] Repository remains private during setup.

## Salary workflow

- [ ] Hours × hourly rate is accurate.
- [ ] Long Class/Notes values wrap and preserve line breaks.
- [ ] Monthly totals are accurate.
- [ ] Annual totals are accurate.

## Sync

- [ ] Same account syncs between two browsers.
- [ ] Offline edits remain local and upload after reconnect.
- [ ] Profile-name change reaches another active device after cloud revision sync.
- [ ] Safe sign-out is blocked when data cannot be verified.

## Exports

- [ ] Monthly PDF downloads directly.
- [ ] Annual PDF downloads directly.
- [ ] Signed-in profile name appears in PDFs.
- [ ] CSV metadata contains the profile name.
- [ ] Backup JSON contains profile metadata and salary data.

## Responsive UI

- [ ] Public login/sign-up page is readable and polished on desktop.
- [ ] Android phone layout.
- [ ] Android tablet layout.
- [ ] Desktop workspace layout.
- [ ] Web/PWA installation.

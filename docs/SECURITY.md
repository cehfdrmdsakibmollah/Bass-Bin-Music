# Security checklist

- ✅ No third-party media harvesting or automatic uploads.
- ✅ Restrictive file MIME allowlist and per-type size limits before local ingestion.
- ✅ Import JSON checks schema version, track count, aspect, dimensions, time boundaries, colors and scalar ranges.
- ✅ Only allowlisted HTTPS domains for music links (including recovered locally saved records).
- ✅ React escapes user-provided titles and layer text by default; generated JSON-LD escapes raw `<` characters.
- ✅ `.env.example` has placeholders only; no credentials bundled.
- ⚠️ No backend authentication or cloud permissions are implemented, so this code must **not** be presented as an admin-protected platform.
- ⚠️ No upload API exposed; future storage and publishing endpoints require JWT validation, CSRF/state protection, rate limiting and audits.
- ⚠️ Imported large media and long exports can exhaust browser memory/disk. File caps reduce but do not eliminate this risk.
- ⚠️ IndexedDB persistence is browser-origin storage, not an encrypted backup or secure cross-device vault.
- ⚠️ New dependencies must be audited and `npm audit` run in an internet-enabled environment.

## Before adding secure Google sign-in

Design HttpOnly/SameSite secure session flow, server token validation, project ownership checks, encrypted token at rest and narrowly scoped OAuth consent. Test unauthorized access. Do not put secrets or administrator credentials in client-side code, GitHub commits, chat or logs.

## Before public release

Check third-party media rights, headers/CSP, actual file decoding, quota and abuse limits, permissions, HTTPS, secure cookies (if any), and privacy policy/consent requirements.

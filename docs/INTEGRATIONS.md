# Publishing and authentication integrations

## YouTube (first future publishing target)

**Not configured or claimed working in this release.** Official YouTube Data API supports `videos.insert` upload with an OAuth token and `youtube.upload` scope, subject to consent-screen verification, account access and project quotas. Relevant source: https://developers.google.com/youtube/v3/docs/videos/insert

Roadmap: create a Google Cloud project; configure verified redirect URL and consent screen; implement server-side OAuth authorization with state/PKCE where applicable; store only encrypted refresh tokens server-side; upload with the official resumable mechanism; handle channel selection, quotas, errors and disconnect; add tests. **Never expose refresh tokens in `NEXT_PUBLIC_` variables.** Upload scopes/quotas may change; read current docs before implementing.

## Firebase Google sign-in

Not configured. When enabled later, client should obtain Firebase ID tokens and protected API routes must verify them server-side using Firebase Admin, validate ownership and avoid using client-only checks for authorization. Never place Admin service account credentials in client bundles.

## MongoDB Atlas

No database is needed for the current local creator. An optional future metadata sync may use MongoDB with strict schema, per-user ownership validation and server-only connection strings. Do not sync media by default.

## SoundCloud / Audiomack / Audio.com

Current feature is a link-only personal collection, not an official upload API integration. Upload permissions are not established here. Use platform websites for manual upload. Do not scrape, extract third-party copyrighted media or imply that a public metadata API grants upload rights.

## Related docs

- Next.js SEO: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Web Audio recording destination: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination
- Canvas capture: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

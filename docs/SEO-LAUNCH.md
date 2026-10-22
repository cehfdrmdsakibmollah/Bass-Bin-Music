# Technical SEO launch plan

Public pages are server-rendered/SSG by the Next.js App Router. Search rankings and Core Web Vitals must be measured post-launch; no #1 ranking promise.

## Public route SEO matrix

| Route | SEO title | Canonical | Indexable with configured production URL | JSON-LD |
|---|---|---|---|---|
| `/` | BASS BIN MUSIC — Free Phonk Video & Audio Visualizer Maker | `/` | Yes | Organization, WebSite, WebApplication |
| `/features` | Free Audio Visualizer & Phonk Editor Features | `/features` | Yes | None |
| `/templates` | Editable Phonk Video Templates | `/templates` | Yes | None |
| `/templates/[slug]` x16 | `[Template] — Free Editable Visualizer Template` | unique slug | Yes | BreadcrumbList |
| `/guides/phonk-visualizer` | How to Make a Phonk Music Visualizer Video | same | Yes | None |
| `/music` | Music Hub — Save & Explore Release Links | `/music` | Yes | None |
| `/studio` | Free Phonk Video Studio | not indexed | No | None |
| `/dashboard` | My Local Projects | not indexed | No | None |
| `/publish` | Publishing Guide | not indexed | No | None |

Descriptions are implemented on indexable pages, and each has an authored H1. The XML sitemap includes only public routes. `robots.ts` disallows the editor and private dashboards, while `noindex` metadata on those routes provides a separate index control. This is not authentication.

## Production SEO prerequisites

- Set the real production HTTPS domain in `NEXT_PUBLIC_SITE_URL`; if missing, `robots.txt` disallows crawlers and pages use `noindex` by design.
- Confirm real canonical URLs, metadata images and `sitemap.xml` after deploy. Never submit localhost/preview domains.
- Verify the domain in Google Search Console, submit `https://YOURDOMAIN/sitemap.xml`, inspect at least `/`, `/templates`, a template detail and the guide.
- Validate JSON-LD with Google Rich Results Test; Organization/WebApplication markup is not guaranteed to yield rich results.
- Run Chrome Lighthouse on production builds. Suggested mobile targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95; these are targets, not measured results.
- Monitor Core Web Vitals at p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, assuming sufficient field data.
- Use helpful original page content, real brand ownership information and meaningful internal links; avoid auto-generated low-value pages.
- Verify 404 status for unknown URLs; do not add user workspace URLs to sitemaps.
- Defer analytics/tracking until consent and privacy requirements are understood.

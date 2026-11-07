# motive11.com

Motive11's marketing site: the operator-facing home for Mark Szymanski's build work (custom software,
AI systems, and websites for established firms). markszymanski.co stays the home for Mark himself,
his content, and builders; this site links there and never copies its prices.

## Stack

- Astro 7 (static output), Tailwind v4 via `@tailwindcss/vite`, `@astrojs/sitemap`
- Satoshi, self-hosted by Astro's Fonts API from Fontshare at build time
- Cloudflare Pages, git-connected (`Motive11/motive11-website` → Pages project `motive11-website`, which holds motive11.com and www)
- No forms and no Pages Functions. Booking is the shared widget from the AIOS booking Worker

## Pages

| Path | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/services` | `src/pages/services.astro`, offers from `src/lib/offers.ts`, prices from `src/lib/pricing.ts` |
| `/partnership`, `/partnership/<industry>` | `src/components/partnership/PartnershipPage.astro`, industries in `src/lib/industries.ts` |
| `/ai-onboarding-day` | `src/pages/ai-onboarding-day.astro` |
| `/privacy` | `src/pages/privacy.astro` via `src/layouts/LegalLayout.astro` |
| `/case-studies`, `/case-studies/<slug>` | `src/content/case-studies/*.md` (schema in `src/content.config.ts`) |
| `/about` | `src/pages/about.astro` |
| `/book`, `/book/<slug>` | `src/pages/book/index.astro`; `public/_redirects` rewrites every booking path to it |
| `/terms`, `/ai-policy` | `src/pages/*.astro` via `src/layouts/LegalLayout.astro` |

Testimonials are read at build time from `testimonials.markszymanski.co` by id (`src/lib/testimonials.ts`).
A failed fetch drops the quote and the build carries on, so a rebuild picks up edited quotes.

Dark mode is the default; the header toggle stores `light` or `dark` in `localStorage`.

## Develop

```bash
npm install
npm run dev        # astro dev, ignores public/_headers
npm run build
npx wrangler pages dev dist --port 8811   # serves dist with the real headers and redirects
```

## Deploy

Pushing `main` deploys. Pages build settings: build command `npm install --no-audit --no-fund && npm run build`,
output `dist`, env `NODE_VERSION=24` and `SKIP_DEPENDENCY_INSTALL=1` (production and preview).

**Order for the first Astro deploy (November 2026):** the Pages project is still set up for the old static
site (no build command, output = repo root). Change the build settings above BEFORE merging the Astro
branch to `main`. Merging first publishes a repo root with no `index.html`, and every page, booking
links included, 404s until the settings are fixed. Changing the settings first is safe: a failed build
leaves the current production deploy live.

Before launch and after any header, hero, or layout change, run from AIOS:
`pipelines/web-build/check_widths.py` on the main pages and `pipelines/web-build/check_csp.py dist`,
and after a push `pipelines/web-build/check_live.py https://motive11.com`.

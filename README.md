# motive11.com

Motive11's marketing site: the operator-facing home for Mark Szymanski's build work (custom software,
AI systems, and websites for established firms). markszymanski.co stays the home for Mark himself,
his content, and builders; this site links there and never copies its prices.

## Stack

- Astro 7 (static output), Tailwind v4 via `@tailwindcss/vite`, `@astrojs/sitemap`
- Satoshi, self-hosted by Astro's Fonts API from Fontshare at build time
- Cloudflare Pages, git-connected (`Motive11/motive11-website` → Pages project `motive11-website`, which holds motive11.com and www)
- No forms of its own. Booking is the shared widget from the AIOS booking Worker
- One Pages Function, `functions/api/v.ts`: the visitor ledger (below)

## Pages

| Path | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/services` | `src/pages/services.astro`, offers from `src/lib/offers.ts`, prices from `src/lib/pricing.ts` |
| `/fractional`, `/fractional/<industry>` | `src/components/fractional/FractionalPage.astro`, industries in `src/lib/industries.ts`. `/partnership` and old `/work-with-me` links redirect here |
| `/ai-onboarding-day` | `src/pages/ai-onboarding-day.astro` |
| `/testimonials` | `src/pages/testimonials.astro`: every Motive11 testimonial from the testimonials API (entity `motive11` only), linked from the footer |
| `/privacy` | `src/pages/privacy.astro` via `src/layouts/LegalLayout.astro` |
| `/case-studies`, `/case-studies/<slug>` | `src/content/case-studies/*.md` (schema in `src/content.config.ts`) |
| `/about` | `src/pages/about.astro` |
| `/book`, `/book/<slug>` | `src/pages/book/index.astro`; `public/_redirects` rewrites every booking path to it |
| `/terms`, `/ai-policy` | `src/pages/*.astro` via `src/layouts/LegalLayout.astro` |

Testimonials are read at build time from `testimonials.markszymanski.co` by id (`src/lib/testimonials.ts`).
A failed fetch drops the quote and the build carries on, so a rebuild picks up edited quotes.

Dark mode is the default; the header toggle stores `light` or `dark` in `localStorage`.

## Visitor ledger

The same visitor ledger markszymanski.co runs (AIOS `state/VISITORS.md`): every page view (with utm tags and
the referring site), click, outbound click, form start, and Fathom moment, plus the email from any form the
site accepts, the booking widget's included, so a visitor is tied to a person once they give an email. A
form the server refuses records `Form not accepted` instead and names nobody.

- The browser half is in `src/components/Head.astro` (`mjsTrack`, `mjsEvent`, `mjsIdentify`). It only sends from
  motive11.com itself. Pages fire conversion moments with `window.mjsTrack("Name")`, which reaches Fathom and the
  ledger; the booking widget calls the same function.
- The server half is `functions/api/v.ts` (with `functions/_shared/`). It sets the `m11_vid` cookie (HttpOnly,
  a year) and writes `visitors` and `visitor_events` rows with `site = motive11.com` to the shared AIOS D1
  `aios-state`, so they show up in Mission Control > Sales > Visitors beside markszymanski.co's.
- **Production needs a D1 binding: variable name `DB`, database `aios-state`, on the `motive11-website` Pages
  project's Production environment only.** Without it (previews, `wrangler pages dev`), `/api/v` answers 204
  and writes nothing.
- Kept from markszymanski.co: nobody in Europe is stored or has device details read, machines are labeled
  not dropped, 4 KB bodies, hourly flood caps (its own `visitor_hourly` counter, `YYYY-MM-DDTHHm`), and the
  180-day sweep of anonymous visitors. Not carried over: the server-side page count (`_middleware.ts`,
  `page_hits`), because its daily tables have no site column and Motive11 rows would land in
  markszymanski.co's numbers. Fathom counts this site's totals.
- **`src/pages/privacy.astro` must change in the same commit whenever what the ledger records, how long it
  keeps it, or where it skips changes.**

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

The Fractional and AI Onboarding Day videos live in Szymanski Media's Bunny Stream library 572643,
which only plays on allowed sites. motive11.com is on that list, so a local preview shows the player but
the video refuses to play. To test video locally, add `127.0.0.1` with `addAllowedReferrer` (AIOS
`connectors/bunny_net`, account key) and remove it again with `removeAllowedReferrer` when done.

Before launch and after any header, hero, or layout change, run from AIOS:
`pipelines/web-build/check_widths.py` on the main pages and `pipelines/web-build/check_csp.py dist`,
and after a push `pipelines/web-build/check_live.py https://motive11.com`.

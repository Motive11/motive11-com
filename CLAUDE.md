<!-- AIOS pointer -->
# motive11.com — micro-site

Deliverable repo at `~/projects/motive11/motive11-com/` (own git → GitHub
`Motive11/motive11-com` → Cloudflare Pages). **This is the live motive11.com.** Owning
entity: `motive11`. Project context/spec is in [`CONTEXT.md`](CONTEXT.md) — self-contained,
no separate AIOS context folder.

Convention: AIOS `C:\Users\marks\AIOS\CLAUDE.md` → "Projects".

## Content-Security-Policy: new outside domains go in `_headers`

`_headers` sends a Content-Security-Policy that allowlists every outside domain the site loads.
**Anything new from another domain (a map, reviews widget, booking or chat embed, video host,
font service, form service) needs its origin added there in the same commit, or it is silently
blocked on the live site.** Opening the HTML files directly ignores `_headers`, so it looks fine locally. Test with
`npx wrangler pages dev .` plus AIOS `pipelines/web-build/check_csp.py`. Standard: AIOS
`pipelines/web-build/security-headers.md`.

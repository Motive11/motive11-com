# motive11.com

Single-page cinematic experience for motive11.com. Routes visitors to [markszymanski.co](https://markszymanski.co).

## Stack

- One `index.html` file with inline CSS and inline JS
- Three.js (r128) via CDN for the particle field background
- Satoshi font via Fontshare CDN
- No build step, no framework, no bundler

## Deploy

Cloudflare Pages, static site. No build command. Output directory is the repo root.

`_redirects` handles legacy paths (`/about`, `/contact`, `/case-studies`, `/work-with-me`) pointing at markszymanski.co.

## Local preview

Open `index.html` in a browser, or serve the folder with any static server (e.g. `python -m http.server`).

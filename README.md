# Mainoo Technologies Website

Digital coordination experience for Mainoo Technologies.

## GitHub Pages

Yes — this Next.js app is configured for GitHub Pages via **static export**.

1. `next.config.ts` sets `output: "export"` (builds to `/out`).
2. `.github/workflows/pages.yml` builds and deploys `/out` on push to `main`.
3. After merge, switch the repo Pages settings from **Deploy from a branch** to **GitHub Actions** (one-time).
4. Custom domain (`CNAME` in `/public`) continues to work.

Local product pages remain available as static files:

- `/kontroliq.html`
- `/kontroliq-gh.html`
- `/legacy-home.html` (previous homepage archive)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
# static site is written to ./out
```

## Phase 1 experience

Scroll-driven film (muted by default; audio reserved for later scenes):

1. Digital continent  
2. Systems in isolation  
3. Mainoo connects  

Closing line: **Building the digital coordination architecture for Africa**

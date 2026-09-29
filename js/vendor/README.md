# Vendored libraries

Copied in as-is so the site has no build step and no runtime CDN dependency.
Update by replacing the file with the same path from jsDelivr at a new version.

| File | Version | Source | Licence |
| --- | --- | --- | --- |
| `gsap.min.js` | 3.15.0 | `cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js` | [GSAP standard licence](https://gsap.com/standard-license) — free, including commercial use |
| `ScrollTrigger.min.js` | 3.15.0 | `cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js` | same |

`app.js` checks that both loaded before using them; if one is missing, or the
visitor prefers reduced motion, paged lists swap pages without animating.

# emilia — portfolio

Emilia (Mia) Palmer's portfolio. A static site — plain HTML, CSS and JavaScript,
no framework, no build step. GSAP, vendored, handles the card motion. On desktop, a phone drawn beside every page is the
navigation: its app tiles are the site's pages.

- **Design (visual spec):** [Figma](https://www.figma.com/design/ahL2NEw9Qre9N7wcH8Ng3o) — start at *Handoff — read me first*
- **Decisions and behaviour:** [docs/design.md](docs/design.md)
- **Working rules for contributors:** [CLAUDE.md](CLAUDE.md)

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html          shell: nav, phone
css/styles.css      all styling; design tokens at the top
js/icons.js         Lucide icon paths, keyed by name
js/content.js       all copy, projects and links
js/app.js           routing, rendering, phone behaviour
js/vendor/          GSAP and ScrollTrigger, copied in (no CDN at runtime)
assets/             resume.pdf; photos/ holds the site photos
docs/design.md      design decisions, with the reasoning
```

## Editing

- **Copy, projects, links** — `js/content.js` only. Never hardcode copy in
  `app.js` or `index.html`.
- **Colours** — the custom properties at the top of `css/styles.css`. Names match
  the Figma colour variables one to one.
- **Icons** — copy the inner markup of a [Lucide](https://lucide.dev) icon (ISC)
  into `js/icons.js` under a new key, then reference that key.

## Routes

Hash routing, so every page has a real link and it works on any static host:
`#/home`, `#/about`, `#/projects`, `#/projects/:slug`, `#/experience`,
`#/skills`, `#/contact`.

## Deploying

GitHub Pages, from `main` at the repo root: *Settings → Pages → Build and
deployment → Deploy from a branch → `main` / `(root)`*. The site is served at
https://emipalmer.github.io/emilia-portfolio/. `.nojekyll` tells Pages to serve
the files as they are.

## Status

Being built in small PRs, one concern each — the sequence is in
[docs/design.md §10](docs/design.md#10-pr-sequence).

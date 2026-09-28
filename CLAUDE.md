# CLAUDE.md

## Why this exists

Emilia (Mia) Palmer's portfolio. She is a Penn State CS senior graduating May 2027,
applying for new grad software roles now. The site's job is to get her interviews.
It is designed, in detail, before being built — the Figma file is the spec, this
repo is the implementation.

Figma: https://www.figma.com/design/ahL2NEw9Qre9N7wcH8Ng3o
Start at the page **Handoff — read me first**. Behaviour and decisions are in
`docs/design.md`. When the two disagree, Figma wins on pixels and
`docs/design.md` wins on behaviour.

## What it is

A static site. No framework, no build step. Hash routing so it works on GitHub
Pages. The distinguishing idea: a phone drawn on the right of every desktop page
is the navigation — its app tiles are the site's pages.

```
index.html          shell: nav, phone
css/styles.css      all styling; design tokens at the top
js/icons.js         Lucide icon paths, keyed by name
js/content.js       ALL copy, projects, links — edit here, not in app.js
js/app.js           routing, rendering, phone behaviour
assets/             resume.pdf; photos/ holds the site photos
```

## How to work here

- **Content goes in `js/content.js`.** Never hardcode copy in `app.js` or HTML.
- **Colours go through the CSS custom properties** listed in `docs/design.md`.
  They match the Figma variable names one to one. No raw hex in components.
- **Icons come from `js/icons.js`** (Lucide, ISC). Add a key, reference it by name.
- Run locally with `python3 -m http.server 8000`. No install, no tests yet.
- Small PRs, one concern each. See the sequence in `docs/design.md`.

## Constraints that are easy to get wrong

- **The page never scrolls on desktop.** `body` is `overflow: hidden`. Where
  content exceeds the frame (projects, about) a *viewport element wraps the list
  alone* — not the whole column. The headline must stay put while cards scroll.
- **The phone is drawn at true device size**: 393×852 screen inside a 415×874
  body, 55pt screen radius, 11px rail, scaled 0.72 on a 1440 artboard. Everything
  else derives from `--ph`. Do not eyeball these.
- **One breakpoint, at 900px.** Below it the phone is hidden and the pill nav
  carries every destination. Everything between 390 and 1440 is the same layout
  squeezed — see the clamp rules in `docs/design.md`.
- **Skills has no phone-only route.** It is in the nav because the phone can be
  dismissed and it would otherwise be unreachable.
- **About's scroll changes emphasis, never content.** Every word is in the markup
  at first paint. That is what makes it safe with JS off and under
  `prefers-reduced-motion`.
- **Focus rings are not optional.** 2px solid forest, 3px offset, `:focus-visible`.
  Identical on every interactive element.

## Cut from v1 — do not build

- The app-open panel (tile expands into a full-screen panel on the phone).
  Tapping a tile navigates the page and nothing else. Frames kept in Figma
  prefixed `v2 ·`.
- Panel-follows-nav, and panel-survives-scroll. Both only matter with panels.
- The resume button in the top-right corner. Resume is a chip on the home page.
- The lily background art and the sage backdrop panel. The page is plain mint.

## Still undecided

- What replaces the empty top-right corner (a style/theme switcher was the idea).

## Notes
Be concise and write clean code. Make sure to update documentation accordingly.

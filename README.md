# emilia — portfolio

A static site built from the Canva design. No build step, no dependencies:
open `index.html` and it runs.

## Structure

```
index.html          page shell — nav, backdrop, phone frame
css/styles.css      all styling; design tokens are at the top
js/icons.js         Lucide icon paths, keyed by name
js/content.js       ← all your copy, projects, and links live here
js/app.js           routing, rendering, phone carousel
assets/             lily.png, me.jpg (extracted from the Canva file)
```

Tile icons come from [Lucide](https://lucide.dev) (ISC licensed). To change
one, copy the inner markup of an icon from that site into `js/icons.js` under
a new key, then point a tile's `icon` at that key in `content.js`.

## Editing content

Open `js/content.js`. Nothing else needs touching for normal updates.

- **Text on a page** — edit the matching entry under `pages`.
- **Add a project** — copy a block inside the `projects` `cards` array.
- **Change the phone tiles** — edit `screens`. A tile with `route` moves
  around the site; a tile with `href` opens a link. Add a whole new object to
  `screens` to add another swipeable home screen; the chevrons and dots
  update themselves.
- **Page label** — `stamp` is what shows inside `print("…")` bottom-left.

Search the file for `TODO` to find every placeholder:

- the end of the Vevey sentence in `about`
- your second interest
- both projects
- your skills lists
- email, GitHub, and LinkedIn URLs (they appear in both `contact` and the
  second phone screen)
- drop your resume at `assets/resume.pdf`, or change the button in
  `index.html`

## How navigation works

URLs are hashes — `#/about`, `#/projects`. That keeps it a static site while
still giving every page a real, shareable link, and it means the back button
works. Changing pages swaps the left column in place; the document itself
never scrolls on desktop, matching how the design is laid out.

The phone is the primary navigator on desktop. Below 900px it's hidden and
the pill nav takes over, which is why `skills` has a nav link that only
appears at that size.

## Putting the phone away

The `>>` control at the top of the phone slides it off the right edge,
leaving a sliver of the device visible and widening the content column.
Bring it back by clicking the `< phone` handle, clicking the sliver itself,
or pressing Escape to send it away again.

State lives in the `phone-away` class on `<body>` and a single `phoneAway`
flag in `app.js`. It's deliberately not persisted: the site never reloads
(hash routing), so the choice survives navigation but resets on a fresh
visit, which is the right default for a first-time visitor.

Tiles on a hidden phone are pulled out of the tab order, and focus moves
between the two controls as you toggle, so it works from the keyboard.

## Running locally

Double-clicking `index.html` works. To use a local server instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Any static host works. For GitHub Pages:

1. Push these files to a repo.
2. Settings → Pages → Source: `main`, folder `/ (root)`.
3. For a `username.github.io` repo, the site is live at that address.

Netlify and Vercel work by dragging the folder onto their dashboard.

## Accessibility notes

Built in deliberately, so keep them if you refactor:

- keyboard focus is visible on every control, and moves to the new page on
  navigation
- off-screen phone tiles are removed from the tab order
- the phone screen images have real alt text
- `prefers-reduced-motion` disables the slide and fade animations
- there's a skip link before the nav

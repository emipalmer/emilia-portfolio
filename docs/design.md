# Design record

Everything decided during design, with the reasoning. The Figma file is the visual
spec; this is the part that does not survive as pixels.

Figma: https://www.figma.com/design/ahL2NEw9Qre9N7wcH8Ng3o

| Figma page | What it holds |
| --- | --- |
| Handoff — read me first | Condensed spec |
| Desktop — 1440 | The eight desktop pages |
| Mobile — 390 | The eight mobile pages |
| Components | Nav pill, chip, link pill, button, project card, phone panel, contact card |
| Phone — true size | The iPhone component, three screens |
| States | Hover, focus, disabled, form states, 404 |
| Projects — detail | The list and six detail pages |
| Contact — message | The message thread, three states |
| Scroll reveal | The about-page scroll, chosen and archived versions |

Frames prefixed `old ·` are superseded and kept deliberately. `v2 ·` means deferred,
not rejected. `✓` marks the chosen version where alternatives exist.

---

## 1. Tokens

CSS custom property names match the Figma variable names exactly.

| Name | Hex | Used for |
| --- | --- | --- |
| `--mint` | `#F4FFF0` | page background |
| `--forest` | `#163808` | body and headline text |
| `--forest-soft` | `#2C5220` | secondary text |
| `--sage` | `#B7BFB4` | backdrop panel, hairlines |
| `--rule` | `#718967` | outlines, nav pill border |
| `--green` / `--green-deep` | `#61A279` / `#2F6B44` | filled button gradient |
| `--screen` | `#E5EEE2` | phone screen |
| `--tile-a` / `--tile-b` | `#8AAB7F` / `#B5D5C5` | app tile gradient |
| `--dock` | `#B9CFB6` | phone dock |
| `--bezel` | `#5A5675` | phone rail |
| `--pink` / `--peach` | `#CF8D87` / `#FECFBD` | links-screen banner only |
| `--error` | `#A14A44` | form errors — the pink darkened until it warns |

**Type** is Figtree throughout (Google Fonts, has a true italic — the italic is
load-bearing in every headline).

Headline 84 on home and on about's arrival state; 46 elsewhere; 40 once about has
scrolled. Body 17, small 15, phone tile labels 9. **Nothing shrinks below 16px
during the about scroll.** Text leaves by fading, not by shrinking past legibility.

---

## 2. The phone

True device size: **393×852 screen** inside a **415×874 body**, 55pt screen radius,
11px rail. On the 1440 artboard it is scaled by **0.72**. Every internal dimension
derives from `--ph` (its height) so the whole thing scales as one object.

This matters beyond fidelity: ESDRS is designed at 393×852, so its screens drop
into the phone at 1:1 with no scaling.

**Three home screens**, paged by chevrons: navigation, projects, links.

A tile always means "launch something"; screens group them. The grid must not
change meaning depending on which page you are on — people learn it once on home.

**Dynamic Island, side buttons, brushed rail.** The home indicator line is part of
the chrome; when a full-screen screenshot covers the screen, redraw the indicator
on top of it.

---

## 3. Routes

```
#/home  #/about  #/projects  #/projects/:slug  #/experience  #/skills  #/contact
```

Slugs: `esdrs`, `dementia-mr`, `revibe`, `gemini-add-on`, `worklog`, `this-site`.

Detail **replaces** the list rather than expanding in place. Expanding pushed the
last project below the fold on a page that does not scroll, and each project gets
a real linkable URL this way.

**ESDRS and ReVibe show their designs in the phone.** On those two detail pages
the phone screen is replaced by that project's images at 1:1 — static images,
not a working prototype. While they are showing, the chevrons page through the
project's images instead of the home screens, and the home indicator bar at the
bottom (redrawn on top of the image) returns the phone to its home screens. The
page column stays on the detail either way; `← projects` is the page's exit. The
other four detail pages leave the phone alone.

An unknown hash gets a 404 page (`hmm, nothing here.` plus two ways back), not a
silent fallback to home. A silent fallback reads as the link being broken.

---

## 4. Behaviour

**Phone entrance.** Slides in from the right edge tilted 7°, straightening as it
lands. 400ms, ease-out. The same path in reverse when put away.

**Phone away.** Slides right leaving ~18px of the device; the content column
widens. A `‹ phone` handle at the viewport edge brings it back, and clicking the
sliver works too. Escape sends it away.

**Nav away.** Slides up past the top edge leaving a bare chevron. Desktop only —
on mobile the nav is the only navigation and must not be dismissible.

All four chevrons (two on the phone, two on the nav toggle) come from one SVG:
22px, 1.6 stroke, forest-soft.

**Photo card rotation.** The phone's photo card cycles rather than holding one
portrait — a fixed face in the corner of every page is a lot. Advances on page
change, and on a ~6s timer otherwise, 400ms crossfade. Headshot first so the
landing page is still her. Under `prefers-reduced-motion`: timer off, no
crossfade, changes only on page change.

**About scroll.** Three steps, matching the `✓ about / 1–3` frames on Scroll
reveal. Text starts oversized and scales down while a photo collage builds over
the page; by the last step the collage owns the page and the text has faded out
completely.

| Step | Headline | Body | Text opacity | Collage |
| --- | --- | --- | --- | --- |
| 1 — arrival | 84 | 24 | 100% | none |
| 2 — collage arrives | 58 | 19 | 40% | first photos, below the text |
| 3 — collage owns it | 40 | 16 | 0% | full, overlapping the text column |

Nothing changes position — only size, opacity, and what sits on top. Every word
is in the markup from first paint and stays there at 0%, so screen readers,
JS-off and `prefers-reduced-motion` visitors get the whole page. Scrolling back
up brings the text straight back.

**Projects scroll.** Six projects do not fit a fixed-height page. A clipping
viewport wraps **the card list alone**: 660×600 at x90/y150 on desktop, 346×610 on
mobile. Headline, nav, phone, chevrons, hint and stamp all sit outside it.
Affordances: 3px track at 8% forest, thumb at 28% sized to the visible fraction,
and a 70px fade to the page colour at the bottom edge. A real scrollbar is
acceptable if styling one becomes a fight — an invisible scroll region is worse.

---

## 5. Contact

The phone holds the **message thread**; the page holds the details as large
readable rows. The phone is the thing you act on, the page is what you read.

Consequence: the phone cannot be dismissed on this page, because it holds the only
way to send a message. That is the single exception to the away behaviour.

Three states: empty, typing, sent. Plus invalid email (validated **on blur**, not
on keystroke), sending, and failed — "that didn't send — try again, or email me
directly". A chat UI that swallows a message silently is worse than a plain form
that admits it.

**The email field above the compose bar is required.** A thread carries no sender;
without it a message arrives with no way to answer.

Underneath the styling it must be a real form: labelled `<textarea>`, labelled
`<input type="email">`, real submit button, honeypot. It needs a form endpoint
(Formspree if hosting on GitHub Pages) — a static site cannot send mail.

**Email obfuscation.** `mia.annp@gmail.com` gets scraped if it sits in the markup.
Assemble it in JS and set `href` on load or click. Keep a real focusable link so
keyboard and screen reader behaviour is unaffected. Cost: with JS off the address
is absent. Accepted — the form is the primary route and the GitHub and LinkedIn
links stay in the markup.

On mobile the thread becomes the page itself. No drawn phone — the visitor is
already holding one.

---

## 6. Mobile (below 900px)

The phone navigator is hidden, with two consequences.

The pill carries **every** destination, because there is no phone tile to reach
them by. Six labels do not fit at 390px, so the nav is **icons**, with the active
item expanding to show its label. Icons are the same set as the phone tiles, so
the meanings carry over from desktop. Every icon needs an `aria-label` — a screen
reader gets nothing from an SVG path, and the labels are the only naming.

The nav has **no collapse toggle**. It is the only navigation; if it could be
dismissed someone could strand themselves.

About's text does not shrink on mobile — the shrink exists to clear room for the
collage, and at 390px there is no room to reclaim. The collage stacks into one
column beneath.

Tap targets are 44px minimum.

---

## 7. Widths between 390 and 1440

One breakpoint only, at 900. Everything else is the same layout squeezed.

- content column: `clamp(420px, 42vw, 640px)`
- gutters: `clamp(24px, 5vw, 90px)`
- projects viewport: height from available space, not a fixed 600
- phone: already fluid, sized from `vh`

Above 1440 nothing grows; the column stops at 640 so lines stay readable and the
extra width becomes margin.

**Check 1000–1100 first.** That is where the column is narrowest while the phone
is still full height. If something has to give there, shrink the phone before the
column — the text is the content.

---

## 8. Interaction states

Focus ring, identical everywhere: **2px solid forest, 3px offset, 6px radius,
`:focus-visible` only** so it shows for keyboard users and not on mouse clicks.
Never remove an outline without replacing it.

Hover is a lift or a tint, never a colour change that could be mistaken for a
different state. Active is a 2% scale down. Disabled is 40% opacity with pointer
events off.

Per component: nav item tints at 30% on hover, 60% when current. Skill chips are
**not** interactive and get no hover; action chips (resume, github) deepen. Link
pills keep their outline on hover so the shape never shifts. Phone tiles lift 2px
with a shadow; the current page keeps its forest ring — that is *state*, not
focus, and the two need to stay distinguishable. The whole project card is the
link, not just the title.

---

## 9. Content

Six projects: esdrs, Dementia Care MR Simulation, ReVibe, Gemini AI Document
Add-On, WorkLog, This site. **esdrs is always lowercase** in copy. Roles are
fixed: esdrs is "design & product lead", Dementia Care MR is "software developer".

**Order: worklog, esdrs, dementia mr, gemini add-on, this site, revibe** —
featured projects first, design-only last. The card list and the phone's
projects screen use the same order, so the two never disagree.

Contact has no intro line; the `say hi.` headline is enough. The this-site detail
body is intentionally just "Designed in Figma!".

**ReVibe is design only** and says so on its detail page. Being explicit beats an
interviewer assuming otherwise and finding out. Its tags are UI/UX and Figma only —
a framework tag would imply it was built.

Experience holds five roles in two groups, work then leadership. Numbers matter —
80% policy review reduction, 500+ students, 6+ city groups.

Contact: `mia.annp@gmail.com`, `github.com/emipalmer`,
`linkedin.com/in/emiliaapalmer`.

Still missing: one ESDRS screen for the desktop demo and one for mobile detail, a
WorkLog screenshot, 15 mobile collage photos, `assets/resume.pdf`, a favicon and a
share-preview image.

---

## 10. PR sequence

1. **Baseline** — commit the existing files as-is, enable Pages, confirm it loads.
   Prove hosting works before adding complexity.
2. **Tokens and nav** — six nav items, skills variant, collapse toggle.
3. **Content** — real copy into `content.js`. No layout changes.
4. **Experience page and `#/projects/:slug`** — first new routing.
5. **Scroll regions** — projects viewport and about scroll. Careful: current code
   puts overflow on the whole column.
6. **Form** — markup, validation, states, Formspree.
7. **Mobile** — the 900px breakpoint and below.
8. **Polish** — focus rings, 404, reduced motion, email obfuscation, share image.

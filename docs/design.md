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
| `--sage` | `#B7BFB4` | hairlines |
| `--rule` | `#718967` | outlines, nav pill border |
| `--green` / `--green-deep` | `#61A279` / `#2F6B44` | filled button gradient |
| `--screen` | `#E5EEE2` | phone screen |
| `--tile-a` / `--tile-b` | `#8AAB7F` / `#B5D5C5` | app tile gradient |
| `--dock` | `#B9CFB6` | phone dock |
| `--bezel` | `#5A5675` | phone rail |
| `--pink` / `--peach` | `#CF8D87` / `#FECFBD` | links-screen banner only |
| `--error` | `#A14A44` | form errors — the pink darkened until it warns |

**Device chrome** — `--white`, `--island`, `--rail-1…4` — are code-only tokens for
colours drawn once inside the Figma iPhone component (tile icons, dynamic island,
brushed rail). They are not Figma variables, but they still live in `:root`, so
no component carries raw hex.

**Type tokens:** `--fs-hero` 84, `--fs-title` 46, `--fs-lead` 24, `--fs-medium` 19,
`--fs-body` 17, `--fs-small` 15. The two headline sizes clamp down toward 390;
the rest are fixed.

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

**One scale for the whole device.** Every phone dimension in CSS is a Figma
device pixel times `--dev`, so the phone shrinks as one object: photo, tiles,
labels, dock, island and side buttons keep their proportions at every size.
`--dev` is the smallest of 0.72px, 0.05vw (0.72 at 1440 wide) and what the
window's height allows, so narrowing *or* shortening the window shrinks it.
The chevrons, dots, hint and the column reserved for the phone use `--art`
(one artboard pixel at the same scale). The phone's top is Figma's y112, 35px
under the nav, and it centres when the window is taller.

The "use this to navigate :)" hint sits under the dots. *Added in code*: a hand
drawn arrow after the text that curves up into the bottom of the phone. It must
point at the device; an earlier version trailed off down and away from it.

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
#/home  #/about  #/projects  #/projects/:slug  #/experience  #/contact
```

Skills was folded into experience; `#/skills` redirects there so old links
keep working.

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

**Detail pages** follow the Projects — detail frames: `← projects`, title, meta
(with the award for esdrs), image, write-up, tags. The page never scrolls, so
the image gives up height first; if it would drop below 120px it steps aside
until the window has room. Below 900px the page scrolls, the image runs full
width, and ESDRS and ReVibe's phone screens sit in the column as a strip.
The whole project card links to its detail page; "read more →" shares the tag
row.

**Skills** live at the end of the experience list — its own page was thin (12
chips, most already project tags), and recruiters read experience and skills
together. They render as Figma's Chip: 16px, 9 × 18 padding, tile-b at 45% with
a sage hairline; labels, not controls — no hover. The nav drops to five items.

**Experience** is one list, work then leadership, each group's label on its
first role. It pages like the projects list when a screen can't fit all five
(4 + 1 on a laptop) and shows everything, with no dots, when it can.

---

## 4. Behaviour

**Phone entrance.** Slides in from the right edge tilted 7°, straightening as it
lands. 400ms, ease-out. Putting it away and bringing it back tilt on the way
and land straight — the Figma away frame has the sliver at 0°. Web Animations
in `app.js` (`phoneEntrance`, `phoneTilt`); none under reduced motion.

**Phone away.** Slides right leaving ~18px of the device. The content column
keeps its width and position, so nothing on the page moves or rewraps
(widening it reflowed the text through the slide and read as a shake). A `‹ phone` handle at the viewport edge brings it back, and clicking the
sliver works too. Escape sends it away.

**Nav away.** Slides up past the top edge leaving a bare chevron. Desktop only —
on mobile the nav is the only navigation and must not be dismissible.

All four chevrons (two on the phone, two on the nav toggle) come from one SVG:
22px, 1.6 stroke, forest-soft.

**Photo card rotation.** The phone's photo card cycles rather than holding one
portrait — a fixed face in the corner of every page is a lot. Advances on page
change, and on a ~6s timer otherwise, 400ms crossfade. Headshot first so the
landing page is still her. Under `prefers-reduced-motion`: timer off, no
crossfade, changes only on page change. The timer also stops while the phone is
put away or the tab is in the background, and restarts after each page change
so two changes never land close together. Only the photo on show is announced
to screen readers.

**About scroll.** Three steps, matching the `✓ about / 1–3` frames on Scroll
reveal. It steps like the projects list — dots in the left margin, one wheel or
trackpad gesture per step, arrow and page keys — and GSAP tweens between the
steps, each photo settling from a slight tilt. Like home, the copy is centred
vertically on arrival and holds that top while it shrinks; the collage is
centred on its own (y176–712 at 1440×860, against the frame's y187–723). Text starts oversized and scales down while a photo collage builds over
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

**Projects paging.** The list never scrolls; it shows a page of cards at a
time, one column, as wide as the column allows (max 900px). A page holds as many
three cards, at every screen size from a laptop up — recalculated on resize,
keeping the first visible card on screen. The list is sized to its tallest
page, so the page stays compact and centres vertically like home. Cards keep Figma's stacked layout
(name, meta, blurb, tags, read more) at Figma's type sizes with tightened gaps,
which fits three from about 830px of viewport height. Shorter windows get even
pages of two rather than a card cut off. Headline, nav, phone and stamp
never move.

Moving between pages: dots in the left margin (like the about page's), one wheel
or trackpad gesture per page (a flick's trailing events don't skip ahead),
Arrow/Page Up and Down, Home/End, or a vertical swipe. The current cards drift
out (28px, 0.28s) and the next page's drift in from the same side (0.5s,
staggered), via GSAP. Under `prefers-reduced-motion`, or if GSAP fails to load,
pages swap instantly.

Below 900px the document scrolls and every card shows; cards drift up into
place as they scroll into view (ScrollTrigger).

Step dots are forest at 15%, 50% for the current step (from the about frames),
24px hit areas.

*Changed from the Figma frame*, which drew a 660px scroll viewport with a
hairline track and fade. Tried and rejected: it read as a plain scrollbar.

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
them by. Five labels do not fit at 390px, so the nav is **icons** (17px, in a
44px pill at y16), with the active item expanding to show its label. Icons are
the same set as the phone tiles, so the meanings carry over from desktop. The
labels stay in the markup, visually hidden on inactive items, so every link has
a real name for screen readers.

The nav has **no collapse toggle**. It is the only navigation; if it could be
dismissed someone could strand themselves.

About's text does not shrink on mobile — the shrink exists to clear room for the
collage, and at 390px there is no room to reclaim. The collage is a two-column
grid beneath.

Mobile carries less text: project cards show their one-line `short` blurb and a
`shortName` where one exists, with no tags; roles show "org · dates" and their
`short` line. Both versions are in the markup, and CSS hides one (so it isn't
read). Home is centred vertically, as in the frame.

Tap targets are 44px minimum; the nav's icons get theirs from an invisible hit
area, so what's drawn stays at the frame's 35×31.

---

## 7. Widths between 390 and 1440

One breakpoint only, at 900. Everything else is the same layout squeezed.

- content column: `clamp(420px, 42vw, 640px)`
- gutters: `clamp(24px, 6.25vw, 90px)`
- projects viewport: height from available space, not a fixed 600
- phone: one scale from both width and height (`--dev`, see §2)

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

Photos live in `assets/photos/`, exported from the Figma originals at 1200px on
the long edge. Still missing: esdrs and ReVibe screens for the phone demos, a
WorkLog screenshot, a favicon and a share-preview image.

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

/* ============================================================================
   app.js — routing, rendering, and the phone navigator.

   Design notes
   - Hash routing (#/about) keeps this a static site: it works on GitHub Pages
     or any host with no server config, and every page is linkable.
   - Nothing scrolls the document on desktop. Changing route swaps content in
     place; long lists show a page at a time instead of scrolling.
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_ROUTE = 'home';

  /* --- DOM references (queried once) ------------------------------------ */
  const els = {
    page:    document.getElementById('page'),
    stamp:   document.getElementById('stamp'),
    screens: document.getElementById('screens'),
    screenBox: document.querySelector('.phone__screen'),
    dots:    document.getElementById('dots'),
    marker:  document.querySelector('.pill__marker'),
    navLinks: Array.from(document.querySelectorAll('.pill__link')),
    prev:    document.querySelector('.chev--prev'),
    next:    document.querySelector('.chev--next'),
    area:    document.getElementById('phoneArea'),
    hide:    document.getElementById('phoneHide'),
    tab:     document.getElementById('phoneTab'),
    nav:     document.getElementById('primaryNav'),
    navToggle: document.getElementById('navToggle')
  };

  let screenIndex = 0;   // which phone home screen is showing
  let currentRoute = ''; // the active page key (nav highlight)
  let currentPath = '';  // the full hash path, e.g. projects/esdrs
  let phoneAway = false; // whether the phone is slid off to the side
  let navAway = false;   // whether the nav is slid up past the top edge

  // The nav can only be put away on desktop; below this it is the only navigation.
  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Motion needs the vendored GSAP; without it (or with reduced motion) the
  // stepped views still work, they just change without animating.
  const hasMotion = Boolean(window.gsap && window.ScrollTrigger);
  if (hasMotion) gsap.registerPlugin(ScrollTrigger);

  let steps = null;      // the live stepped view's handles, torn down on route change

  /* --- Small helpers ----------------------------------------------------- */

  /** Create an element with optional class, text, and attributes. */
  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    for (const [k, v] of Object.entries(opts.attrs || {})) node.setAttribute(k, v);
    return node;
  }

  /** Read the route key out of the URL hash, falling back to home. */
  /**
   * Read the hash: a page (#/about), a project's detail (#/projects/esdrs),
   * or neither — which gets the 404 page rather than a silent fallback.
   */
  function routeFromHash() {
    let path = (location.hash || '').replace(/^#\/?/, '').trim() || DEFAULT_ROUTE;
    // Skills folded into experience; old links land there.
    if (path === 'skills') {
      history.replaceState(null, '', '#/experience');
      path = 'experience';
    }
    const [key, slug] = path.split('/');
    if (key === 'projects' && slug) {
      const project = CONTENT.projects.find(p => p.slug === slug);
      return project ? { path, key, project } : { path, key: null };
    }
    const known = Object.prototype.hasOwnProperty.call(CONTENT.pages, key) && !slug;
    return { path, key: known ? key : null };
  }

  /** Websites and the resume PDF open in a new tab; mailto: stays in place. */
  function linkAttrs(href) {
    return /^https?:|\.pdf$/i.test(href)
      ? { href, target: '_blank', rel: 'noopener' }
      : { href };
  }

  /* --- Page rendering ---------------------------------------------------- */

  /** Build the big headline, with the name in italic as in the mockup. */
  function renderHeadline(title) {
    const h1 = el('h1', { className: 'headline' });
    h1.append(document.createTextNode(title.lead || ''));
    if (title.em) h1.append(el('em', { text: title.em }));
    if (title.tail) h1.append(document.createTextNode(title.tail));
    if (title.aside) h1.append(el('span', { className: 'aside', text: title.aside }));
    return h1;
  }

  /** Render one content block. Returns a node, or null for unknown types. */
  function renderBlock(block) {
    switch (block.type) {

      case 'text':
        return el('p', { text: block.text });

      case 'list': {
        const frag = document.createDocumentFragment();
        if (block.label) frag.append(el('p', { className: 'bullets__label', text: block.label }));
        const ul = el('ul', { className: 'bullets' });
        block.items.forEach(item => ul.append(el('li', { text: item })));
        frag.append(ul);
        return frag;
      }

      case 'cards': {
        const ul = el('ul', { className: 'cards' });
        CONTENT[block.source].forEach(item => {
          const li = el('li', { className: 'card' });

          // The whole card is the link: the title's link stretches over it.
          const name = el('h2', { className: 'card__name' });
          name.append(el('a', { className: 'card__link', text: item.name, attrs: { href: `#/projects/${item.slug}` } }));
          const tags = el('ul', { className: 'card__tech' });
          item.tags.forEach(t => tags.append(el('li', { text: t })));
          li.append(name,
            el('p', { className: 'card__meta', text: item.meta.join('  \u00b7  ') }),
            el('p', { className: 'card__blurb', text: item.blurb }),
            tags,
            el('span', { className: 'card__more', text: 'read more \u2192', attrs: { 'aria-hidden': 'true' } }));
          ul.append(li);
        });
        return pagedList(ul, 'projects', 3);
      }

      case 'chips': {
        const frag = document.createDocumentFragment();
        frag.append(el('p', { className: 'chips__label', text: block.label }));
        const ul = el('ul', { className: 'chips' });
        block.items.forEach(item => ul.append(el('li', { className: 'chip', text: item })));
        frag.append(ul);
        return frag;
      }

      case 'collage':
        return collage(CONTENT.photos.collage);

      case 'roles': {
        // One flat list, each group's label riding on its first role, so it
        // pages like the project cards when a screen is too short for all five.
        const ul = el('ul', { className: 'roles' });
        CONTENT.experience.forEach(group => {
          group.roles.forEach((role, i) => {
            const li = el('li', { className: 'role' });
            if (i === 0) li.append(el('h2', { className: 'roles__label', text: group.group }));
            const head = el('div', { className: 'role__head' });
            head.append(el('h3', { className: 'role__title', text: role.title }), el('p', { className: 'role__dates', text: role.dates }));
            li.append(head,
              el('p', { className: 'role__org', text: [role.org, role.team].filter(Boolean).join(' \u00b7 ') }),
              el('p', { className: 'role__line', text: role.line }));
            ul.append(li);
          });
        });
        // Skills close the list as one more item, so they page with the roles.
        const skills = el('li', { className: 'role role--skills' });
        skills.append(el('h2', { className: 'roles__label', text: 'skills' }));
        CONTENT.skills.forEach(group => {
          skills.append(renderBlock({ type: 'chips', label: `${group.label}:`, items: group.items }));
        });
        ul.append(skills);
        return pagedList(ul, 'experience');
      }

      case 'links': {
        const ul = el('ul', { className: 'linklist' });
        block.items.forEach(link => {
          const li = el('li');
          li.append(el('a', { text: link.label, attrs: linkAttrs(link.href) }));
          ul.append(li);
        });
        return ul;
      }

      default:
        console.warn('Unknown content block type:', block.type);
        return null;
    }
  }

  /** Swap the written column to a new route. */
  function renderPage(route) {
    teardownSteps();
    if (unfitImage) { unfitImage(); unfitImage = null; }
    els.page.textContent = '';
    els.page.dataset.route = route.project ? 'detail' : route.key || 'missing';

    let stamp, title;
    if (route.project) {
      renderDetail(route.project);
      stamp = 'projects';
      title = route.project.name;
    } else {
      const page = route.key ? CONTENT.pages[route.key] : CONTENT.notFound;
      els.page.append(renderHeadline(page.title));
      const prose = el('div', { className: 'prose' });
      page.body.forEach(block => {
        const node = renderBlock(block);
        if (node) prose.append(node);
      });
      els.page.append(prose);
      stamp = title = page.stamp;
    }

    els.page.classList.toggle('page--paged', Boolean(els.page.querySelector('.pager')));
    els.page.classList.toggle('page--collage', Boolean(els.page.querySelector('.collage')));
    els.page.classList.toggle('page--detail', Boolean(route.project));
    setupSteps();

    els.stamp.textContent = `print(\u201C${stamp}\u201D)`;
    document.title = `${title} — emilia`;

    // Restart the entrance animation on every change.
    els.page.classList.remove('is-entering');
    void els.page.offsetWidth; // force reflow so the animation replays
    els.page.classList.add('is-entering');
  }

  /** A project's own page: back link, title, meta, image, write-up, tags. */
  function renderDetail(project) {
    els.page.append(el('a', { className: 'detail__back', text: '\u2190 projects', attrs: { href: '#/projects' } }));
    els.page.append(el('h1', { className: 'headline', text: project.name }));

    const prose = el('div', { className: 'prose' });
    prose.append(el('p', { className: 'detail__meta', text: [...project.meta, project.award].filter(Boolean).join('  \u00b7  ') }));
    if (project.image) {
      const img = el('img', { className: 'detail__image', attrs: { src: project.image.src, alt: project.image.alt } });
      prose.append(img);
      fitDetailImage(img);
    }
    // With no phone below the breakpoint, the demo screens sit in the column.
    if (project.screens) {
      const strip = el('div', { className: 'detail__screens' });
      project.screens.forEach(shot => strip.append(el('img', { attrs: { src: shot.src, alt: shot.alt, loading: 'lazy' } })));
      prose.append(strip);
    }
    project.body.forEach(text => prose.append(el('p', { text })));
    const tags = el('ul', { className: 'card__tech detail__tags' });
    project.tags.forEach(t => tags.append(el('li', { text: t })));
    prose.append(tags);
    els.page.append(prose);
  }

  /**
   * On desktop the image shrinks so the write-up always fits; below 120px it
   * would be a sliver, so it steps aside until the window has room again.
   */
  let unfitImage = null;
  function fitDetailImage(img) {
    const fit = () => {
      img.hidden = false;
      if (desktop.matches && img.complete && img.clientHeight < 120) img.hidden = true;
    };
    const resize = new ResizeObserver(fit);
    resize.observe(els.page);
    img.addEventListener('load', fit);
    unfitImage = () => resize.disconnect();
  }

  /* --- Stepped views -----------------------------------------------------
     The desktop page never scrolls. Content longer than the frame moves in
     steps instead: dots in the left margin, one wheel or trackpad gesture per
     step, arrow and page keys, or a swipe. Two views use it — the projects
     list pages through its cards, and about builds its collage.
  ------------------------------------------------------------------------ */

  /** Route wheel, key and swipe input on the page to step changes. */
  function bindStepInput(step, jump, count) {
    // One step per gesture: trackpads keep firing wheel events after a flick,
    // so a gesture only counts again once the wheel has been quiet a moment.
    let spent = false;
    let quiet = null;
    function onWheel(e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(() => { spent = false; }, 220);
      if (spent || Math.abs(e.deltaY) < 8) return;
      spent = true;
      step(Math.sign(e.deltaY));
    }

    function onKey(e) {
      const dir = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (dir) step(dir);
      else if (e.key === 'Home') jump(0);
      else if (e.key === 'End') jump(count() - 1);
      else return;
      e.preventDefault();
    }

    let touchY = null;
    const onTouchStart = e => { touchY = e.touches[0].clientY; };
    const onTouchEnd = e => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) step(Math.sign(dy));
      touchY = null;
    };

    els.page.addEventListener('wheel', onWheel, { passive: false });
    els.page.addEventListener('keydown', onKey);
    els.page.addEventListener('touchstart', onTouchStart, { passive: true });
    els.page.addEventListener('touchend', onTouchEnd);
    return () => {
      clearTimeout(quiet);
      els.page.removeEventListener('wheel', onWheel);
      els.page.removeEventListener('keydown', onKey);
      els.page.removeEventListener('touchstart', onTouchStart);
      els.page.removeEventListener('touchend', onTouchEnd);
    };
  }

  function stepDots(label) {
    return el('div', { className: 'step-dots', attrs: { role: 'group', 'aria-label': label } });
  }

  function renderDots(rail, labels, jump) {
    rail.textContent = '';
    rail.hidden = labels.length < 2;
    labels.forEach((label, i) => {
      const dot = el('button', { className: 'step-dot', attrs: { type: 'button', 'aria-label': label } });
      dot.addEventListener('click', () => jump(i));
      rail.append(dot);
    });
  }

  function markDot(rail, i) {
    Array.from(rail.children).forEach((dot, k) => {
      if (k === i) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function setupSteps() {
    const pager = els.page.querySelector('.pager');
    const collage = els.page.querySelector('.collage');
    if (!pager && !collage) return;
    const animate = hasMotion && !reducedMotion.matches;
    steps = { cleanups: [] };
    if (pager) setupPager(pager, animate, steps.cleanups);
    if (collage) setupCollage(collage, animate, steps.cleanups);
  }

  function teardownSteps() {
    if (!steps) return;
    steps.cleanups.forEach(fn => fn());
    steps = null;
  }

  /* Projects: a page of cards at a time. */

  /** `perPage` caps a page; fewer show when the screen is too short for the cap. */
  function pagedList(list, label, perPage = Infinity) {
    const pager = el('div', { className: 'pager', attrs: { role: 'region', 'aria-label': label, 'data-per-page': perPage } });
    const viewport = el('div', { className: 'pager__viewport', attrs: { tabindex: '0' } });
    viewport.append(list);
    pager.append(viewport, stepDots(`${label} pages`));
    return pager;
  }

  function setupPager(pager, animate, cleanups) {
    const viewport = pager.querySelector('.pager__viewport');
    const rail = pager.querySelector('.step-dots');
    const cards = Array.from(viewport.firstElementChild.children);  // cards or roles
    const label = pager.getAttribute('aria-label');
    const perPage = Number(pager.dataset.perPage);

    // Below the breakpoint the document scrolls and every card shows.
    if (!desktop.matches) {
      viewport.tabIndex = -1;
      if (animate) cleanups.push(revealOnScroll(cards));
      return;
    }

    let pages = [];
    let current = 0;
    let busy = false;

    /** Pack cards, in order, into pages that fit the viewport's height. */
    function paginate() {
      if (busy) return;
      const first = pages.length ? pages[current][0] : 0;
      cards.forEach(card => { card.hidden = false; });
      const style = getComputedStyle(viewport);
      const room = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const gap = parseFloat(getComputedStyle(cards[0].parentElement).rowGap) || 0;

      const heights = cards.map(card => card.offsetHeight);
      const fits = pg => pg.reduce((sum, k) => sum + heights[k], 0) + gap * (pg.length - 1) <= room;
      const chunk = size => Array.from({ length: Math.ceil(cards.length / size) },
        (_, n) => cards.slice(n * size, n * size + size).map((c, k) => n * size + k));

      if (Number.isFinite(perPage)) {
        // Even pages: the most per page, up to the cap, that every page can fit.
        let size = perPage;
        while (size > 1 && !chunk(size).every(fits)) size--;
        pages = chunk(size);
      } else {
        // As many as fit, page by page.
        pages = [];
        let page = [];
        cards.forEach((card, i) => {
          if (page.length && !fits([...page, i])) { pages.push(page); page = []; }
          page.push(i);
        });
        pages.push(page);
      }

      // Keep the card that was first on screen on screen.
      current = pages.findIndex(pg => pg.includes(first));
      renderDots(rail, pages.map(pg => `Show ${label} ${pg[0] + 1}–${pg[pg.length - 1] + 1}`), go);
      show(current);
    }

    function show(i) {
      cards.forEach((card, k) => { card.hidden = !pages[i].includes(k); });
      markDot(rail, i);
    }

    /** Current cards drift out, the next page's drift in from the same side. */
    function go(to) {
      if (busy || to < 0 || to >= pages.length || to === current) return;
      const dir = to > current ? 1 : -1;
      const leaving = pages[current].map(k => cards[k]);
      const arriving = pages[to].map(k => cards[k]);
      current = to;
      if (!animate) { show(current); return; }

      busy = true;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(leaving, { y: -28 * dir, opacity: 0, duration: 0.28, ease: 'power2.in', stagger: 0.04 })
        .add(() => show(current))
        .fromTo(arriving, { y: 28 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.07 });
    }

    const resize = new ResizeObserver(paginate);
    resize.observe(viewport);
    paginate();
    if (animate) {
      gsap.fromTo(pages[current].map(k => cards[k]), { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.1 });
    }

    cleanups.push(bindStepInput(d => go(current + d), go, () => pages.length));
    cleanups.push(() => {
      resize.disconnect();
      cards.forEach(card => { card.hidden = false; });
      if (hasMotion) { gsap.killTweensOf(cards); gsap.set(cards, { clearProps: 'opacity,transform' }); }
    });
  }

  /* About: the copy shrinks and fades while the collage builds over it. */

  // Figma "✓ about / 1–3": headline, body and aside sizes and text opacity.
  const ABOUT_STEPS = [
    { headline: 84, body: 24, aside: 19, text: 1 },
    { headline: 58, body: 19, aside: 15, text: 0.4 },
    { headline: 40, body: 16, aside: 13, text: 0 }
  ];

  function collage(photos) {
    const wrap = el('div', { className: 'collage' });
    photos.forEach(photo => {
      const img = el('img', { className: 'collage__photo', attrs: {
        src: photo.src, alt: photo.alt, loading: 'lazy', 'data-step': photo.step, 'data-tilt': photo.tilt,
        style: `--x:${photo.x};--y:${photo.y};--w:${photo.w};--h:${photo.h}`
      }});
      wrap.append(img);
    });
    wrap.append(stepDots('About'));
    return wrap;
  }

  function setupCollage(wrap, animate, cleanups) {
    const photos = Array.from(wrap.querySelectorAll('.collage__photo'));

    // Below the breakpoint the collage is a grid under the copy; nothing shrinks.
    if (!desktop.matches) {
      if (animate) cleanups.push(revealOnScroll(photos));
      return;
    }
    // Without GSAP the page holds its arrival state: all copy, no collage.
    if (!hasMotion) return;

    const rail = wrap.querySelector('.step-dots');
    const headline = els.page.querySelector('.headline');
    const aside = headline.querySelector('.aside');
    const paras = Array.from(els.page.querySelectorAll('.prose > p'));
    // The hero headline clamps below 84 on narrower screens; keep its ratios.
    const scale = parseFloat(getComputedStyle(headline).fontSize) / ABOUT_STEPS[0].headline;

    const tl = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'power2.inOut' } });
    tl.addLabel('step0');
    [1, 2].forEach(n => {
      const s = ABOUT_STEPS[n];
      const at = `step${n - 1}`;
      tl.to(headline, { fontSize: s.headline * scale }, at)
        .to(aside, { fontSize: s.aside }, at)
        .to(paras, { fontSize: s.body }, at)
        .to([headline, ...paras], { opacity: s.text }, at)
        .fromTo(photos.filter(p => +p.dataset.step === n),
          { opacity: 0, y: 36, scale: 0.94, rotation: (i, p) => +p.dataset.tilt },
          { opacity: 1, y: 0, scale: 1, rotation: 0, stagger: 0.12, ease: 'power3.out' }, `${at}+=0.25`)
        .addLabel(`step${n}`);
    });

    let current = 0;
    function go(to) {
      if (to < 0 || to >= ABOUT_STEPS.length || to === current) return;
      current = to;
      markDot(rail, current);
      if (animate) tl.tweenTo(`step${to}`, { duration: 0.9, ease: 'power1.inOut' });
      else tl.seek(`step${to}`);
    }

    renderDots(rail, ['About: arrival', 'About: collage arrives', 'About: collage'], go);
    markDot(rail, current);
    cleanups.push(bindStepInput(d => go(current + d), go, () => ABOUT_STEPS.length));
    cleanups.push(() => {
      tl.kill();
      gsap.set([headline, aside, ...paras, ...photos], { clearProps: 'all' });
    });
  }

  /** Mobile: items drift up into place as the page scrolls to them. */
  function revealOnScroll(items) {
    gsap.set(items, { opacity: 0, y: 24 });
    const triggers = ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 })
    });
    // Measure now rather than on window load, which waits for every photo.
    ScrollTrigger.refresh();
    return () => {
      triggers.forEach(t => t.kill());
      gsap.killTweensOf(items);
      gsap.set(items, { clearProps: 'opacity,transform' });
    };
  }

  /* --- Navigation state -------------------------------------------------- */

  /** Mark the active pill link and slide the marker under it. */
  function syncNav(key) {
    let active = null;

    els.navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#/${key}`;
      if (isActive) { link.setAttribute('aria-current', 'page'); active = link; }
      else link.removeAttribute('aria-current');
    });

    if (active) {
      // The marker is positioned inside the pill's border, so measure from there.
      const pill = els.nav.getBoundingClientRect();
      const box = active.getBoundingClientRect();
      els.marker.style.left = `${box.left - pill.left - els.nav.clientLeft}px`;
      els.marker.style.width = `${box.width}px`;
      els.marker.style.top = `${box.top - pill.top - els.nav.clientTop}px`;
      els.marker.style.height = `${box.height}px`;
      els.marker.classList.add('is-ready');
    } else {
      els.marker.classList.remove('is-ready');
    }

    // Highlight the matching phone tile.
    document.querySelectorAll('.tile[data-route]').forEach(tile => {
      if (tile.dataset.route === `#/${key}`) tile.setAttribute('aria-current', 'page');
      else tile.removeAttribute('aria-current');
    });
  }

  /* --- Phone navigator --------------------------------------------------- */

  /**
   * Build an inline SVG icon from js/icons.js.
   * Sized in CSS via width/height:100%, so one path serves every slot.
   */
  function icon(name) {
    const markup = ICONS[name];
    const span = el('span', { className: 'tile__glyph', attrs: { 'aria-hidden': 'true' } });
    if (!markup) {
      console.warn('Unknown icon:', name);
      return span;
    }
    span.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + markup + '</svg>';
    return span;
  }

  /** Build one tile button (site route or external link). */
  function buildTile(tile) {
    const li = el('li');
    const isLink = Boolean(tile.href);

    const node = isLink
      ? el('a', { className: 'tile', attrs: { ...linkAttrs(tile.href), 'aria-label': tile.label } })
      : el('button', { className: 'tile', attrs: {
          type: 'button',
          'data-route': tile.route,
          'aria-label': `Go to ${tile.label}`
        }});

    node.append(icon(tile.icon));
    li.append(node);
    li.append(el('span', { className: 'tile__label', text: tile.label }));
    return li;
  }

  /** Render every phone screen once at startup. */
  function buildScreens() {
    CONTENT.screens.forEach((screen, i) => {
      const panel = el('div', { className: 'screen', attrs: {
        role: 'tabpanel',
        'aria-label': `${screen.name} screen`
      }});

      if (screen.photo) {
        // The card starts on the headshot; rotating through the rest is a later PR.
        const photo = CONTENT.photos.card[0];
        const wrap = el('div', { className: 'screen__photo' });
        wrap.append(el('img', { attrs: { src: photo.src, alt: photo.alt, loading: 'eager' } }));
        panel.append(wrap);
      }

      if (screen.banner) {
        panel.append(el('div', {
          className: `screen__banner screen__banner--${screen.banner.tone}`,
          text: screen.banner.text
        }));
      }

      // The projects screen has one tile per project, in list order.
      const tiles = screen.tiles === 'projects'
        ? CONTENT.projects.map(p => ({ label: p.tile, icon: p.icon, route: `#/projects/${p.slug}` }))
        : screen.tiles;

      const grid = el('ul', { className: 'screen__grid' });
      tiles.forEach(tile => grid.append(buildTile(tile)));
      panel.append(grid);

      els.screens.append(panel);
    });
    renderPhoneDots();
  }

  /** One dot per home screen, or per demo screen while a demo is showing. */
  function renderPhoneDots() {
    els.dots.textContent = '';
    const count = demo ? demo.shots.length : CONTENT.screens.length;
    for (let i = 0; i < count; i++) {
      const dot = el('button', { attrs: {
        type: 'button',
        role: 'tab',
        'aria-label': demo ? `${demo.name} screen ${i + 1}` : `Screen ${i + 1}`,
        'aria-selected': 'false'
      }});
      dot.addEventListener('click', () => phoneGo(i));
      els.dots.append(dot);
    }
  }

  function markPhonePager(index, count) {
    els.prev.disabled = index === 0;
    els.next.disabled = index === count - 1;
    Array.from(els.dots.children).forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
  }

  /** Slide the phone to a given screen and update the chevrons and dots. */
  function goToScreen(index) {
    const last = CONTENT.screens.length - 1;
    screenIndex = Math.max(0, Math.min(index, last));

    els.screens.style.transform = `translateX(-${screenIndex * 100}%)`;
    markPhonePager(screenIndex, last + 1);
    syncTileFocus();
  }

  /* --- Phone demo ----------------------------------------------------------
     On esdrs and ReVibe's detail pages the phone shows that project's screens
     at 1:1 (both are designed at 393x852, like the phone). The chevrons page
     through them; the home bar goes back to the home screens. The page column
     stays on the detail either way, and leaving it closes the demo.
  ------------------------------------------------------------------------ */

  let demo = null;  // { name, node, shots, index } while a demo is on the phone

  function openDemo(project) {
    closeDemo();
    const node = el('div', { className: 'phone__demo', attrs: { role: 'group', 'aria-label': `${project.name} screens` } });
    const shots = project.screens.map(shot => {
      const img = el('img', { className: 'phone__shot', attrs: { src: shot.src, alt: shot.alt } });
      node.append(img);
      return img;
    });
    const home = el('button', { className: 'phone__home', attrs: { type: 'button', 'aria-label': 'Back to the home screen' } });
    home.addEventListener('click', closeDemo);
    node.append(home);

    // Everything under the demo is out of reach until it closes.
    els.screenBox.querySelectorAll(':scope > *').forEach(child => { child.inert = true; });
    els.screenBox.append(node);
    demo = { name: project.name, node, shots, index: 0 };
    renderPhoneDots();
    phoneGo(0);
  }

  function closeDemo() {
    if (!demo) return;
    demo.node.remove();
    demo = null;
    els.screenBox.querySelectorAll(':scope > *').forEach(child => { child.inert = false; });
    renderPhoneDots();
    goToScreen(screenIndex);
  }

  /** Page the phone: the demo's screens while one is open, else the home screens. */
  function phoneGo(index) {
    if (!demo) { goToScreen(index); return; }
    demo.index = Math.max(0, Math.min(index, demo.shots.length - 1));
    demo.shots.forEach((img, i) => img.classList.toggle('is-current', i === demo.index));
    markPhonePager(demo.index, demo.shots.length);
  }

  const phoneIndex = () => demo ? demo.index : screenIndex;

  /** Only tiles on the visible screen of a visible phone are tabbable. */
  function syncTileFocus() {
    Array.from(els.screens.children).forEach((panel, i) => {
      const reachable = !phoneAway && i === screenIndex;
      panel.querySelectorAll('a, button').forEach(node => {
        node.tabIndex = reachable ? 0 : -1;
      });
    });
  }

  /**
   * Slide the phone off the right edge (or bring it back).
   * The pill nav still covers every page, so nothing becomes unreachable.
   */
  function setPhoneAway(away, moveFocus) {
    phoneAway = away;
    document.body.classList.toggle('phone-away', away);

    els.hide.setAttribute('aria-expanded', String(!away));
    els.tab.setAttribute('aria-expanded', String(!away));

    // Keep the hidden control out of the tab order in both directions.
    els.hide.tabIndex = away ? -1 : 0;
    els.tab.tabIndex = away ? 0 : -1;

    syncTileFocus();

    // Send focus to whichever control is now on screen.
    if (moveFocus) (away ? els.tab : els.hide).focus();
  }

  /**
   * Slide the nav up past the top edge (or bring it back). Desktop only:
   * the phone still reaches every page while the nav is away.
   */
  function setNavAway(away) {
    navAway = away;
    document.body.classList.toggle('nav-away', away);
    els.nav.inert = away;
    els.navToggle.setAttribute('aria-expanded', String(!away));
    els.navToggle.setAttribute('aria-label', away ? 'Show navigation' : 'Hide navigation');
  }

  /* --- Wiring ------------------------------------------------------------ */

  function handleRouteChange() {
    const route = routeFromHash();
    if (route.path === currentPath) return;
    currentPath = route.path;
    currentRoute = route.key || '';

    renderPage(route);
    syncNav(currentRoute);
    if (route.project && route.project.screens) openDemo(route.project);
    else closeDemo();

    // Move focus to the new content so keyboard and screen-reader users
    // land in the right place after navigating.
    els.page.focus({ preventScroll: true });
  }

  function init() {
    buildScreens();
    document.querySelector('.tile--dock').append(icon('home'));
    goToScreen(0);

    // Any tile carrying data-route drives the router (includes the dock button).
    document.addEventListener('click', event => {
      const tile = event.target.closest('.tile[data-route]');
      if (tile) location.hash = tile.dataset.route;
    });

    els.prev.addEventListener('click', () => phoneGo(phoneIndex() - 1));
    els.next.addEventListener('click', () => phoneGo(phoneIndex() + 1));

    els.navToggle.addEventListener('click', () => setNavAway(!navAway));
    // Crossing below the breakpoint must never leave the only nav hidden.
    desktop.addEventListener('change', e => {
      if (!e.matches && navAway) setNavAway(false);
      teardownSteps();
      setupSteps();
    });

    els.hide.addEventListener('click', () => setPhoneAway(true, true));
    els.tab.addEventListener('click', () => setPhoneAway(false, true));

    // Clicking the sliver of phone still on screen also brings it back.
    els.area.addEventListener('click', event => {
      if (!phoneAway) return;
      event.preventDefault();
      event.stopPropagation();
      setPhoneAway(false, false);
    }, true);

    // Arrow keys page the phone, matching the "swipe left and right" note.
    document.addEventListener('keydown', event => {
      if (event.target.matches('input, textarea')) return;
      if (event.key === 'Escape' && !phoneAway) { setPhoneAway(true, true); return; }
      if (phoneAway) return; // arrows do nothing while it's tucked away
      if (event.key === 'ArrowRight') phoneGo(phoneIndex() + 1);
      if (event.key === 'ArrowLeft') phoneGo(phoneIndex() - 1);
    });

    // Touch swipe on the phone screen itself.
    let touchStartX = null;
    els.screenBox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    els.screenBox.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) phoneGo(phoneIndex() + (delta < 0 ? 1 : -1));
      touchStartX = null;
    });

    window.addEventListener('hashchange', handleRouteChange);
    // Re-measure the sliding nav marker when the layout reflows.
    window.addEventListener('resize', () => syncNav(currentRoute));

    handleRouteChange();
  }

  // Fonts change link widths, so wait for them before measuring the marker.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => syncNav(currentRoute));
  }

  document.addEventListener('DOMContentLoaded', init);
})();

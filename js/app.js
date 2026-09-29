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
  let currentRoute = ''; // the active page key
  let phoneAway = false; // whether the phone is slid off to the side
  let navAway = false;   // whether the nav is slid up past the top edge

  // The nav can only be put away on desktop; below this it is the only navigation.
  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Card motion needs the vendored GSAP; without it (or with reduced motion)
  // paged lists still work, pages just swap without animating.
  const hasMotion = Boolean(window.gsap && window.ScrollTrigger);
  if (hasMotion) gsap.registerPlugin(ScrollTrigger);

  let paged = null;      // the live paged list's handles, torn down on route change

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
  function routeFromHash() {
    // Until detail pages exist (PR 4), #/projects/<slug> shows its parent page.
    const key = (location.hash || '').replace(/^#\/?/, '').trim().split('/')[0];
    return Object.prototype.hasOwnProperty.call(CONTENT.pages, key) ? key : DEFAULT_ROUTE;
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
          li.append(el('h2', { className: 'card__name', text: item.name }));
          li.append(el('p', { className: 'card__meta', text: item.meta.join('  \u00b7  ') }));
          li.append(el('p', { className: 'card__blurb', text: item.blurb }));

          const tags = el('ul', { className: 'card__tech' });
          item.tags.forEach(t => tags.append(el('li', { text: t })));
          li.append(tags);
          ul.append(li);
        });
        return pagedList(ul, 'projects');
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
  function renderPage(key) {
    const page = CONTENT.pages[key];
    if (!page) return;

    teardownPager();
    els.page.textContent = '';
    els.page.dataset.route = key;
    els.page.append(renderHeadline(page.title));

    const prose = el('div', { className: 'prose' });
    page.body.forEach(block => {
      const node = renderBlock(block);
      if (node) prose.append(node);
    });
    els.page.append(prose);
    els.page.classList.toggle('page--paged', Boolean(prose.querySelector('.pager')));
    setupPager();

    els.stamp.textContent = `print(\u201C${page.stamp}\u201D)`;
    document.title = `${page.stamp} — emilia`;

    // Restart the entrance animation on every change.
    els.page.classList.remove('is-entering');
    void els.page.offsetWidth; // force reflow so the animation replays
    els.page.classList.add('is-entering');
  }

  /* --- Paged lists ------------------------------------------------------- */

  /**
   * Long lists show a page of cards at a time instead of scrolling. As many
   * cards as fit the column's height make a page; dots on the left step
   * between pages, and a wheel or swipe moves one page per gesture.
   */
  function pagedList(list, label) {
    const pager = el('div', { className: 'pager', attrs: { role: 'region', 'aria-label': label } });
    const viewport = el('div', { className: 'pager__viewport', attrs: { tabindex: '0' } });
    viewport.append(list);
    pager.append(viewport, el('div', { className: 'pager__dots', attrs: { role: 'group', 'aria-label': `${label} pages` } }));
    return pager;
  }

  function setupPager() {
    const pager = els.page.querySelector('.pager');
    if (!pager) return;
    const viewport = pager.querySelector('.pager__viewport');
    const dots = pager.querySelector('.pager__dots');
    const cards = Array.from(viewport.querySelectorAll('.card'));
    const animate = hasMotion && !reducedMotion.matches;
    const cleanups = [];
    paged = { cleanups };

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

      pages = [];
      let page = [];
      let used = 0;
      cards.forEach((card, i) => {
        const need = card.offsetHeight + (page.length ? gap : 0);
        if (page.length && used + need > room) { pages.push(page); page = []; used = 0; }
        used += card.offsetHeight + (page.length ? gap : 0);
        page.push(i);
      });
      pages.push(page);

      // Keep the card that was first on screen on screen.
      current = pages.findIndex(pg => pg.includes(first));
      renderDots();
      show(current);
    }

    function renderDots() {
      dots.textContent = '';
      dots.hidden = pages.length < 2;
      pages.forEach((pg, i) => {
        const range = pg.length > 1 ? `${pg[0] + 1}–${pg[pg.length - 1] + 1}` : `${pg[0] + 1}`;
        const dot = el('button', { className: 'pager__dot', attrs: { type: 'button', 'aria-label': `Show projects ${range}` } });
        dot.addEventListener('click', () => go(i));
        dots.append(dot);
      });
    }

    function show(i) {
      cards.forEach((card, k) => { card.hidden = !pages[i].includes(k); });
      Array.from(dots.children).forEach((dot, k) => {
        if (k === i) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
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

    // One page per gesture: trackpads keep firing wheel events after a flick,
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
      go(current + Math.sign(e.deltaY));
    }

    function onKey(e) {
      const step = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (step) go(current + step);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(pages.length - 1);
      else return;
      e.preventDefault();
    }

    let touchY = null;
    const onTouchStart = e => { touchY = e.touches[0].clientY; };
    const onTouchEnd = e => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) go(current + Math.sign(dy));
      touchY = null;
    };

    els.page.addEventListener('wheel', onWheel, { passive: false });
    pager.addEventListener('keydown', onKey);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd);
    const resize = new ResizeObserver(paginate);
    resize.observe(viewport);

    paginate();
    if (animate) {
      gsap.fromTo(pages[current].map(k => cards[k]), { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.1 });
    }

    cleanups.push(() => {
      els.page.removeEventListener('wheel', onWheel);
      clearTimeout(quiet);
      resize.disconnect();
      cards.forEach(card => { card.hidden = false; });
      if (hasMotion) { gsap.killTweensOf(cards); gsap.set(cards, { clearProps: 'opacity,transform' }); }
    });
  }

  function teardownPager() {
    if (!paged) return;
    paged.cleanups.forEach(fn => fn());
    paged = null;
  }

  /** Mobile: cards drift up into place as the page scrolls to them. */
  function revealOnScroll(cards) {
    gsap.set(cards, { opacity: 0, y: 24 });
    const triggers = ScrollTrigger.batch(cards, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 })
    });
    // Measure now rather than on window load, which waits for every photo.
    ScrollTrigger.refresh();
    return () => {
      triggers.forEach(t => t.kill());
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: 'opacity,transform' });
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

      // Matching dot in the pager.
      const dot = el('button', { attrs: {
        type: 'button',
        role: 'tab',
        'aria-label': `Screen ${i + 1}`,
        'aria-selected': String(i === 0)
      }});
      dot.addEventListener('click', () => goToScreen(i));
      els.dots.append(dot);
    });
  }

  /** Slide the phone to a given screen and update the chevrons and dots. */
  function goToScreen(index) {
    const last = CONTENT.screens.length - 1;
    screenIndex = Math.max(0, Math.min(index, last));

    els.screens.style.transform = `translateX(-${screenIndex * 100}%)`;
    els.prev.disabled = screenIndex === 0;
    els.next.disabled = screenIndex === last;

    Array.from(els.dots.children).forEach((dot, i) => {
      dot.setAttribute('aria-selected', String(i === screenIndex));
    });

    syncTileFocus();
  }

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
    const key = routeFromHash();
    if (key === currentRoute) return;
    currentRoute = key;

    renderPage(key);
    syncNav(key);

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

    els.prev.addEventListener('click', () => goToScreen(screenIndex - 1));
    els.next.addEventListener('click', () => goToScreen(screenIndex + 1));

    els.navToggle.addEventListener('click', () => setNavAway(!navAway));
    // Crossing below the breakpoint must never leave the only nav hidden.
    desktop.addEventListener('change', e => {
      if (!e.matches && navAway) setNavAway(false);
      teardownPager();
      setupPager();
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
      if (event.key === 'ArrowRight') goToScreen(screenIndex + 1);
      if (event.key === 'ArrowLeft') goToScreen(screenIndex - 1);
    });

    // Touch swipe on the phone screen itself.
    let touchStartX = null;
    const screenBox = document.querySelector('.phone__screen');
    screenBox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    screenBox.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) goToScreen(screenIndex + (delta < 0 ? 1 : -1));
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

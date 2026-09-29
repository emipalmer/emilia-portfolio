/* ============================================================================
   content.js — all copy, projects, links and photos. Nothing here touches
   layout or behaviour; app.js reads it and renders.

   The source of truth for every word is the Figma file (Desktop — 1440 and
   Projects — detail). Change it there first, then here.
   ========================================================================== */

// Assembled at runtime so the address never appears whole in the page source.
const EMAIL = ['mia.annp', 'gmail.com'].join('@');

const LINKS = {
  email:    { label: 'email',    href: `mailto:${EMAIL}`,                          display: EMAIL },
  github:   { label: 'github',   href: 'https://github.com/emipalmer',             display: 'github.com/emipalmer' },
  linkedin: { label: 'linkedin', href: 'https://linkedin.com/in/emiliaapalmer',    display: 'linkedin.com/in/emiliaapalmer' },
  resume:   { label: 'resume',   href: 'assets/resume.pdf' }
};

const CONTENT = {

  /* --- Pages -------------------------------------------------------------
     key    : matches the URL hash, e.g. #/about
     stamp  : the faded print("...") label bottom-left
     title  : the headline. `em` renders in italic.
     body   : blocks. Types: 'list', 'text', 'links', 'cards'.
  ----------------------------------------------------------------------- */
  pages: {

    home: {
      stamp: 'hi, i’m emilia',
      title: { lead: 'hi, i’m ', em: 'emilia', tail: '.' },
      body: [
        { type: 'list', items: ['computer science @ penn state', 'aspiring developer'] },
        { type: 'links', items: [LINKS.resume, LINKS.github] }
      ]
    },

    about: {
      stamp: 'about',
      title: { lead: 'hi, i’m ', em: 'emilia', tail: '.', aside: '(you can also call me mia.)' },
      body: [
        { type: 'text', text: 'I’m a computer science student at Penn State, minoring in cybersecurity, math and entrepreneurship.' },
        { type: 'text', text: 'This past summer I was an AI Engineer Intern at Venerable, building Python automation on AWS Bedrock for investment and compliance teams.' },
        { type: 'text', text: 'The summer before, I was an AI/ML intern at Vevey, a startup teaching kids to code their own games with AI.' },
        { type: 'collage' }
      ]
    },

    projects: {
      stamp: 'projects',
      title: { lead: 'things i’ve ', em: 'built', tail: '.' },
      body: [{ type: 'cards', source: 'projects' }]
    },

    experience: {
      stamp: 'experience',
      title: { lead: 'where i’ve ', em: 'worked', tail: '.' },
      body: [{ type: 'roles' }]
    },


    contact: {
      stamp: 'contact',
      title: { lead: 'say ', em: 'hi', tail: '!' },
      body: [
        { type: 'links', items: [LINKS.email, LINKS.github, LINKS.linkedin] }
      ]
    }
  },

  // Any hash that isn't a page or a project. Not a route of its own.
  notFound: {
    stamp: '404',
    title: { lead: 'hmm, ', em: 'nothing', tail: ' here.' },
    body: [
      { type: 'text', text: 'That page doesn\u2019t exist \u2014 the link may be old, or I may have moved it.' },
      { type: 'links', items: [{ label: 'home', href: '#/home' }, { label: 'projects', href: '#/projects' }] }
    ]
  },

  /* --- Projects ----------------------------------------------------------
     Order is deliberate: featured first, design-only last. The phone's
     projects screen uses the same order.
       slug   : #/projects/<slug>
       tile   : label on the phone tile      short : one-liner for mobile cards
       meta   : dates, then role(s)          body  : detail-page paragraphs
       image  : shown on the detail page     screens: shown in the phone on
                                                      the detail page (1:1)
  ----------------------------------------------------------------------- */
  projects: [
    {
      slug: 'worklog', name: 'WorkLog', tile: 'worklog', icon: 'worklog',
      meta: ['2026', 'design & build', 'personal project'],
      blurb: 'Log what you did each day; it turns those notes into resume bullets, STAR stories and a skills list when you need them.',
      short: 'Daily notes become resume bullets.',
      tags: ['Next.js', 'Claude API', 'Figma'],
      image: { src: 'assets/projects/worklog.png', alt: 'WorkLog: daily log entries beside a resume editor with a live preview' },
      body: [
        'You do good work and then can’t remember any of it. At review time, or when updating a resume, you are reconstructing months from memory and the specifics of your impact are gone.',
        'WorkLog is a daily log that pays off later. You write a line or two about what you did, and it turns those entries into resume bullets, STAR stories or a skills list. The resume editor sits beside a live preview, so a bullet goes from log to document without retyping.'
      ]
    },
    {
      slug: 'esdrs', name: 'esdrs', tile: 'esdrs', icon: 'esdrs',
      meta: ['2026 — present', 'design & product lead'],
      award: 'Dave Hall Award, Bardusch Family IdeaMakers Challenge',
      blurb: 'A social mobile app promoting sustainability within fashion.',
      short: 'Social app for sustainable fashion.',
      tags: ['UI/UX', 'Mobile', 'Figma'],
      image: { src: 'assets/projects/esdrs.jpg', alt: 'Emilia and two teammates in dark blazers' },
      screens: [
        { src: 'assets/projects/esdrs-screen-a.png', alt: 'esdrs profile: your closet of pieces to lend, with borrow counts' },
        { src: 'assets/projects/esdrs-screen-b.png', alt: 'esdrs event board for Penn State vs. Ohio State, showing what people are wearing' },
        { src: 'assets/projects/esdrs-screen-c.png', alt: 'esdrs browse: search closets, filter by occasion, pieces from friends\u2019 closets' }
      ],
      body: [
        'More than two in five college students buy clothes for an event they’ll wear once. The workaround — texting friends to ask what they own — is a free-for-all where nobody knows what anyone has.',
        'esdrs is an invite-only app for borrowing clothes from people you already know. Access runs through the social graph rather than a public marketplace, so browsing extends to friends-of-friends, and joining a sorority or club unlocks those closets past the normal limit.',
        'My work so far is 57 screens and the system behind them: the full borrow lifecycle from request through handoff, return and overdue; communities built as an audience and a calendar rather than a shared closet; event boards where people coordinate what they’re wearing; and a privacy model where borrow history stays private but you can choose to post yourself in a piece.',
        'I’m currently working on developing the app, stay tuned for updates!'
      ]
    },
    {
      slug: 'dementia-mr', name: 'Dementia Care MR Simulation', tile: 'dementia mr', icon: 'dementia',
      meta: ['spring 2026', 'software developer'],
      blurb: 'A mixed reality dementia-care training module for Meta Quest, built for instructors and students.',
      short: 'Mixed reality training on Meta Quest.',
      tags: ['Unity', 'Photon Fusion', 'Meta Quest'],
      image: { src: 'assets/projects/dementia.jpg', alt: 'Emilia and her capstone teammates beside their project poster at the showcase' },
      body: [
        'A mixed reality dementia-care training module for Meta Quest, supporting instructor and student roles across two headsets. My capstone project at Penn State University.',
        'I built the multiplayer layer with Photon Fusion, redesigned the session lobby and in-headset UI to fix host/client connection and scene transition bugs, and added a synced voting system so students choose dialogue while the instructor controls how the scenario progresses.'
      ]
    },
    {
      slug: 'gemini-add-on', name: 'Gemini AI Document Add-On', tile: 'gemini add-on', icon: 'gemini',
      meta: ['mar 2025', 'frontend & integration'],
      blurb: 'A Google Docs add-on that runs Gemini analyses inside the document, with one-click feedback. Projected to cut editing time 30%.',
      short: 'Gemini analyses inside Google Docs.',
      tags: ['JavaScript', 'React', 'Tailwind', 'Apps Script'],
      body: [
        'Editing a long document means leaving it constantly — copying a paragraph somewhere else to check it, then carrying the answer back. This add-on keeps that inside Google Docs.',
        'It runs Gemini analyses on the document you are already in, with one-click feedback, and is projected to cut editing time by 30%. I built the frontend-to-backend integration in JavaScript, React and Tailwind, wired to Google Apps Script. I worked on this for HackPSU in Spring 2025!'
      ]
    },
    {
      slug: 'this-site', name: 'This site', tile: 'this site', icon: 'site',
      meta: ['2026', 'design & build'],
      blurb: 'Designed in Figma and built from scratch — the phone is the navigation.',
      short: 'Built from scratch; the phone is the nav.',
      tags: ['HTML/CSS', 'JavaScript', 'Figma'],
      body: ['Designed in Figma!']
    },
    {
      slug: 'revibe', name: 'ReVibe', tile: 'revibe', icon: 'revibe',
      meta: ['feb 2025', 'ui/ux design'],
      blurb: 'A secondhand clothing app where an AI recommendation system learns your taste as you swipe. I designed the interface in Figma.',
      short: 'Secondhand shopping that learns your taste.',
      tags: ['UI/UX', 'Figma'],
      image: { src: 'assets/projects/revibe-pitch.jpg', alt: 'ReVibe pitch graphic: app screens of secondhand clothing beside the ReVibe logo' },
      screens: [
        { src: 'assets/projects/revibe-swipe.jpg',  alt: 'ReVibe swipe screen: a red off-shoulder Hollister top, size S, $9.99' },
        { src: 'assets/projects/revibe-browse.jpg', alt: 'ReVibe browse grid of secondhand tops' },
        { src: 'assets/projects/revibe-item.jpg',   alt: 'ReVibe item detail: condition, material, fit notes and styling tags' }
      ],
      body: [
        'Secondhand shopping is good for the planet and bad as an experience — endless racks, no sense of what suits you, nothing that learns. ReVibe makes it feel like browsing rather than searching: you swipe through individual pieces and a recommendation system learns your taste as you go.',
        'I designed the cross-platform interface in Figma! With this I was a finalist for the Nittany Entrepreneurship Society Pitch Competition in 2025, competing against 5 other teams for $5,000.'
      ]
    }
  ],

  /* --- Skills ----------------------------------------------------------
     Shown as chips at the end of the experience page.
  ----------------------------------------------------------------------- */
  skills: [
    { label: 'languages', items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'SQL'] },
    { label: 'tools',     items: ['React', 'AWS', 'Docker', 'MongoDB', 'Git', 'Linux'] }
  ],

  /* --- Experience --------------------------------------------------------
     Two groups, work then leadership. `short` is the mobile line.
  ----------------------------------------------------------------------- */
  experience: [
    {
      group: 'work',
      roles: [
        {
          title: 'AI Engineer Intern', org: 'Venerable', team: 'VenAI team', dates: 'may – aug 2026',
          line: 'Built Python automation on AWS Bedrock for investment, finance and compliance teams, including a compliance merge pipeline that cut policy review time by 80%.',
          short: 'Python automation on AWS Bedrock; a compliance pipeline that cut policy review time by 80%.'
        },
        {
          title: 'AI/ML Intern', org: 'Vevey', dates: 'jun – aug 2025',
          line: 'Tuned prompt engineering for an AI game maker, improving accuracy 75% on generated 2D/3D coding games, and built a React + TypeScript marketplace tested by 500+ students.',
          short: 'Prompt engineering for an AI game maker, and a React marketplace tested by 500+ students.'
        },
        {
          title: 'Operations Intern', org: 'Presidential Leadership Academy, Penn State', dates: 'apr 2026 – present',
          line: 'Lead alumni outreach across 6+ city groups and plan Academy events for 100+ attendees.',
          short: 'Alumni outreach across 6+ city groups; events for 100+ attendees.'
        }
      ]
    },
    {
      group: 'leadership',
      roles: [
        {
          title: 'Presidential Leadership Academy Scholar', org: 'Penn State', dates: 'apr 2024 – present',
          line: 'Honors classes and travel led by the University President and the Dean of Schreyer.',
          short: 'Honors classes and travel led by the University President.'
        },
        {
          title: 'Engineering Ambassador', org: 'College of Engineering', dates: 'apr 2025 – present',
          line: 'Campus tours and presentations for 50+ prospective students and families.',
          short: 'Tours and presentations for 50+ prospective students.'
        }
      ]
    }
  ],

  /* --- Photos ------------------------------------------------------------
     `card`: the phone's photo card cycles through these, headshot first.
     `collage`: the about-page collage.
  ----------------------------------------------------------------------- */
  photos: {
    card: [
      { src: 'assets/photos/headshot.jpg',     alt: 'Emilia in a navy blazer, smiling, outside a stone campus building' },
      { src: 'assets/photos/event.jpg',        alt: 'Emilia and three friends wearing name tags in a grand arched hall' },
      { src: 'assets/photos/lisboa.jpg',       alt: 'Emilia with three friends, one in an I love Lisboa shirt' },
      { src: 'assets/photos/travel-study.jpg', alt: 'A travel-study group gathered in a café under a hanging plant' },
      { src: 'assets/photos/venerable.jpg',    alt: 'Emilia and three friends sitting in front of a tall window' }
    ],
    // About collage, in Figma frame units ("✓ about / 3": x, y, width, height).
    // `step` is when a photo arrives; `tilt` is the angle it settles from.
    collage: [
      { src: 'assets/photos/event.jpg',             x: 705, y: 370, w: 283, h: 212, step: 1, tilt: 3,  alt: 'Emilia and three friends wearing name tags in a grand arched hall' },
      { src: 'assets/photos/lisboa.jpg',            x: 128, y: 445, w: 225, h: 169, step: 1, tilt: 5,  alt: 'Emilia with three friends, one in an I love Lisboa shirt' },
      { src: 'assets/photos/travel-study.jpg',      x: 383, y: 187, w: 219, h: 292, step: 2, tilt: -3, alt: 'A travel-study group gathered in a caf\u00e9 under a hanging plant' },
      { src: 'assets/photos/venerable.jpg',         x: 592, y: 213, w: 199, h: 265, step: 2, tilt: 4,  alt: 'Emilia and three friends sitting in front of a tall window' },
      { src: 'assets/photos/dressed-up.jpg',        x: 484, y: 456, w: 200, h: 267, step: 2, tilt: -4, alt: 'Emilia and a friend dressed up for an event' },
      { src: 'assets/photos/blazers.jpg',           x: 82,  y: 222, w: 318, h: 238, step: 2, tilt: -2, alt: 'Emilia with two friends in dark blazers' },
      { src: 'assets/photos/venerable-meeting.jpg', x: 285, y: 494, w: 371, h: 209, step: 1, tilt: -5, alt: 'A full meeting room at Venerable\u2019s West Chester office' },
      { src: 'assets/photos/venerable-team.jpg',    x: 656, y: 200, w: 338, h: 177, step: 2, tilt: 3,  alt: 'Interns in front of the Venerable West Chester office sign' }
    ]
  },

  /* --- Phone screens -----------------------------------------------------
     Home screens paged by the chevrons: navigation, projects, links.
     A tile with `route` moves around the site; one with `href` opens a link.
     `icon` is a key from js/icons.js.
  ----------------------------------------------------------------------- */
  screens: [
    {
      name: 'navigation',
      photo: true,
      tiles: [
        { label: 'about',      icon: 'about',      route: '#/about' },
        { label: 'projects',   icon: 'projects',   route: '#/projects' },
        { label: 'experience', icon: 'experience', route: '#/experience' },
        { label: 'contact',    icon: 'contact',    route: '#/contact' }
      ]
    },
    {
      name: 'projects',
      banner: { text: 'projects', tone: 'green' },
      tiles: 'projects'   // one tile per project, in CONTENT.projects order
    },
    {
      name: 'links',
      banner: { text: 'links', tone: 'pink' },
      tiles: [
        { label: 'github',   icon: 'github',   href: LINKS.github.href },
        { label: 'linkedin', icon: 'linkedin', href: LINKS.linkedin.href },
        { label: 'resume',   icon: 'resume',   href: LINKS.resume.href },
        { label: 'email',    icon: 'contact',  href: LINKS.email.href }
      ]
    }
  ]
};

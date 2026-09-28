/* ============================================================================
   content.js — everything you'll want to edit lives here.
   Nothing in this file touches layout or behaviour; app.js reads it and renders.

   Anything marked TODO is a placeholder I couldn't pull from the Canva file.
   ========================================================================== */

const CONTENT = {

  /* --- Pages -------------------------------------------------------------
     key       : matches the URL hash, e.g. #/about
     stamp     : the faded print("...") label bottom-left
     title     : the big headline. `em` renders in italic, like the mockup.
     body      : array of blocks. Types: 'list', 'text', 'links', 'cards'.
  ----------------------------------------------------------------------- */
  pages: {

    home: {
      stamp: 'hi, i\u2019m emilia',
      title: { lead: 'hi, i\u2019m ', em: 'emilia', tail: '.' },
      body: [
        { type: 'list', items: [
          'computer science @ penn state',
          'aspiring developer'
        ]}
      ]
    },

    about: {
      stamp: 'about',
      title: { lead: 'hi, i\u2019m ', em: 'emilia', tail: '.', aside: '(you can also call me mia.)' },
      body: [
        { type: 'text', text: 'I\u2019m an aspiring software developer.' },
        { type: 'text', text: 'I\u2019m currently an AI/ML intern at Venerable.' },
        { type: 'text', text: 'Last summer I interned at Vevey, a startup focused on teaching kids how to code their own games with AI. I worked on TODO \u2014 finish this sentence.' },
        { type: 'list', label: 'interests:', items: [
          'fashion tech',
          'TODO \u2014 second interest'
        ]}
      ]
    },

    projects: {
      stamp: 'projects',
      title: { lead: 'things i\u2019ve ', em: 'built', tail: '.' },
      body: [
        // Duplicate a card to add a project. `link` is optional.
        { type: 'cards', items: [
          {
            name: 'TODO \u2014 project one',
            blurb: 'One or two lines on what it does and why you made it.',
            tech: ['Python', 'TODO'],
            link: ''
          },
          {
            name: 'TODO \u2014 project two',
            blurb: 'One or two lines on what it does and why you made it.',
            tech: ['TODO'],
            link: ''
          }
        ]}
      ]
    },

    skills: {
      stamp: 'skills',
      title: { lead: 'what i ', em: 'work with', tail: '.' },
      body: [
        { type: 'list', label: 'languages:', items: ['Python', 'Java', 'TODO'] },
        { type: 'list', label: 'tools:', items: ['Git', 'TODO'] }
      ]
    },

    contact: {
      stamp: 'contact',
      title: { lead: 'say ', em: 'hi', tail: '.' },
      body: [
        { type: 'text', text: 'The fastest way to reach me is email \u2014 I answer everything.' },
        { type: 'links', items: [
          { label: 'email',    href: 'mailto:TODO@psu.edu' },
          { label: 'github',   href: 'https://github.com/TODO' },
          { label: 'linkedin', href: 'https://linkedin.com/in/TODO' }
        ]}
      ]
    }
  },

  /* --- Phone screens -----------------------------------------------------
     Each screen is one "home screen" you page through with the chevrons.
     A tile with `route` navigates the site; a tile with `href` opens a link.
     `icon` is a key from js/icons.js.
     `photo` renders the image card from the mockup.
  ----------------------------------------------------------------------- */
  screens: [
    {
      name: 'main',
      photo: { src: 'assets/me.jpg', alt: 'Emilia at Cabo da Roca, wearing a Penn State cap' },
      tiles: [
        { label: 'about',    icon: 'about',    route: '#/about' },
        { label: 'projects', icon: 'projects', route: '#/projects' },
        { label: 'skills',   icon: 'skills',   route: '#/skills' },
        { label: 'contact',  icon: 'contact',  route: '#/contact' }
      ]
    },
    {
      name: 'links',
      // A gradient banner instead of a photo, matching the "skills" frame.
      banner: { text: 'links' },
      tiles: [
        { label: 'github',   icon: 'github',   href: 'https://github.com/TODO' },
        { label: 'linkedin', icon: 'linkedin', href: 'https://linkedin.com/in/TODO' },
        { label: 'resume',   icon: 'resume',   href: 'assets/resume.pdf' },
        { label: 'email',    icon: 'contact',  href: 'mailto:TODO@psu.edu' }
      ]
    }
  ]
};

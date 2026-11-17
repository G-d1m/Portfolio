/* ------------------------------------------------------------------
   Everything the WWW home page says lives here.
   Name, links and project addresses come from ../js/content.js,
   so they only need changing in one place.
   ------------------------------------------------------------------ */

window.SITE = (function (P) {
  "use strict";
  P = P || {};
  var links = P.links || {};

  // Finds a project from content.js by its name, so the address is written once
  function project(name) {
    return (P.projects || []).filter(function (p) { return p.name === name; })[0] || {};
  }

  return {
    first: "George",
    last: "Dimitrakopoulos",
    photo: "../assets/img/me-card.webp",          // the cut-out photo on the CH 02 card

    // One channel per section, in the order of the TV colour bars
    channels: ["George", "About", "Stack", "Work", "Experience", "Education", "Contact"],

    hero: {
      role: "Freelance front-end developer",
      stack: ["UI/UX design", "React", "Next.js", "Tailwind CSS", "JavaScript"],
      text: "I design and build websites for small businesses in Athens, and study Computer Science at the University of Piraeus."
    },

    about: {
      lead: "I design and build fast, clean interfaces with React, Next.js and Tailwind CSS. I start from the design, and I care a lot about how things look, move and feel.",
      more: "Before I focused on development I co-founded Used hub, sourcing, repairing and reselling pre-loved electronics. It taught me to deal with real customers, work to deadlines and own a product end to end.",
      facts: [
        ["Based in", "Athens, Greece"],
        ["Working as", "Freelance front-end developer"],
        ["Focus", "Front-end development and UI/UX design"]
      ],
      stats: [
        [2, "client sites live"],
        [1, "startup co-founded"],
        [2, "certifications"]
      ]
    },

    stack: {
      tags: [
        "JavaScript", "React", "Next.js", "Tailwind CSS", "HTML", "CSS", "UI/UX design", "Python", "Git",
        "Vite", "Cloudflare", "Responsive design", "Front-end", "Web development",
        "Electronics repair", "Sales & marketing", "Start-ups"
      ],
      rows: [
        ["UI/UX design", "React", "Next.js", "Tailwind CSS", "JavaScript"],
        ["HTML", "CSS", "Python", "Git", "Vite", "Cloudflare"]
      ],
      // Programming languages, and how often they come up
      languages: [
        ["JavaScript", "every day"],
        ["HTML", "every day"],
        ["CSS", "every day"]
      ]
    },

    work: [
      {
        name: "Dell'Angelo-menu",           // same name as in content.js
        title: "Dell'Angelo",
        kind: "Online menu",
        art: "dellangelo",
        text: "The printed menu of Dell'Angelo Pizzeria, brought to the web. An animated intro, then two pages that keep the proportions of the paper menu and scale as a whole from desktop to tablet.",
        stack: ["React", "Vite", "Cloudflare"],
        url: project("Dell'Angelo-menu").url,
        code: "https://github.com/G-d1m/dellangelo-menu"
      },
      {
        name: "pro-one-goalkeeping",
        title: "Pro One Goalkeeping",
        kind: "Academy website",
        art: "proone",
        text: "A site for a goalkeeper coaching academy: services, video carousels, testimonials, a light and a dark mode, and a booking form that sends requests straight to the coach.",
        stack: ["HTML", "CSS", "JavaScript", "Web3Forms"],
        url: project("pro-one-goalkeeping").url,
        code: "https://github.com/G-d1m/pro-one-goalkeeping"
      },
      {
        name: "EVE",
        title: "EVE",
        kind: "In progress",
        art: "eve",
        text: "Still in the studio. It will be on this channel when it's ready.",
        stack: [],
        wip: true
      }
    ],

    experience: [
      {
        when: "Sep 2026 – now",
        role: "Freelance web developer",
        where: "Self-employed, Athens and remote",
        text: "Building websites for small businesses, from the first design to deployment. React and Vite, or plain HTML, CSS and JavaScript, hosted on Cloudflare.",
        tags: ["UI/UX design", "React", "JavaScript", "Responsive design"]
      },
      {
        when: "Jan 2024 – Jan 2025",
        role: "Co-founder",
        where: "Used hub, remote",
        text: "Started a business with a partner to source, repair and resell pre-loved iPhones: hunting down high-margin deals, refurbishing damaged devices and selling them to real customers.",
        tags: ["Start-ups", "Sales & marketing", "Electronics repair"]
      }
    ],

    // Oldest first. "cert" must match a certificate name in content.js to open it in the desktop's picture viewer.
    education: [
      {
        when: "2021 – 2023",
        title: "Vocational High School",
        detail: "Computer Systems, Networking and Telecommunications. Trained as a computer and network technician: hardware, networking, operating systems, troubleshooting and IT support.",
        note: "Graduated with 19.1 / 20"
      },
      {
        when: "2023 – now",
        title: "University of Piraeus",
        detail: "Bachelor's degree in Computer Science.",
        note: "SQL, Python"
      },
      {
        when: "Apr 2026",
        title: "Responsive Web Design",
        detail: "Certification from freeCodeCamp.",
        cert: "Responsive Web Design",
        image: "../assets/img/certificates/responsive-web-design.png"
      },
      {
        when: "Oct 2026",
        title: "Google Ads Search",
        detail: "Certification from Google Digital Academy (Skillshop). Valid until Oct 2027.",
        cert: "Google Ads Search",
        image: "../assets/img/certificates/google-ads.png"
      }
    ],

    contact: {
      title: "Let's build something.",
      text: "If you have a unique idea or want to connect, contact me.",
      links: [
        ["LinkedIn", links.linkedin || "https://www.linkedin.com/in/george-d1mitrakopoulos"],
        ["GitHub", links.github || "https://github.com/G-d1m"]
      ]
    }
  };
})(window.PORTFOLIO);

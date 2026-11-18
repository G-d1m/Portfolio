/* ------------------------------------------------------------------
   Everything you can read on the site lives here.
   Change text, links, projects and certificates in this one file.
   ------------------------------------------------------------------ */

window.PORTFOLIO = {

  name: "George Dimitrakopoulos",
  role: "Freelance front-end developer",
  location: "Athens, Greece",
  photo: "assets/img/me.webp",

  // About text, skills and education. Not shown on the site right now (the ReadMe folder was removed).
  about: [
    "Hi, I'm George. I study Computer Science at the University of Piraeus and build websites as a freelance front-end developer.",
    "I start from the design. I get the look and the motion right first, then wire up everything behind it. Most of my work so far is front end, from plain HTML, CSS and JavaScript to React and Next.js.",
    "This portfolio is one of those ideas: an old TV that turns into a computer. Look through the folders to see what I've made."
  ],

  skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS", "UI/UX design", "Python", "Git"],

  education: [
    { school: "University of Piraeus", detail: "BSc in Computer Science", when: "In progress" }
  ],

  links: {
    github: "https://github.com/G-d1m",
    linkedin: "https://www.linkedin.com/in/george-d1mitrakopoulos"
  },

  // What the WWW icon opens: the animated site in www/ (its text is in www/js/data.js).
  // address is only what the address bar shows.
  home: {
    title: "George Dimitrakopoulos",
    url: "www/index.html",
    address: "www://george-dimitrakopoulos"
  },

  // The terminal that types to the visitor. Capitals and the "!" don't matter: "hi" works too.
  terminal: {
    lines: ["Hi", "That's Me", "And This Is My Portfolio", "", "Type HI! To Continue: "],
    answer: "HI!"
  },

  // Log in screen
  login: {
    user: "user1",
    hint: "What's 9+10?",
    answers: ["19", "21"]
  },

  // projects folder.  embed:false = the site refuses to load inside another page,
  // so the browser window shows an "open in a new tab" button instead.
  projects: [
    {
      name: "Dell'Angelo-menu",
      url: "https://dellangelo-menu.com/?v=3",
      embed: true,
      readme: [
        "Dell'Angelo - online menu",
        "=========================",
        "",
        "The online menu of Dell'Angelo Pizzeria, for desktop and tablet.",
        "",
        "It opens with an animated intro (logo, tagline, zoom) and then",
        "shows the menu on two pages with the proportions of the printed",
        "one. The pages scale as a whole, so every dish keeps its place",
        "next to the pictures on any screen.",
        "",
        "Built with",
        "  Vite + React, no other libraries",
        "  Fonts bundled with the site",
        "  Hosted on Cloudflare Workers",
        "",
        "Code",
        "  https://github.com/G-d1m/dellangelo-menu"
      ].join("\n")
    },
    {
      name: "pro-one-goalkeeping",
      url: "https://pro-one.georged1m.com",
      embed: true,
      readme: [
        "Pro One Goalkeeping",
        "===================",
        "",
        "Website for Pro One Goalkeeping Academy, a goalkeeper coaching",
        "service.",
        "",
        "One page with every section, video carousels, a light and a dark",
        "mode, and a booking form that sends requests straight to the",
        "coach. Works on desktop and phones.",
        "",
        "Built with",
        "  Plain HTML, CSS and JavaScript, no build step",
        "  Booking form through Web3Forms",
        "  Hosted on Cloudflare Workers",
        "",
        "Code",
        "  https://github.com/G-d1m/pro-one-goalkeeping"
      ].join("\n")
    },
    { name: "EVE", inProgress: true }
  ],

  // certificates folder. The names are also used by www/js/data.js to open them from the WWW page.
  certificates: [
    { name: "Responsive Web Design", image: "assets/img/certificates/responsive-web-design.png" },
    { name: "Google Ads Search", image: "assets/img/certificates/google-ads.png" },
    { name: "Coming soon", inProgress: true }
  ]
};

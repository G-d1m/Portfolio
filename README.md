# Portfolio

My portfolio as an old TV that turns into a computer.
Plain HTML, CSS and JavaScript. No build step, nothing to install.

## Run it

Open `index.html` in a browser, or in VS Code right-click it and choose
**Open with Live Server**.

## How it plays

1. White blast, then an old TV on channel 1.
2. One of the five channels works, picked at random on every visit. The others
   show static. Find the right one (click, or keys 1-5).
3. The TV takes two hits, the noise clears from the center and the portrait
   stays on a white screen, dissolving into it.
4. Terminals flood the screen for a moment, then one terminal types a message
   and waits for `HI!` (`hi`, `Hi` and `hi!` work too).
5. The picture switches off, then boot and log in. The hint says
   `What's 9+10?`; both `19` and `21` open it. The **X** on the log in window
   goes back to the TV, on a dead channel, and the hunt starts again.
6. Desktop: **projects**, **certificates**, **tv game** (a small jumping game
   that keeps the best score), **WWW** (a browser that opens on the animated
   home page in `www/`; the project sites open in it too), a clock, and a menu
   with **Turn off** that ends in static with the GitHub and LinkedIn links.
7. Windows pour out of their taskbar button when they open and are sucked
   back into it when they close or minimize (a "magic lamp").
8. Desktop icons can be dragged anywhere on the desktop. Dragging on the empty
   desktop draws a blue selection box; dragging one of the selected icons
   moves them all. They go back to their places when the page is reloaded.

## The WWW home page (`www/`)

What the WWW icon opens: a loud, scroll-driven page about me, built like a TV
broadcast with seven channels, one per colour bar of the test card.

- Switches on like a TV: a white line, static, then the colour bars lift away.
- Bars on the left fill one by one as you scroll through each channel; the bar
  on the right fills for the whole page. Click a bar, or press **1**-**7**, to
  jump to a channel with a burst of static.
- A 3D swarm of points (three.js) changes shape on every channel: sphere,
  double helix, icosahedron, torus knot, tunnel, wave, and finally the word
  HI!. The cursor pushes it away, clicks send a shockwave through it, and fast
  scrolling scatters it and makes the dust rush past.
- The name swells and changes colour around the cursor (a variable font) and
  the letters fly apart in 3D when you scroll away. Titles stretch and lean
  with scroll speed and glitch when their channel comes on.
- About: the text lights up word by word; a holographic card of the portrait
  tilts towards the pointer. Stack: a ball of skills you can drag and spin.
  Work: the cards slide sideways in 3D while the page is pinned. Experience:
  slabs stand up as they arrive. Education: a line draws itself through the
  years. Contact: letters get knocked away when the pointer touches them.
- Every click throws colour-bar confetti. Typing **H** **I** starts a party.
- With "reduce motion" switched on in the system, the page stays still.

Inside the WWW window, **Open it here** on a project opens it in the same
window, and **Show certificate** opens it in the desktop's picture viewer.
The browser's **Back** button returns to the home page exactly where the
visitor left it: the page is only hidden while another site is open (and stops
animating meanwhile), never reloaded.
Opened on its own (`www/index.html`), the page opens projects in a new tab and
shows certificates in place.

| What | Where |
|---|---|
| All its text (about, stack, work, experience, education, contact) | `www/js/data.js` |
| Name, links, project addresses, certificate pictures | `js/content.js` (shared with the desktop) |
| Colours, fonts, layout | `www/css/site.css`: the yellow screen, the dark text and the test card colours are at the top |
| The 3D swarm (shapes, glow, dust) | `www/js/scene.js` |
| Everything that moves | `www/js/site.js` |
| What the WWW icon opens | `home` in `js/content.js` |

## Change the content

Everything you can read on the site is in **`js/content.js`**: name, links,
the terminal lines, the log in answers, projects and certificates. The about
text, skills and education are still in that file but are not shown anywhere
since the ReadMe folder was removed.

| What | Where |
|---|---|
| Texts, links, projects, certificates | `js/content.js` |
| Portrait | `assets/img/me.webp` (a cut-out with a transparent background works best); its size, place and fade are under "Stage 2" in `css/tv.css` |
| Certificate pictures | `assets/img/certificates/` |
| Colours of the computer (retro gray theme) | top of `css/os.css` |
| TV, static, terminals look | `css/tv.css` |
| Timings of the intro | `js/intro.js` (`tuneIn`, `terminalBurst`, `openMainTerminal`) |
| Wallpaper | `assets/img/wallpaper.jpg` (set on `#os-desktop` in `css/os.css`) |
| Magic lamp (speed, shape) | `lamp()` in `js/os.js` |
| Desktop icons | `entries` in `showDesktop()` in `js/os.js`; where they start: `arrangeIcons()` |

## Before publishing

- [ ] Give the third certificate its real name (`certificates` in
      `js/content.js`, now "Coming soon").
- [ ] Check the Dell'Angelo link (`projects[0].url`).
- [ ] Push the Dell'Angelo menu (`git push` in that project) so its new
      header goes live and the menu can open inside the window.

### Showing a project inside the browser window

A project with `embed: true` loads inside the window on the desktop; with
`embed: false` its window shows an "open in a new tab" button instead.

A site only loads inside the window if it allows other pages to show it. The
Dell'Angelo menu decides that in its own `public/_headers`
(`frame-ancestors`). It allows this portfolio when it runs on `localhost` /
`127.0.0.1` (Live Server) or on an address ending in
`.georgedimi67.workers.dev`. If the portfolio is hosted anywhere else, add
that address to the same line and redeploy the menu.

Opened by double-clicking `index.html` (a `file://` address) the menu stays
blocked, because a file on disk can't be put on that list. Use Live Server.

## Files

```
index.html        the page: TV, white room, computer
css/base.css      fonts, variables, the opening blast
css/tv.css        TV screen, channel display, portrait, terminals
css/os.css        boot, log in, desktop, windows, power off
js/content.js     all the text and links
js/static.js      the static on the canvas + the sounds
js/intro.js       channels, flash, terminals, the HI! prompt
js/os.js          boot, log in, desktop, windows and their magic lamp, folders, browser, power off
js/game.js        the jumping game
js/main.js        starts everything, moves between the TV and the computer
assets/           portrait, certificates, fonts
www/              the home page the WWW icon opens (see above)
  index.html
  css/site.css
  js/data.js      its text
  js/scene.js     the 3D swarm
  js/site.js      side bars, channels, animations
  vendor/         three.js (only the parts the swarm uses)
  fonts/          Anybody variable font + its licence
```

## While working on it

Add these to the address to jump ahead:

- `?ch=3` the working channel is always 3
- `?skip=terminal` start at the terminal
- `?skip=boot` start at the boot screen
- `?skip=login` start at the log in screen
- `?skip=desktop` start on the desktop

## Credits

- Fonts: VT323 and IBM Plex Sans, both under the SIL Open Font License,
  bundled in `assets/fonts/`. The computer uses Arial where it is installed
  and IBM Plex Sans everywhere else.
- Anybody variable font (Etcetera Type Co), SIL Open Font License, in
  `www/fonts/` with its licence text.
- three.js, MIT License (notice kept at the top of `www/vendor/three.min.js`).
- Wallpaper: photo from Unsplash (id `x9YqzbKd8hU`), used under the Unsplash
  License.

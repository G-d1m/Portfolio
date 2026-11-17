/* ------------------------------------------------------------------
   Everything that moves on the WWW home page.

   The page is one TV with seven channels (sections). Scrolling
   changes channel: the bars on the left fill one by one, the bar on
   the right fills for the whole page, and the 3D swarm (js/scene.js)
   changes shape and colour. Keys 1-7 or the bars jump straight to a
   channel with a burst of static. Typing H I starts a party.

   The text comes from js/data.js.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var D = window.SITE;
  var doc = document, root = doc.documentElement, body = doc.body;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var framed = window.parent !== window;            // true inside the WWW window on the desktop

  // The test card, left to right. Same values as --c0..--c6 in css/site.css.
  var COLORS = ["#ececec", "#f5f353", "#12d6dc", "#1cc21c", "#e23be2", "#f20000", "#4d5bff"];
  function toRgb(list) {
    return list.map(function (hex) {
      var n = parseInt(hex.slice(1), 16);
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    });
  }
  var INK = "#0b0a3a";                               // the dark text colour, as in css/site.css
  // Colours that show up on the yellow screen (no white, no yellow)
  var ON_YELLOW = [COLORS[4], COLORS[5], COLORS[6], COLORS[2], COLORS[3]];
  var CONFETTI = [INK, COLORS[2], COLORS[3], COLORS[4], COLORS[5], COLORS[6]];
  // The swarm's two colours on each channel, deep enough to read on yellow
  var SWARM_A = toRgb(["#2f3dff", "#e23be2", INK, "#11801a", "#e23be2", "#f20000", "#2f3dff"]);
  var SWARM_B = toRgb([INK, "#f20000", "#0c8f95", INK, INK, INK, "#e23be2"]);
  var SWARM_X = [0.6, 0.8, 0.58, 0, 0.6, 0, 0.5];    // where the swarm sits, as a share of half the screen
  var SWARM_OPACITY = [0.85, 0.5, 0.42, 0.4, 0.5, 0.32, 0.95];   // lighter where it sits behind text

  /* ====================== Small helpers ====================== */

  function $(sel, from) { return (from || doc).querySelector(sel); }
  function $$(sel, from) { return [].slice.call((from || doc).querySelectorAll(sel)); }
  function el(tag, className, text) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function hue(h) {
    h = h - Math.floor(h);
    return [clamp(Math.abs(h * 6 - 3) - 1, 0, 1), clamp(2 - Math.abs(h * 6 - 2), 0, 1), clamp(2 - Math.abs(h * 6 - 4), 0, 1)];
  }
  // Frame-rate independent easing towards a target
  function follow(current, target, speed, dt) { return lerp(current, target, 1 - Math.exp(-speed * dt)); }

  function letters(node, text) {
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var span = el("span", "l", text[i]);
      span.setAttribute("aria-hidden", "true");
      node.appendChild(span);
      out.push(span);
    }
    return out;
  }

  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=?";
  // Letters flicker through random characters before they settle on the new text
  function scramble(node, text, ms) {
    if (calm) { node.textContent = text; return; }
    var len = Math.max(node.textContent.length, text.length), start = performance.now();
    (function step(now) {
      var t = clamp((now - start) / ms, 0, 1), out = "";
      for (var i = 0; i < len; i++) {
        if (t >= 0.3 + 0.7 * i / len) out += text[i] || "";
        else out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.textContent = out;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ====================== Static ====================== */

  function Snow(canvas, w, h) {
    canvas.width = w; canvas.height = h;
    this.ctx = canvas.getContext("2d");
    this.img = this.ctx.createImageData(w, h);
    this.px = new Uint32Array(this.img.data.buffer);
    this.w = w;
  }
  Snow.prototype.draw = function () {
    var px = this.px, n = px.length, band = (Math.random() * (n / this.w)) | 0;
    for (var i = 0; i < n; i++) {
      var v = (Math.random() * 255) | 0;
      if (((i / this.w) | 0) - band < 6 && ((i / this.w) | 0) >= band) v = v >> 2;   // a dark rolling band
      px[i] = 0xff000000 | (v << 16) | (v << 8) | v;
    }
    this.ctx.putImageData(this.img, 0, 0);
  };

  /* ====================== Build the page from data.js ====================== */

  var segs = [], heroLetters = [], words = [], tags = [], cards = [], slabs = [], steps = [];

  function buildRail() {
    var rail = $("#rail");
    D.channels.forEach(function (name, i) {
      var button = el("button", "seg");
      button.type = "button";
      button.dataset.ch = i;
      button.setAttribute("aria-label", "Channel " + (i + 1) + ": " + name);
      button.appendChild(el("i", "seg-fill"));
      button.appendChild(el("span", "seg-num", String(i + 1)));
      button.appendChild(el("span", "seg-name", name));
      button.addEventListener("click", function () { jump(i); });
      rail.appendChild(button);
      segs.push({ el: button, f: -1 });
    });
  }

  function buildHero() {
    var h1 = $("#hero-name");
    h1.setAttribute("aria-label", D.first + " " + D.last);
    [D.first, D.last].forEach(function (word) {
      var line = el("span", "line");
      letters(line, word).forEach(function (span) {
        var n = heroLetters.length;
        span.style.setProperty("--lc", ON_YELLOW[n % ON_YELLOW.length]);
        span.style.setProperty("--rz", rnd(-50, 50).toFixed(0) + "deg");
        heroLetters.push({
          el: span, k: 0, written: "",
          // where the letter flies when you scroll away: x, y, z, and turns around x, y, z
          fly: [rnd(-1, 1), rnd(-1.3, 0.3), rnd(0.2, 1), rnd(-1, 1), rnd(-1, 1), rnd(-0.6, 0.6)]
        });
      });
      h1.appendChild(line);
    });
    $("#role-text").textContent = D.hero.role;
    $("#role-stack").textContent = D.hero.stack[0];
    $("#hero-text").textContent = D.hero.text;
    if (!fine) $(".hint").textContent = "Scroll, or tap the bars to change channel";
  }

  function buildAbout() {
    var lead = $("#about-lead");
    D.about.lead.split(" ").forEach(function (word, i) {
      if (i) lead.appendChild(doc.createTextNode(" "));
      var span = el("span", "w" + (calm ? " lit" : ""), word);
      lead.appendChild(span);
      words.push(span);
    });
    $("#about-more").textContent = D.about.more;

    var facts = $("#facts");
    D.about.facts.forEach(function (f) {
      facts.appendChild(el("dt", "", f[0]));
      facts.appendChild(el("dd", "", f[1]));
    });

    var stats = $("#stats");
    D.about.stats.forEach(function (s) {
      var li = el("li"), num = el("b", "", calm ? String(s[0]) : "0");
      num.dataset.to = s[0];
      li.appendChild(num);
      li.appendChild(el("span", "", s[1]));
      stats.appendChild(li);
    });

    $("#holo-img").src = D.photo;
    $("#holo-name").textContent = D.first + " " + D.last;
  }

  function buildStack() {
    var sphere = $("#sphere"), list = D.stack.tags, n = list.length, golden = Math.PI * (3 - Math.sqrt(5));
    sphere.setAttribute("aria-label", "Skills: " + list.join(", ") + ".");
    list.forEach(function (name, i) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      var tag = el("span", "tag", name);
      tag.setAttribute("aria-hidden", "true");
      tag.style.setProperty("--tc", ON_YELLOW[i % ON_YELLOW.length]);
      tag.style.setProperty("--fs", (name.length > 12 ? 17 : name.length > 6 ? 21 : 27) + "px");
      tag.addEventListener("pointerenter", function () { tag.classList.add("hot"); sphereState.hover = true; });
      tag.addEventListener("pointerleave", function () { tag.classList.remove("hot"); sphereState.hover = false; });
      sphere.appendChild(tag);
      tags.push({ el: tag, x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    });

    var langs = $("#langs");
    D.stack.languages.forEach(function (l) {
      var li = el("li", "", l[0]);
      li.appendChild(el("span", "", l[1]));
      langs.appendChild(li);
    });

    [["#mq-1", 0, "var(--c6)"], ["#mq-2", 1, "var(--c4)"]].forEach(function (cfg) {
      var row = $(cfg[0]);
      row.style.setProperty("--mc", cfg[2]);
      for (var k = 0; k < 3; k++) {
        D.stack.rows[cfg[1]].forEach(function (word) {
          row.appendChild(el("span", "", word));
          row.appendChild(el("i"));
        });
      }
    });
  }

  var CARD_COLORS = { dellangelo: COLORS[5], proone: COLORS[3], eve: COLORS[4] };

  function buildWork() {
    var track = $("#work-track");
    $("#work-all").textContent = D.work.length;

    D.work.forEach(function (w) {
      var card = el("article", "card");
      card.style.setProperty("--pc", CARD_COLORS[w.art] || COLORS[3]);
      var inner = el("div", "card-in");

      var art = el("div", "card-art art-" + w.art);
      art.setAttribute("aria-hidden", "true");
      if (w.art === "dellangelo") {
        art.appendChild(el("div", "pie"));
        art.appendChild(el("p", "steam", "Dell'Angelo"));
      } else if (w.art === "proone") {
        art.appendChild(el("div", "pitch"));
        art.appendChild(el("div", "goal"));
        art.appendChild(el("div", "ball"));
        art.appendChild(el("p", "glove", "Saved!"));
      } else {
        var canvas = el("canvas");
        art.appendChild(canvas);
        art.appendChild(el("p", "nosig", "NO SIGNAL"));
        eveSnow = new Snow(canvas, 96, 60);
      }
      inner.appendChild(art);

      var text = el("div", "card-body");
      text.appendChild(el("p", "card-kind", w.kind));
      text.appendChild(el("h3", "", w.title));
      text.appendChild(el("p", "card-text", w.text));
      if (w.stack.length) {
        var chips = el("ul", "chips");
        w.stack.forEach(function (s) { chips.appendChild(el("li", "", s)); });
        text.appendChild(chips);
      }
      if (!w.wip) {
        var actions = el("div", "card-actions");
        if (w.url) {
          var open = el("button", "btn magnet", framed ? "Open it here" : "Open the site");
          open.type = "button";
          open.addEventListener("click", function () { openProject(w); });
          actions.appendChild(open);
        }
        if (w.code) {
          var code = el("a", "btn ghost magnet", "See the code");
          code.href = w.code; code.target = "_blank"; code.rel = "noopener";
          actions.appendChild(code);
        }
        text.appendChild(actions);
      }
      inner.appendChild(text);
      card.appendChild(inner);
      track.appendChild(card);

      // Leaning the card towards the pointer, with a light that follows it
      inner.addEventListener("pointermove", function (e) {
        if (calm) return;
        var r = inner.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        inner.style.setProperty("--hx", ((px - 0.5) * 18).toFixed(2) + "deg");
        inner.style.setProperty("--hy", ((0.5 - py) * 14).toFixed(2) + "deg");
        inner.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        inner.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });
      inner.addEventListener("pointerleave", function () {
        inner.style.setProperty("--hx", "0deg");
        inner.style.setProperty("--hy", "0deg");
      });

      cards.push({ el: card, left: 0, w: 0, written: "" });
    });
  }

  function buildExperience() {
    var host = $("#slabs");
    D.experience.forEach(function (x) {
      var slab = el("article", "slab");
      slab.appendChild(el("p", "slab-when", x.when));
      var text = el("div");
      text.appendChild(el("h3", "", x.role));
      text.appendChild(el("p", "slab-where", x.where));
      text.appendChild(el("p", "slab-text", x.text));
      var chips = el("ul", "chips");
      x.tags.forEach(function (t) { chips.appendChild(el("li", "", t)); });
      text.appendChild(chips);
      slab.appendChild(text);
      host.appendChild(slab);
      slabs.push({ el: slab, written: "" });
    });
  }

  function buildEducation() {
    var host = $("#steps");
    D.education.forEach(function (x) {
      var li = el("li", "step" + (calm ? " on" : ""));
      var text = el("div");
      text.appendChild(el("p", "step-when", x.when));
      text.appendChild(el("h3", "", x.title));
      text.appendChild(el("p", "", x.detail));
      if (x.note) text.appendChild(el("span", "step-note", x.note));
      li.appendChild(text);

      if (x.image) {
        var button = el("button", "cert magnet");
        button.type = "button";
        button.setAttribute("aria-label", "Show the " + x.title + " certificate");
        var img = el("img");
        img.src = x.image; img.alt = ""; img.loading = "lazy";
        button.appendChild(img);
        button.appendChild(el("span", "", "Show certificate"));
        button.addEventListener("click", function () { openCertificate(x); });
        li.appendChild(button);
      }
      host.appendChild(li);
      steps.push({ el: li, y: 0, on: calm });
    });
  }

  var shoutLetters = [];

  function buildContact() {
    var h2 = $("#contact-title");
    h2.setAttribute("aria-label", D.contact.title);
    D.contact.title.split(" ").forEach(function (word, i) {
      if (i) h2.appendChild(doc.createTextNode(" "));
      var w = el("span", "word");
      letters(w, word).forEach(function (span, k) {
        span.style.setProperty("--lc", ON_YELLOW[(i * 3 + k) % ON_YELLOW.length]);
        span.addEventListener("pointerenter", function () { kick(span); });
        shoutLetters.push(span);
      });
      h2.appendChild(w);
    });
    $("#contact-text").textContent = D.contact.text;

    var links = $("#contact-links"), fills = [COLORS[2], COLORS[4]];
    D.contact.links.forEach(function (l, i) {
      var a = el("a", "big-link magnet", l[0]);
      a.href = l[1]; a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--lc", fills[i % fills.length]);
      links.appendChild(a);
    });
    $("#rewind").addEventListener("click", function () { jump(0); });
  }

  // A letter of the big contact line gets knocked away, then springs back
  function kick(span) {
    if (calm || span.kicked) return;
    span.kicked = true;
    span.classList.add("hit");
    span.style.transform = "translate(" + rnd(-50, 50).toFixed(0) + "px," + rnd(-80, 20).toFixed(0) + "px) rotate(" + rnd(-60, 60).toFixed(0) + "deg) scale(" + rnd(0.7, 1.4).toFixed(2) + ")";
    setTimeout(function () {
      span.style.transform = "";
      span.classList.remove("hit");
      setTimeout(function () { span.kicked = false; }, 400);
    }, 520);
  }

  /* ====================== Opening things in the desktop's windows ====================== */

  // Inside the WWW window the desktop opens the site in the same window; on its own it opens a new tab
  function openProject(w) {
    if (framed) window.parent.postMessage({ type: "open-project", name: w.name }, "*");
    else window.open(w.url, "_blank", "noopener");
  }

  function openCertificate(x) {
    if (framed && x.cert) { window.parent.postMessage({ type: "open-certificate", name: x.cert }, "*"); return; }
    $("#lightbox-img").src = x.image;
    $("#lightbox-img").alt = x.title + " certificate";
    $("#lightbox-cap").textContent = x.title;
    $("#lightbox").hidden = false;
    $("#lightbox-close").focus();
  }

  function closeLightbox() { $("#lightbox").hidden = true; }

  /* ====================== Measuring ====================== */

  var view = { w: 1, h: 1, max: 1 };
  var sections = [];
  var nameEl, workEl, workTrack, sphereEl, pathEl, pathSvg, pathDraw, pathGhost, pathHead;
  var workDistance = 0, pathLen = 0, pathShown = 0;

  // The surname fills the width of the screen
  function fitName() {
    nameEl.style.setProperty("--name-size", "100px");
    heroLetters.forEach(function (l) { l.el.style.setProperty("--wd", 74); l.el.style.setProperty("--wg", 640); l.written = ""; });
    var widest = 0;
    $$(".line", nameEl).forEach(function (line) {
      var ls = line.children, a = ls[0].getBoundingClientRect(), b = ls[ls.length - 1].getBoundingClientRect();
      widest = Math.max(widest, b.right - a.left);
    });
    var size = 100 * (nameEl.clientWidth * 0.8) / Math.max(1, widest);   // room for letters to swell
    size = Math.min(size, view.h * 0.3, 260);
    nameEl.style.setProperty("--name-size", size.toFixed(1) + "px");
  }

  function buildPath() {
    var gw = pathSvg.getBoundingClientRect().width, H = pathEl.offsetHeight, x0 = gw * 0.32;
    pathSvg.setAttribute("viewBox", "0 0 " + gw + " " + H);
    var d = "M " + x0 + " 0", prevY = 0;
    steps.forEach(function (s, i) {
      var y = s.el.offsetTop + 30, swing = i % 2 ? gw * 0.04 : gw * 0.96;
      s.y = y;
      d += " C " + swing + " " + (prevY + (y - prevY) * 0.35).toFixed(1) + ", " + swing + " " + (prevY + (y - prevY) * 0.65).toFixed(1) + ", " + x0 + " " + y;
      prevY = y;
    });
    d += " L " + x0 + " " + H;
    pathGhost.setAttribute("d", d);
    pathDraw.setAttribute("d", d);
    pathLen = pathDraw.getTotalLength();
    pathDraw.style.strokeDasharray = pathLen + " " + pathLen;
    pathDraw.style.strokeDashoffset = calm ? 0 : pathLen;
    pathShown = calm ? pathLen : 0;

    $$(".path-dot, .path-head", pathSvg).forEach(function (n) { n.remove(); });
    steps.forEach(function (s) {
      var dot = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "path-dot" + (s.on ? " on" : ""));
      dot.setAttribute("cx", x0); dot.setAttribute("cy", s.y); dot.setAttribute("r", 8);
      pathSvg.appendChild(dot);
      s.dot = dot;
    });
    pathHead = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
    pathHead.setAttribute("class", "path-head");
    pathHead.setAttribute("r", 7);
    pathSvg.appendChild(pathHead);
  }

  function measure() {
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    fitName();

    // The work channel is as tall as the cards are wide, so scrolling down slides them sideways
    workDistance = Math.max(0, workTrack.scrollWidth - view.w);
    workEl.style.height = Math.round(workDistance + view.h) + "px";
    cards.forEach(function (c) { c.left = c.el.offsetLeft; c.w = c.el.offsetWidth; c.written = ""; });

    sphereEl.style.setProperty("--sph", (sphereEl.clientWidth / 520).toFixed(3));

    var y = window.scrollY;
    sections = $$(".ch").map(function (s) {
      var r = s.getBoundingClientRect();
      return { el: s, top: r.top + y, h: r.height, title: $(".ch-title", s) };
    });
    view.max = Math.max(1, root.scrollHeight - view.h);

    buildPath();

    // Marks on the right bar where each channel starts
    var meter = $(".meter");
    $$(".meter-tick", meter).forEach(function (t) { t.remove(); });
    sections.forEach(function (s, i) {
      if (!i) return;
      var tick = el("i", "meter-tick");
      tick.style.top = (clamp(s.top / view.max, 0, 1) * 100).toFixed(2) + "%";
      meter.appendChild(tick);
    });

    if (swarm) swarm.resize(view.w, view.h);
    sizeFx();
    segs.forEach(function (s) { s.f = -1; });
    slabs.forEach(function (s) { s.written = ""; });
  }

  var measureTimer = 0;
  function remeasure() {
    clearTimeout(measureTimer);
    measureTimer = setTimeout(measure, 80);
  }

  /* ====================== Channels and the side bars ====================== */

  var active = -1;
  var meterRail, meterHead, osdCh, osdName, lastPercent = -1, lastP = -1;

  function setActive(i) {
    var first = active === -1;
    active = i;
    root.style.setProperty("--c", COLORS[i]);
    osdCh.textContent = "CH " + pad(i + 1);
    osdName.textContent = D.channels[i];
    segs.forEach(function (s, k) { s.el.classList.toggle("on", k === i); });

    var title = sections[i] && sections[i].title;
    if (title && !first && !calm) {
      title.classList.remove("glitching");
      void title.offsetWidth;                         // restart the animation
      title.classList.add("glitching");
    }
  }

  function updateChannels(y) {
    var mid = y + view.h * 0.5, now = 0;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (mid >= s.top) now = i;
      var span = Math.min(s.h, view.max - s.top);
      var f = span > 1 ? clamp((y - s.top) / span, 0, 1) : (y >= view.max - 2 ? 1 : 0);
      if (Math.abs(f - segs[i].f) > 0.002) {
        segs[i].f = f;
        segs[i].el.style.setProperty("--f", f.toFixed(4));
      }
    }

    var p = clamp(y / view.max, 0, 1);
    if (Math.abs(p - lastP) > 0.0005) {
      lastP = p;
      meterRail.style.setProperty("--p", p.toFixed(4));
      var percent = Math.round(p * 100);
      if (percent !== lastPercent) { lastPercent = percent; meterHead.textContent = pad(percent) + "%"; }
    }
    if (now !== active) setActive(now);
  }

  // Channel change: a quick burst of static, and you're there
  var cutSnow, cutUntil = 0;
  function jump(i) {
    var s = sections[i];
    if (!s) return;
    var target = Math.min(view.max, i ? s.top + 1 : 0);
    if (calm) { window.scrollTo(0, target); return; }
    var cut = $("#cut");
    cut.classList.add("on");
    cutUntil = performance.now() + 280;
    setTimeout(function () { window.scrollTo(0, target); }, 70);
    setTimeout(function () { cut.classList.remove("on"); }, 280);
  }

  /* ====================== CH 01: the name ====================== */

  var heroFoot, heroHint, nameTilt = "";

  function updateHero(y, dt) {
    var heroH = sections[0].h;
    if (y > heroH * 1.1) return;
    var hp = clamp(y / heroH, 0, 1);

    // Read every letter's place first, then write, so the browser lays the page out only once
    var reach = Math.max(110, view.w * 0.1), centers = [];
    for (var i = 0; i < heroLetters.length; i++) {
      var r = heroLetters[i].el.getBoundingClientRect();
      centers.push(r.left + r.width / 2, r.top + r.height / 2);
    }

    for (i = 0; i < heroLetters.length; i++) {
      var l = heroLetters[i];
      var dx = mouse.x - centers[i * 2], dy = mouse.y - centers[i * 2 + 1];
      var near = mouse.on ? Math.exp(-(dx * dx + dy * dy) / (reach * reach)) : 0;
      var idle = (0.5 + 0.5 * Math.sin(time * 2.4 - i * 0.55)) * (mouse.on ? 0.12 : 0.45);
      l.k = calm ? 0 : follow(l.k, Math.max(near, idle), 9, dt);

      var f = l.fly, out = "none", op = 1;
      if (hp > 0.001 && !calm) {
        out = "translate3d(" + (f[0] * hp * view.w * 0.4).toFixed(1) + "px," + (f[1] * hp * view.h * 0.6).toFixed(1) + "px," + (f[2] * hp * 700).toFixed(1) + "px) " +
          "rotateX(" + (f[3] * hp * 240).toFixed(1) + "deg) rotateY(" + (f[4] * hp * 240).toFixed(1) + "deg) rotateZ(" + (f[5] * hp * 140).toFixed(1) + "deg)";
        op = clamp(1 - hp * 1.25, 0, 1);
      }
      var key = l.k.toFixed(3) + out + op;
      if (key === l.written) continue;
      l.written = key;
      l.el.style.setProperty("--k", l.k.toFixed(3));
      l.el.style.setProperty("--wd", (74 + l.k * 62).toFixed(1));
      l.el.style.setProperty("--wg", (640 + l.k * 260).toFixed(0));
      if (!l.el.classList.contains("drop")) {
        l.el.style.transform = out;
        l.el.style.opacity = op;
      }
    }

    var tilt = calm ? "none" : "rotateY(" + (mouse.sx * 9).toFixed(2) + "deg) rotateX(" + (-mouse.sy * 6).toFixed(2) + "deg)";
    if (tilt !== nameTilt) { nameTilt = tilt; nameEl.style.transform = tilt; }
    heroFoot.style.transform = "translate3d(0," + (-hp * 90).toFixed(1) + "px,0)";
    heroFoot.style.opacity = clamp(1 - hp * 1.8, 0, 1);
    heroHint.style.opacity = clamp(1 - hp * 4, 0, 1);
  }

  // The stack chip next to the role cycles through the tools
  function cycleRole() {
    var node = $("#role-stack"), i = 0;
    setInterval(function () {
      if (doc.hidden || window.scrollY > view.h) return;
      i = (i + 1) % D.hero.stack.length;
      scramble(node, D.hero.stack[i], 600);
    }, 2200);
  }

  /* ====================== CH 02: about ====================== */

  var litWords = -1, holoEl, holoCard, holoHover = false;

  function updateAbout() {
    if (calm) return;
    var r = $("#about-lead").getBoundingClientRect();
    if (r.bottom < -200 || r.top > view.h + 200) return;
    var p = clamp((view.h * 0.86 - r.top) / (r.height + view.h * 0.32), 0, 1);
    var lit = Math.floor(p * words.length * 1.08);
    if (lit === litWords) return;
    litWords = lit;
    words.forEach(function (w, i) {
      w.classList.toggle("lit", i < lit);
      w.classList.toggle("hot", i === lit - 1 && lit < words.length);
    });
  }

  function wireHolo() {
    holoEl = $("#holo"); holoCard = $(".holo-card", holoEl);
    if (calm) return;
    holoEl.addEventListener("pointermove", function (e) {
      holoHover = true;
      var r = holoCard.getBoundingClientRect(), px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
      tiltHolo((0.5 - py) * 26, (px - 0.5) * 32, px, py);
    });
    holoEl.addEventListener("pointerleave", function () { holoHover = false; });
  }

  function tiltHolo(rx, ry, px, py) {
    holoCard.style.setProperty("--rx", rx.toFixed(2) + "deg");
    holoCard.style.setProperty("--ry", ry.toFixed(2) + "deg");
    holoCard.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    holoCard.style.setProperty("--my", (py * 100).toFixed(1) + "%");
  }

  function updateHoloIdle(y) {
    if (calm || holoHover || !inView(1, y, 0)) return;
    tiltHolo(Math.sin(time * 0.9) * 6, Math.cos(time * 0.7) * 10, 0.5 + Math.cos(time * 0.7) * 0.4, 0.5 + Math.sin(time * 0.9) * 0.3);
  }

  // The numbers spin like a slot machine, then land
  function wireStats() {
    if (calm || !("IntersectionObserver" in window)) {
      $$("#stats b").forEach(function (b) { b.textContent = b.dataset.to; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        $$("#stats b").forEach(function (b, k) {
          var start = performance.now() + k * 180, to = b.dataset.to;
          (function step(now) {
            var t = (now - start) / 1300;
            b.textContent = t < 0.85 ? String((Math.random() * 10) | 0) : to;
            if (t < 0.85) requestAnimationFrame(step);
          })(start);
        });
      });
    }, { threshold: 0.6 });
    io.observe($("#stats"));
  }

  /* ====================== CH 03: the ball of skills ====================== */

  var sphereState = { vx: 0.35, vy: 0.12, drag: null, hover: false };

  function rotateTags(ay, ax) {
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      var x = t.x * cy + t.z * sy, z = -t.x * sy + t.z * cy;            // around y
      var y = t.y * cx - z * sx; z = t.y * sx + z * cx;                   // around x
      t.x = x; t.y = y; t.z = z;
    }
  }

  function updateSphere(dt, y) {
    if (!inView(2, y, 100)) return;
    var st = sphereState;
    if (!st.drag && !calm) {
      var calmDown = st.hover ? 0.2 : 1;
      st.vx = follow(st.vx, 0.35 * calmDown, 1.5, dt);
      st.vy = follow(st.vy, 0.1 * calmDown, 1.5, dt);
      rotateTags(st.vx * dt, st.vy * dt);
    }
    var R = sphereEl.clientWidth * 0.39;
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i], depth = (t.z + 1) / 2;
      t.el.style.transform = "translate(-50%,-50%) translate3d(" + (t.x * R).toFixed(1) + "px," + (t.y * R).toFixed(1) + "px,0) scale(" + (0.5 + depth * 0.65).toFixed(3) + ")";
      t.el.style.opacity = (0.18 + depth * 0.82).toFixed(3);
      t.el.style.zIndex = Math.round(depth * 100);
    }
  }

  function wireSphere() {
    var st = sphereState, lastX = 0, lastY = 0, lastT = 0;
    sphereEl.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      st.drag = e.pointerId;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      sphereEl.classList.add("grabbing");
      try { sphereEl.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    });
    sphereEl.addEventListener("pointermove", function (e) {
      if (st.drag !== e.pointerId) return;
      var now = performance.now(), dts = Math.max(0.008, (now - lastT) / 1000);
      var ay = (e.clientX - lastX) * 0.009, ax = -(e.clientY - lastY) * 0.009;
      rotateTags(ay, ax);
      st.vx = ay / dts; st.vy = ax / dts;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    });
    function release(e) {
      if (st.drag !== e.pointerId) return;
      st.drag = null;
      st.vx = clamp(st.vx, -14, 14); st.vy = clamp(st.vy, -14, 14);
      sphereEl.classList.remove("grabbing");
    }
    sphereEl.addEventListener("pointerup", release);
    sphereEl.addEventListener("pointercancel", release);
  }

  // Two rows of huge words that run sideways, faster and slanted when you scroll fast
  var marquee = [{ x: 0, dir: -1 }, { x: 0, dir: 1 }];
  function updateMarquee(dt, y) {
    if (!inView(2, y, 0)) return;
    var boost = Math.abs(scroll.smoothVel) * 0.35, skew = clamp(-scroll.smoothVel / 90, -22, 22);
    [$("#mq-1"), $("#mq-2")].forEach(function (row, i) {
      var m = marquee[i], set = row.scrollWidth / 3;
      if (!calm) m.x += m.dir * (50 + boost) * dt;
      if (m.x < -set) m.x += set;
      if (m.x > 0) m.x -= set;
      row.style.transform = "translate3d(" + m.x.toFixed(1) + "px,0,0) skewX(" + (calm ? 0 : skew).toFixed(2) + "deg)";
    });
  }

  /* ====================== CH 04: work, pinned while the cards slide ====================== */

  var workNow = -1;
  function updateWork(y) {
    var s = sections[3];
    if (!inView(3, y, 50)) return;
    var p = clamp((y - s.top) / Math.max(1, s.h - view.h), 0, 1);
    var tx = -p * workDistance;
    workTrack.style.transform = "translate3d(" + tx.toFixed(1) + "px,0,0)";

    var nearest = 0, best = Infinity;
    cards.forEach(function (c, i) {
      var off = (c.left + c.w / 2 + tx - view.w / 2) / view.w;
      if (Math.abs(off) < best) { best = Math.abs(off); nearest = i; }
      var t = calm ? "none" : "rotateY(" + clamp(-off * 60, -62, 62).toFixed(2) + "deg) translateZ(" + (-Math.abs(off) * 420).toFixed(1) + "px) translateY(" + (Math.sin(off * 2.4) * 22).toFixed(1) + "px)";
      if (t !== c.written) {
        c.written = t;
        c.el.style.transform = t;
        c.el.style.opacity = calm ? 1 : clamp(1.15 - Math.abs(off) * 0.9, 0.25, 1).toFixed(3);
      }
    });
    if (nearest !== workNow) { workNow = nearest; $("#work-now").textContent = nearest + 1; }
  }

  /* ====================== CH 05: experience, slabs that stand up ====================== */

  function updateSlabs(y) {
    if (calm || !inView(4, y, 200)) return;
    slabs.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var enter = clamp((view.h - r.top) / (view.h * 0.55), 0, 1);
      var leave = clamp(r.bottom / (view.h * 0.4), 0, 1);
      var e = 1 - Math.pow(1 - enter, 3);
      var rx = (1 - e) * 72 - (1 - leave) * 40, tz = (1 - e) * -320 - (1 - leave) * 120;
      var key = rx.toFixed(1) + tz.toFixed(0);
      if (key === s.written) return;
      s.written = key;
      s.el.style.setProperty("--rx", rx.toFixed(2) + "deg");
      s.el.style.setProperty("--tz", tz.toFixed(1) + "px");
      s.el.style.setProperty("--op", (0.15 + 0.85 * e * leave).toFixed(3));
    });
  }

  /* ====================== CH 06: education, a line that draws itself ====================== */

  function pathLengthAtY(target) {
    var lo = 0, hi = pathLen;
    for (var i = 0; i < 14; i++) {
      var mid = (lo + hi) / 2;
      if (pathDraw.getPointAtLength(mid).y < target) lo = mid; else hi = mid;
    }
    return lo;
  }

  function updatePath(y, dt) {
    if (calm || !pathLen || !inView(5, y, 100)) return;
    var r = pathEl.getBoundingClientRect();
    var want = pathLengthAtY(clamp(view.h * 0.62 - r.top, 0, r.height));
    pathShown = follow(pathShown, want, 6, dt);
    pathDraw.style.strokeDashoffset = (pathLen - pathShown).toFixed(1);
    var head = pathDraw.getPointAtLength(pathShown);
    pathHead.setAttribute("cx", head.x.toFixed(1));
    pathHead.setAttribute("cy", head.y.toFixed(1));
    steps.forEach(function (s) {
      var on = head.y >= s.y - 6;
      if (on === s.on) return;
      s.on = on;
      s.el.classList.toggle("on", on);
      s.dot.classList.toggle("on", on);
      if (on) {
        var b = s.dot.getBoundingClientRect();
        burst(b.left + b.width / 2, b.top + b.height / 2, COLORS[5], 10);
      }
    });
  }

  /* ====================== Pointer: cursor, magnets ====================== */

  var mouse = { x: -9999, y: -9999, on: false, sx: 0, sy: 0, rx: 0, ry: 0 };
  var cursorEl, dotEl, ringEl;

  function wirePointer() {
    cursorEl = $("#cursor"); dotEl = $(".cursor-dot"); ringEl = $(".cursor-ring");
    var custom = fine && !calm;
    if (custom) body.classList.add("has-cursor");

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") { mouse.on = false; return; }
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!mouse.on) { mouse.rx = mouse.x; mouse.ry = mouse.y; }
      mouse.on = true;
      cursorEl.classList.remove("out");
      if (custom) dotEl.style.transform = "translate3d(" + mouse.x + "px," + mouse.y + "px,0)";
    }, { passive: true });
    doc.addEventListener("mouseleave", function () { mouse.on = false; cursorEl.classList.add("out"); });
    window.addEventListener("blur", function () { mouse.on = false; });

    doc.addEventListener("pointerover", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, .sphere, .shout .l") : null;
      cursorEl.classList.toggle("hover", !!t);
    });
    window.addEventListener("pointerdown", function (e) {
      cursorEl.classList.add("down");
      if (e.button === 0 && !e.target.closest(".lightbox")) burst(e.clientX, e.clientY);
    });
    window.addEventListener("pointerup", function () { cursorEl.classList.remove("down"); });

    if (!custom) return;
    // Buttons lean towards the pointer
    $$(".magnet").forEach(function (m) {
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.classList.add("pulling");
        m.style.transform = "translate(" + (dx * 0.3).toFixed(1) + "px," + (dy * 0.4).toFixed(1) + "px)";
      });
      m.addEventListener("pointerleave", function () {
        m.classList.remove("pulling");
        m.style.transform = "";
      });
    });
  }

  function updateCursor(dt) {
    var nx = mouse.on ? (mouse.x / view.w) * 2 - 1 : 0, ny = mouse.on ? (mouse.y / view.h) * 2 - 1 : 0;
    mouse.sx = follow(mouse.sx, nx, 3, dt);
    mouse.sy = follow(mouse.sy, ny, 3, dt);
    if (!body.classList.contains("has-cursor")) return;
    mouse.rx = follow(mouse.rx, mouse.x, 16, dt);
    mouse.ry = follow(mouse.ry, mouse.y, 16, dt);
    ringEl.style.transform = "translate3d(" + mouse.rx.toFixed(1) + "px," + mouse.ry.toFixed(1) + "px,0)";
  }

  /* ====================== Bursts of colour on click ====================== */

  var fx, fxc, bits = [], rings = [], fxDirty = false, kickScatter = 0;

  function sizeFx() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = Math.round(view.w * r);
    fx.height = Math.round(view.h * r);
    fxc.setTransform(r, 0, 0, r, 0, 0);
  }

  function burst(x, y, color, count) {
    if (calm) return;
    rings.push({ x: x, y: y, life: 0, max: 0.75, c: color || CONFETTI[(Math.random() * CONFETTI.length) | 0] });
    count = count || 28;
    for (var i = 0; i < count; i++) {
      var a = rnd(0, Math.PI * 2), sp = rnd(240, 820);
      bits.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 260,
        rot: rnd(0, 6), vr: rnd(-14, 14), w: rnd(5, 14), h: rnd(10, 36),
        c: CONFETTI[i % CONFETTI.length], life: 0, max: rnd(0.7, 1.4)
      });
    }
    if (bits.length > 500) bits.splice(0, bits.length - 500);
    if (swarm) swarm.pulse((x / view.w) * 2 - 1, -(y / view.h) * 2 + 1);
    kickScatter = 0.4;
  }

  function drawFx(dt) {
    if (!bits.length && !rings.length) {
      if (fxDirty) { fxc.clearRect(0, 0, view.w, view.h); fxDirty = false; }
      return;
    }
    fxDirty = true;
    fxc.clearRect(0, 0, view.w, view.h);
    var big = Math.max(view.w, view.h) * 0.32, i;

    for (i = rings.length - 1; i >= 0; i--) {
      var g = rings[i];
      g.life += dt;
      var t = g.life / g.max;
      if (t >= 1) { rings.splice(i, 1); continue; }
      var e = 1 - Math.pow(1 - t, 3), rad = 6 + e * big;
      fxc.globalAlpha = 1 - t;
      fxc.lineWidth = 14 * (1 - t) + 1;
      fxc.strokeStyle = g.c;
      fxc.beginPath(); fxc.arc(g.x, g.y, rad, 0, Math.PI * 2); fxc.stroke();
      fxc.strokeStyle = "rgba(11,10,58,.7)";
      fxc.lineWidth = 2;
      fxc.beginPath(); fxc.arc(g.x, g.y, rad * 0.7, 0, Math.PI * 2); fxc.stroke();
    }

    for (i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.life += dt;
      if (b.life >= b.max) { bits.splice(i, 1); continue; }
      b.vy += 1500 * dt;
      b.vx *= Math.pow(0.4, dt);
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      fxc.globalAlpha = 1 - b.life / b.max;
      fxc.fillStyle = b.c;
      fxc.save();
      fxc.translate(b.x, b.y); fxc.rotate(b.rot);
      fxc.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.rot * 1.3)) + 2);
      fxc.restore();
    }
    fxc.globalAlpha = 1;
  }

  /* ====================== The 3D swarm ====================== */

  var swarm = null, morph = 0, scatter = 0, partyUntil = -1;

  function updateSwarm(dt, y) {
    if (!swarm) return;
    var mid = y + view.h * 0.5, k = 0;
    for (var i = 0; i < sections.length; i++) if (mid >= sections[i].top) k = i;
    var s = sections[k], local = clamp((mid - s.top) / s.h, 0, 1);
    var target = k + (k < 6 ? smooth(0.8, 1, local) : 0);
    morph = follow(morph, target, 3.2, dt);

    var i0 = Math.floor(morph), i1 = Math.min(6, i0 + 1), t = morph - i0;
    var colA = mix3(SWARM_A[i0], SWARM_A[i1], t), colB = mix3(SWARM_B[i0], SWARM_B[i1], t);
    if (time < partyUntil) { colA = hue(time * 0.9); colB = hue(time * 0.9 + 0.5); }

    kickScatter *= Math.pow(0.05, dt);
    scatter = follow(scatter, clamp(Math.abs(scroll.smoothVel) / 5000, 0, 0.5) + kickScatter, 6, dt);

    var opacity = lerp(SWARM_OPACITY[i0], SWARM_OPACITY[i1], t);
    if (view.w / view.h < 1.15) opacity *= 0.55;

    swarm.frame({
      morph: morph, colA: colA, colB: colB, opacity: opacity, scatter: scatter,
      speed: scroll.smoothVel, dt: dt, time: time, offsets: SWARM_X,
      mouse: { x: (mouse.x / view.w) * 2 - 1, y: -(mouse.y / view.h) * 2 + 1, on: mouse.on, sx: mouse.sx, sy: mouse.sy }
    });
  }

  /* ====================== H I ====================== */

  function party() {
    partyUntil = time + 4;
    body.classList.add("party");
    for (var i = 0; i < 9; i++) {
      setTimeout(function () { burst(rnd(0.15, 0.85) * view.w, rnd(0.2, 0.7) * view.h); }, i * 150);
    }
    setTimeout(function () { body.classList.remove("party"); }, 4000);
  }

  function wireKeys() {
    var typed = "";
    doc.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") { closeLightbox(); return; }
      var n = Number(e.key);
      if (n >= 1 && n <= 7 && e.key.length === 1) { jump(n - 1); return; }
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-2);
        if (typed === "hi") { typed = ""; if (!calm) party(); }
      }
    });
  }

  /* ====================== Switching on ====================== */

  function powerOn() {
    var power = $("#power");
    var letterIn = function () {
      body.classList.remove("booting");
      if (calm) return;
      heroLetters.forEach(function (l, i) {
        l.el.style.animationDelay = (i * 0.035).toFixed(3) + "s";
        l.el.classList.add("drop");
        l.el.addEventListener("animationend", function () {
          l.el.classList.remove("drop");
          l.el.style.animationDelay = "";
          l.written = "";
        }, { once: true });
      });
    };

    if (calm) { power.remove(); letterIn(); return; }

    var snow = new Snow($("#power-snow"), 160, 100), stage = 0, timers = [], done = false;
    (function tick() {
      if (done) return;
      if (stage >= 2) snow.draw();
      requestAnimationFrame(tick);
    })();

    function go(n) {
      stage = n;
      power.className = "s" + n;
      if (n === 4) {
        letterIn();
        timers.push(setTimeout(function () { done = true; power.remove(); }, 1100));
      }
    }
    timers.push(setTimeout(function () { go(1); }, 120));
    timers.push(setTimeout(function () { go(2); }, 470));
    timers.push(setTimeout(function () { go(3); }, 1000));
    timers.push(setTimeout(function () { go(4); }, 1400));

    // A click skips it
    power.addEventListener("click", function () {
      if (stage >= 4) return;
      timers.forEach(clearTimeout);
      timers = [];
      go(4);
    });
  }

  /* ====================== Kept in the background by the WWW window ====================== */
  // When another site opens in the WWW window this page isn't thrown away, only hidden,
  // so Back brings the visitor to the same spot. While hidden it stops drawing.

  var paused = false, pausedAt = 0;

  function wireHost() {
    if (!framed) return;
    window.addEventListener("message", function (e) {
      if (e.source !== window.parent) return;
      var type = e.data && e.data.type;
      if (type === "www-pause" && !paused) {
        paused = true;
        pausedAt = window.scrollY;
      } else if (type === "www-resume" && paused) {
        paused = false;
        if (Math.abs(window.scrollY - pausedAt) > 2) window.scrollTo(0, pausedAt);
        scroll.last = window.scrollY;
        lastNow = performance.now();
        remeasure();
        requestAnimationFrame(frame);
      }
    });
  }

  /* ====================== Every frame ====================== */

  var scroll = { last: 0, vel: 0, smoothVel: 0 };
  var time = 0, lastNow = 0, eveSnow = null, stretchWritten = "";

  function inView(i, y, margin) {
    var s = sections[i];
    return s && y + view.h + margin > s.top && y - margin < s.top + s.h;
  }

  function frame(now) {
    if (paused) return;                               // hidden by the desktop's browser; resumes on a message
    requestAnimationFrame(frame);
    var dt = clamp((now - lastNow) / 1000, 0.001, 0.05);
    lastNow = now;
    time += dt;

    var y = window.scrollY;
    var v = (y - scroll.last) / dt;
    scroll.last = y;
    if (Math.abs(v) > 30000) v = 0;                    // a channel jump, not a scroll
    scroll.vel = lerp(scroll.vel, v, 0.25);
    scroll.smoothVel = follow(scroll.smoothVel, scroll.vel, 5, dt);

    if (!calm) {
      var stretch = clamp(Math.abs(scroll.smoothVel) / 2600, 0, 1).toFixed(2);
      var skew = clamp(-scroll.smoothVel / 260, -9, 9).toFixed(1);
      var written = stretch + "|" + skew;
      if (written !== stretchWritten) {
        stretchWritten = written;
        root.style.setProperty("--stretch", stretch);
        root.style.setProperty("--skew", skew + "deg");
      }
    }

    updateChannels(y);
    updateCursor(dt);
    updateHero(y, dt);
    updateAbout();
    updateHoloIdle(y);
    updateSphere(dt, y);
    updateMarquee(dt, y);
    updateWork(y);
    updateSlabs(y);
    updatePath(y, dt);

    if (cutSnow && now < cutUntil) cutSnow.draw();
    if (eveSnow && !calm && inView(3, y, 0) && ((time * 30) | 0) % 2) eveSnow.draw();

    drawFx(dt);
    updateSwarm(dt, y);
  }

  /* ====================== Start ====================== */

  function start() {
    nameEl = $("#hero-name");
    heroFoot = $(".hero-foot"); heroHint = $(".hint");
    workEl = $(".work"); workTrack = $("#work-track");
    sphereEl = $("#sphere");
    pathEl = $("#path"); pathSvg = $("#path-svg"); pathDraw = $("#path-draw"); pathGhost = $("#path-ghost");
    meterRail = $(".rail-right"); meterHead = $("#meter-head");
    osdCh = $("#osd-ch"); osdName = $("#osd-name");
    fx = $("#fx"); fxc = fx.getContext("2d");
    cutSnow = new Snow($("#cut"), 160, 100);

    buildRail();
    buildHero();
    buildAbout();
    buildStack();
    buildWork();
    buildExperience();
    buildEducation();
    buildContact();

    if (!calm && window.SCENE && window.THREE) {
      var small = Math.min(window.innerWidth, window.innerHeight) < 600;
      swarm = window.SCENE.create($("#gl"), {
        count: small ? 5000 : 9000, dust: small ? 700 : 1400, size: small ? 28 : 34,
        light: true, base: toRgb([INK])[0]                 // the yellow screen: points drawn like ink
      });
    }

    wirePointer();
    wireHolo();
    wireStats();
    wireSphere();
    wireKeys();
    wireHost();
    cycleRole();

    $("#lightbox-close").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", function (e) { if (e.target === e.currentTarget) closeLightbox(); });

    measure();
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe($("main"));
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(remeasure);
      doc.fonts.load("900 230px Anybody").then(function () {
        if (swarm) swarm.setWord("HI!", "Anybody");
      }, function () { /* keeps the fallback font */ });
    }

    scroll.last = window.scrollY;
    lastNow = performance.now();
    requestAnimationFrame(frame);
    powerOn();
  }

  start();
})();

/* ------------------------------------------------------------------
   The computer: boot, log in, desktop, windows, folders, power off.
   What the folders contain comes from js/content.js.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var PF = (window.PF = window.PF || {});
  var C = window.PORTFOLIO;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var wait = function (ms) { return new Promise(function (done) { setTimeout(done, ms); }); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ====================== Icons (inline SVG, flat retro style) ====================== */

  var ICONS = {
    logo:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="28" fill="#dcd6c4" stroke="#000" stroke-width="2"/>' +
      '<rect x="10" y="10" width="28" height="18" fill="#12a5aa" stroke="#000" stroke-width="2"/><path d="M13 13h10v3H13z" fill="#8ee6e8"/>' +
      '<path d="M19 33h10v4H19z" fill="#b9b29d" stroke="#000" stroke-width="2"/><rect x="8" y="37" width="32" height="6" fill="#dcd6c4" stroke="#000" stroke-width="2"/></svg>',
    user:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="#dcdcdc"/>' +
      '<circle cx="24" cy="19" r="9" fill="#808080"/><path d="M6 48c0-11 8-17 18-17s18 6 18 17z" fill="#808080"/></svg>',
    key:
      '<svg viewBox="0 0 32 48" aria-hidden="true"><path d="M13 22h7v24l-3 2-4-2v-3h-3v-3h3v-3h-3v-3h3z" fill="#ffd800" stroke="#b39500" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="16" cy="13" r="11" fill="#ffd800" stroke="#b39500" stroke-width="2"/><circle cx="16" cy="11" r="4" fill="#c0c0c0" stroke="#b39500" stroke-width="2"/></svg>',
    folder:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 40V12l4-5h11l4 5h19v28z" fill="#f5f353"/>' +
      '<path d="M6 39V12l3-4h10l4 5h19" fill="none" stroke="#fffde6" stroke-width="2"/>' +
      '<path d="M5 40h38V12" fill="none" stroke="#3c3c3c" stroke-width="2"/></svg>',
    text:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 5h28v38H10z" fill="#fff" stroke="#000" stroke-width="2"/>' +
      '<path d="M10 5h28v7H10z" fill="#0100a6" stroke="#000" stroke-width="2"/>' +
      '<path d="M15 19h18M15 25h18M15 31h18M15 37h11" stroke="#000" stroke-width="2"/></svg>',
    link:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="#fff" stroke="#000" stroke-width="2"/>' +
      '<path d="M6 24h36M24 6v36M24 6c-9 6-9 30 0 36M24 6c9 6 9 30 0 36M10 14h28M10 34h28" fill="none" stroke="#000" stroke-width="2"/></svg>',
    browser:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="#9fdcff" stroke="#000" stroke-width="2"/>' +
      '<path d="M6 24h36M24 6v36M24 6c-9 6-9 30 0 36M24 6c9 6 9 30 0 36M10 14h28M10 34h28" fill="none" stroke="#000" stroke-width="2"/></svg>',
    tv:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 3l9 9 9-9" fill="none" stroke="#000" stroke-width="2"/>' +
      '<rect x="4" y="12" width="40" height="28" fill="#dcd6c4" stroke="#000" stroke-width="2"/><rect x="8" y="16" width="25" height="20" fill="#000"/>' +
      '<path d="M10 18h3v16h-3z" fill="#fff"/><path d="M13 18h3v16h-3z" fill="#f5f353"/><path d="M16 18h3v16h-3z" fill="#12d6dc"/>' +
      '<path d="M19 18h3v16h-3z" fill="#1cc21c"/><path d="M22 18h3v16h-3z" fill="#e23be2"/><path d="M25 18h3v16h-3z" fill="#f20000"/><path d="M28 18h3v16h-3z" fill="#0100a6"/>' +
      '<circle cx="38" cy="21" r="2" fill="#4c4c4c"/><circle cx="38" cy="29" r="2" fill="#4c4c4c"/><path d="M11 40v5M37 40v5" stroke="#000" stroke-width="3"/></svg>',
    image:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="30" fill="#fff" stroke="#000" stroke-width="2"/>' +
      '<rect x="9" y="13" width="30" height="22" fill="#12a5aa"/><circle cx="31" cy="20" r="3" fill="#f5f353"/><path d="M9 35l10-12 7 8 4-4 9 8z" fill="#1c8a1c"/></svg>',
    warn:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5 45 42H3z" fill="#ffe600" stroke="#000" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M24 18v13" stroke="#000" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="37" r="2" fill="#000"/></svg>',
    error:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="#f20000" stroke="#7a0000" stroke-width="2"/>' +
      '<path d="M16 16l16 16M32 16 16 32" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
    power:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="3" width="42" height="42" fill="#f20000" stroke="#000" stroke-width="2"/>' +
      '<path d="M6 42V6h36" fill="none" stroke="#ff9a9a" stroke-width="2"/>' +
      '<path d="M24 12v11" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M17 17a11 11 0 1 0 14 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
    back:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H7M12 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter"/></svg>',
    home:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l9-8 9 8M6 10v10h12V10" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    reload:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2-5M19 4v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    min: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10h8" stroke="currentColor" stroke-width="2"/></svg>',
    max: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3h8v7H2z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M2 3h8" stroke="currentColor" stroke-width="2"/></svg>',
    close: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="2"/></svg>'
  };

  function fillIcons(root) {
    root.querySelectorAll("[data-icon]").forEach(function (node) {
      node.innerHTML = ICONS[node.dataset.icon] || "";
    });
  }

  /* ====================== Boot and log in ====================== */

  var stage, desktop, layer;
  var offScreen = null;
  var loginWired = false;

  function prepare() {
    stage = $("#stage-os");
    desktop = $("#os-desktop");
    layer = $("#win-layer");
    stage.hidden = false;
    fillIcons(stage);
    $("#login-user").value = C.login.user;
    $("#start-name").textContent = C.name;
  }

  // A small window with a progress bar that fills up, then the log in.
  async function start() {
    prepare();
    $("#os-boot").hidden = false;

    var title = $("#boot-title"), began = Date.now();
    var timer = setInterval(function () {
      var steps = Math.floor((Date.now() - began - 150) / 2100 * 20);      // same pace as the bar in os.css
      title.textContent = "Starting (" + Math.max(0, Math.min(20, steps)) * 5 + "%)";
    }, 80);

    await wait(2650);
    clearInterval(timer);
    $("#os-boot").hidden = true;
    showLogin();
  }

  function showHint(open) {
    var hint = $("#login-hint");
    hint.setAttribute("aria-expanded", String(open));
    hint.textContent = open ? C.login.hint : "hint";
  }

  function showLogin() {
    var pass = $("#login-pass");
    $("#os-login").hidden = false;
    pass.value = "";
    showHint(false);

    // The buttons are wired once, even when the visitor comes back here from the TV
    if (!loginWired) {
      loginWired = true;
      wireLogin();
    }
    if (window.matchMedia("(pointer: fine)").matches) pass.focus();
  }

  function wireLogin() {
    var pass = $("#login-pass"), hint = $("#login-hint");

    hint.addEventListener("click", function () { showHint(hint.getAttribute("aria-expanded") !== "true"); });
    $("#login-help").addEventListener("click", function () { showHint(true); });
    $("#login-close").addEventListener("click", function () { PF.backToTv(); });     // X: back to the TV
    $("#login-power").addEventListener("click", askPowerOff);

    $("#login-form").addEventListener("submit", function (event) {
      event.preventDefault();
      if (C.login.answers.indexOf(pass.value.trim()) === -1) {
        dialog({
          title: "Error",
          icon: "error",
          heading: "Wrong password",
          message: "Press hint under the password box.",
          buttons: [{ label: "OK", action: function () { pass.focus(); pass.select(); } }]
        });
        return;
      }
      pass.blur();
      $("#os-login").hidden = true;
      showDesktop();
    });
  }

  // Puts the computer away when the visitor goes back to the TV. The next HI! boots it again.
  function sleep() {
    $("#os-login").hidden = true;
    stage.hidden = true;
  }

  /* ====================== Desktop ====================== */

  function showDesktop() {
    desktop.hidden = false;

    var icons = $("#desk-icons");
    var list = $("#start-list");
    var entries = [
      { name: "projects", icon: "folder", open: function () { openFolder(tree().projects); } },
      { name: "certificates", icon: "folder", open: function () { openFolder(tree().certificates); } },
      { name: "tv game", icon: "tv", open: openGame },
      { name: "WWW", icon: "browser", open: function () { openBrowser(); } }
    ];

    entries.forEach(function (entry) {
      var icon = makeItem({ name: entry.name, icon: entry.icon }, entry.open, icons);
      icons.appendChild(icon);
      makeMovable(icon, icons);

      var row = el("button", "start-item");
      row.type = "button";
      row.innerHTML = ICONS[entry.icon];
      row.appendChild(el("span", "", entry.name));
      row.addEventListener("click", function () { toggleStart(false); entry.open(); });
      list.appendChild(row);
    });

    arrangeIcons(icons);
    wireSelectionBox(icons);
    window.addEventListener("resize", function () { keepInside(icons, icons.querySelectorAll(".item")); });

    // Clicking the empty desktop clears the selection
    desktop.addEventListener("pointerdown", function (event) {
      if (!event.target.closest(".item")) clearSelection(icons);
      if (!event.target.closest("#start-menu, #start-btn")) toggleStart(false);
    });

    $("#start-btn").addEventListener("click", function () { toggleStart(); });
    $("#start-off").addEventListener("click", function () { toggleStart(false); askPowerOff(); });
    window.addEventListener("keydown", function (event) { if (event.key === "Escape") toggleStart(false); });

    tickClock();
    setInterval(tickClock, 5000);
    PF.audio.chime();
  }

  function tickClock() {
    var now = new Date();
    var clock = $("#clock");
    clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    clock.dateTime = now.toISOString();
    clock.title = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function toggleStart(open) {
    var menu = $("#start-menu"), button = $("#start-btn");
    if (open == null) open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.classList.toggle("open", open);
  }

  /* ---------- Icons you can open ---------- */

  function clearSelection(container) {
    container.querySelectorAll(".item.selected").forEach(function (n) { n.classList.remove("selected", "armed"); });
  }

  // node: { name, icon } or { name, thumb }.  Mouse: first click selects, second opens
  // (so a double-click works). Touch and keyboard open straight away.
  // "armed" marks the icon the last click landed on. Icons picked with the selection box
  // are selected but not armed, so one click on them doesn't open anything.
  function makeItem(node, open, container) {
    var button = el("button", "item");
    button.type = "button";
    if (node.thumb) {
      var img = el("img", "item-thumb");
      img.src = node.thumb; img.alt = "";
      button.appendChild(img);
    } else {
      button.innerHTML = ICONS[node.icon];
    }
    button.appendChild(el("span", "item-name", node.name));

    var touch = false;
    button.addEventListener("pointerdown", function (event) { touch = event.pointerType !== "mouse"; });
    button.addEventListener("click", function (event) {
      if (button.justMoved) return;                 // it was dragged, not clicked
      var keyboard = event.detail === 0;
      var wasArmed = button.classList.contains("armed");
      clearSelection(container);
      button.classList.add("selected", "armed");
      if (touch || keyboard || wasArmed) open();
    });
    return button;
  }

  /* ---------- Desktop icons: placing, moving, selecting ---------- */

  // Lines the icons up in columns down the left side
  function arrangeIcons(container) {
    var items = container.querySelectorAll(".item");
    if (!items.length) return;
    var cellW = items[0].offsetWidth + 8, cellH = 90;
    var rows = Math.max(1, Math.floor((container.clientHeight - 12) / cellH));
    items.forEach(function (item, i) {
      item.style.left = 8 + Math.floor(i / rows) * cellW + "px";
      item.style.top = 12 + (i % rows) * cellH + "px";
    });
  }

  // Pushes icons back onto the desktop when they would end up outside it
  function keepInside(container, items) {
    items.forEach(function (item) {
      item.style.left = Math.max(0, Math.min(container.clientWidth - item.offsetWidth, item.offsetLeft)) + "px";
      item.style.top = Math.max(0, Math.min(container.clientHeight - item.offsetHeight, item.offsetTop)) + "px";
    });
  }

  // Lets an icon be dragged around the desktop. Dragging one of several selected icons moves them all.
  function makeMovable(item, container) {
    item.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      var startX = event.clientX, startY = event.clientY;
      var moving = null;                            // the icons being dragged and where they started

      function move(e) {
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (!moving) {
          if (Math.abs(dx) + Math.abs(dy) < 6) return;          // still a click, not a drag
          if (!item.classList.contains("selected")) {
            clearSelection(container);
            item.classList.add("selected");
          }
          moving = [].map.call(container.querySelectorAll(".item.selected"), function (node) {
            return { node: node, left: node.offsetLeft, top: node.offsetTop };
          });
          container.classList.add("moving");
        }
        // The whole group stops at the edge of the desktop, so it keeps its shape
        var maxX = container.clientWidth, maxY = container.clientHeight;
        moving.forEach(function (m) {
          dx = Math.max(-m.left, Math.min(maxX - m.node.offsetWidth - m.left, dx));
          dy = Math.max(-m.top, Math.min(maxY - m.node.offsetHeight - m.top, dy));
        });
        moving.forEach(function (m) {
          m.node.style.left = m.left + dx + "px";
          m.node.style.top = m.top + dy + "px";
        });
      }

      function drop() {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerup", drop);
        item.removeEventListener("pointercancel", drop);
        if (!moving) return;
        container.classList.remove("moving");
        item.justMoved = true;                      // swallows the click that follows a drag
        setTimeout(function () { item.justMoved = false; }, 0);
      }

      item.setPointerCapture(event.pointerId);
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerup", drop);
      item.addEventListener("pointercancel", drop);
    });
  }

  // Dragging on the empty desktop draws a selection box. Every icon it touches gets selected.
  function wireSelectionBox(container) {
    container.addEventListener("pointerdown", function (event) {
      if (event.target !== container || event.button !== 0) return;
      var area = container.getBoundingClientRect();
      var startX = event.clientX - area.left, startY = event.clientY - area.top;
      var box = null;

      function move(e) {
        var x = Math.max(0, Math.min(area.width, e.clientX - area.left));
        var y = Math.max(0, Math.min(area.height, e.clientY - area.top));
        if (!box) {
          if (Math.abs(x - startX) + Math.abs(y - startY) < 4) return;
          box = el("div", "select-box");
          container.appendChild(box);
        }
        var left = Math.min(x, startX), top = Math.min(y, startY);
        var right = Math.max(x, startX), bottom = Math.max(y, startY);
        box.style.cssText = "left:" + left + "px;top:" + top + "px;width:" + (right - left) + "px;height:" + (bottom - top) + "px";

        container.querySelectorAll(".item").forEach(function (item) {
          var touched = item.offsetLeft < right && item.offsetLeft + item.offsetWidth > left &&
                        item.offsetTop < bottom && item.offsetTop + item.offsetHeight > top;
          item.classList.toggle("selected", touched);
          item.classList.remove("armed");
        });
      }

      function end() {
        container.removeEventListener("pointermove", move);
        container.removeEventListener("pointerup", end);
        container.removeEventListener("pointercancel", end);
        if (box) box.remove();
      }

      container.setPointerCapture(event.pointerId);
      container.addEventListener("pointermove", move);
      container.addEventListener("pointerup", end);
      container.addEventListener("pointercancel", end);
    });
  }

  /* ====================== Magic lamp ====================== */
  // A window pours out of its taskbar button when it opens and is sucked back into it
  // when it closes or minimizes. While that happens the real window is hidden and a
  // copy of it, cut into horizontal strips, is bent into the shape of the lamp.

  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }

  // The outline of the lamp: 0 at the window, 1 at the button. Wide for a while, then a quick turn into a thin neck.
  var NECK_LOW = 1 / (1 + Math.exp(5)), NECK_HIGH = 1 / (1 + Math.exp(-5));
  function neck(t) {
    t = clamp01(t);
    return (1 / (1 + Math.exp(-10 * (t - 0.5))) - NECK_LOW) / (NECK_HIGH - NECK_LOW);
  }

  // A lifeless copy of a window: it looks the same but has no pages or games running inside.
  function snapshot(node) {
    var copy = node.cloneNode(true);
    var live = node.querySelectorAll("canvas"), still = copy.querySelectorAll("canvas");
    for (var i = 0; i < live.length; i++) {
      var picture = el("img", live[i].className);
      picture.alt = "";
      try { picture.src = live[i].toDataURL(); } catch (e) { /* stays empty */ }
      still[i].replaceWith(picture);
    }
    copy.querySelectorAll("iframe").forEach(function (frame) { frame.replaceWith(el("div", "lamp-blank")); });
    copy.classList.remove("max");
    copy.removeAttribute("role");
    copy.removeAttribute("aria-label");
    return copy;
  }

  // opening: true = out of the taskbar button, false = into it.  done() runs when it is over.
  function lamp(win, opening, done) {
    var node = win.el, host = $("#lamp-layer");
    var button = win.task.getBoundingClientRect();

    if (calm || !host || !button.width) {
      node.style.visibility = "";
      win.busy = false;
      if (done) done();
      return;
    }
    win.busy = true;

    // Everything is measured from the top left corner of the desktop
    var desk = desktop.getBoundingClientRect();
    var box = node.getBoundingClientRect();
    var pad = 6;                                                 // room for the window's outline and shadow
    var W = box.width + pad * 2, H = box.height + pad * 2;
    var L = box.left - desk.left - pad, T = box.top - desk.top - pad;
    var toL = button.left - desk.left + button.width * 0.2;      // where the lamp ends: inside the button
    var toR = button.right - desk.left - button.width * 0.2;
    var toY = button.top - desk.top + 8;
    var span = Math.max(60, toY - T);

    // Lists and text that were scrolled should look scrolled in the copies too
    var parts = node.querySelectorAll("*"), scrolls = [], i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i].scrollTop || parts[i].scrollLeft) scrolls.push([i, parts[i].scrollLeft, parts[i].scrollTop]);
    }

    var shot = snapshot(node);
    var group = el("div", "lamp");
    var count = Math.max(10, Math.min(32, Math.round(H / 18)));
    var each = H / count, strips = [];

    for (i = 0; i < count; i++) {
      var y0 = i * each, y1 = Math.min(H, y0 + each + 1);        // 1px overlap hides the seams
      var strip = el("div", "lamp-strip");
      strip.style.width = W + "px";
      strip.style.height = (y1 - y0) + "px";
      var copy = shot.cloneNode(true);
      copy.style.cssText = "left:" + pad + "px;top:" + (pad - y0) + "px;width:" + box.width + "px;height:" + box.height +
        "px;z-index:auto";
      strip.appendChild(copy);
      group.appendChild(strip);
      strips.push({ el: strip, copy: copy, y0: y0, y1: y1 });
    }
    host.appendChild(group);

    if (scrolls.length) {
      strips.forEach(function (s) {
        var inside = s.copy.querySelectorAll("*");
        scrolls.forEach(function (mark) {
          inside[mark[0]].scrollLeft = mark[1];
          inside[mark[0]].scrollTop = mark[2];
        });
      });
    }
    node.style.visibility = "hidden";

    // k: 0 = the window as it normally looks, 1 = all of it inside the button
    function shape(k) {
      var form = smooth(k / 0.3);                  // the sides curve in towards the button
      var stretch = smooth(k / 0.5);               // the bottom edge reaches down to it
      var slide = clamp01((k - 0.2) / 0.8);        // then the whole window slides down the neck
      slide *= slide;

      function rowY(y) {
        var at = T + y + ((y / H) * span - y) * stretch + slide * span;
        return at > toY ? toY : at;
      }
      function side(at, from, to) { return from + (to - from) * neck((at - T) / span) * form; }

      for (var n = 0; n < strips.length; n++) {
        var s = strips[n];
        var top = rowY(s.y0), bottom = rowY(s.y1);
        if (bottom - top < 0.3) { s.el.style.display = "none"; continue; }       // already inside the button

        var l0 = side(top, L, toL), l1 = side(bottom, L, toL);
        var w0 = Math.max(1, side(top, L + W, toR) - l0);
        var w1 = Math.max(1, side(bottom, L + W, toR) - l1);
        var ratio = w0 / w1, h = s.y1 - s.y0;

        // Bends the strip (a rectangle) into a trapezoid: top edge at l0, w0 wide; bottom edge at l1, w1 wide
        s.el.style.display = "";
        s.el.style.transform = "matrix3d(" +
          w0 / W + ",0,0,0," +
          (l1 * ratio - l0) / h + "," + (bottom * ratio - top) / h + ",0," + (ratio - 1) / h + "," +
          "0,0,1,0," +
          l0 + "," + top + ",0,1)";
      }
    }

    var began = performance.now(), ms = 460;
    shape(opening ? 1 : 0);
    requestAnimationFrame(function step(now) {
      var p = clamp01((now - began) / ms);
      shape(opening ? Math.pow(1 - p, 1.5) : Math.pow(p, 1.5));
      if (p < 1) { requestAnimationFrame(step); return; }
      group.remove();
      node.style.visibility = "";
      win.busy = false;
      if (done) done();
    });
  }

  /* ====================== Windows ====================== */

  var windows = {};          // id -> window
  var zTop = 10;
  var activeWin = null;

  function focusWin(win) {
    if (activeWin && activeWin !== win) {
      activeWin.el.classList.remove("active");
      if (activeWin.task) activeWin.task.classList.remove("active");
    }
    activeWin = win;
    if (!win) return;
    win.el.hidden = false;
    win.minimized = false;
    win.el.style.zIndex = ++zTop;
    win.el.classList.add("active");
    if (win.task) win.task.classList.add("active");
  }

  // Brings a window to the front. A minimized one pours back out of the taskbar.
  function raiseWin(win) {
    if (win.busy) return;
    var wasMinimized = win.minimized;
    focusWin(win);
    if (wasMinimized) lamp(win, true);
  }

  function minimizeWin(win) {
    if (win.busy) return;
    lamp(win, false, function () { win.el.hidden = true; });
    win.minimized = true;
    win.el.classList.remove("active");
    win.task.classList.remove("active");
    if (activeWin === win) activeWin = null;
  }

  // options: { id, title, icon, content, width, height, className, onClose }
  function openWindow(options) {
    var existing = windows[options.id];
    if (existing) { existing.isNew = false; raiseWin(existing); return existing; }

    var node = el("section", "win " + (options.className || ""));
    node.setAttribute("role", "dialog");
    node.innerHTML =
      '<header class="win-bar"><span class="win-icon">' + (ICONS[options.icon] || "") + '</span><span class="win-title"></span>' +
      '<button type="button" class="win-btn min" aria-label="Minimize">' + ICONS.min + '</button>' +
      '<button type="button" class="win-btn max" aria-label="Maximize">' + ICONS.max + '</button>' +
      '<button type="button" class="win-btn close" aria-label="Close">' + ICONS.close + '</button></header>' +
      '<div class="win-body"></div>';
    var bar = $(".win-bar", node);
    $(".win-body", node).appendChild(options.content);

    // Size and place it inside the desktop, each new window a little lower and to the right
    var area = layer.getBoundingClientRect();
    var small = area.width < 720;
    var count = Object.keys(windows).length;
    var w = Math.min(options.width || 560, area.width - (small ? 12 : 40));
    var h = Math.min(options.height || 400, area.height - (small ? 12 : 30));
    var x = small ? (area.width - w) / 2 : Math.max(10, Math.min(area.width - w - 10, 150 + (count % 6) * 30));
    var y = small ? (area.height - h) / 2 : Math.max(8, Math.min(area.height - h - 8, 26 + (count % 6) * 26));
    node.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px";
    layer.appendChild(node);

    var task = el("button", "task");
    task.type = "button";
    task.innerHTML = ICONS[options.icon] || "";
    var taskName = el("span", "", options.title);
    task.appendChild(taskName);
    $("#task-list").appendChild(task);

    var win = {
      id: options.id, el: node, task: task, isNew: true, minimized: false, busy: false,
      setTitle: function (title) {
        $(".win-title", node).textContent = title;
        taskName.textContent = title;
        node.setAttribute("aria-label", title);
      },
      close: function () {
        if (win.busy) return;
        delete windows[options.id];
        if (activeWin === win) activeWin = null;
        task.classList.remove("active");
        lamp(win, false, function () { node.remove(); task.remove(); });
        if (options.onClose) options.onClose();
      }
    };
    windows[options.id] = win;
    win.setTitle(options.title);

    node.addEventListener("pointerdown", function () { if (activeWin !== win) focusWin(win); }, true);
    $(".close", node).addEventListener("click", win.close);
    $(".min", node).addEventListener("click", function () { minimizeWin(win); });
    $(".max", node).addEventListener("click", function () { node.classList.toggle("max"); });
    bar.addEventListener("dblclick", function (event) {
      if (!event.target.closest(".win-btn")) node.classList.toggle("max");
    });
    task.addEventListener("click", function () {
      if (win.minimized || activeWin !== win) raiseWin(win); else minimizeWin(win);
    });

    // Drag by the title bar
    bar.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || event.target.closest(".win-btn") || node.classList.contains("max")) return;
      var startX = event.clientX, startY = event.clientY;
      var fromX = node.offsetLeft, fromY = node.offsetTop;
      bar.setPointerCapture(event.pointerId);
      desktop.classList.add("dragging");

      function move(e) {
        var box = layer.getBoundingClientRect();
        var nx = Math.max(80 - node.offsetWidth, Math.min(box.width - 80, fromX + e.clientX - startX));
        var ny = Math.max(0, Math.min(box.height - 36, fromY + e.clientY - startY));
        node.style.left = nx + "px";
        node.style.top = ny + "px";
      }
      function drop() {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", drop);
        bar.removeEventListener("pointercancel", drop);
        desktop.classList.remove("dragging");
      }
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", drop);
      bar.addEventListener("pointercancel", drop);
    });

    focusWin(win);

    // It stays hidden until whoever opened it has filled it in, then it pours out of its taskbar button
    node.style.visibility = "hidden";
    win.busy = true;
    Promise.resolve().then(function () { lamp(win, true); });

    return win;
  }

  // Small message box in the middle of the screen. Returns a function that closes it.
  // options: { title, icon, heading, message, buttons: [{ label, action }], build(body, close) }
  function dialog(options) {
    var host = stage.querySelector(".os-screen:not([hidden])") || stage;
    var veil = el("div", "veil");
    var box = el("section", "win active dialog");
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-label", options.title);
    box.innerHTML =
      '<header class="win-bar"><span class="win-title"></span>' +
      '<button type="button" class="win-btn close" aria-label="Close">' + ICONS.close + '</button></header>' +
      '<div class="win-body dialog-body"></div><footer class="dialog-foot"></footer>';
    $(".win-title", box).textContent = options.title;
    var body = $(".dialog-body", box), foot = $(".dialog-foot", box);

    function close() {
      window.removeEventListener("keydown", onKey);
      veil.remove();
    }
    function onKey(event) { if (event.key === "Escape") close(); }

    if (options.build) {
      options.build(body, close);
    } else {
      body.innerHTML = '<span class="dialog-icon">' + ICONS[options.icon || "warn"] + "</span>";
      var words = el("div", "dialog-text");
      words.appendChild(el("strong", "", options.heading));
      if (options.message) words.appendChild(el("p", "", options.message));
      body.appendChild(words);
    }

    var first = null;
    (options.buttons || [{ label: "OK" }]).forEach(function (b) {
      var button = el("button", "btn", b.label);
      button.type = "button";
      button.addEventListener("click", function () { close(); if (b.action) b.action(); });
      foot.appendChild(button);
      if (!first) first = button;
    });

    $(".close", box).addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    veil.appendChild(box);
    host.appendChild(veil);
    if (first) first.focus();
    return close;
  }

  function inProgress(name) {
    dialog({
      title: name,
      icon: "warn",
      heading: "In progress",
      message: "\u201C" + name + "\u201D isn't finished yet. Come back soon."
    });
  }

  /* ====================== What the folders hold ====================== */

  var treeCache = null;

  function tree() {
    if (treeCache) return treeCache;
    treeCache = {
      projects: {
        type: "folder", name: "projects",
        children: C.projects.map(function (p) {
          if (p.inProgress) return { type: "wip", name: p.name, icon: "folder" };
          return {
            type: "folder", name: p.name,
            children: [
              { type: "text", name: "ReadMe", title: p.name + " - ReadMe", text: p.readme },
              { type: "link", name: "Open site", title: p.name, url: p.url, embed: p.embed !== false }
            ]
          };
        })
      },
      certificates: {
        type: "folder", name: "certificates",
        children: C.certificates.map(function (c) {
          if (c.inProgress) return { type: "wip", name: c.name, icon: "image" };
          return { type: "image", name: c.name, src: c.image };
        })
      }
    };
    return treeCache;
  }

  /* ---------- Folder window ---------- */

  function openFolder(root) {
    var content = el("div", "fx");
    content.innerHTML =
      '<div class="fx-bar"><button type="button" class="tool-btn fx-back" aria-label="Back">' + ICONS.back + '</button>' +
      '<div class="fx-path">' + ICONS.folder + '<span></span></div></div><div class="fx-grid"></div><div class="fx-status"></div>';

    var win = openWindow({ id: "folder:" + root.name, title: root.name, icon: "folder", content: content, width: 600, height: 400 });
    if (!win.isNew) return;

    var trail = [root];                     // where we are: [projects, EVE...]
    var back = $(".fx-back", content), path = $(".fx-path span", content);
    var grid = $(".fx-grid", content), status = $(".fx-status", content);

    function show() {
      var here = trail[trail.length - 1];
      win.setTitle(here.name);
      path.textContent = "C:\\Desktop" + trail.map(function (n) { return "\\" + n.name; }).join("");
      back.disabled = trail.length < 2;
      grid.textContent = "";
      here.children.forEach(function (child) {
        var look = child.type === "image" ? { name: child.name, thumb: child.src }
          : { name: child.name, icon: child.icon || child.type };
        grid.appendChild(makeItem(look, function () { openNode(child); }, grid));
      });
      status.textContent = here.children.length + (here.children.length === 1 ? " item" : " items");
    }

    function openNode(node) {
      if (node.type === "folder") { trail.push(node); show(); }
      else if (node.type === "wip") inProgress(node.name);
      else if (node.type === "text") openText(node);
      else if (node.type === "image") openImage(node);
      else if (node.type === "link") openBrowser(node);
    }

    back.addEventListener("click", function () { if (trail.length > 1) { trail.pop(); show(); } });
    grid.addEventListener("pointerdown", function (event) { if (event.target === grid) clearSelection(grid); });
    show();
  }

  /* ---------- Text file ---------- */

  function openText(node) {
    var pre = el("pre", "note");
    // Plain text, with web addresses turned into links
    node.text.split(/(https?:\/\/[^\s]+)/g).forEach(function (part, i) {
      if (i % 2) {
        var a = el("a", "", part);
        a.href = part; a.target = "_blank"; a.rel = "noopener";
        pre.appendChild(a);
      } else {
        pre.appendChild(document.createTextNode(part));
      }
    });
    openWindow({ id: "text:" + node.title, title: node.title, icon: "text", content: pre, width: 560, height: 430 });
  }

  /* ---------- Picture ---------- */

  function openImage(node) {
    var view = el("div", "viewer");
    var img = el("img");
    img.src = node.src; img.alt = node.name + " certificate";
    view.appendChild(img);
    openWindow({ id: "image:" + node.name, title: node.name, icon: "image", content: view, width: 860, height: 640 });
  }

  /* ---------- WWW: the browser ---------- */

  var www = null;            // the browser, while its window is open

  // The page the browser opens on and goes back to with the home button
  function homePage() {
    return { title: C.home.title, url: C.home.url, address: C.home.address, embed: true, home: true };
  }

  // site: { title, url, embed } to go straight to a site. Without it the home page shows.
  function openBrowser(site) {
    var fresh = !www;
    if (fresh) {
      var shell = el("div", "browser");
      shell.innerHTML =
        '<div class="browser-bar"><button type="button" class="tool-btn browser-back" aria-label="Back">' + ICONS.back + '</button>' +
        '<button type="button" class="tool-btn browser-home" aria-label="Home page">' + ICONS.home + '</button>' +
        '<button type="button" class="tool-btn browser-reload" aria-label="Reload">' + ICONS.reload + '</button>' +
        '<input class="browser-address" type="text" readonly aria-label="Address">' +
        '<a class="btn browser-out" target="_blank" rel="noopener" hidden>Open in new tab</a></div><div class="browser-view"></div>';
      www = {
        shell: shell, site: null, frame: null, history: [],
        homeLayer: null, homeFrame: null, page: null,
        view: $(".browser-view", shell), address: $(".browser-address", shell),
        back: $(".browser-back", shell), home: $(".browser-home", shell),
        reload: $(".browser-reload", shell), out: $(".browser-out", shell)
      };
      www.back.addEventListener("click", goBack);
      www.home.addEventListener("click", function () { showPage(homePage()); });
      www.reload.addEventListener("click", function () { if (www.frame) www.frame.src = www.site.url; });
    }

    www.win = openWindow({
      id: "www", title: "WWW", icon: "browser", content: www.shell, width: 1180, height: 760,
      onClose: function () { www = null; }
    });
    if (fresh || site) showPage(site || homePage());
  }

  function makeFrame(site) {
    var frame = el("iframe");
    frame.title = site.title;
    frame.src = site.url;
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
    frame.setAttribute("referrerpolicy", "no-referrer");
    return frame;
  }

  // Tells the home page it is being hidden or shown again, so it can stop drawing meanwhile
  function tellHome(type) {
    try { www.homeFrame.contentWindow.postMessage({ type: type }, "*"); } catch (e) { /* not loaded yet */ }
  }

  // goingBack: true when Back brought us here, so this page isn't added to the history again
  function showPage(site, goingBack) {
    if (!goingBack && www.site) www.history.push(www.site);
    www.site = site;

    if (www.page) { www.page.remove(); www.page = null; }
    www.back.disabled = !www.history.length;
    www.home.disabled = !!site.home;
    www.reload.disabled = !site.embed;
    www.out.hidden = false;
    www.out.href = site.url;
    www.address.value = site.address || site.url;
    www.win.setTitle(site.title + " - WWW");

    // The home page is made once and only hidden while another site is open,
    // so Back finds it scrolled to where the visitor left it
    if (site.home) {
      if (!www.homeLayer) {
        www.homeLayer = el("div", "browser-page");
        www.homeLayer.appendChild(el("p", "browser-loading", "Loading " + site.title + "…"));
        www.homeFrame = makeFrame(site);
        www.homeLayer.appendChild(www.homeFrame);
        www.view.appendChild(www.homeLayer);
      } else if (www.homeLayer.classList.contains("away")) {
        www.homeLayer.classList.remove("away");
        tellHome("www-resume");
      }
      www.frame = www.homeFrame;
      return;
    }

    if (www.homeLayer && !www.homeLayer.classList.contains("away")) {
      www.homeLayer.classList.add("away");
      tellHome("www-pause");
    }

    var page = el("div", "browser-page");
    www.frame = null;
    if (site.embed) {
      page.appendChild(el("p", "browser-loading", "Loading " + site.title + "…"));
      www.frame = makeFrame(site);
      page.appendChild(www.frame);
    } else {
      // Some sites refuse to be shown inside another page
      var note = el("div", "browser-note");
      note.innerHTML = ICONS.link;
      note.appendChild(el("h2", "", "This site opens in its own tab"));
      note.appendChild(el("p", "", site.title + " doesn't allow other pages to show it inside a window."));
      var go = el("a", "btn", "Open " + site.title);
      go.href = site.url; go.target = "_blank"; go.rel = "noopener";
      note.appendChild(go);
      page.appendChild(note);
    }
    www.view.appendChild(page);
    www.page = page;
  }

  function goBack() {
    var previous = www && www.history.pop();
    if (previous) showPage(previous, true);
  }

  // The home page asks for a project or a certificate. Only names from content.js are opened.
  window.addEventListener("message", function (event) {
    if (!www || !www.homeFrame || event.source !== www.homeFrame.contentWindow) return;
    var msg = event.data || {};
    if (msg.type === "open-project") {
      var project = C.projects.filter(function (p) { return p.name === msg.name && p.url; })[0];
      if (project) showPage({ title: project.name, url: project.url, embed: project.embed !== false });
    } else if (msg.type === "open-certificate") {
      var cert = C.certificates.filter(function (c) { return c.name === msg.name && c.image; })[0];
      if (cert) openImage({ name: cert.name, src: cert.image });
    }
  });

  /* ---------- tv game ---------- */

  function openGame() {
    if (windows.game) { raiseWin(windows.game); return; }

    var page = el("div", "game-page");
    var game = null;
    var win = openWindow({
      id: "game", title: "tv game", icon: "tv", content: page, width: 700, height: 330,
      onClose: function () { if (game) game.destroy(); }
    });
    game = PF.game.mount(page, function () { return activeWin === win && !win.busy && !document.hidden; });
    page.appendChild(el("p", "game-help", "Space, the up arrow or a tap makes the TV jump."));
  }

  /* ====================== Power off ====================== */

  function askPowerOff() {
    dialog({
      title: "Turn off computer",
      buttons: [{ label: "Cancel" }],
      build: function (body, close) {
        body.classList.add("power-body");
        var button = el("button", "power-btn");
        button.type = "button";
        button.innerHTML = ICONS.power;
        button.appendChild(el("span", "", "Turn off"));
        button.addEventListener("click", function () { close(); powerOff(); });
        body.appendChild(button);
        setTimeout(function () { button.focus(); }, 0);
      }
    });
  }

  // The picture collapses like an old tube, then it's all static with two links.
  async function powerOff() {
    stage.classList.add("crt-off");
    await wait(520);
    stage.classList.remove("crt-off");
    stage.classList.add("dark");
    stage.querySelectorAll(".os-screen").forEach(function (screen) { screen.hidden = true; });
    await wait(350);

    $("#off-github").href = C.links.github;
    $("#off-linkedin").href = C.links.linkedin;
    $("#off-restart").addEventListener("click", function () { window.location.reload(); });
    $("#os-off").hidden = false;

    offScreen = new PF.StaticScreen($("#off-static"));
    offScreen.setMode("snow");
    offScreen.start();
    PF.audio.startNoise(0.6);
  }

  PF.os = {
    start: start,
    sleep: sleep,
    // Used by ?skip=login and ?skip=desktop while working on the site
    startAtLogin: function () { prepare(); showLogin(); },
    startAtDesktop: function () { prepare(); showDesktop(); }
  };
})();

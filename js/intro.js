/* ------------------------------------------------------------------
   The intro: white blast, the TV channel game, the flash,
   the burst of terminals and the terminal that asks for "HI!".
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var PF = (window.PF = window.PF || {});
  var C = window.PORTFOLIO;

  var $ = function (sel) { return document.querySelector(sel); };
  var wait = function (ms) { return new Promise(function (done) { setTimeout(done, ms); }); };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var pick = function (list) { return list[rnd(list.length)]; };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var app, tv, picture, white, layer;
  var screen;                 // the static on the TV
  var liveChannel = 1;        // the channel that works, picked at random on every visit
  var found = false;
  var deadLooks = {};         // what each dead channel shows

  function setPortrait() {
    document.querySelectorAll(".portrait img").forEach(function (img) { img.src = C.photo; });
  }

  /* ====================== 1. TV ====================== */

  // options.channel: force the working channel.  options.returning: the visitor came back from the log in window.
  function start(options) {
    options = options || {};
    app = $("#app"); tv = $("#stage-tv"); picture = $("#tv-picture");
    white = $("#stage-white"); layer = $("#term-layer");
    setPortrait();

    found = false;
    liveChannel = options.channel || 1 + rnd(5);

    // Each dead channel gets its own kind of static
    var looks = ["snow", "bars", "roll", "streak", "snow"].sort(function () { return Math.random() - 0.5; });
    for (var n = 1; n <= 5; n++) deadLooks[n] = looks[n - 1];

    screen = new PF.StaticScreen($("#tv-static"), { fps: calm ? 8 : 24 });
    screen.start();

    buildVolume();
    document.querySelectorAll(".tv-ch").forEach(function (button) {
      button.addEventListener("click", function () {
        PF.audio.click();
        select(Number(button.dataset.ch));
      });
    });
    window.addEventListener("keydown", onChannelKey);

    // Coming back from the log in window: no blast, and the TV is on one of the dead channels
    if (options.returning) {
      var dead;
      do { dead = 1 + rnd(5); } while (dead === liveChannel);
      select(dead);
      return;
    }

    // First visit: opening blast, then the TV always starts on channel 1
    var blast = $("#blast");
    if (blast) {
      setTimeout(function () { blast.classList.add("go"); }, 450);
      setTimeout(function () { blast.remove(); }, 1700);
    }
    select(1);
  }

  function onChannelKey(event) {
    if (found) return;
    if (event.key >= "1" && event.key <= "5") select(Number(event.key));
  }

  function select(channel) {
    if (found) return;

    document.querySelectorAll(".tv-ch").forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.ch) === channel));
    });
    $("#tv-current").textContent = "CH " + pad(channel);

    // A blink of black, like the tube changing channel
    picture.classList.add("switching");
    setTimeout(function () { picture.classList.remove("switching"); }, 90);

    if (channel === liveChannel) {
      tuneIn();
    } else {
      screen.setMode(deadLooks[channel]);
      $("#tv-nosignal").hidden = false;
      PF.audio.startNoise(1);
    }
  }

  // Volume bars at the bottom. They control the hiss of the static.
  function buildVolume() {
    var bars = $("#tv-bars"), mute = $("#tv-mute");

    function paint() {
      var level = PF.audio.muted ? 0 : PF.audio.volume;
      bars.querySelectorAll(".tv-bar").forEach(function (bar, i) {
        bar.classList.toggle("on", i < level);
      });
      mute.textContent = PF.audio.muted ? "MUTE" : "VOL";
      mute.setAttribute("aria-pressed", String(PF.audio.muted));
    }

    for (var i = 1; i <= 10; i++) {
      var bar = document.createElement("button");
      bar.type = "button";
      bar.className = "tv-bar";
      bar.dataset.level = i;
      bar.setAttribute("aria-label", "Volume " + i);
      bars.appendChild(bar);
    }
    bars.addEventListener("click", function (event) {
      var bar = event.target.closest(".tv-bar");
      if (!bar) return;
      var level = Number(bar.dataset.level);
      // Clicking the last lit bar turns the volume down one step
      PF.audio.setVolume(level === PF.audio.volume && !PF.audio.muted ? level - 1 : level);
      paint();
    });
    mute.addEventListener("click", function () {
      PF.audio.setMuted(!PF.audio.muted);
      paint();
    });
    paint();
  }

  // The right channel: light noise over the site, two hits, noise clears from the center.
  async function tuneIn() {
    found = true;
    window.removeEventListener("keydown", onChannelKey);
    $("#tv-nosignal").hidden = true;
    screen.setMode("snow");
    tv.classList.add("found");
    PF.audio.startNoise(0.45);

    await wait(liveChannel === 1 ? 1900 : 750);
    hit();
    await wait(560);
    hit();
    await wait(520);

    // OSD slides off the sides while the noise opens up from the middle
    tv.classList.add("leaving");
    PF.audio.stopNoise(0.9);
    white.classList.add("flashbang");
    await animateClear(picture, calm ? 500 : 950);

    screen.stop();
    tv.remove();

    await wait(2800);                 // a few seconds of nothing but the portrait
    await terminalBurst();
    await wait(1100);
    openMainTerminal();
  }

  function hit() {
    PF.audio.thump();
    if (calm) return;
    app.classList.remove("hit");
    void app.offsetWidth;             // restart the animation
    app.classList.add("hit");
  }

  // Grows the transparent hole in the middle of the picture (see .tv-picture in tv.css)
  function animateClear(el, ms) {
    return new Promise(function (done) {
      var began = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - began) / ms);
        var eased = p * p;            // starts slow, ends fast
        el.style.setProperty("--clear", (-20 + 140 * eased) + "%");
        if (p < 1) requestAnimationFrame(step); else done();
      })(began);
    });
  }

  /* ====================== 2. Burst of fake "hacker" terminals ====================== */

  var NAMES = ["System32", "drivers", "config", "Users", "george", "AppData", "Local", "Temp", "Programs",
    "node_modules", ".git", "objects", "refs", "src", "components", "assets", "css", "js", "public", "dist",
    "cache", "logs", "bin", "lib", "include", "Documents", "Projects", "Portfolio", "keys", "certs"];
  var EXT = ["dll", "sys", "js", "json", "css", "log", "dat", "ini", "exe", "html"];

  function ip() { return (11 + rnd(200)) + "." + rnd(255) + "." + rnd(255) + "." + (1 + rnd(254)); }

  // Each of these returns a function that makes the next line of fake output
  var FEEDS = [
    function tree() {
      var depth = 1;
      var next = function () {
        depth = Math.max(1, Math.min(6, depth + pick([-1, 0, 0, 1, 1])));
        var line = "";
        for (var i = 1; i < depth; i++) line += Math.random() < 0.7 ? "│   " : "    ";
        return line + (Math.random() < 0.75 ? "├───" : "└───") + pick(NAMES) + (Math.random() < 0.3 ? "." + pick(EXT) : "");
      };
      next.command = "tree /f";
      return next;
    },
    function dir() {
      var next = function () {
        var stamp = "11/" + pad(1 + rnd(28)) + "/2026  " + pad(1 + rnd(12)) + ":" + pad(rnd(60)) + " " + pick(["AM", "PM"]);
        if (Math.random() < 0.3) return stamp + "    <DIR>          " + pick(NAMES);
        return stamp + String(rnd(9999999).toLocaleString("en-US")).padStart(18) + " " + pick(NAMES) + "." + pick(EXT);
      };
      next.command = "dir /s";
      return next;
    },
    function netstat() {
      var next = function () {
        return "  TCP    192.168.1." + rnd(255) + ":" + (49152 + rnd(16000)) + "    " + ip() + ":" +
          pick([443, 80, 22, 8080, 3306]) + "    " + pick(["ESTABLISHED", "LISTENING", "TIME_WAIT", "CLOSE_WAIT"]);
      };
      next.command = "netstat -an";
      return next;
    },
    function ping() {
      var target = ip();
      var next = function () {
        return "Reply from " + target + ": bytes=32 time=" + (1 + rnd(90)) + "ms TTL=" + pick([52, 57, 64, 117, 128]);
      };
      next.command = "ping -t " + target;
      return next;
    },
    function dump() {
      var address = 0x7ff60000 + rnd(0xffff) * 16;
      var next = function () {
        var bytes = [];
        for (var i = 0; i < 16; i++) bytes.push(rnd(256).toString(16).toUpperCase().padStart(2, "0"));
        address += 16;
        return "0x" + address.toString(16).toUpperCase().padStart(8, "0") + "  " + bytes.slice(0, 8).join(" ") + "  " + bytes.slice(8).join(" ");
      };
      next.command = "type memory.dmp";
      return next;
    }
  ];

  function spawnBurstTerminal(index) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var big = Math.random() < 0.4;
    var w = Math.min(vw - 16, big ? 380 + rnd(240) : 190 + rnd(150));
    var h = Math.min(vh - 16, big ? 240 + rnd(180) : 110 + rnd(90));
    var fontSize = big ? 12 : 10;

    var feed = pick(FEEDS)();
    var el = document.createElement("div");
    el.className = "term burst";
    el.style.cssText = "left:" + rnd(Math.max(1, vw - w)) + "px;top:" + rnd(Math.max(1, vh - h)) +
      "px;width:" + w + "px;height:" + h + "px;z-index:" + (index + 1);
    el.innerHTML = '<div class="term-bar"><span></span><span>_ □ ×</span></div><pre class="term-body"></pre>';
    el.querySelector(".term-bar span").textContent = "cmd - " + feed.command;
    var body = el.querySelector(".term-body");
    body.style.fontSize = fontSize + "px";
    layer.appendChild(el);

    var maxLines = Math.max(3, Math.floor((h - 36) / (fontSize * 1.25)));
    var lines = ["C:\\Users\\george>" + feed.command, ""];
    body.textContent = lines[0];
    var timer = setInterval(function () {
      for (var i = 1 + rnd(3); i > 0; i--) lines.push(feed());
      if (lines.length > maxLines) lines = lines.slice(lines.length - maxLines);
      body.textContent = lines.join("\n");
    }, 45 + rnd(40));

    return function close() { clearInterval(timer); el.remove(); };
  }

  // Terminals pop up all over the screen for a bit under 3 seconds, then vanish together.
  async function terminalBurst() {
    var count = window.innerWidth < 700 ? 8 : 13;
    var closers = [];
    for (var i = 0; i < count; i++) {
      closers.push(spawnBurstTerminal(i));
      await wait(1700 / count + rnd(40));
    }
    await wait(600);
    closers.forEach(function (close) { close(); });
  }

  /* ====================== 3. The terminal that types to you ====================== */

  async function openMainTerminal() {
    var el = document.createElement("div");
    el.className = "term main";
    el.innerHTML = '<div class="term-bar"><span>george@portfolio</span><span>_ □ ×</span></div><div class="term-body"></div>';
    layer.appendChild(el);
    var body = el.querySelector(".term-body");

    var cursor = document.createElement("span");
    cursor.className = "cur";
    cursor.textContent = "_";

    var lines = C.terminal.lines;
    var lineEl;

    for (var i = 0; i < lines.length; i++) {
      lineEl = document.createElement("div");
      lineEl.className = "line";
      var text = document.createElement("span");
      lineEl.appendChild(text);
      lineEl.appendChild(cursor);                       // the "_" always sits after the last letter
      body.appendChild(lineEl);

      await wait(i === 0 ? 700 : 420);                  // small pause before each line

      for (var k = 0; k < lines[i].length; k++) {
        text.textContent += lines[i][k];
        PF.audio.tick();
        await wait(45 + rnd(75));
      }

      if (i < lines.length - 1) {
        await wait(lines[i] ? 1250 : 300);              // "_" flashes, then the hacker presses Enter
      }
    }

    askForAnswer(body, lineEl, cursor);
  }

  // "HI!", "hi!", "HI" and "hi" all count: capitals and the "!" don't matter
  function isAnswer(text) {
    function plain(s) { return s.trim().toUpperCase().replace(/!+$/, ""); }
    return plain(text) === plain(C.terminal.answer);
  }

  // The last line turns into a prompt. Only the right answer does anything.
  function askForAnswer(body, lineEl, cursor) {
    var typed = document.createElement("span");
    typed.className = "typed";
    lineEl.insertBefore(typed, cursor);

    var input = document.createElement("input");
    input.className = "term-input";
    input.type = "text";
    input.maxLength = 24;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("enterkeyhint", "go");
    input.setAttribute("aria-label", "Type " + C.terminal.answer + " to continue");
    body.appendChild(input);

    input.addEventListener("input", function () { typed.textContent = input.value; });
    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      if (isAnswer(input.value)) {
        input.blur();
        PF.go("os");                                    // hard cut to black, then the computer boots
      }
      // Anything else: nothing happens, on purpose.
    });

    // Clicking anywhere keeps the keyboard on the prompt
    white.addEventListener("pointerup", function () { input.focus({ preventScroll: true }); });
    input.focus({ preventScroll: true });
  }

  PF.intro = {
    start: start,

    // Used by ?skip=terminal while working on the site
    startAtTerminal: function () {
      white = $("#stage-white"); layer = $("#term-layer");
      setPortrait();
      $("#stage-tv").remove();
      $("#blast").remove();
      openMainTerminal();
    }
  };
})();

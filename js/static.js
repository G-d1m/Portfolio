/* ------------------------------------------------------------------
   TV static drawn on a canvas, plus the few sounds the site makes.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var PF = (window.PF = window.PF || {});

  /* ====================== Static picture ====================== */

  // Pixels are written as 32-bit numbers: 0xAABBGGRR
  function rgb(r, g, b) { return (0xff000000 | (b << 16) | (g << 8) | r) >>> 0; }

  // Colour bars: white, yellow, cyan, green, magenta, red, blue
  var BARS_TOP = [[235, 235, 235], [235, 235, 16], [16, 235, 235], [16, 235, 16], [235, 16, 235], [235, 16, 16], [16, 16, 235]];
  var BARS_LOW = [[16, 16, 235], [20, 20, 20], [235, 16, 235], [20, 20, 20], [16, 235, 235], [20, 20, 20], [235, 235, 235]];

  var STREAK_DARK = [rgb(0, 0, 0), rgb(18, 10, 90), rgb(60, 20, 170), rgb(150, 30, 190), rgb(20, 120, 60), rgb(0, 0, 0)];
  var STREAK_BRIGHT = [rgb(255, 255, 255), rgb(225, 225, 255), rgb(180, 140, 255), rgb(255, 255, 255), rgb(120, 110, 220)];

  function StaticScreen(canvas, options) {
    options = options || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = "snow";                 // snow | roll | bars | streak
    this.fps = options.fps || 24;
    this.running = false;
    this.time = 0;
    this.seed = ((Math.random() * 0xffffffff) >>> 0) || 1;
    this.tears = [{ y: 0, h: 0 }, { y: 0, h: 0 }];
    this.last = 0;
    this.frame = this.frame.bind(this);
    this.resize = this.resize.bind(this);
  }

  // The canvas is drawn small and stretched by CSS, which gives the chunky grain.
  StaticScreen.prototype.resize = function () {
    var box = this.canvas.getBoundingClientRect();
    var cw = Math.max(1, box.width), ch = Math.max(1, box.height);
    var w = Math.round(Math.min(520, Math.max(200, cw / 3.2)));
    var h = Math.max(1, Math.round(w * ch / cw));
    if (w === this.w && h === this.h) return;
    this.w = this.canvas.width = w;
    this.h = this.canvas.height = h;
    this.image = this.ctx.createImageData(w, h);
    this.px = new Uint32Array(this.image.data.buffer);
  };

  StaticScreen.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.resize();
    window.addEventListener("resize", this.resize);
    requestAnimationFrame(this.frame);
  };

  StaticScreen.prototype.stop = function () {
    this.running = false;
    window.removeEventListener("resize", this.resize);
  };

  StaticScreen.prototype.setMode = function (mode) { this.mode = mode; };

  StaticScreen.prototype.frame = function (now) {
    if (!this.running) return;
    requestAnimationFrame(this.frame);
    if (now - this.last < 1000 / this.fps) return;
    this.last = now;
    this.time += 1 / this.fps;
    if (!this.px) return;

    if (this.mode === "bars") this.drawBars();
    else if (this.mode === "streak") this.drawStreak();
    else this.drawSnow(this.mode === "roll");

    this.ctx.putImageData(this.image, 0, 0);
  };

  // Black and white snow. With roll=true a dark band keeps sliding down the screen.
  StaticScreen.prototype.drawSnow = function (roll) {
    var px = this.px, n = this.w * this.h, s = this.seed, v, i;
    for (i = 0; i < n; i++) {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;            // fast random numbers
      v = s & 255;
      v = v < 100 ? v >> 2 : v < 205 ? v : 255;            // more contrast than plain grey
      px[i] = 0xff000000 | (v << 16) | (v << 8) | v;
    }
    this.seed = s;

    if (roll) {
      var bandH = Math.round(this.h * 0.16);
      var top = Math.round(((this.time * 0.35) % 1.3) * this.h) - bandH;
      var from = Math.max(0, top) * this.w;
      var to = Math.min(this.h, top + bandH) * this.w;
      for (i = from; i < to; i++) px[i] = 0xff000000 | ((px[i] >>> 2) & 0x3f3f3f);
    }
  };

  // Colour bars that tear sideways and get eaten by noise.
  StaticScreen.prototype.drawBars = function () {
    var px = this.px, w = this.w, h = this.h, s = this.seed, t = this.time;
    var split = Math.round(h * 0.72);
    var tears = this.tears, k, x, y, i = 0;

    // Every few frames the two torn bands jump somewhere else
    if (Math.random() < 0.18) {
      for (k = 0; k < tears.length; k++) {
        tears[k].y = Math.floor(Math.random() * h);
        tears[k].h = Math.floor(h * (0.03 + Math.random() * 0.12));
      }
    }

    for (y = 0; y < h; y++) {
      var offset = Math.sin(y * 0.11 + t * 4) * 2;
      var amp = 44;                                        // how strong the noise is
      for (k = 0; k < tears.length; k++) {
        if (y >= tears[k].y && y < tears[k].y + tears[k].h) {
          offset += Math.sin(y * 0.9 + t * 30) * w * 0.12 + w * 0.08;
          amp = 150;
        }
      }
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      var snowRow = (s & 255) < 12;                        // a few rows are pure noise
      var set = y < split ? BARS_TOP : BARS_LOW;

      for (x = 0; x < w; x++, i++) {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        if (snowRow) {
          var g = s & 255;
          px[i] = 0xff000000 | (g << 16) | (g << 8) | g;
          continue;
        }
        var xi = (((x + offset) % w) + w) % w;
        var c = set[(xi * 7 / w) | 0];
        var d = ((s & 255) * amp >> 8) - (amp >> 1);
        var r = c[0] + d, gg = c[1] + d, b = c[2] + d;
        r = r < 0 ? 0 : r > 255 ? 255 : r;
        gg = gg < 0 ? 0 : gg > 255 ? 255 : gg;
        b = b < 0 ? 0 : b > 255 ? 255 : b;
        px[i] = 0xff000000 | (b << 16) | (gg << 8) | r;
      }
    }
    this.seed = s;
  };

  // Sideways streaks of purple, blue and green with two blown-out white bands.
  StaticScreen.prototype.drawStreak = function () {
    var px = this.px, w = this.w, h = this.h, s = this.seed, t = this.time;
    var bandA = h * (0.34 + 0.06 * Math.sin(t * 0.9));
    var bandB = h * (0.62 + 0.05 * Math.sin(t * 0.7 + 2));
    var bandH = h * 0.07;
    var x, y, i = 0;

    for (y = 0; y < h; y++) {
      var near = Math.min(Math.abs(y - bandA), Math.abs(y - bandB));
      var palette = near < bandH ? STREAK_BRIGHT : STREAK_DARK;
      var lit = near < bandH ? 215 : near < bandH * 2.4 ? 130 : 95;   // how many pixels light up
      x = 0;
      while (x < w) {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        var run = 1 + (s & 7);
        var color = ((s >>> 8) & 255) < lit ? palette[((s >>> 16) & 255) % palette.length] : 0xff000000;
        while (run-- > 0 && x < w) { px[i++] = color; x++; }
      }
    }
    this.seed = s;
  };

  PF.StaticScreen = StaticScreen;

  /* ====================== Sound ====================== */
  // Browsers only allow sound after the visitor clicks or presses a key,
  // so everything here stays silent until then.

  var audio = (PF.audio = {
    ctx: null,
    volume: 3,          // 0-10, shown by the bars at the bottom of the TV
    muted: false,
    wantNoise: false,
    noiseLevel: 1,
    noiseGain: null,

    level: function () { return this.muted ? 0 : this.volume / 10; },

    unlock: function () {
      try {
        if (!this.ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ctx = new AC();
        }
        if (this.ctx.state === "suspended") this.ctx.resume();
        if (this.wantNoise) this.startNoise(this.noiseLevel);
      } catch (e) { /* no sound, the site still works */ }
    },

    noiseBuffer: function (seconds) {
      var ctx = this.ctx;
      var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    },

    // The hiss of a dead channel. level 1 = full static, lower = quieter.
    startNoise: function (level) {
      this.wantNoise = true;
      this.noiseLevel = level == null ? 1 : level;
      if (!this.ctx) return;
      if (!this.noiseGain) {
        var src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer(2);
        src.loop = true;
        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.value = 0;
        src.connect(this.noiseGain).connect(this.ctx.destination);
        src.start();
      }
      this.noiseGain.gain.setTargetAtTime(this.level() * 0.1 * this.noiseLevel, this.ctx.currentTime, 0.03);
    },

    stopNoise: function (fadeSeconds) {
      this.wantNoise = false;
      if (this.ctx && this.noiseGain) {
        this.noiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, (fadeSeconds || 0.05) / 3);
      }
    },

    setVolume: function (n) {
      this.volume = Math.max(0, Math.min(10, n));
      this.muted = false;
      if (this.wantNoise) this.startNoise(this.noiseLevel);
    },

    setMuted: function (muted) {
      this.muted = muted;
      if (this.wantNoise) this.startNoise(this.noiseLevel);
    },

    // One note that fades out. Used by the sounds below.
    tone: function (type, from, to, seconds, gain, delay) {
      if (!this.ctx || !this.level()) return;
      var t = this.ctx.currentTime + (delay || 0);
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, t);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + seconds);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain * this.level(), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + seconds + 0.05);
    },

    thump: function () { this.tone("sine", 110, 38, 0.2, 1.6); },             // hand hitting the TV
    click: function () { this.tone("square", 900, 500, 0.03, 0.12); },        // channel button
    tick:  function () { this.tone("square", 1500, 1200, 0.016, 0.05); },     // terminal key
    blip:  function () { this.tone("triangle", 660, 880, 0.09, 0.3); },       // game jump
    chime: function () {                                                      // desktop is ready
      var notes = [392, 523.25, 659.25, 783.99];
      for (var i = 0; i < notes.length; i++) this.tone("sine", notes[i], notes[i], 0.9, 0.5, i * 0.13);
    }
  });

  ["pointerdown", "keydown"].forEach(function (type) {
    window.addEventListener(type, function () { audio.unlock(); }, true);
  });
})();

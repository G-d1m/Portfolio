/* ------------------------------------------------------------------
   "No signal" runner: a little TV on legs jumps over antennas.
   Opens from the "tv game" icon on the desktop. Keeps the best score.
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var PF = (window.PF = window.PF || {});

  var W = 640, H = 200;          // size the game is drawn at (CSS stretches it)
  var GROUND = 168;              // y of the floor
  var P = 3;                     // size of one sprite pixel
  var INK = "#000", PAPER = "#fff";
  var BEST_KEY = "portfolio-runner-best";

  var TV = [
    "..#........#..",
    "...#......#...",
    "....#....#....",
    "##############",
    "#............#",
    "#.########.#.#",
    "#.#......#...#",
    "#.#.#..#.#.#.#",
    "#.#......#...#",
    "#.########.#.#",
    "#............#",
    "##############"
  ];
  var LEGS = [
    ["...##....##...", "...##....##...", "..###...###..."],      // step 1
    ["...##....##...", "..##......##..", ".##........##."],      // step 2
    ["..##......##..", "..##......##..", ".............."]       // in the air
  ];

  var OBSTACLES = [
    [ // small antenna
      "..#..",
      "#.#.#",
      ".###.",
      "..#..",
      "..#..",
      "..#..",
      "..#..",
      "..#..",
      ".###.",
      "#####"
    ],
    [ // tall antenna
      "...#...",
      "#..#..#",
      ".#.#.#.",
      "..###..",
      "...#...",
      "#..#..#",
      ".#.#.#.",
      "..###..",
      "...#...",
      "...#...",
      "...#...",
      "...#...",
      "..###..",
      "#######"
    ],
    [ // satellite dish
      "#.........",
      "##......#.",
      "###....#..",
      ".###..#...",
      "..#####...",
      "...###....",
      "....#.....",
      "....#.....",
      "...###....",
      ".#######.."
    ]
  ];

  function drawSprite(ctx, rows, x, y) {
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === "#") ctx.fillRect(Math.round(x) + c * P, Math.round(y) + r * P, P, P);
      }
    }
  }

  function loadBest() {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { return 0; }
  }
  function saveBest(value) {
    try { localStorage.setItem(BEST_KEY, String(value)); } catch (e) { /* private mode: keep it in memory only */ }
  }

  // host: element to put the game in.  isActive(): true while its window is in front.
  function mount(host, isActive) {
    var canvas = document.createElement("canvas");
    canvas.className = "game-canvas";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Jumping game. Press space or tap to jump.");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var state = "idle";            // idle | run | over
    var best = loadBest();
    var score = 0, distance = 0, speed = 0;
    var y = 0, vy = 0;             // player height above the floor (negative = up)
    var obstacles = [], gap = 0, specks = [];
    var last = 0, raf = 0, overAt = 0;

    var tvW = TV[0].length * P, tvH = (TV.length + 3) * P, tvX = 56;

    for (var i = 0; i < 14; i++) specks.push({ x: Math.random() * W, y: GROUND + 6 + Math.random() * 18, w: 3 + Math.random() * 10 });

    function reset() {
      state = "run";
      score = 0; distance = 0; speed = 300;
      y = 0; vy = 0;
      obstacles = []; gap = 420;
    }

    function press() {
      if (state === "idle") { reset(); return; }
      if (state === "over") { if (performance.now() - overAt > 450) reset(); return; }
      if (y === 0) { vy = -720; PF.audio.blip(); }
    }

    function update(dt) {
      speed = Math.min(760, speed + 7 * dt);
      distance += speed * dt;
      score = Math.floor(distance / 12);

      vy += 2200 * dt;
      y += vy * dt;
      if (y > 0) { y = 0; vy = 0; }

      gap -= speed * dt;
      if (gap <= 0) {
        var rows = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        obstacles.push({ rows: rows, x: W + 10, w: rows[0].length * P, h: rows.length * P });
        gap = 250 + Math.random() * 300 + speed * 0.4;
      }

      for (var i = obstacles.length - 1; i >= 0; i--) {
        var o = obstacles[i];
        o.x -= speed * dt;
        if (o.x + o.w < -10) { obstacles.splice(i, 1); continue; }

        // Hit test with a little forgiveness around the edges
        var m = 6;
        var hit = tvX + m < o.x + o.w - m && tvX + tvW - m > o.x + m && GROUND + y - m > GROUND - o.h + m;
        if (hit) {
          state = "over";
          overAt = performance.now();
          if (score > best) { best = score; saveBest(best); }
          PF.audio.thump();
        }
      }

      for (var k = 0; k < specks.length; k++) {
        specks[k].x -= speed * dt;
        if (specks[k].x + specks[k].w < 0) specks[k].x = W + Math.random() * 60;
      }
    }

    function five(n) { return String(n).padStart(5, "0"); }

    function draw(now) {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = INK;

      ctx.fillRect(0, GROUND, W, 2);
      for (var k = 0; k < specks.length; k++) ctx.fillRect(Math.round(specks[k].x), Math.round(specks[k].y), specks[k].w, 2);

      for (var i = 0; i < obstacles.length; i++) drawSprite(ctx, obstacles[i].rows, obstacles[i].x, GROUND - obstacles[i].h);

      var legs = y < 0 ? LEGS[2] : state === "run" ? LEGS[Math.floor(now / 90) % 2] : LEGS[0];
      var top = GROUND + y - tvH;
      drawSprite(ctx, TV, tvX, top);
      drawSprite(ctx, legs, tvX, top + TV.length * P);

      ctx.font = '26px "VT323", monospace';
      ctx.textBaseline = "top";
      ctx.textAlign = "right";
      ctx.fillText("HI " + five(best) + "  " + five(score), W - 14, 10);

      ctx.textAlign = "center";
      if (state === "idle") {
        ctx.fillText("NO SIGNAL", W / 2, 46);
        ctx.fillText("press space or tap to play", W / 2, 76);
      } else if (state === "over") {
        ctx.fillText("GAME OVER", W / 2, 46);
        ctx.fillText("space or tap to try again", W / 2, 76);
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (state === "run" && isActive()) update(dt);
      draw(now);
    }

    function onKey(event) {
      if (!isActive()) return;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        press();
      }
    }
    function onPointer(event) { event.preventDefault(); press(); }

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);
    raf = requestAnimationFrame(frame);

    return {
      destroy: function () {
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKey);
        canvas.removeEventListener("pointerdown", onPointer);
      }
    };
  }

  PF.game = { mount: mount };
})();

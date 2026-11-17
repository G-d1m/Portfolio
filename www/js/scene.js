/* ------------------------------------------------------------------
   The 3D swarm behind the page.
   Thousands of glowing points take a different shape on every
   channel and fly from one shape to the next while you scroll.
   A second layer of dust rushes past faster the faster you scroll.

   Shapes, in channel order:
     0 sphere   1 double helix   2 icosahedron   3 torus knot
     4 tunnel   5 wave           6 the word HI!
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var THREE = window.THREE;
  var TAU = Math.PI * 2;
  var SHAPES = 7;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Random order, so points cross the screen when they change shape instead of sliding over
  function shuffle(arr) {
    var n = arr.length / 3, i, j, t, k;
    for (i = n - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      for (k = 0; k < 3; k++) { t = arr[i * 3 + k]; arr[i * 3 + k] = arr[j * 3 + k]; arr[j * 3 + k] = t; }
    }
    return arr;
  }

  /* ====================== Shapes ====================== */

  function sphere(n) {
    var a = new Float32Array(n * 3), golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      var R = 2.2 * (Math.random() < 0.85 ? 1 : rnd(0.55, 0.95));
      a[i * 3] = Math.cos(th) * r * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = Math.sin(th) * r * R;
    }
    return shuffle(a);
  }

  function helix(n) {
    var a = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var t = Math.random(), y = (t - 0.5) * 6.2, ang = t * TAU * 2.6, x, z;
      if (Math.random() < 0.72) {
        var side = Math.random() < 0.5 ? 0 : Math.PI;
        x = Math.cos(ang + side) * 1.15 + rnd(-0.07, 0.07);
        z = Math.sin(ang + side) * 1.15 + rnd(-0.07, 0.07);
      } else {                                         // the rungs between the strands
        var step = Math.round(t * 30) / 30, ang2 = step * TAU * 2.6, f = rnd(-1, 1);
        y = (step - 0.5) * 6.2;
        x = Math.cos(ang2) * 1.15 * f;
        z = Math.sin(ang2) * 1.15 * f;
      }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }

  function icosahedron(n) {
    var p = (1 + Math.sqrt(5)) / 2;
    var v = [[-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0], [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p], [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1]];
    var s = 2.3 / Math.sqrt(1 + p * p);
    var edges = [], i, j;
    for (i = 0; i < 12; i++) for (j = i + 1; j < 12; j++) {
      var dx = v[i][0] - v[j][0], dy = v[i][1] - v[j][1], dz = v[i][2] - v[j][2];
      if (Math.abs(Math.sqrt(dx * dx + dy * dy + dz * dz) - 2) < 0.01) edges.push([v[i], v[j]]);
    }
    var a = new Float32Array(n * 3);
    for (i = 0; i < n; i++) {
      var k = i * 3;
      if (i % 5 === 0) {                               // a few points float on the faces
        var e1 = edges[Math.floor(Math.random() * edges.length)], u = Math.random(), r = 0.82;
        a[k] = (e1[0][0] + (e1[1][0] - e1[0][0]) * u) * s * r;
        a[k + 1] = (e1[0][1] + (e1[1][1] - e1[0][1]) * u) * s * r;
        a[k + 2] = (e1[0][2] + (e1[1][2] - e1[0][2]) * u) * s * r;
        continue;
      }
      var e = edges[i % edges.length], t = Math.random(), j2 = 0.035;
      a[k] = (e[0][0] + (e[1][0] - e[0][0]) * t) * s + rnd(-j2, j2);
      a[k + 1] = (e[0][1] + (e[1][1] - e[0][1]) * t) * s + rnd(-j2, j2);
      a[k + 2] = (e[0][2] + (e[1][2] - e[0][2]) * t) * s + rnd(-j2, j2);
    }
    return shuffle(a);
  }

  function torusKnot(n) {
    var a = new Float32Array(n * 3), P = 2, Q = 3;
    for (var i = 0; i < n; i++) {
      var t = Math.random() * TAU, r = 2 + Math.cos(Q * t);
      var cx = r * Math.cos(P * t), cy = r * Math.sin(P * t), cz = -Math.sin(Q * t);
      var u = Math.random() * TAU, w = Math.random() * TAU, tube = 0.38 * Math.sqrt(Math.random());
      a[i * 3] = (cx + Math.cos(u) * Math.sin(w) * tube) * 0.78;
      a[i * 3 + 1] = (cy + Math.sin(u) * Math.sin(w) * tube) * 0.78;
      a[i * 3 + 2] = (cz + Math.cos(w) * tube) * 0.78;
    }
    return a;
  }

  function tunnel(n) {
    var a = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var ring = Math.floor(Math.random() * 24), z = 2.2 - ring * 0.42;
      var ang = Math.random() * TAU + ring * 0.21, R = 2.25 + Math.sin(ring * 0.7) * 0.15;
      a[i * 3] = Math.cos(ang) * R;
      a[i * 3 + 1] = Math.sin(ang) * R;
      a[i * 3 + 2] = z + rnd(-0.04, 0.04);
    }
    return a;
  }

  function wave(n) {
    var a = new Float32Array(n * 3), cols = Math.ceil(Math.sqrt(n * 1.6)), rows = Math.ceil(n / cols);
    for (var i = 0; i < n; i++) {
      var x = ((i % cols) / (cols - 1) - 0.5) * 9, z = (Math.floor(i / cols) / (rows - 1) - 0.5) * 6;
      var y = Math.sin(x * 0.9) * 0.45 + Math.cos(z * 1.2 + x * 0.3) * 0.35;
      // tilted towards the camera
      a[i * 3] = x;
      a[i * 3 + 1] = y * 0.9 - 0.6 + z * 0.42;
      a[i * 3 + 2] = z * 0.8 - y * 0.2;
    }
    return shuffle(a);
  }

  // Points sampled from the word drawn on a hidden canvas
  function word(n, text, font) {
    var W = 600, H = 260, c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "900 230px " + font;
    g.fillText(text, W / 2, H / 2 + 10);
    var data = g.getImageData(0, 0, W, H).data, hits = [];
    for (var y = 0; y < H; y += 2) for (var x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 128) hits.push(x, y);
    var a = new Float32Array(n * 3), count = hits.length / 2;
    for (var i = 0; i < n; i++) {
      if (!count) { a[i * 3] = rnd(-3, 3); a[i * 3 + 1] = rnd(-1, 1); continue; }
      var h = Math.floor(Math.random() * count);
      a[i * 3] = (hits[h * 2] / W - 0.5) * 6.6 + rnd(-0.02, 0.02);
      a[i * 3 + 1] = -(hits[h * 2 + 1] / H - 0.5) * 2.86 + rnd(-0.02, 0.02);
      a[i * 3 + 2] = rnd(-0.18, 0.18);
    }
    return a;
  }

  /* ====================== Shaders ====================== */

  var VERT = [
    "attribute vec3 s1; attribute vec3 s2; attribute vec3 s3; attribute vec3 s4; attribute vec3 s5; attribute vec3 s6;",
    "attribute float aRand;",
    "uniform float uW[7];",
    "uniform float uTime, uTrans, uScatter, uSize, uPixel, uAspect;",
    "uniform vec2 uMouse; uniform float uMouseOn;",
    "uniform vec2 uPulse; uniform float uPulseR, uPulseA;",
    "uniform vec3 uColA, uColB;",
    "varying vec3 vColor; varying float vAlpha;",
    "void main() {",
    "  vec3 p = position * uW[0] + s1 * uW[1] + s2 * uW[2] + s3 * uW[3] + s4 * uW[4] + s5 * uW[5] + s6 * uW[6];",
    "  float r = aRand * 6.2831;",
    "  vec3 wob = vec3(sin(p.y * 1.7 + uTime * 0.9 + r), sin(p.z * 1.9 + uTime * 1.1 + r * 0.5), sin(p.x * 1.5 + uTime * 0.8 + r * 0.75));",
    "  p += wob * (0.035 + uScatter * 0.9 + uTrans * 1.1 * (0.4 + aRand));",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  vec2 ndc = gl_Position.xy / gl_Position.w;",
    // cursor pushes points away
    "  vec2 dm = ndc - uMouse; dm.x *= uAspect;",
    "  float push = smoothstep(0.42, 0.0, length(dm)) * uMouseOn;",
    "  vec2 dir = normalize(dm + vec2(0.0001));",
    // click shockwave
    "  vec2 dp = ndc - uPulse; dp.x *= uAspect;",
    "  float dist = length(dp);",
    "  float ring = exp(-pow((dist - uPulseR) * 7.0, 2.0)) * uPulseA;",
    "  gl_Position.xy += (dir * push * 0.22 + normalize(dp + vec2(0.0001)) * ring * 0.16) * gl_Position.w;",
    "  gl_PointSize = uSize * uPixel * (0.45 + aRand * 1.1) * (1.0 + push * 1.6 + ring * 2.0) / -mv.z;",
    "  vColor = mix(uColA, uColB, smoothstep(0.2, 0.8, fract(aRand * 7.31 + p.y * 0.12)));",
    "  vColor += vec3(push * 0.5 + ring * 0.8);",
    "  vAlpha = 0.55 + 0.45 * sin(uTime * 2.3 + aRand * 40.0);",
    "}"
  ].join("\n");

  // uGlow 1: points add light (for a dark screen). 0: points are ink (for a light screen).
  var FRAG = [
    "uniform float uOpacity, uGlow;",
    "varying vec3 vColor; varying float vAlpha;",
    "void main() {",
    "  float d = length(gl_PointCoord - 0.5);",
    "  float a = pow(smoothstep(0.5, 0.0, d), uGlow > 0.5 ? 1.7 : 1.0);",
    "  gl_FragColor = vec4(vColor * mix(1.0, a, uGlow), a * vAlpha * uOpacity);",
    "}"
  ].join("\n");

  var DUST_VERT = [
    "attribute float aRand;",
    "uniform float uTravel, uPixel;",
    "varying float vFade; varying float vTint;",
    "void main() {",
    "  vec3 p = position;",
    "  p.z = mod(p.z + uTravel, 46.0) - 40.0;",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  gl_PointSize = uPixel * (1.0 + aRand * 2.2) * 9.0 / -mv.z;",
    "  vFade = smoothstep(-40.0, -26.0, p.z) * smoothstep(6.0, 2.0, p.z);",
    "  vTint = aRand;",
    "}"
  ].join("\n");

  var DUST_FRAG = [
    "uniform vec3 uCol, uBase; uniform float uOpacity, uGlow;",
    "varying float vFade; varying float vTint;",
    "void main() {",
    "  float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));",
    "  vec3 c = mix(uBase, uCol, step(0.6, vTint));",
    "  gl_FragColor = vec4(c * mix(1.0, a, uGlow), a * vFade * uOpacity * 0.7);",
    "}"
  ].join("\n");

  /* ====================== The world ====================== */

  // Returns null when the browser can't draw WebGL; the page works without it.
  function create(canvas, options) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      return null;
    }
    var pixel = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pixel);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 7;

    var N = options.count;
    // On a light screen the points are drawn like ink instead of adding light
    var glow = options.light ? 0 : 1;
    var blending = options.light ? 1 : THREE.AdditiveBlending;     // 1 is three.js NormalBlending
    var base = options.base || [1, 1, 1];
    var geo = new THREE.BufferGeometry();
    var shapes = [sphere(N), helix(N), icosahedron(N), torusKnot(N), tunnel(N), wave(N), word(N, "HI!", "Arial Black, Impact, sans-serif")];
    geo.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    for (var s = 1; s < SHAPES; s++) geo.setAttribute("s" + s, new THREE.BufferAttribute(shapes[s], 3));
    var rands = new Float32Array(N);
    for (var i = 0; i < N; i++) rands[i] = Math.random();
    geo.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));

    var uniforms = {
      uW: { value: [1, 0, 0, 0, 0, 0, 0] },
      uTime: { value: 0 }, uTrans: { value: 0 }, uScatter: { value: 0 },
      uSize: { value: options.size || 30 }, uPixel: { value: pixel }, uAspect: { value: 1 },
      uMouse: { value: [9, 9] }, uMouseOn: { value: 0 },
      uPulse: { value: [0, 0] }, uPulseR: { value: 0 }, uPulseA: { value: 0 },
      uColA: { value: new THREE.Color(1, 1, 1) }, uColB: { value: new THREE.Color(0, 1, 1) },
      uOpacity: { value: 1 }, uGlow: { value: glow }
    };
    var points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: uniforms, vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, blending: blending
    }));
    points.frustumCulled = false;
    scene.add(points);

    // Dust
    var D = options.dust || 1400;
    var dustGeo = new THREE.BufferGeometry(), dp = new Float32Array(D * 3), dr = new Float32Array(D);
    for (i = 0; i < D; i++) {
      dp[i * 3] = rnd(-14, 14); dp[i * 3 + 1] = rnd(-9, 9); dp[i * 3 + 2] = rnd(0, 46);
      dr[i] = Math.random();
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    dustGeo.setAttribute("aRand", new THREE.BufferAttribute(dr, 1));
    var dustUniforms = {
      uTravel: { value: 0 }, uPixel: { value: pixel }, uOpacity: { value: 1 }, uGlow: { value: glow },
      uCol: { value: new THREE.Color(1, 1, 0) }, uBase: { value: new THREE.Color(base[0], base[1], base[2]) }
    };
    var dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
      uniforms: dustUniforms, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
      transparent: true, depthWrite: false, blending: blending
    }));
    dust.frustumCulled = false;
    scene.add(dust);

    var spin = 0, halfW = 1, wide = true;
    var pulse = { r: 0, a: 0 };

    function resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
      halfW = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z * camera.aspect;
      wide = w / h > 1.15;
    }

    // Swaps the word for one drawn in the page's own font once it has loaded
    function setWord(text, font) {
      var attr = geo.getAttribute("s6");
      attr.array.set(word(N, text, font));
      attr.needsUpdate = true;
    }

    // state: { morph 0..6, colA, colB [r,g,b 0..1], opacity, scatter, speed, mouse {x,y,on}, offsets[], dt, time }
    function frame(st) {
      var m = Math.max(0, Math.min(SHAPES - 1, st.morph));
      var i0 = Math.floor(m), i1 = Math.min(SHAPES - 1, i0 + 1), t = m - i0;
      var e = t * t * (3 - 2 * t);
      var w = uniforms.uW.value;
      for (var k = 0; k < SHAPES; k++) w[k] = 0;
      w[i0] += 1 - e; w[i1] += e;

      uniforms.uTime.value = st.time;
      uniforms.uTrans.value = Math.sin(e * Math.PI);
      uniforms.uScatter.value = st.scatter;
      uniforms.uColA.value.setRGB(st.colA[0], st.colA[1], st.colA[2]);
      uniforms.uColB.value.setRGB(st.colB[0], st.colB[1], st.colB[2]);
      uniforms.uOpacity.value = st.opacity;
      uniforms.uMouse.value[0] = st.mouse.x; uniforms.uMouse.value[1] = st.mouse.y;
      uniforms.uMouseOn.value += ((st.mouse.on ? 1 : 0) - uniforms.uMouseOn.value) * 0.1;

      pulse.r += st.dt * 1.6;
      pulse.a *= Math.pow(0.12, st.dt);
      uniforms.uPulseR.value = pulse.r;
      uniforms.uPulseA.value = pulse.a;

      // Turning: always a little, more when scrolling, none at all on the word so it can be read
      spin += st.dt * (0.16 + Math.min(4, Math.abs(st.speed) * 0.004));
      var face = w[6], wrapped = Math.atan2(Math.sin(spin), Math.cos(spin));
      points.rotation.y = wrapped * (1 - face) + st.mouse.sx * 0.35;
      points.rotation.x = 0.25 * Math.sin(spin * 0.6) * (1 - face) + st.mouse.sy * 0.22;
      points.rotation.z = Math.sin(spin * 0.4) * 0.12 * (1 - face);

      // Where the swarm sits: beside the text on wide screens, behind it on narrow ones
      var off = 0;
      for (k = 0; k < SHAPES; k++) off += (st.offsets[k] || 0) * w[k];
      var targetX = wide ? off * halfW : 0;
      points.position.x += (targetX - points.position.x) * Math.min(1, st.dt * 4);
      var sc = wide ? 1 : 0.78;
      points.scale.set(sc, sc, sc);

      dustUniforms.uTravel.value += st.dt * (1.2 + Math.min(60, Math.abs(st.speed) * 0.06));
      dustUniforms.uCol.value.setRGB(st.colA[0], st.colA[1], st.colA[2]);
      dustUniforms.uOpacity.value = st.opacity;

      renderer.render(scene, camera);
    }

    return {
      resize: resize,
      frame: frame,
      setWord: setWord,
      pulse: function (x, y) {
        uniforms.uPulse.value[0] = x; uniforms.uPulse.value[1] = y;
        pulse.r = 0; pulse.a = 1;
      }
    };
  }

  window.SCENE = { create: create };
})();

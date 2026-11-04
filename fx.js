/* fx.js — the motion layer: a field of polished gold spheres in real perspective (WebGL, no libraries),
   a few of them passing in front of the page, the hero's 3D parallax and card tilt.
   Everything is inert under prefers-reduced-motion (the back field is drawn once, nothing moves). */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var small = (window.innerWidth || 1200) < 760;
  var $ = function (id) { return document.getElementById(id); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (a, b, v) { var x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var D0 = 6;                                    // reference depth: a sphere at d = D0 sits exactly where its (ax, ay) says

  /* ---------- shared pointer ---------- */
  var ptr = { x: 0, y: 0, tx: 0, ty: 0, rx: 0, ry: 0, last: -1e9 };   // x/y: smoothed (also idle sway); rx/ry: where the cursor really is
  window.addEventListener('pointermove', function (e) {
    ptr.tx = (e.clientX / (window.innerWidth || 1) - 0.5) * 2;
    ptr.ty = (e.clientY / (window.innerHeight || 1) - 0.5) * 2;
    ptr.last = performance.now(); ptr.rx = ptr.tx; ptr.ry = ptr.ty;
  }, { passive: true });

  /* ---------- shaders: impostor spheres, lit by a procedural studio so they read as polished gold ---------- */
  var VS = [
    'attribute vec2 a_corner; attribute vec3 a_c; attribute vec4 a_p;',
    'uniform vec2 u_aspect;',
    'varying vec2 v_uv; varying vec4 v_p; varying float v_d; varying vec2 v_ctr;',
    'void main() {',
    '  float q = 1.45 + a_p.y * 0.9;',
    '  vec2 off = a_corner * q * a_p.x;',
    '  gl_Position = vec4(a_c.xy + vec2(off.x / u_aspect.x, off.y), 0.0, 1.0);',
    '  v_uv = a_corner * q; v_p = a_p; v_d = a_c.z; v_ctr = a_c.xy;',
    '}'
  ].join('\n');

  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'varying vec2 v_uv; varying vec4 v_p; varying float v_d; varying vec2 v_ctr;',
    'uniform float u_far; uniform float u_t; uniform vec2 u_asp2;',
    // a warm photo studio: bright overhead, amber horizon, a floor that bounces warm light, one big window and one strip light
    'vec3 env(vec3 r) {',
    '  float h = r.y;',
    '  vec3 sky = mix(vec3(0.95, 0.62, 0.24), vec3(1.55, 1.30, 1.00), smoothstep(0.0, 0.9, h));',
    '  vec3 flr = mix(vec3(0.42, 0.20, 0.07), vec3(0.06, 0.025, 0.015), smoothstep(-0.05, -0.95, h));',
    '  vec3 c = mix(flr, sky, smoothstep(-0.25, 0.25, h));',
    '  float az = atan(r.x, r.z); float el = asin(clamp(h, -1.0, 1.0));',
    '  float win = smoothstep(0.0, 0.10, 0.46 - abs(az + 0.9)) * smoothstep(0.0, 0.10, 0.30 - abs(el - 0.55));',
    '  float strip = smoothstep(0.0, 0.06, 0.10 - abs(az - 1.15)) * smoothstep(0.0, 0.10, 0.75 - abs(el - 0.05));',
    '  return c + vec3(2.7, 2.35, 1.9) * win + vec3(1.7, 1.4, 1.05) * strip;',
    '}',
    'void main() {',
    '  float rr = length(v_uv);',
    '  float blur = v_p.y;',
    '  if (rr > 1.45 + blur * 0.9) discard;',
    '  float edge = 1.0 - smoothstep(0.985 - blur * 0.6, 1.015 + blur * 0.9, rr);',
    '  vec2 u2 = rr > 1.0 ? v_uv / rr : v_uv;',
    '  vec3 n = vec3(u2, sqrt(max(0.0, 1.0 - dot(u2, u2))));',
    '  vec3 v = normalize(vec3(-v_ctr.x * u_asp2.x * 0.5, -v_ctr.y * 0.5, 1.0));',      // towards the camera, so highlights shift as it floats across
    '  float ndv = clamp(dot(n, v), 0.0, 1.0);',
    '  vec3 r = 2.0 * dot(n, v) * n - v;',
    '  float yaw = u_t * 0.18 + v_p.w * 6.283; float cy = cos(yaw); float sy = sin(yaw);',
    '  r = vec3(cy * r.x + sy * r.z, r.y, -sy * r.x + cy * r.z);',                          // the studio slowly turns round it
    '  vec3 F0 = vec3(1.0, 0.72, 0.30);',
    '  vec3 F = F0 + (vec3(1.0) - F0) * pow(1.0 - ndv, 5.0);',
    '  vec3 col = 1.0 - exp(-env(r) * F * 1.55);',
    '  col = mix(col, vec3(0.55, 0.36, 0.14), blur * 0.55);',                               // out of focus: gold loses its contrast
    '  float ea = edge * (1.0 - blur * 0.3);',
    '  float ha = (rr > 1.0 ? exp(-(rr - 1.0) * 6.0) : 1.0) * 0.12 * (1.0 - blur * 0.5);',
    '  float fog = 1.0 - smoothstep(u_far * 0.55, u_far, v_d);',
    '  float A = v_p.z * fog;',
    '  vec3 oc = col * ea + vec3(1.0, 0.72, 0.30) * ha * (1.0 - ea);',
    '  float oa = ea + ha * (1.0 - ea);',
    '  gl_FragColor = vec4(min(oc, vec3(1.0)) * A, oa * A);',
    '}'
  ].join('\n');

  var CORNERS = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

  function makeField(canvas, o) {
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return null;
    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = shader(gl.VERTEX_SHADER, VS), fs = shader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);

    var aCorner = gl.getAttribLocation(pr, 'a_corner'), aC = gl.getAttribLocation(pr, 'a_c'), aP = gl.getAttribLocation(pr, 'a_p');
    var uAsp = gl.getUniformLocation(pr, 'u_aspect'), uAsp2 = gl.getUniformLocation(pr, 'u_asp2'), uFar = gl.getUniformLocation(pr, 'u_far'), uT = gl.getUniformLocation(pr, 'u_t');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    var STRIDE = 9 * 4;
    gl.enableVertexAttribArray(aCorner); gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(aC); gl.vertexAttribPointer(aC, 3, gl.FLOAT, false, STRIDE, 8);
    gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, STRIDE, 20);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var cap = o.n + 48, data = new Float32Array(cap * 6 * 9);
    var items = [], extra = [], aspect = 1, lost = false;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });

    function spawn(s, anywhere) {
      s.ax = Math.random() < 0.55 ? (Math.random() < 0.5 ? -1 : 1) * rand(0.62, 1.12) : rand(-0.55, 0.55); s.ay = rand(-0.95, 0.95);
      s.d = anywhere ? rand(o.dMin, o.dMax) : o.dMax;
      s.r = rand(o.rMin, o.rMax); s.v = rand(0.75, 1.3); s.seed = Math.random();
      return s;
    }
    for (var i = 0; i < o.n; i++) items.push(spawn({}, true));

    function resize() {
      var k = Math.min(window.devicePixelRatio || 1, o.dpr);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * k));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * k));
      aspect = canvas.width / canvas.height;
    }

    function frame(dt, warp, t) {
      if (lost) return;
      var list = [], k, s, n = 0, live = (performance.now() - ptr.last) < 2600;
      for (k = 0; k < items.length; k++) {
        s = items[k];
        if (!o.still) { s.d -= o.speed * s.v * dt * (1 + warp); s.ax += Math.sin(t * 0.25 + s.seed * 12) * 0.0004; }
        if (s.d < o.dMin) spawn(s, false);
        var sc = D0 / s.d;
        var bx = (s.ax - ptr.x * 0.11) * sc, by = (s.ay + ptr.y * 0.08) * sc;                  // nearer spheres shift more: real parallax
        var tox = 0, toy = 0;
        if (live) {                                                                              // the cursor pushes spheres away, like a hand in water
          var qx = (bx - ptr.rx) * aspect, qy = by + ptr.ry, dd = Math.sqrt(qx * qx + qy * qy), infl = 0.30 + s.r * sc * 1.4;
          if (dd < infl && dd > 0.0001) { var f = 1 - dd / infl; f = f * f * (3 - 2 * f); tox = (qx / dd) * f * 0.30 / aspect; toy = (qy / dd) * f * 0.30; }
        }
        s.ox = (s.ox || 0) + (tox - (s.ox || 0)) * 0.12; s.oy = (s.oy || 0) + (toy - (s.oy || 0)) * 0.12;
        s.px = bx + s.ox; s.py = by + s.oy;
        s.pr = s.r * sc; s.pb = o.blur(s.d);
        s.pa = o.alpha * smooth(o.dMin, o.dMin + (o.dMax - o.dMin) * 0.16, s.d);
        list.push(s);
      }
      for (k = extra.length - 1; k >= 0; k--) {
        if (extra[k].step(extra[k], dt)) list.push(extra[k]); else extra.splice(k, 1);
      }
      list.sort(function (a, b) { return b.d - a.d; });                    // back to front
      for (k = 0; k < list.length && n < cap; k++) {
        s = list[k];
        var ext = s.pr * (1.45 + s.pb * 0.9);
        if (s.pa <= 0.003 || s.px + ext / aspect < -1 || s.px - ext / aspect > 1 || s.py + ext < -1 || s.py - ext > 1) continue;
        for (var c = 0; c < 6; c++) {
          var q = (n * 6 + c) * 9;
          data[q] = CORNERS[c * 2]; data[q + 1] = CORNERS[c * 2 + 1];
          data[q + 2] = s.px; data[q + 3] = s.py; data[q + 4] = s.d;
          data[q + 5] = s.pr; data[q + 6] = s.pb; data[q + 7] = s.pa; data[q + 8] = s.seed;
        }
        n++;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (n) {
        gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, n * 54), gl.DYNAMIC_DRAW);
        gl.uniform2f(uAsp, aspect, 1); gl.uniform2f(uAsp2, aspect, 1); gl.uniform1f(uFar, o.far); gl.uniform1f(uT, t);
        gl.drawArrays(gl.TRIANGLES, 0, n * 6);
      }
    }
    resize();
    return { frame: frame, resize: resize, extra: extra };
  }

  /* ---------- boot ---------- */
  var back = null, front = null;
  var cb = $('fx-back'), cf = $('fx-front');
  if (cb) back = makeField(cb, {
    n: small ? 6 : 10, dMin: 5.0, dMax: 20, far: 22, speed: 0.5, rMin: 0.06, rMax: 0.15, alpha: 0.9, dpr: 1.5, still: reduce,
    blur: function (d) { return clamp(Math.abs(d - 9) / 11, 0, 1) * 0.7; }
  });
  if (cf && !reduce) front = makeField(cf, {
    n: small ? 1 : 2, dMin: 2.4, dMax: 7.5, far: 14, speed: 1.2, rMin: 0.03, rMax: 0.06, alpha: 0.6, dpr: 1.25,
    blur: function (d) { return clamp((7.5 - d) / 5.1, 0, 1) * 0.9; }                        // bokeh as they pass the lens
  });

  /* ---------- hero: the screen and the character parallax in 3D ---------- */
  var stage = $('home');   // --px / --py live on the hero, so the character and the headline both read them
  function updateStage() {
    if (!stage || reduce || window.scrollY > (window.innerHeight || 800) * 1.1) return;
    stage.style.setProperty('--px', ptr.x.toFixed(3));
    stage.style.setProperty('--py', ptr.y.toFixed(3));
  }

  /* ---------- loop ---------- */
  var last = performance.now(), lastY = window.scrollY, vel = 0, raf = 0;
  function tick(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var y = window.scrollY;
    vel += (clamp((y - lastY) / Math.max(dt, 0.001), -4000, 4000) - vel) * 0.12; lastY = y;
    if (now - ptr.last > 2600) { ptr.tx = Math.sin(now / 2600) * 0.4; ptr.ty = Math.cos(now / 3300) * 0.18; }   // idle sway
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    var warp = clamp(Math.abs(vel) / 900, 0, 2.2);                                              // scrolling pulls the spheres faster
    if (back) back.frame(dt, warp, now / 1000);
    if (front) front.frame(dt, warp * 0.8, now / 1000);
    updateStage();
    if (!document.hidden) raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  var rz = 0;
  window.addEventListener('resize', function () {
    if (rz) return;
    rz = requestAnimationFrame(function () { rz = 0; if (back) back.resize(); if (front) front.resize(); if (reduce && back) back.frame(0, 0, 0); });
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

  if (reduce) { if (back) back.frame(0, 0, 0); } else { start(); }

  /* ---------- cards tilt in 3D under the cursor (the CSS reads --rx --ry --gx --gy) ---------- */
  if (!reduce && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cur = null;
    var clear = function () {
      if (!cur) return;
      ['--rx', '--ry', '--gx', '--gy'].forEach(function (p) { cur.style.removeProperty(p); });
      cur = null;
    };
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('.card-media') : null;
      if (el !== cur) { clear(); cur = el; }
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', clear);
  }
})();

/* fx.js — the motion layer: a field of polished gold spheres in real perspective (WebGL, no libraries),
   a few of them passing in front of the page, the opening impact, the hero's 3D parallax and card tilt.
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
  var ptr = { x: 0, y: 0, tx: 0, ty: 0, last: -1e9 };
  window.addEventListener('pointermove', function (e) {
    ptr.tx = (e.clientX / (window.innerWidth || 1) - 0.5) * 2;
    ptr.ty = (e.clientY / (window.innerHeight || 1) - 0.5) * 2;
    ptr.last = performance.now();
  }, { passive: true });

  /* ---------- shaders: impostor spheres, lit by a procedural studio so they read as polished gold ---------- */
  var VS = [
    'attribute vec2 a_corner; attribute vec3 a_c; attribute vec4 a_p;',
    'uniform vec2 u_aspect;',
    'varying vec2 v_uv; varying vec4 v_p; varying float v_d;',
    'void main() {',
    '  float q = 1.45 + a_p.y * 0.9;',
    '  vec2 off = a_corner * q * a_p.x;',
    '  gl_Position = vec4(a_c.xy + vec2(off.x / u_aspect.x, off.y), 0.0, 1.0);',
    '  v_uv = a_corner * q; v_p = a_p; v_d = a_c.z;',
    '}'
  ].join('\n');

  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'varying vec2 v_uv; varying vec4 v_p; varying float v_d;',
    'uniform float u_far;',
    'vec3 env(vec3 r, float s) {',
    '  float up = smoothstep(-0.35, 0.95, r.y);',
    '  vec3 base = mix(vec3(0.10, 0.02, 0.03), vec3(1.0, 0.82, 0.55), up * up);',
    '  float t = (r.y - 0.12 - 0.05 * sin(s * 6.0)) * 7.0;',
    '  base += vec3(1.0, 0.86, 0.60) * exp(-t * t) * 0.9;',
    '  base += vec3(1.0, 0.95, 0.85) * (smoothstep(0.90, 0.985, dot(r, normalize(vec3(-0.55, 0.65, 0.5)))) * 2.6',
    '                                 + smoothstep(0.93, 0.99, dot(r, normalize(vec3(0.7, 0.2, 0.65)))) * 1.4);',
    '  base += vec3(0.8, 0.25, 0.2) * smoothstep(0.2, 0.9, -r.y) * 0.35;',   // warm bounce from the burgundy below
    '  return base;',
    '}',
    'void main() {',
    '  float rr = length(v_uv);',
    '  float blur = v_p.y;',
    '  if (rr > 1.45 + blur * 0.9) discard;',
    '  float edge = 1.0 - smoothstep(0.98 - blur * 0.6, 1.02 + blur * 0.9, rr);',
    '  vec2 u2 = rr > 1.0 ? v_uv / rr : v_uv;',
    '  vec3 n = vec3(u2, sqrt(max(0.0, 1.0 - dot(u2, u2))));',
    '  vec3 r = 2.0 * n.z * n - vec3(0.0, 0.0, 1.0);',
    '  float fres = pow(1.0 - n.z, 4.0);',
    '  vec3 F0 = vec3(1.0, 0.77, 0.36);',
    '  vec3 F = F0 + (vec3(1.0) - F0) * fres * 0.55;',
    '  vec3 col = F * env(r, v_p.w) * 0.9 + F0 * 0.10 * max(0.0, dot(n, normalize(vec3(-0.4, 0.6, 0.7))));',
    '  col = col / (1.0 + 0.45 * col) * 1.35;',
    '  col = mix(col, vec3(0.52, 0.34, 0.14), blur * 0.55);',            // depth of field: out-of-focus gold loses its contrast
    '  float ea = edge * (1.0 - blur * 0.3);',
    '  float ha = (rr > 1.0 ? exp(-(rr - 1.0) * 5.0) : 1.0) * 0.18 * (1.0 - blur * 0.5);',
    '  float fog = 1.0 - smoothstep(u_far * 0.55, u_far, v_d);',         // far spheres emerge out of the velvet
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
    var uAsp = gl.getUniformLocation(pr, 'u_aspect'), uFar = gl.getUniformLocation(pr, 'u_far');
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
      s.ax = rand(-1.1, 1.1); s.ay = rand(-0.95, 0.95);
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
      var list = [], k, s, n = 0;
      for (k = 0; k < items.length; k++) {
        s = items[k];
        if (!o.still) { s.d -= o.speed * s.v * dt * (1 + warp); s.ax += Math.sin(t * 0.25 + s.seed * 12) * 0.0004; }
        if (s.d < o.dMin) spawn(s, false);
        var sc = D0 / s.d;
        s.px = (s.ax - ptr.x * 0.05) * sc; s.py = (s.ay + ptr.y * 0.04) * sc;
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
        gl.uniform2f(uAsp, aspect, 1); gl.uniform1f(uFar, o.far);
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
    n: small ? 10 : 20, dMin: 5.2, dMax: 22, far: 24, speed: 1.0, rMin: 0.035, rMax: 0.09, alpha: 0.58, dpr: 1.5, still: reduce,
    blur: function (d) { return clamp(Math.abs(d - 10) / 12, 0, 1) * 0.75; }
  });
  if (cf && !reduce) front = makeField(cf, {
    n: small ? 2 : 4, dMin: 2.4, dMax: 7.5, far: 14, speed: 2.1, rMin: 0.02, rMax: 0.05, alpha: 0.8, dpr: 1.25,
    blur: function (d) { return clamp((7.5 - d) / 5.1, 0, 1) * 0.9; }                        // bokeh as they pass the lens
  });

  /* ---------- opening impact: a gold sphere rushes the lens, hits the screen, bursts ---------- */
  function burst() {
    for (var i = 0; i < 22; i++) {
      var a = Math.random() * 6.283, sp = rand(0.5, 1.9);
      front.extra.push({
        d: 4, px: 0, py: 0, pr: rand(0.012, 0.03), pb: 0.05, pa: 1, seed: Math.random(), life: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        step: function (s, dt) { s.life += dt; s.vy -= 0.9 * dt; s.px += s.vx * dt; s.py += s.vy * dt; s.pa = 1 - smooth(0.45, 1, s.life); return s.life < 1; }
      });
    }
  }
  function hit() {
    var imp = $('impact'), main = document.querySelector('main');
    if (imp) { imp.classList.add('go'); setTimeout(function () { imp.classList.remove('go'); }, 800); }
    if (main) { main.classList.add('shake'); setTimeout(function () { main.classList.remove('shake'); }, 520); }
    burst();
  }
  function intro() {
    if (reduce || !front || window.scrollY > 40) return;
    try { if (sessionStorage.getItem('hh-intro') === '1') return; sessionStorage.setItem('hh-intro', '1'); } catch (e) {}
    var t0 = performance.now() + 450, dur = 1000;                                              // the hero copy starts revealing first
    front.extra.push({
      d: 14, px: 0, py: 0.02, pr: 0, pb: 0, pa: 0, seed: 0.37,
      step: function (s) {
        var p = clamp((performance.now() - t0) / dur, 0, 1);
        if (p <= 0) { s.pa = 0; return true; }
        s.d = 14 - 12.9 * Math.pow(p, 2.4);                                                    // accelerates into the lens
        s.pr = 0.014 + 1.3 * Math.pow(p, 3.2); s.pb = 0.25 * smooth(0.75, 1, p); s.pa = 1;
        if (p >= 1) { hit(); return false; }
        return true;
      }
    });
  }

  /* ---------- hero: the screen and the character parallax in 3D ---------- */
  var stage = $('stage3d');
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
    if (now - ptr.last > 2600) { ptr.tx = Math.sin(now / 2400) * 0.55; ptr.ty = Math.cos(now / 3100) * 0.25; }   // idle sway
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    var warp = clamp(Math.abs(vel) / 700, 0, 3.5);                                              // scrolling pulls the spheres faster
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

  if (reduce) { if (back) back.frame(0, 0, 0); } else { start(); intro(); }

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

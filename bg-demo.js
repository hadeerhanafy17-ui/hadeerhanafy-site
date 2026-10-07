/* Background chooser — temporary preview page (bg.html). Delete both once a
   direction is picked. No inline script, so the site CSP applies unchanged. */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---- 3: film grain, drawn once into a tiling data URL ---- */
  (function grain() {
    var n = 110, c = document.createElement('canvas');
    c.width = c.height = n;
    var g = c.getContext('2d'), img = g.createImageData(n, n), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 15;
    }
    g.putImageData(img, 0, 0);
    document.getElementById('grain').style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
  })();

  /* ---- 2: drifting dust ---- */
  var cv = document.getElementById('dust'), ctx = cv.getContext('2d');
  var dust = [], raf = 0, running = false;

  function seed() {
    var w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight;
    var count = Math.round(Math.min(90, (w * h) / 16000));
    dust = [];
    for (var i = 0; i < count; i++) {
      dust.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -0.05 - Math.random() * 0.17,
        a: 0.12 + Math.random() * 0.4,
        p: Math.random() * Math.PI * 2
      });
    }
  }

  function tick(t) {
    raf = 0;
    if (!running) return;
    var w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < dust.length; i++) {
      var p = dust[i];
      p.x += p.vx + Math.sin(t / 2600 + p.p) * 0.11;
      p.y += p.vy;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
      if (p.x < -6) p.x = w + 6; else if (p.x > w + 6) p.x = -6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(223,245,94,' + (p.a * (0.6 + 0.4 * Math.sin(t / 1700 + p.p))).toFixed(3) + ')';
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function startDust() {
    if (reduce || running) return;
    seed(); running = true;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function stopDust() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    ctx.clearRect(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', function () { if (running) seed(); });

  /* ---- picker ---- */
  var opts = Array.prototype.slice.call(document.querySelectorAll('[data-bg]'));

  function pick(n) {
    for (var i = 1; i <= 3; i++) {
      document.getElementById('bg' + i).classList.toggle('on', i === n);
    }
    opts.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-bg') === String(n)); });
    if (n === 2) startDust(); else stopDust();
    try { history.replaceState(null, '', '?bg=' + n); } catch (e) {}
  }

  opts.forEach(function (b) {
    b.addEventListener('click', function () { pick(parseInt(b.getAttribute('data-bg'), 10)); });
  });

  var start = parseInt((location.search.match(/bg=(\d)/) || [])[1], 10);
  pick(start >= 1 && start <= 3 ? start : 1);
})();

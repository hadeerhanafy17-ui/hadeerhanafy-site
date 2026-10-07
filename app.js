(function () {
  'use strict';

  var CATS = { cgi: 'AI CGI', brand: 'Brand Commercials', trend: 'Trend-Led', expert: 'Expert Branding' };

  var PROJECTS = [
    { title: 'The shave that never ends', cat: 'expert',
      summary: 'A wordless story about the daily cycle of shaving and regrowth, and the clinic session that ends it. Made for Al Hoqail Medical Group.',
      stat: '200,000+ views', loop: 'assets/w1-loop.webp', full: 'assets/w1.mp4' },
    { title: 'Every piece has its animal', cat: 'cgi', tag: 'Concept',
      summary: 'A lioness in ruby, a panther in emerald, a wolf in diamonds — each animal wears the piece that matches it. Self-initiated concept inspired by L’azurde.',
      loop: 'assets/w10-loop.webp', full: 'assets/w10.mp4' },
    { title: 'Say it out loud', cat: 'expert',
      summary: 'A boy learns to say no in three steps. Written and voiced in Jordanian dialect for a child-psychology specialist building her practice.',
      stat: '35,000+ views', loop: 'assets/w2-loop.webp', full: 'assets/w2.mp4' },
    { title: 'When the kitchen goes down', cat: 'brand',
      summary: 'Service stops mid-rush: the flame dies, the orders pile up, and one call brings the crew. A dialogue-free film for the maintenance arm of Miz in the UAE.',
      loop: 'assets/w3-loop.webp', full: 'assets/w3.mp4' },
    { title: 'Her trend, not the trend', cat: 'trend',
      summary: 'A known trend taken apart and rebuilt around one doctor’s identity, down to her own cup and her own screen. Made for Dr. Amira Kamal.',
      loop: 'assets/w4-loop.webp', full: 'assets/w4.mp4' },
    { title: 'Meet Layan', cat: 'expert',
      summary: 'A miniature 3D version of the clinic’s own assistant, designed from a single photo, launching the series she now hosts. Made for Dr. Amira Kamal in Saudi Arabia.',
      loop: 'assets/w5-loop.webp', full: 'assets/w5.mp4' },
    { title: 'Out of the billboard', cat: 'cgi',
      summary: 'A product handed off a city billboard straight into a hand on the street. Built around REJURAN’s own packaging for Dr. Amira Kamal.',
      loop: 'assets/w6-loop.webp', full: 'assets/w6.mp4' },
    { title: 'The storefront that serves itself', cat: 'cgi',
      summary: 'Giant dishes rise out of a cafe facade until the whole menu is standing on the street. Produced through a marketing agency for Menta Cafe & Restaurant.',
      loop: 'assets/w7-loop.webp', full: 'assets/w7.mp4' },
    { title: 'Results, out of the bag', cat: 'brand',
      summary: 'Filler cases lift out of the clinic’s own shopping bag and arrange themselves, turning a plain before-and-after into a product reveal. Made for a dermatology and aesthetics clinic in Saudi Arabia.',
      loop: 'assets/w8-loop.webp', full: 'assets/w8.mp4' },
    { title: 'Skip the invoice', cat: 'cgi', tag: 'Concept',
      summary: 'A product reveal built around one line: skip the invoice, do the collab. Self-initiated concept for COLAB, not a commissioned campaign.',
      loop: 'assets/w9-loop.webp', full: 'assets/w9.mp4' }
  ];

  var STEPS = [
    { title: 'Hook and brief', text: 'It starts from the client, the product and the one moment that stops the scroll in the first one or two seconds.', deliver: 'Concept directions and the opening hook' },
    { title: 'Script and characters', text: 'A timed beat sheet, dialogue written in the right dialect, and characters designed to stay consistent across every scene.', deliver: 'Script, beat sheet and character references' },
    { title: 'References and shots', text: 'Visual references and a shot list that fix framing, camera and transitions before anything is generated.', deliver: 'Reference board and shot list' },
    { title: 'Prompt and generate', text: 'Prompts written for each tool, not copied between them. The hardest shot is tested first.', deliver: 'Approved test shots' },
    { title: 'Identity and motion review', text: 'Faces, products, logos and motion are checked and fixed before anything moves to final quality.', deliver: 'Locked scenes' },
    { title: 'Voice, edit and captions', text: 'Voice and lip-sync, editing, sound, captions and revisions until it is ready to post.', deliver: 'Final film and caption' }
  ];

  var SERVICES = ['AI CGI', 'Brand Commercial', 'Trend-Led Content', 'Expert Branding', '3D Website', 'Creative Direction'];

  // render pass: one sweep every RP_PERIOD seconds, lasting RP_DUR seconds
  var RP_PERIOD = 7.0, RP_DUR = 1.45;
  var FILTERS = [['all', 'All work'], ['cgi', 'AI CGI'], ['brand', 'Brand Commercials'], ['trend', 'Trend-Led'], ['expert', 'Expert Branding']];

  var $ = function (id) { return document.getElementById(id); };
  var root = $('hh-root');
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

  /* ---------- work grid ---------- */
  var filter = 'all';
  var gridEl = $('hh-grid');
  var filtersEl = $('hh-filters');

  function renderFilters() {
    filtersEl.textContent = '';
    FILTERS.forEach(function (f) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (filter === f[0] ? ' on' : '');
      b.setAttribute('aria-pressed', filter === f[0] ? 'true' : 'false');
      b.textContent = f[1];
      b.addEventListener('click', function () { filter = f[0]; renderFilters(); renderGrid(); });
      filtersEl.appendChild(b);
    });
  }

  function renderGrid() {
    gridEl.textContent = '';
    PROJECTS.filter(function (p) { return filter === 'all' || p.cat === filter; }).forEach(function (p) {
      var art = document.createElement('article');
      art.className = 'card reveal in';

      var media = document.createElement('div');
      media.className = 'card-media';

      var cat = document.createElement('span');
      cat.className = 'card-cat';
      cat.textContent = CATS[p.cat];
      media.appendChild(cat);

      if (p.tag) {
        var tg = document.createElement('span');
        tg.className = 'card-tag';
        tg.textContent = p.tag;
        media.appendChild(tg);
      }

      var img = document.createElement('img');
      img.className = 'card-loop';
      img.src = p.loop;
      img.alt = p.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      media.appendChild(img);

      var open = document.createElement('button');
      open.type = 'button';
      open.className = 'card-open';
      open.setAttribute('aria-label', 'Play ' + p.title);
      open.addEventListener('click', function () { openPlay(p, open); });
      media.appendChild(open);

      var tag = document.createElement('span');
      tag.className = 'play-tag';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = 'Watch the film';
      media.appendChild(tag);

      var body = document.createElement('div');
      body.className = 'card-body';
      var h3 = document.createElement('h3');
      h3.className = 'card-title';
      h3.textContent = p.title;
      var sum = document.createElement('p');
      sum.className = 'card-sum';
      sum.textContent = p.summary;
      body.appendChild(h3);
      body.appendChild(sum);
      if (p.stat) {
        var st = document.createElement('p');
        st.className = 'card-stat';
        st.textContent = p.stat;
        body.appendChild(st);
      }

      art.appendChild(media);
      art.appendChild(body);
      gridEl.appendChild(art);
    });
    if (window.hhRefreshAnim) window.hhRefreshAnim();
  }

  /* ---------- lightbox ---------- */
  var lb = $('hh-lightbox'), player = $('hh-player'), lbCap = $('hh-lb-cap');
  var lbReturn = null;

  function openPlay(p, src) {
    lbReturn = src || document.activeElement;
    lb.setAttribute('aria-label', p.title);
    lbCap.textContent = p.title;
    player.poster = p.loop;
    player.src = p.full;
    player.currentTime = 0;
    player.muted = false;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    var pr = player.play();
    if (pr && pr.catch) pr.catch(function () { player.muted = true; player.play().catch(function () {}); });
    lb.focus();
  }

  function closePlay() {
    if (lb.hidden) return;
    try { player.pause(); } catch (e) {}
    player.removeAttribute('src');
    player.load();
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lbReturn && lbReturn.focus) { try { lbReturn.focus(); } catch (e) {} }
  }

  $('hh-lb-close').addEventListener('click', closePlay);
  lb.addEventListener('click', function (e) { if (e.target === lb) closePlay(); });

  /* ---------- process ---------- */
  var step = 0;
  var stepsEl = $('hh-steps'), barsEl = $('hh-panel-bars');

  function renderSteps() {
    stepsEl.textContent = '';
    barsEl.textContent = '';
    STEPS.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'step' + (step === i ? ' on' : '');
      b.setAttribute('aria-pressed', step === i ? 'true' : 'false');
      var n = document.createElement('span');
      n.className = 'step-n';
      n.textContent = pad(i + 1);
      var t = document.createElement('span');
      t.textContent = s.title;
      b.appendChild(n);
      b.appendChild(t);
      b.addEventListener('click', function () { step = i; renderSteps(); });
      stepsEl.appendChild(b);

      var bar = document.createElement('span');
      if (i <= step) bar.className = 'on';
      barsEl.appendChild(bar);
    });
    $('hh-panel-num').textContent = pad(step + 1);
    $('hh-panel-text').textContent = STEPS[step].text;
    $('hh-panel-deliver').textContent = STEPS[step].deliver;
  }

  /* ---------- booking modal ---------- */
  var modal = $('hh-modal'), scrim = $('hh-scrim');
  var formStep = $('hh-step-form'), sentStep = $('hh-step-sent');
  var errEl = $('hh-error'), servicesEl = $('hh-services');
  var service = '', modalReturn = null;

  function renderServices() {
    servicesEl.textContent = '';
    SERVICES.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (service === label ? ' on' : '');
      b.setAttribute('aria-pressed', service === label ? 'true' : 'false');
      b.textContent = label;
      b.addEventListener('click', function () { service = (service === label) ? '' : label; renderServices(); });
      servicesEl.appendChild(b);
    });
  }

  function openBook(src) {
    modalReturn = src || document.activeElement;
    formStep.hidden = false;
    sentStep.hidden = true;
    errEl.hidden = true;
    $('hh-copy').textContent = 'Copy request';
    modal.hidden = false;
    scrim.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { modal.focus(); }, 40);
  }

  function closeBook() {
    if (modal.hidden) return;
    modal.hidden = true;
    scrim.hidden = true;
    document.body.style.overflow = '';
    if (modalReturn && modalReturn.focus) { try { modalReturn.focus(); } catch (e) {} }
  }

  function val(id) { return ($(id).value || '').trim(); }

  function buildSummary() {
    var lines = ['Project request for Hadeer Hanafy'];
    if (val('bk-name')) lines.push('Name: ' + val('bk-name'));
    if (val('bk-contact')) lines.push('Email: ' + val('bk-contact'));
    if (val('bk-phone')) lines.push('WhatsApp / Telegram: ' + val('bk-phone'));
    if (val('bk-brand')) lines.push('Brand or product: ' + val('bk-brand'));
    if (service) lines.push('Service: ' + service);
    if (val('bk-budget')) lines.push('Budget: $' + val('bk-budget'));
    if (val('bk-idea')) lines.push('Idea: ' + val('bk-idea'));
    return lines.join('\n');
  }

  $('hh-review').addEventListener('click', function () {
    if (!val('bk-name') || !val('bk-contact')) {
      errEl.textContent = 'Add your name and your email so I can reply.';
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;
    $('hh-summary').textContent = buildSummary();
    formStep.hidden = true;
    sentStep.hidden = false;
    modal.scrollTop = 0;
  });

  $('hh-edit').addEventListener('click', function () {
    sentStep.hidden = true;
    formStep.hidden = false;
  });

  $('hh-copy').addEventListener('click', function () {
    var self = this;
    try {
      navigator.clipboard.writeText($('hh-summary').textContent).then(
        function () { self.textContent = 'Copied'; },
        function () { self.textContent = 'Copy failed'; }
      );
    } catch (e) { self.textContent = 'Copy failed'; }
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (b) {
    b.addEventListener('click', function () { openBook(b); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close-modal]'), function (b) {
    b.addEventListener('click', closeBook);
  });
  scrim.addEventListener('click', closeBook);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) { closePlay(); return; }
    if (!modal.hidden) closeBook();
  });

  /* keep focus inside the open dialog */
  document.addEventListener('focusin', function (e) {
    if (!modal.hidden && !modal.contains(e.target)) modal.focus();
    else if (!lb.hidden && !lb.contains(e.target)) lb.focus();
  });

  /* ---------- nav state ---------- */
  var navEl = $('hh-nav');
  var NAV_IDS = ['home', 'about', 'work', 'process', 'contact'];
  var navLinks = {};
  NAV_IDS.forEach(function (id) { navLinks[id] = document.querySelector('[data-nav="' + id + '"]'); });
  var activeId = 'home', scrolledOn = false;

  function trackScroll() {
    var line = window.innerHeight * 0.42;
    var cur = NAV_IDS[0];
    NAV_IDS.forEach(function (id) {
      var el = $(id);
      if (el && el.getBoundingClientRect().top <= line) cur = id;
    });
    var home = $('home');
    var sc = home ? home.getBoundingClientRect().top < -40 : false;
    if (cur !== activeId) {
      if (navLinks[activeId]) { navLinks[activeId].classList.remove('on'); navLinks[activeId].removeAttribute('aria-current'); }
      activeId = cur;
      if (navLinks[activeId]) { navLinks[activeId].classList.add('on'); navLinks[activeId].setAttribute('aria-current', 'location'); }
    }
    if (sc !== scrolledOn) { scrolledOn = sc; navEl.classList.toggle('scrolled', sc); }
  }

  /* ---------- motion ---------- */
  function startMotion() {
    var hero = $('home'), float = $('hh-float'), tilt = $('hh-char2');
    var sprite = $('hh-sprite'), bar = $('hh-progress');
    var rp = $('hh-rp'), wire = $('hh-wire'), line = $('hh-line');
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var ids = NAV_IDS, sides = [0.5, 1, 0, 1, 0];
    var smooth = function (a, b, v) { var x = Math.max(0, Math.min(1, (v - a) / (b - a))); return x * x * (3 - 2 * x); };

    var anim = [], counterState = [], pars = [], chips = [];

    function collect() {
      anim = Array.prototype.slice.call(root.querySelectorAll('.reveal, .mask, .rule'));
      pars = Array.prototype.slice.call(root.querySelectorAll('.par'));
      chips = Array.prototype.slice.call(root.querySelectorAll('.chip-float'));
      counterState = Array.prototype.slice.call(root.querySelectorAll('.stat strong')).map(function (el) {
        return { el: el, raw: el.textContent.trim(), running: false, shown: false };
      });
    }
    collect();
    window.hhRefreshAnim = function () { collect(); kick(); };

    function runCounter(c) {
      var m = c.raw.match(/^([0-9]+)([a-zA-Z+]*)$/);
      if (!m) return;
      var target = parseInt(m[1], 10), suffix = m[2];
      var t0 = performance.now(), dur = 1100;
      c.running = true;
      var tick = function (now) {
        var k = Math.min(1, (now - t0) / dur);
        c.el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(tick); else c.running = false;
      };
      c.el.textContent = '0' + suffix;
      requestAnimationFrame(tick);
    }

    var look = 0, pointerSeen = false, lastPointer = -1e9;
    var raf = 0, last = performance.now();
    var prev = null, vel = 0, nx = 0, ny = 0, tx = 0, ty = 0, bob = 0;

    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var sec = now / 1000;
      var vh = Math.min(window.innerHeight || 800, 1100);
      var scrollY = -root.getBoundingClientRect().top;
      if (prev === null) prev = scrollY;
      var raw = (scrollY - prev) / Math.max(dt, 0.001); prev = scrollY;
      vel += (Math.max(-3000, Math.min(3000, raw)) - vel) * 0.16;

      var band = Math.min(vh, 820), i, r, visible;

      for (i = 0; i < anim.length; i++) {
        r = anim[i].getBoundingClientRect();
        visible = r.top < band * 0.9 && r.bottom > band * 0.08;
        if (visible !== anim[i].classList.contains('in')) anim[i].classList.toggle('in', visible);
      }
      for (i = 0; i < counterState.length; i++) {
        var c = counterState[i];
        r = c.el.getBoundingClientRect();
        visible = r.top < band * 0.85 && r.bottom > band * 0.1;
        if (visible && !c.shown && !c.running) { c.shown = true; runCounter(c); }
        if (!visible && c.shown && !c.running) { c.shown = false; c.el.textContent = c.raw; }
      }

      if (bar) {
        var total = Math.max(1, root.getBoundingClientRect().height - vh);
        bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, scrollY / total)).toFixed(4) + ')';
      }

      for (i = 0; i < pars.length; i++) {
        r = pars[i].getBoundingClientRect();
        var off = ((r.top + r.height / 2) - vh / 2) / vh;
        pars[i].style.transform = 'translateY(' + Math.round(off * -26) + 'px)';
      }

      var heroH = Math.max(1, hero.getBoundingClientRect().height);
      var p = Math.max(0, Math.min(1, scrollY / heroH));
      var show = smooth(0.45, 0.9, p);

      var idx = 0;
      for (i = 0; i < ids.length; i++) {
        var n = $(ids[i]);
        if (!n) continue;
        r = n.getBoundingClientRect();
        if (r.top <= vh * 0.5) idx = i + Math.min(1, (vh * 0.5 - r.top) / Math.max(1, r.height));
      }
      var base = Math.floor(idx);
      var cv = Math.min(ids.length - 1, base + smooth(0.76, 1, idx - base));
      var i0 = Math.floor(cv), i1 = Math.min(ids.length - 1, i0 + 1), k = cv - i0;

      var W = window.innerWidth || 1200;
      var margin = (W - Math.min(W, 1180)) / 2 + (W > 900 ? 40 : 22);
      var wide = margin >= 140;
      var h = wide ? Math.max(140, Math.min(190, margin * 1.1)) : (W < 600 ? 104 : 128);
      var w = h * (430 / 1011);
      var leftX = wide ? margin / 2 : Math.max(36, w * 0.5 + 10);
      var rightX = W - leftX;
      var sideV = sides[i0] + (sides[i1] - sides[i0]) * k;
      var x = leftX + (rightX - leftX) * sideV;
      bob += dt;
      var y = vh * 0.54 + Math.sin(scrollY * 0.0012) * vh * 0.12 + Math.sin(bob * 0.9) * 5;

      nx += (tx - nx) * 0.07; ny += (ty - ny) * 0.07;
      var sway = reduce ? 0 : Math.sin(sec * 0.3) * 0.3;
      var px = Math.max(-1, Math.min(1, nx + sway));
      var py = Math.max(-1, Math.min(1, ny));
      var tiltV = Math.max(-7, Math.min(7, vel * 0.006));

      for (i = 0; i < chips.length; i++) {
        var ch = chips[i];
        var d = parseFloat(ch.getAttribute('data-depth')) || 1;
        var dx = nx * d * 12 + Math.sin(sec * 0.4 + i * 1.7) * d * 4;
        var dy = ny * d * 8 + Math.cos(sec * 0.33 + i * 2.1) * d * 5;
        ch.style.transform = 'translate3d(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px, 0)';
      }

      if (sprite) {
        // idle: a slow, small sweep so she never looks frozen.
        // live (pointer moving): aim straight at the raw pointer and catch up fast.
        var idle = Math.sin(sec * 0.42) * 0.8;
        var live = pointerSeen && (now - lastPointer < 2200);
        var aim = live ? Math.max(-1, Math.min(1, tx)) : idle;
        look += (aim - look) * (live ? 0.34 : 0.085);
        var fi = 24 - Math.max(0, Math.min(24, Math.round((look + 1) / 2 * 24)));
        var col = fi % 5, row = (fi / 5) | 0;
        var bgPos = (col * 25) + '% ' + (row * 25) + '%';
        var tf = 'translateX(-50%) translate3d(' + (look * 10).toFixed(1) + 'px, ' + (-Math.abs(look) * 2 + Math.sin(sec * 0.9) * 3).toFixed(1) + 'px, 0)';
        sprite.style.backgroundPosition = bgPos;
        sprite.style.transform = tf;

        // render pass: a scan line sweeps down and exposes the wireframe under it
        if (rp && !reduce) {
          rp.style.transform = tf;
          wire.style.backgroundPosition = bgPos;
          var t = sec % RP_PERIOD;
          if (t < RP_DUR) {
            var k = t / RP_DUR;
            var pos = -45 + k * 190;
            var fade = Math.sin(Math.PI * k);
            wire.style.maskPosition = wire.style.webkitMaskPosition = '0% ' + pos.toFixed(1) + '%';
            wire.style.opacity = (fade * 0.95).toFixed(3);
            line.style.top = (pos * 0.66 + 17).toFixed(1) + '%';
            line.style.opacity = (fade * 0.9).toFixed(3);
          } else if (wire.style.opacity !== '0') {
            wire.style.opacity = '0';
            line.style.opacity = '0';
          }
        }
      }

      float.style.height = h.toFixed(0) + 'px';
      float.style.width = w.toFixed(0) + 'px';
      var docEnd = Math.max(1, root.getBoundingClientRect().height - scrollY - vh);
      var endFade = Math.max(0, Math.min(1, docEnd / 260));
      float.style.opacity = (show * endFade * (wide ? 1 : 0.55)).toFixed(3);
      float.style.transform = 'translate3d(' + (x - w / 2).toFixed(1) + 'px, ' + (y - h / 2).toFixed(1) + 'px, 0)';
      if (tilt) tilt.style.transform = 'perspective(700px) rotateY(' + (px * 9).toFixed(2) + 'deg) rotateX(' + (-py * 4 + tiltV).toFixed(2) + 'deg) translateY(' + (-tiltV * 0.8).toFixed(1) + 'px)';

      trackScroll();
      if (!document.hidden && !reduce) kick();
    }

    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    window.addEventListener('pointermove', function (ev) {
      var W = window.innerWidth || 1, Hh = window.innerHeight || 1;
      pointerSeen = true;
      lastPointer = performance.now();
      tx = Math.max(-1, Math.min(1, (ev.clientX / W - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, (ev.clientY / Hh - 0.5) * 2));
      kick();
    }, { passive: true });
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    kick();
  }

  /* ---- background: volumetric orbs drifting toward the viewer ---- */
  function startOrbs() {
    var cv = $('hh-orbs');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // one warm family drawn from the character's burgundy — plum through wine,
    // rose and ember. The brand lime stays out of here so it reads as the only
    // accent on the page.
    var HUES = [
      [152, 50, 94],    // plum
      [190, 54, 86],    // wine — closest to her burgundy
      [226, 92, 120],   // rose
      [190, 54, 86],
      [204, 92, 86],    // ember
      [152, 50, 94]
    ];

    var orbs = [], dpr = 1, W = 0, H = 0, raf = 0;
    var mx = 0, my = 0, tmx = 0, tmy = 0;

    function makeOrb(z) {
      return {
        z: z,
        ox: (Math.random() - 0.5) * 1.9,          // position in camera space
        oy: (Math.random() - 0.5) * 1.5,
        base: 30 + Math.random() * 62,             // radius before perspective
        dz: 0.028 + Math.random() * 0.042,         // approach speed
        hue: HUES[(Math.random() * HUES.length) | 0],
        drift: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        spin: 0.3 + Math.random() * 0.5
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      resize();
      var n = W < 700 ? 8 : (W < 1200 ? 12 : 15);
      orbs = [];
      for (var i = 0; i < n; i++) orbs.push(makeOrb(0.06 + (i / n) * 0.96));
    }

    function smooth(a, b, v) {
      var x = Math.max(0, Math.min(1, (v - a) / (b - a)));
      return x * x * (3 - 2 * x);
    }

    function paint(o, t) {
      // perspective: small and sharp far away, large and soft up close
      var p = 1 / (0.17 + o.z * 1.28);
      var r = o.base * p;
      if (r < 1) return;

      var wob = Math.sin(t * o.spin + o.phase) * 0.035;
      var cx = W * 0.5 + (o.ox + wob) * W * 0.52 * p + mx * (1 - o.z) * 46;
      var cy = H * 0.5 + (o.oy + o.drift * Math.sin(t * 0.4 + o.phase)) * H * 0.56 * p + my * (1 - o.z) * 32;

      if (cx < -r * 2.4 || cx > W + r * 2.4 || cy < -r * 2.4 || cy > H + r * 2.4) return;

      // fade in as it emerges from the distance, dissolve as it passes the camera
      var a = smooth(1, 0.82, o.z) * smooth(0, 0.34, o.z);
      if (a <= 0.002) return;

      var c = o.hue, g;

      // halo
      g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 2.3);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.20 * a).toFixed(4) + ')');
      g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * 2.3, 0, Math.PI * 2); ctx.fill();

      // body — lit from the upper left, falling off to a dark limb
      g = ctx.createRadialGradient(cx - r * 0.34, cy - r * 0.38, r * 0.05, cx, cy, r * 1.04);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.56 * a).toFixed(4) + ')');
      g.addColorStop(0.55, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.26 * a).toFixed(4) + ')');
      g.addColorStop(1, 'rgba(' + ((c[0] * 0.35) | 0) + ',' + ((c[1] * 0.35) | 0) + ',' + ((c[2] * 0.45) | 0) + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.04, 0, Math.PI * 2); ctx.fill();

      // rim light, strongest on the lower right
      ctx.save();
      ctx.lineWidth = Math.max(0.8, r * 0.045);
      g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      g.addColorStop(0.62, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.52 * a).toFixed(4) + ')');
      g.addColorStop(1, 'rgba(255,255,255,' + (0.30 * a).toFixed(4) + ')');
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.97, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // specular highlight
      var hr = r * 0.3;
      g = ctx.createRadialGradient(cx - r * 0.36, cy - r * 0.4, 0, cx - r * 0.36, cy - r * 0.4, hr);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.32 * a).toFixed(4) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx - r * 0.36, cy - r * 0.4, hr, 0, Math.PI * 2); ctx.fill();
    }

    var last = performance.now();
    function tick(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = now / 1000;

      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < orbs.length; i++) {
        var o = orbs[i];
        o.z -= o.dz * dt;
        if (o.z <= 0) { orbs[i] = makeOrb(1); orbs[i].z = 1; o = orbs[i]; }
        paint(o, t);
      }
      ctx.globalCompositeOperation = 'source-over';

      if (!document.hidden && !reduce) raf = requestAnimationFrame(tick);
    }

    function kick() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }

    seed();
    if (reduce) { ctx.clearRect(0, 0, W, H); for (var i = 0; i < orbs.length; i++) paint(orbs[i], 0); return; }
    kick();

    window.addEventListener('resize', function () { seed(); kick(); });
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('pointermove', function (e) {
      tmx = Math.max(-1, Math.min(1, (e.clientX / (window.innerWidth || 1) - 0.5) * 2));
      tmy = Math.max(-1, Math.min(1, (e.clientY / (window.innerHeight || 1) - 0.5) * 2));
    }, { passive: true });
  }

  renderFilters();
  renderGrid();
  renderSteps();
  renderServices();
  trackScroll();
  startMotion();
  startOrbs();
})();

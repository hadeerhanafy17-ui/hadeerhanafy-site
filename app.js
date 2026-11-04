(function () {
  'use strict';

  var CATS = { cgi: 'AI CGI', brand: 'Brand Commercials', trend: 'Trend-Led', expert: 'Expert Branding' };

  // client / country: only what the site or the brief already states. Left out when unknown, never guessed.
  var PROJECTS = [
    { title: 'From the desk to the sky', cat: 'cgi', tag: 'Hook', client: 'Travel content creator',
      summary: 'The opening hook of a travel creator’s video: a toy plane lifts off a laptop keyboard, becomes a real jet over a seaside town, and lands the creator in a window seat.',
      poster: 'assets/w11-poster.webp', full: 'assets/w11.mp4' },
    { title: 'The shave that never ends', cat: 'expert', client: 'Medical group',
      summary: 'A wordless story about the daily cycle of shaving and regrowth, and the clinic session that ends it. Made for Al Hoqail Medical Group.',
      stat: '215,000+ views', poster: 'assets/w1-poster.webp', full: 'assets/w1.mp4' },
    { title: 'Wherever the laptop opens', cat: 'expert', tag: 'Hook', client: 'Travel content creator',
      summary: 'A hook for a travel creator’s video: the same creator, recognisable in every scene, from a stone room to a city seen from above, the planet turning and an icy pier at sunset.',
      poster: 'assets/w12-poster.webp', full: 'assets/w12.mp4' },
    { title: 'The route, drawn on the map', cat: 'trend', tag: 'Hook', client: 'Travel content creator', wide: true,
      summary: 'A hook for a travel creator’s video: a glowing route draws itself from Denmark to Turkey on a dark map, so the trip reads in seconds.',
      poster: 'assets/w13-poster.webp', full: 'assets/w13.mp4' },
    { title: 'Worth breaking a window for', cat: 'trend', client: 'Dermatology clinic', country: 'Saudi Arabia',
      summary: 'A known action trend rebuilt around the clinic’s own product box: a woman smashes a car window to grab it off the back seat and sprints down the street with it.',
      poster: 'assets/w16-poster.webp', full: 'assets/w16.mp4' },
    { title: 'The menu, one tap at a time', cat: 'brand', client: 'Restaurant', country: 'Saudi Arabia',
      summary: 'The restaurant’s own menu, dish by dish: a finger moves through each one, named on screen, and the film ends on the restaurant’s sign.',
      poster: 'assets/w15-poster.webp', full: 'assets/w15.mp4' },
    { title: 'The pear everyone teased', cat: 'expert', client: 'Dermatology clinic', country: 'Saudi Arabia',
      summary: 'A pear carries the story of the many women who are teased over the muscle that sits inward in their bodies. Layan, the 3D version of the doctor’s real assistant, takes her to the clinic, where the doctor shapes her body and she walks out happy. The message: what people tease you about can simply be treated.',
      poster: 'assets/w14-poster.webp', full: 'assets/w14.mp4' },
    { title: 'Say it out loud', cat: 'expert', client: 'Child-psychology specialist', country: 'Jordan',
      summary: 'A boy learns to say no in three steps. Written and voiced in Jordanian dialect for a child-psychology specialist building her practice.',
      stat: '35,000+ views', poster: 'assets/w2-poster.webp', full: 'assets/w2.mp4' },
    { title: 'When the kitchen goes down', cat: 'brand', client: 'Maintenance company', country: 'UAE',
      summary: 'Service stops mid-rush: the flame dies, the orders pile up, and one call brings the crew. A dialogue-free film for the maintenance arm of Miz in the UAE.',
      poster: 'assets/w3-poster.webp', full: 'assets/w3.mp4' },
    { title: 'Her trend, not the trend', cat: 'trend', client: 'Dermatology clinic', country: 'Saudi Arabia',
      summary: 'A known trend taken apart and rebuilt around one doctor’s identity, down to her own cup and her own screen. Made for Dr. Amira Kamal.',
      poster: 'assets/w4-poster.webp', full: 'assets/w4.mp4' },
    { title: 'Meet Layan', cat: 'expert', client: 'Dermatology clinic', country: 'Saudi Arabia',
      summary: 'A miniature 3D version of the clinic’s own assistant, designed from a single photo, launching the series she now hosts. Made for Dr. Amira Kamal in Saudi Arabia.',
      poster: 'assets/w5-poster.webp', full: 'assets/w5.mp4' },
    { title: 'Out of the billboard', cat: 'cgi', client: 'Dermatology clinic', country: 'Saudi Arabia',
      summary: 'A product handed off a city billboard straight into a hand on the street. Built around REJURAN’s own packaging for Dr. Amira Kamal.',
      poster: 'assets/w6-poster.webp', full: 'assets/w6.mp4' },
    { title: 'The storefront that serves itself', cat: 'cgi', client: 'Cafe & restaurant',
      summary: 'Giant dishes rise out of a cafe facade until the whole menu is standing on the street. Produced through a marketing agency for Menta Cafe & Restaurant.',
      poster: 'assets/w7-poster.webp', full: 'assets/w7.mp4' },
    { title: 'Results, out of the bag', cat: 'brand', client: 'Dermatology and aesthetics clinic', country: 'Saudi Arabia',
      summary: 'Filler cases lift out of the clinic’s own shopping bag and arrange themselves, turning a plain before-and-after into a product reveal. Made for a dermatology and aesthetics clinic in Saudi Arabia.',
      poster: 'assets/w8-poster.webp', full: 'assets/w8.mp4' },
    { title: 'Skip the invoice', cat: 'cgi', tag: 'Concept', client: 'Self-initiated concept',
      summary: 'A product reveal built around one line: skip the invoice, do the collab. Self-initiated concept for COLAB, not a commissioned campaign.',
      poster: 'assets/w9-poster.webp', full: 'assets/w9.mp4' },
    { title: 'Every piece has its animal', cat: 'cgi', tag: 'Concept', client: 'Self-initiated concept',
      summary: 'A lioness in ruby, a panther in emerald, a wolf in diamonds — each animal wears the piece that matches it. Self-initiated concept inspired by L’azurde.',
      poster: 'assets/w10-poster.webp', full: 'assets/w10.mp4' }
  ];

  var SERVICES = ['AI CGI', 'Brand Commercial', 'Trend-Led Content', 'Expert Branding', '3D Website', 'Creative Direction'];

  // render pass: one sweep every RP_PERIOD seconds, lasting RP_DUR seconds
  var RP_PERIOD = 7.0, RP_DUR = 1.45;
  var FILTERS = [['all', 'All work'], ['cgi', 'AI CGI'], ['brand', 'Brand Commercials'], ['trend', 'Trend-Led'], ['expert', 'Expert Branding']];

  var $ = function (id) { return document.getElementById(id); };
  var root = $('hh-root');
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

  /* ---------- card previews: a sharp still, and the real film plays in its place on hover (or when a card is mostly in view on touch) ---------- */
  var CAN_HOVER = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var livePreview = null;
  var io = (!CAN_HOVER && 'IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var m = e.target;
      if (e.intersectionRatio >= 0.65) { if (m.hhStart) m.hhStart(); } else if (m.hhStop) m.hhStop();
    });
  }, { threshold: [0, 0.65, 1] }) : null;

  function attachPreview(media, p, before) {
    if (p.wide || REDUCE) return;                                    // wide films are cropped in a portrait card, so they keep the still
    var v = null;
    function stop() {
      if (!v) return;
      v.pause();
      if (v.parentNode) v.parentNode.removeChild(v);
      v = null;
      if (livePreview === stop) livePreview = null;
    }
    function start() {
      if (v) return;
      if (livePreview) livePreview();                                // one preview at a time
      v = document.createElement('video');
      v.className = 'card-video';
      v.muted = true; v.setAttribute('muted', ''); v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
      v.src = p.full;
      media.insertBefore(v, before);
      v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
      var pr = v.play();
      if (pr && pr.catch) pr.catch(stop);
      livePreview = stop;
    }
    media.hhStart = start; media.hhStop = stop;
    if (CAN_HOVER) { media.addEventListener('pointerenter', start); media.addEventListener('pointerleave', stop); }
    else if (io) io.observe(media);
  }

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

  function findFilm(full) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].full === full) return PROJECTS[i];
    return null;
  }

  // one film card; used by the Work grid and by the example under each audience
  function makeCard(p) {
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
    img.src = p.poster;
    img.width = 640; img.height = 800;
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
    attachPreview(media, p, open);

    var tag = document.createElement('span');
    tag.className = 'play-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'Watch the film';
    media.appendChild(tag);

    var body = document.createElement('div');
    body.className = 'card-body';
    var who = [p.client, p.country].filter(Boolean).join(' · ');
    if (who) {
      var meta = document.createElement('p');
      meta.className = 'card-meta';
      meta.textContent = who;
      body.appendChild(meta);
    }
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
    return art;
  }

  function renderGrid() {
    if (io) io.disconnect();
    gridEl.textContent = '';
    PROJECTS.filter(function (p) { return filter === 'all' || p.cat === filter; }).forEach(function (p) {
      gridEl.appendChild(makeCard(p));
    });
    if (window.hhRefreshAnim) window.hhRefreshAnim();
  }

  /* ---------- who it's for ---------- */
  var audTabs = Array.prototype.slice.call(document.querySelectorAll('.seg-btn'));
  var audPanels = Array.prototype.slice.call(document.querySelectorAll('.aud-panel'));

  Array.prototype.forEach.call(document.querySelectorAll('.aud-example'), function (host) {
    var p = findFilm(host.getAttribute('data-film'));
    if (p) host.appendChild(makeCard(p));
  });

  function selectAudience(i, focus) {
    audTabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (audPanels[n]) audPanels[n].hidden = !on;
    });
    if (focus) audTabs[i].focus();
  }

  audTabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectAudience(i, false); });
    t.addEventListener('keydown', function (e) {
      var n = audTabs.length, k = -1;
      if (e.key === 'ArrowRight') k = (i + 1) % n;
      else if (e.key === 'ArrowLeft') k = (i + n - 1) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k >= 0) { e.preventDefault(); selectAudience(k, true); }
    });
  });

  /* ---------- lightbox ---------- */
  var lb = $('hh-lightbox'), player = $('hh-player'), lbCap = $('hh-lb-cap');
  var lbReturn = null;

  function openPlay(p, src) {
    lbReturn = src || document.activeElement;
    lb.setAttribute('aria-label', p.title);
    lbCap.textContent = p.title;
    player.poster = p.poster;
    lb.classList.toggle('wide', !!p.wide);
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

    var anim = [], counterState = [], pars = [];

    function collect() {
      anim = Array.prototype.slice.call(root.querySelectorAll('.reveal, .mask, .rule'));
      pars = Array.prototype.slice.call(root.querySelectorAll('.par'));
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

    /* ---- before → after (one block per .ba section) ----
       Desktop: the stage is pinned (sticky) and scroll progress through the track slides the four
       shots out from behind the product card (--k per shot: 1 = hidden behind it, 0 = in place;
       --e on the board drives the card scale and the "After" labels).
       Mobile: no pin, each shot eases in as it scrolls into view. Reduced motion: stays in the final state. */
    var BA_TOP = 68;                                               // sticky offset = height of the scrolled nav
    var BA_WIN = [[0.20, 0.68], [0.04, 0.50], [0.04, 0.50], [0.20, 0.68]]; // inner shots first, outer ones after
    var baSecs = Array.prototype.slice.call(root.querySelectorAll('.ba')).map(function (sec) {
      return {
        track: sec.querySelector('.ba-track'), stage: sec.querySelector('.ba-stage'), board: sec.querySelector('.ba-board'),
        shots: Array.prototype.slice.call(sec.querySelectorAll('.ba-shot')), last: {}
      };
    });

    function baSet(S, el, name, v, key) {
      var s = v.toFixed(3);
      if (S.last[key] !== s) { S.last[key] = s; el.style.setProperty(name, s); }
    }

    function updateBA(vh) {
      if (reduce) return;
      var desktop = (window.innerWidth || 1200) > 900;
      baSecs.forEach(function (S) {
        if (!S.track || !S.board) return;
        var i, k, e = 0;
        if (desktop) {
          var r = S.track.getBoundingClientRect();
          var p = Math.max(0, Math.min(1, (BA_TOP - r.top) / Math.max(1, r.height - S.stage.offsetHeight)));
          for (i = 0; i < S.shots.length; i++) baSet(S, S.shots[i], '--k', 1 - smooth(BA_WIN[i][0], BA_WIN[i][1], p), i);
          e = smooth(0.3, 0.75, p);
        } else {
          for (i = 0; i < S.shots.length; i++) {
            k = 1 - smooth(0, 1, (vh * 0.94 - S.shots[i].getBoundingClientRect().top) / (vh * 0.2));
            baSet(S, S.shots[i], '--k', k, i);
            e = Math.max(e, 1 - k);
          }
        }
        baSet(S, S.board, '--e', e, 'e');
      });
    }

    Array.prototype.forEach.call(root.querySelectorAll('.ba-watch'), function (btn) {
      btn.addEventListener('click', function () {
        var p = findFilm(btn.getAttribute('data-film'));
        if (p) openPlay(p, btn);
      });
    });

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

      updateBA(vh);

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

  renderFilters();
  renderGrid();
  renderServices();
  trackScroll();
  startMotion();
})();

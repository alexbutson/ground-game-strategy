/* Ground Game Strategy — course pages (v2 staging)
   Scroll reveal + interest-list capture.

   ────────────────────────────────────────────────────────────────
   TO TURN ON REAL FORM CAPTURE (2 minutes, no server, no WordPress)
   ────────────────────────────────────────────────────────────────
   1. Go to https://formspree.io and sign up (free tier: 50 submissions/month).
   2. Create a form. Point it at whichever inbox should get the leads.
   3. Copy the form's endpoint — it looks like https://formspree.io/f/xyzabcde
   4. Paste it into FORM_ENDPOINT below and commit.

   Until that's set, the form still works: it falls back to opening the
   visitor's email client with everything pre-filled to FALLBACK_EMAIL.
   That's the same mailto pattern the live contact page already uses.

   When registration moves to a real platform (see the LMS memo), the
   likely swap is a RegFox pop-over embed on each course page — this
   form then becomes the waitlist for cohorts that aren't open yet.
*/

var FORM_ENDPOINT  = "";                                // <-- paste Formspree URL here
var FALLBACK_EMAIL = "hello@groundgamestrategy.com";    // <-- confirm this inbox is monitored

/* ---------- scroll reveal ---------- */
(function () {
  var els = document.querySelectorAll('.rv');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ---------- interest list ---------- */
(function () {
  var form = document.getElementById('interest-form');
  if (!form) return;

  var msg = document.getElementById('form-msg');
  var btn = form.querySelector('button[type=submit]');

  function show(kind, text) {
    if (!msg) return;
    msg.className = 'formmsg ' + kind;
    msg.textContent = text;
  }

  function fields() {
    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = v; });
    return d;
  }

  function mailtoFallback(d) {
    var body =
      'Name: '         + (d.name    || '') + '\n' +
      'Email: '        + (d.email   || '') + '\n' +
      'Organization: ' + (d.org     || '') + '\n' +
      'Course: '       + (d.course  || '') + '\n' +
      'Format: '       + (d.format  || '') + '\n' +
      'Timing: '       + (d.timing  || '') + '\n\n' +
      (d.message || '');
    window.location.href =
      'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent('Interest list — ' + (d.course || 'Ground Game course')) +
      '&body='    + encodeURIComponent(body);
    show('ok', 'Opening your email app with the details filled in — press send and we’ll be in touch.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = fields();

    if (!d.email) { show('err', 'An email address is required so we can reach you.'); return; }

    if (!FORM_ENDPOINT) { mailtoFallback(d); return; }

    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      form.reset();
      show('ok', 'You’re on the list. We’ll email you as soon as dates are confirmed — before registration opens publicly.');
    }).catch(function () {
      mailtoFallback(d);
    }).then(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Join the interest list'; }
    });
  });
})();

/* ---- sticky enroll bar: reveal after the hero, hide over the signup form ---- */
(function () {
  var bar = document.querySelector('.enrollbar');
  if (!bar) return;
  var hero = document.querySelector('.chero');
  var form = document.getElementById('signup');
  function tick() {
    var pastHero = !hero || (hero.getBoundingClientRect().bottom < 60);
    var atForm = form && form.getBoundingClientRect().top < window.innerHeight * 0.9
                      && form.getBoundingClientRect().bottom > 0;
    bar.classList.toggle('show', pastHero && !atForm);
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  tick();
})();

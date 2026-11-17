'use strict';
// AIify post-download flow: how-to video -> free 4-PDF suite -> sales video -> hire form.
// Starts when the download animation reveals #download-success. API and media come from the free-file Worker.
(() => {
  const API = location.hostname.endsWith('.joshua-509.workers.dev') ? location.origin : 'https://aiify-free-file.joshua-509.workers.dev';
  const variant = document.documentElement.dataset.variant || '';
  const params = new URLSearchParams(location.search);
  const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'li_fat_id'];
  const utms = Object.fromEntries(UTM.map(k => [k, (params.get(k) || '').slice(0, 512)]).filter(([, v]) => v));
  const isTest = params.get('aiify_test') === '1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sid = () => { try { return sessionStorage.getItem('aiify.funnel.session') || ''; } catch { return ''; } };
  const vid = () => { try { return localStorage.getItem('aiify.visitor') || ''; } catch { return ''; } };
  const once = new Set();
  function flow(event, detail) {
    if (once.has(event)) return; once.add(event);
    const body = JSON.stringify({ session_id: sid(), visitor_id: vid() || undefined, page_variant: variant || undefined, event, detail, test: isTest, ...utms });
    try { if (navigator.sendBeacon?.(API + '/api/flow', new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return; } catch {}
    fetch(API + '/api/flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }
  const M = API + '/media/';
  const ITEMS = [
    ['nothing-slips', 'Nothing Slips Away', 'Paste your messy week. Get every promise, owner and deadline, with the follow-up nudge already written.', 47],
    ['va-multiplier', 'Make Your VA Scary Good', 'Turn one recurring task into a playbook your VA can run tomorrow, AI prompts included.', 67],
    ['dont-hire', "Don't Hire That Yet", 'Score a job description for what AI can already handle, before you post the role.', 97],
    ['monday-clarity', 'Monday Clarity', 'Turn your calendar and inbox into a one-page Monday memo: your top 3, plus what to delegate or drop.', 37]
  ];
  const total = ITEMS.reduce((a, i) => a + i[3], 0);
  const root = document.createElement('section');
  root.className = 'fx'; root.id = 'aiify-flow'; root.hidden = true; root.setAttribute('aria-label', 'Next steps');
  root.innerHTML = `
  <div class="fx-stage" id="fx-howto">
    <p class="fx-kicker"><i></i>Step 2 of 3 · 55 seconds</p>
    <h2>Watch this before you open it. <em>It's the difference between a file and a chief of staff.</em></h2>
    <p class="fx-sub">Exactly where to click in ChatGPT, Claude and Grok. Upload the file, type “Let's do this.” and hit send.</p>
    ${player('howto', 'aiify-howto-upload-720.mp4', 'howto-poster.jpg', 'How to upload the AI Chief of Staff file to ChatGPT, Claude, and Grok')}
    <div class="fx-apps"><a href="https://chatgpt.com" target="_blank" rel="noopener">Open ChatGPT ↗</a><a href="https://claude.ai" target="_blank" rel="noopener">Open Claude ↗</a><a href="https://grok.com" target="_blank" rel="noopener">Open Grok ↗</a></div>
    <div class="fx-next" id="fx-next"><a href="#fx-suite"><b>↓</b>Wait, there's more: 4 free builders below</a></div>
  </div>
  <div class="fx-stage" id="fx-suite">
    <div class="fx-urgent">Free for a limited time</div>
    <p class="fx-kicker"><i></i>The AI Business Operating System</p>
    <h2>Your chief of staff runs the day. <em>These 4 plug the leaks you can't see.</em></h2>
    <p class="fx-sub">Dropped promises. VAs waiting on you. A hire you might not need. Mondays that start in chaos. Each builder works the second you upload it to ChatGPT, Claude or Grok. No setup, no course, no login.</p>
    <img class="fx-hero" src="${M}suite-hero.jpg?v=2" alt="The four AIify builder PDFs spread out: Nothing Slips Away, Make Your VA Scary Good, Don't Hire That Yet, and Monday Clarity" width="1600" height="620" loading="lazy">
    <div class="fx-grid">${ITEMS.map(([k, n, d, p]) => `<div class="fx-item"><img src="${M}cover-${k}.jpg?v=2" alt="" width="340" height="440" loading="lazy"><div><h3>${n}</h3><p>${d}</p><div class="fx-price"><s>$${p}</s><span class="fx-free">FREE</span></div></div></div>`).join('')}</div>
    <div class="fx-total"><span>All 4: <s>$${total}</s></span><em>$0</em></div>
    <a class="fx-cta" id="fx-suite-dl" href="${API}/api/suite" download="AIify-AI-Business-Operating-System.zip">Download all 4 free <span aria-hidden="true">↓</span></a>
    <p class="fx-fine">One zip, four PDFs. No email, no form.</p>
    <div class="fx-dl" id="fx-dl" aria-hidden="true">${ITEMS.map(([k], i) => `<span class="fx-mini" style="background-image:url(${M}cover-${k}.jpg?v=2)"></span>`).join('')}
      <svg class="fx-ring" viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="28"/><circle class="fg" cx="32" cy="32" r="28"/><path d="m20 33 8 8 16-17"/></svg><div class="fx-box">AI OS</div></div>
    <div class="fx-done" id="fx-done" role="status">All 4 are in your downloads ✓</div>
  </div>
  <div class="fx-stage" id="fx-hire" hidden>
    <p class="fx-kicker"><i></i>Step 3 of 3 · the part most people skip</p>
    <h2>Want this running in your business <em>without lifting a finger?</em></h2>
    <p class="fx-sub">Files are the start. AIify builds a swarm of AI agents around your business, then co-manages it with you, so the outcomes keep coming.</p>
    ${player('sales', 'aiify-sales-hire-720.mp4', 'sales-poster.jpg', 'Why have AIify co-manage an AI agent swarm for your business')}
    <div class="fx-outcomes"><div><b>✓</b>Nothing falls through the cracks</div><div><b>✓</b>Your VAs get scary good</div><div><b>✓</b>Scale without adding headcount</div><div><b>✓</b>Bring agency spend in-house</div></div>
    <p class="fx-terms">Month-to-month. No long contract. You keep everything we build.</p>
    <button class="fx-cta" id="fx-hire-btn" type="button">I'm interested in Hiring AIify <span aria-hidden="true">→</span></button>
  </div>`;
  function player(id, src, poster, label) {
    return `<div class="fx-player" id="fx-${id}-p"><video id="fx-${id}-v" src="${M}${src}" poster="${M}${poster}" playsinline preload="metadata" aria-label="${label}"></video>
      <button class="fx-sound" id="fx-${id}-s" type="button" hidden>🔊 Tap for sound</button>
      <button class="fx-replay" id="fx-${id}-r" type="button" hidden>↻ Watch again</button>
      <div class="fx-ctrl"><button type="button" id="fx-${id}-m" aria-label="Mute or unmute">🔊</button><button type="button" id="fx-${id}-pp" aria-label="Play or pause">❚❚</button></div>
      <div class="fx-bar"><i id="fx-${id}-b"></i></div></div>`;
  }
  const modal = document.createElement('div');
  modal.className = 'fx-modal'; modal.id = 'fx-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'fx-m-title');
  modal.innerHTML = `<div class="fx-sheet"><button class="fx-x" type="button" aria-label="Close">×</button>
   <form id="fx-form" novalidate><h3 id="fx-m-title">Let's talk.</h3><p>Tell us where to reach you and we'll call to set up a time to chat.</p>
    <label class="fx-f"><span>Full name</span><input name="name" autocomplete="name" required maxlength="160"><small></small></label>
    <label class="fx-f"><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required maxlength="254"><small></small></label>
    <label class="fx-f"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="64"><small></small></label>
    <input class="fx-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="fx-cta fx-submit" type="submit">Send <span aria-hidden="true">→</span></button>
    <p class="fx-fine" id="fx-err" role="alert"></p></form></div>`;
  // ---- video helpers
  const V = {};
  function setup(id) {
    const v = root.querySelector(`#fx-${id}-v`), s = root.querySelector(`#fx-${id}-s`), r = root.querySelector(`#fx-${id}-r`);
    const m = root.querySelector(`#fx-${id}-m`), pp = root.querySelector(`#fx-${id}-pp`), b = root.querySelector(`#fx-${id}-b`);
    const sync = () => { m.textContent = v.muted ? '🔇' : '🔊'; pp.textContent = v.paused ? '▶' : '❚❚'; s.hidden = !v.muted || v.ended; };
    v.addEventListener('timeupdate', () => {
      if (!v.duration) return; const k = v.currentTime / v.duration; b.style.width = (k * 100) + '%';
      if (k > .5) flow(id + '_video_50');
      if (id === 'howto' && v.currentTime > 49) root.querySelector('#fx-next').classList.add('hot');
    });
    v.addEventListener('play', () => { r.hidden = true; flow(id + '_video_started', v.muted ? 'muted' : 'sound'); sync(); });
    v.addEventListener('pause', sync); v.addEventListener('volumechange', sync);
    v.addEventListener('ended', () => { r.hidden = false; flow(id + '_video_completed'); sync(); V[id].onEnd?.(); });
    s.addEventListener('click', () => { v.muted = false; if (v.currentTime < 15) v.currentTime = 0; v.play().catch(() => {}); flow(id + '_sound_on'); });
    m.addEventListener('click', () => { v.muted = !v.muted; if (!v.muted) flow(id + '_sound_on'); if (v.paused) v.play().catch(() => {}); });
    pp.addEventListener('click', () => v.paused ? v.play().catch(() => {}) : v.pause());
    v.addEventListener('click', () => { if (v.muted) s.click(); else v.paused ? v.play().catch(() => {}) : v.pause(); });
    r.addEventListener('click', () => { v.currentTime = 0; v.muted = false; v.play().catch(() => {}); });
    V[id] = { v, sync };
  }
  // A user gesture "unlocks" a media element on iOS/Safari so it can later play with sound.
  function bless(id) { const v = V[id]?.v; if (!v || v.dataset.blessed) return; v.dataset.blessed = '1'; try { v.muted = false; const p = v.play(); v.pause(); p?.catch?.(() => {}); } catch {} }
  function playWithSound(id) {
    const { v, sync } = V[id]; v.currentTime = 0; v.muted = false;
    v.play().then(sync).catch(() => { v.muted = true; v.play().then(sync).catch(sync); });
  }
  function reveal(el) { el.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in'))); }
  function scrollTo(el) { const y = el.getBoundingClientRect().top + scrollY - 16; scrollTo_(y); }
  function scrollTo_(y) { window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
  function confetti(host, n = 60) {
    if (reduced) return; const c = document.createElement('div'); c.className = 'fx-confetti';
    const cols = variant === 'b' ? ['#A3D7E2', '#7DC1D0', '#FAFAFA', '#34d399', '#A1A1AA', '#E4E4E7'] : ['#b7fe3c', '#3edffb', '#bba5ff', '#ff4fa3', '#ffd23f', '#fff'];
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 220; const e = document.createElement('i');
      e.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;--r:${Math.random() * 900}deg;--d:${Math.random() * 120}ms;--c:${cols[i % 6]}`; c.append(e); }
    host.append(c); setTimeout(() => c.remove(), 1500);
  }
  function init() {
    const main = document.querySelector('main'); if (!main) return;
    main.append(root); document.body.append(modal);
    setup('howto'); setup('sales');
    const q = new URL(API + '/api/suite'); if (sid()) q.searchParams.set('session', sid()); if (variant) q.searchParams.set('v', variant);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) if (utms[k]) q.searchParams.set(k, utms[k]);
    if (isTest) q.searchParams.set('test', '1');
    const dl = root.querySelector('#fx-suite-dl'); dl.href = q.href;
    // 1) first download click: unlock both videos inside the gesture
    document.querySelector('#download')?.addEventListener('click', () => { bless('howto'); bless('sales'); }, { capture: true });
    document.querySelector('#download-again')?.addEventListener('click', () => { bless('howto'); }, { capture: true });
    // 2) when the existing download animation finishes (success panel shown), start the flow
    const success = document.querySelector('#download-success');
    let started = false;
    const start = () => {
      if (started || !success || success.hidden) return; started = true;
      root.hidden = false; const h = root.querySelector('#fx-howto'), su = root.querySelector('#fx-suite');
      reveal(h); reveal(su); flow('flow_started');
      setTimeout(() => { scrollTo(h); playWithSound('howto'); }, reduced ? 0 : 450);
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.id === 'fx-suite') flow('suite_viewed'); } }), { threshold: .25 });
      root.querySelectorAll('.fx-item').forEach((x, i) => { x.style.transitionDelay = (i * 90) + 'ms'; io.observe(x); }); io.observe(su);
    };
    if (success) new MutationObserver(start).observe(success, { attributes: true, attributeFilter: ['hidden'] });
    V.howto.onEnd = () => { if (!root.querySelector('#fx-hire').hidden) return; scrollTo(root.querySelector('#fx-suite')); };
    // 3) suite download: animation -> reveal hire stage -> sales video
    let suiteDone = false;
    dl.addEventListener('click', () => {
      bless('sales'); flow('suite_download_clicked'); if (suiteDone) return; suiteDone = true;
      const box = root.querySelector('#fx-dl'), done = root.querySelector('#fx-done'), fg = box.querySelector('.fg');
      dl.style.display = 'none'; box.classList.add('on');
      const minis = [...box.querySelectorAll('.fx-mini')]; const W = box.clientWidth;
      minis.forEach((m, i) => { m.style.left = (W / 2 - 160 + i * 84) + 'px'; m.style.top = '0px';
        if (!reduced) m.animate([{ transform: 'translateY(0) rotate(0) scale(1)', opacity: 1 }, { transform: `translate(${W / 2 - 31 - (W / 2 - 160 + i * 84)}px,90px) rotate(${(i - 1.5) * 25}deg) scale(.35)`, opacity: 0 }], { duration: 650, delay: 150 + i * 160, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }); });
      const t0 = performance.now(), D = reduced ? 1 : 1500;
      (function step(now) { const k = Math.min(1, (now - t0) / D); fg.style.strokeDashoffset = String(176 * (1 - k)); if (k < 1) requestAnimationFrame(step); else {
        box.classList.add('done'); done.classList.add('on'); confetti(root.querySelector('#fx-suite'), 80);
        if (!reduced) box.querySelector('.fx-box').animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.15)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 450 });
        setTimeout(() => { const hire = root.querySelector('#fx-hire'); reveal(hire); flow('hire_stage_shown'); setTimeout(() => { scrollTo(hire); playWithSound('sales'); }, reduced ? 0 : 500); }, reduced ? 0 : 1100);
      } })(t0);
    });
    // 4) hire modal
    const form = modal.querySelector('#fx-form'), sheet = modal.querySelector('.fx-sheet');
    const open = () => { modal.classList.add('on'); flow('hire_modal_opened'); V.sales.v.pause(); setTimeout(() => form.querySelector('input[name=name]')?.focus(), 60); };
    const close = () => modal.classList.remove('on');
    root.querySelector('#fx-hire-btn').addEventListener('click', open);
    form.addEventListener('input', () => flow('hire_form_started'), { once: true });
    form.addEventListener('input', e => { const m = e.target.nextElementSibling; if (m?.tagName === 'SMALL') m.textContent = ''; });
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.fx-x')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
    form.addEventListener('submit', async e => {
      e.preventDefault(); const f = new FormData(form); const err = modal.querySelector('#fx-err'); err.textContent = '';
      const val = k => String(f.get(k) || '').trim(); const bad = {};
      if (!val('name')) bad.name = 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) bad.email = 'Please enter a valid email.';
      if (val('phone') && val('phone').replace(/\D/g, '').length < 7) bad.phone = "That phone number doesn't look right.";
      for (const k of ['name', 'email', 'phone']) form.querySelector(`[name=${k}]`).nextElementSibling.textContent = bad[k] || '';
      if (Object.keys(bad).length) { form.querySelector(`[name=${Object.keys(bad)[0]}]`).focus(); return; }
      const btn = form.querySelector('.fx-submit'); btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch(API + '/api/hire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          name: val('name'), email: val('email'), phone: val('phone'), website: val('website'), session_id: sid(), visitor_id: vid() || undefined, page_variant: variant || undefined, test: isTest, ...utms }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) { if (j.errors) for (const [k, m] of Object.entries(j.errors)) { const i = form.querySelector(`[name=${k}]`); if (i) i.nextElementSibling.textContent = m; } else err.textContent = j.error || 'Something went wrong. Please try again.'; throw 0; }
        const first = val('name').split(/\s+/)[0];
        sheet.innerHTML = `<button class="fx-x" type="button" aria-label="Close">×</button><div class="fx-thanks" role="status"><div class="fx-check"><svg viewBox="0 0 64 64"><path d="m16 34 11 11 22-25"/></svg></div>
          <h3>You're in${first ? ', ' + first.replace(/[<>&"]/g, '') : ''}! 🎉</h3><p>We'll call you soon to set up a time to chat.</p>
          <ol><li><b>Right now:</b> install your Chief of Staff agent. Upload <b>ai-chief-of-staff.md</b> to ChatGPT, Claude or Grok and type “Let's do this.”</li><li><b>Next:</b> answer the 5 quick questions and connect your calendar and email.</li><li><b>Soon:</b> we call you to set up a time to talk about your swarm.</li></ol>
          <div class="fx-apps"><a href="https://chatgpt.com" target="_blank" rel="noopener">Open ChatGPT ↗</a><a href="https://claude.ai" target="_blank" rel="noopener">Open Claude ↗</a><a href="https://grok.com" target="_blank" rel="noopener">Open Grok ↗</a></div></div>`;
        confetti(sheet, 90);
        const hb = root.querySelector('#fx-hire-btn'); hb.textContent = "✓ You're in. We'll call you soon."; hb.disabled = true; hb.style.animation = 'none';
      } catch { btn.disabled = false; btn.innerHTML = 'Send <span aria-hidden="true">→</span>'; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

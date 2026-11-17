'use strict';
const LI_CONVERSIONS = { page_view: 32321050, download: 32321042 };
(() => {
  const apiBase = location.hostname.endsWith('.joshua-509.workers.dev')
    ? location.origin : 'https://aiify-free-file.joshua-509.workers.dev';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'li_fat_id'];
  const params = new URLSearchParams(location.search);
  const tracking = Object.fromEntries(trackingKeys.map(key => [key, (params.get(key) || '').slice(0, 512)]));
  // Storage can be unavailable in private/restricted contexts; keep an in-memory fallback.
  const sessionKey = 'aiify.funnel.session';
  let sessionId;
  try { sessionId = sessionStorage.getItem(sessionKey); } catch {}
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(sessionId || '')) {
    sessionId = crypto.randomUUID();
    try { sessionStorage.setItem(sessionKey, sessionId); } catch {}
  }
  const sent = new Set();
  const variant = {}; // Variant is fixed by the page, never by query parameters.
  function conversion(key) {
    const id = LI_CONVERSIONS[key];
    if (id != null && typeof window.lintrk === 'function') {
      const marker = `conversion.${key}`;
      const storageKey = `aiify.funnel.${sessionId}.${marker}`;
      if (sent.has(marker)) return;
      try { if (sessionStorage.getItem(storageKey)) return; } catch {}
      sent.add(marker);
      try { sessionStorage.setItem(storageKey, '1'); } catch {}
      try { window.lintrk('track', { conversion_id: id }); } catch {}
    }
  }
  function backgroundPost(path, payload) {
    const body = JSON.stringify(payload);
    try {
      // text/plain is a CORS-simple type, so sendBeacon can finish cross-origin.
      // application/json beacons return true then fail with net::ERR_FAILED (no preflight).
      if (navigator.sendBeacon?.(`${apiBase}${path}`, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    } catch {}
    try {
      void fetch(`${apiBase}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer'
      }).catch(() => {});
    } catch {}
  }
  function track(event) {
    const key = `aiify.funnel.${sessionId}.${event}`;
    if (sent.has(event)) return;
    try { if (sessionStorage.getItem(key)) return; } catch {}
    sent.add(event);
    try { sessionStorage.setItem(key, '1'); } catch {}
    const payload = { session_id: sessionId, ...variant, event, li_fat_id_present: params.has('li_fat_id') };
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      if (tracking[key]) payload[key] = tracking[key];
    }
    try { if (document.referrer) payload.referrer_host = new URL(document.referrer).hostname; } catch {}
    backgroundPost('/api/event', payload);
  }
  // Anonymous, session-cumulative active/visible engagement. Storage is optional.
  const engagementKey = `aiify.engagement.${sessionId}`;
  let visitorId, visitNumber = 1, state = {};
  try { state = JSON.parse(sessionStorage.getItem(engagementKey) || '{}') || {}; } catch {}
  try {
    visitorId = localStorage.getItem('aiify.visitor');
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(visitorId || '')) {
      visitorId = crypto.randomUUID(); localStorage.setItem('aiify.visitor', visitorId);
    }
    visitNumber = state.visit_number || Math.min(10000, (Number(localStorage.getItem('aiify.visits')) || 0) + 1);
    if (!state.visit_number) localStorage.setItem('aiify.visits', String(visitNumber));
  } catch { visitorId = undefined; }
  state = { engaged_ms: 0, max_scroll: 0, ...state, visit_number: visitNumber };
  let lastTick = performance.now(), lastActive = lastTick, wasVisible = document.visibilityState === 'visible', lastPayload = '';
  function saveEngagement() { try { sessionStorage.setItem(engagementKey, JSON.stringify(state)); } catch {} }
  function sampleEngagement() {
    const now = performance.now();
    if (wasVisible) state.engaged_ms = Math.min(86400000, state.engaged_ms + Math.max(0, Math.min(now, lastActive + 30000) - lastTick));
    lastTick = now; wasVisible = document.visibilityState === 'visible';
    const root = document.documentElement;
    const travel = root.scrollHeight - innerHeight;
    state.max_scroll = Math.max(state.max_scroll, travel > 0 ? Math.min(100, Math.round(scrollY / travel * 100)) : 0);
    saveEngagement();
  }
  function ping(force = false) {
    try {
      sampleEngagement();
      const payload = { session_id: sessionId, visitor_id: visitorId, ...variant, ...state,
        engaged_ms: Math.floor(state.engaged_ms), li_fat_id_present: params.has('li_fat_id'), test: params.get('aiify_test') === '1' };
      for (const key of trackingKeys.slice(0, 5)) if (tracking[key]) payload[key] = tracking[key];
      try { if (document.referrer) payload.referrer_host = new URL(document.referrer).hostname; } catch {}
      const serialized = JSON.stringify(payload);
      if (force || serialized !== lastPayload) { lastPayload = serialized; backgroundPost('/api/ping', payload); }
    } catch {}
  }
  for (const event of ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart']) {
    addEventListener(event, () => { sampleEngagement(); lastActive = performance.now(); }, { passive: true });
  }
  setInterval(sampleEngagement, 1000);
  setInterval(() => { if (document.visibilityState === 'visible') ping(); }, 15000);
  document.addEventListener('visibilitychange', () => { sampleEngagement(); if (document.visibilityState === 'hidden') ping(true); });
  addEventListener('pagehide', () => ping(true));
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.id === 'download' || link.id === 'download-again') state.download_click = true;
    else if (link.protocol === 'mailto:') state.mailto_click = true;
    else {
      const tool = { 'chatgpt.com': 'chatgpt', 'claude.ai': 'claude', 'grok.com': 'grok', 'gemini.google.com': 'gemini' }[link.hostname];
      if (!tool) return;
      state.next_step = tool;
    }
    ping(true);
  }, { capture: true });
  ping(true);
  track('page_view');
  conversion('page_view');
  const download = document.querySelector('#download');
  const again = document.querySelector('#download-again');
  const file = new URL(`${apiBase}/api/file`);
  file.searchParams.set('session', sessionId);
  if (variant.page_variant) file.searchParams.set('v', variant.page_variant);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    if (tracking[key]) file.searchParams.set(key, tracking[key]);
  }
  if (params.has('li_fat_id')) file.searchParams.set('li', '1');
  download.href = again.href = file.href;

  const card = document.querySelector('.download-card');
  let animating = false;
  function showSuccess() {
    document.querySelector('#download-ready').hidden = true;
    document.querySelector('#download-success').hidden = false;
    document.querySelector('#download-success h2').focus({ preventScroll: true });
  }
  function confetti() {
    const burst = document.createElement('div');
    burst.className = 'confetti'; burst.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('i');
      const angle = Math.PI * 2 * i / 40;
      const distance = 70 + Math.random() * 130;
      piece.style.cssText = `--x:${Math.cos(angle) * distance}px;--y:${Math.sin(angle) * distance}px;--r:${180 + Math.random() * 540}deg;--delay:${Math.random() * 80}ms;--color:var(--burst-${i % 4})`;
      burst.append(piece);
    }
    card.append(burst);
    setTimeout(() => burst.remove(), 1100);
  }
  function clicked() {
    track('download_clicked');
    conversion('download');
    document.querySelector('#download-status').textContent = 'Your file is downloading';
  }
  // Keep native attachment navigation: the animation never waits on the network.
  download.addEventListener('click', () => {
    clicked();
    if (animating) return;
    animating = true;
    if (reducedMotion.matches) { showSuccess(); return; }
    const stage = document.querySelector('.download-stage');
    stage.style.setProperty('--flight-x', `${stage.clientWidth / 2 - 29}px`);
    card.classList.add('is-downloading');
    const start = performance.now();
    function progress(now) {
      const percent = Math.min(100, Math.round((now - start) / 11));
      download.style.setProperty('--progress', `${percent}%`);
      download.querySelector('.percentage').textContent = `${percent}%`;
      if (percent < 100) requestAnimationFrame(progress);
    }
    requestAnimationFrame(progress);
    setTimeout(() => card.classList.add('is-complete'), 1180);
    setTimeout(confetti, 1540);
    setTimeout(showSuccess, 1900);
  });
  again.addEventListener('click', clicked);
})();

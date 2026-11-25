'use strict';
// Standalone /watch/ player. No pause, no seek-ahead, CTA at 523.5s, hire lightbox.
(function () {
  const HLS_SRC = 'https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/hls/master.m3u8';
  const MP4_SRC = 'https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/vsl-720p.mp4';
  const HIRE_URL = 'https://aiify-free-file.joshua-509.workers.dev/api/hire';
  const REVEAL_AT = 523.5;
  const TIME_KEY = 'aiify.vsl.maxTime';
  const REVEAL_KEY = 'aiify.vsl.revealed';
  const JUMP_FLOOR = 1.25;

  const params = new URLSearchParams(location.search);
  const variant = (document.documentElement.dataset.v || 'a').toLowerCase();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = document.getElementById('vsl');
  const player = document.getElementById('player');
  const gate = document.getElementById('sound-gate');
  const muteBtn = document.getElementById('mute');
  const progress = document.getElementById('progress');
  const ctaSlot = document.getElementById('cta-slot');
  const cta = document.getElementById('cta');
  const lightbox = document.getElementById('lightbox');
  const dialog = document.getElementById('dialog');
  const track = document.getElementById('lb-track');
  const viewport = document.getElementById('lb-viewport');
  const panes = [...document.querySelectorAll('.pane')];
  const stepLabel = document.getElementById('lb-step');
  const stepBar = document.getElementById('lb-progress');
  const form = document.getElementById('lead-form');
  const formAlert = document.getElementById('form-alert');
  const submitBtn = document.getElementById('lead-submit');
  const thanks = document.getElementById('thanks');

  const mutedIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>';
  const soundIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/></svg>';

  let shown = false;
  let hold = false;
  let soundStarted = false;
  let ready = false;
  let resumed = false;
  let arming = false;
  let highWater = readSaved();
  let wall = highWater;
  let lastSample = performance.now();
  let saveTimer = 0;
  let step = 1;
  let rev = '';
  let pain = '';
  let finished = false;
  let lastFocus = null;
  const sessionId = storageId(sessionStorage, 'aiify.funnel.session');
  const visitorId = storageId(localStorage, 'aiify.visitor');

  function storageId(store, key) {
    try {
      let id = store.getItem(key);
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id || '')) {
        id = (crypto.randomUUID && crypto.randomUUID()) || fallbackId();
        store.setItem(key, id);
      }
      return id;
    } catch {
      return fallbackId();
    }
  }
  function fallbackId() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const n = Math.random() * 16 | 0;
      return (ch === 'x' ? n : (n & 0x3 | 0x8)).toString(16);
    });
  }
  function readSaved() {
    try {
      const n = Number(localStorage.getItem(TIME_KEY));
      if (Number.isFinite(n) && n > 0 && n < 24 * 60) return n;
    } catch { /* private mode */ }
    return 0;
  }
  function readRevealed() {
    try { return localStorage.getItem(REVEAL_KEY) === '1'; } catch { return false; }
  }
  function persistTime() {
    try {
      const prev = Number(localStorage.getItem(TIME_KEY)) || 0;
      localStorage.setItem(TIME_KEY, String(Math.round(Math.max(prev, highWater) * 100) / 100));
    } catch { /* ignore */ }
  }
  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = 0; persistTime(); }, 800);
  }

  function reveal(options) {
    const opts = options || {};
    if (opts.persist) {
      try { localStorage.setItem(REVEAL_KEY, '1'); } catch { /* ignore */ }
    }
    if (shown) return;
    shown = true;
    ctaSlot.hidden = false;
    const settle = opts.settle || reduced;
    if (settle) {
      cta.classList.add('is-settled');
      return;
    }
    cta.classList.add('is-entering');
    const done = () => {
      cta.classList.remove('is-entering');
      cta.classList.add('is-pulsing');
    };
    cta.addEventListener('animationend', function onEnd(event) {
      if (event.animationName !== 'cta-pop') return;
      cta.removeEventListener('animationend', onEnd);
      done();
    });
    setTimeout(() => {
      if (!cta.classList.contains('is-pulsing') && !cta.classList.contains('is-settled')) done();
    }, 900);
  }

  function paintProgress() {
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    progress.style.width = Math.min(100, (video.currentTime / duration) * 100) + '%';
  }
  function syncMute() {
    const muted = video.muted;
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    muteBtn.innerHTML = muted ? mutedIcon : soundIcon;
  }
  function snapTo(back) {
    arming = true;
    try { video.currentTime = back; } catch { /* not seekable yet */ }
    arming = false;
  }
  function guardTime() {
    if (!ready || arming) return;
    const now = performance.now();
    const elapsed = Math.max(0, (now - lastSample) / 1000);
    lastSample = now;
    const t = video.currentTime;
    if (!Number.isFinite(t)) return;
    // Keep a return visit on the saved point until the viewer restarts with sound.
    if (!soundStarted && highWater > 1 && t + 0.75 < highWater) {
      wall = highWater;
      snapTo(highWater);
      return;
    }
    const allowance = Math.max(JUMP_FLOOR, elapsed * 1.5 + 0.5);
    if (t > wall + allowance) {
      const back = wall;
      snapTo(back);
      requestAnimationFrame(() => {
        if (!arming && video.currentTime > back + allowance) snapTo(back);
      });
      return;
    }
    const forward = t >= wall - 0.05;
    wall = t;
    if (forward && t > highWater) {
      highWater = t;
      scheduleSave();
    }
    if (t >= REVEAL_AT) reveal({ persist: true, settle: false });
    paintProgress();
  }
  function applyResume() {
    if (!resumed) {
      resumed = true;
      if (!soundStarted) {
        const saved = readSaved();
        const cap = Number.isFinite(video.duration) ? Math.min(saved, Math.max(0, video.duration - 0.25)) : saved;
        if (cap > 0.35) {
          arming = true;
          wall = cap;
          highWater = Math.max(highWater, cap);
          try { video.currentTime = cap; } catch { /* metadata race */ }
          arming = false;
          if (cap >= REVEAL_AT) reveal({ persist: true, settle: true });
        }
      }
    }
    lastSample = performance.now();
    ready = true;
    video.controls = false;
  }

  function startWithSound() {
    if (soundStarted) {
      video.muted = false;
      syncMute();
      video.play().catch(() => {});
      return;
    }
    soundStarted = true;
    gate.hidden = true;
    arming = true;
    wall = 0;
    lastSample = performance.now();
    try { video.currentTime = 0; } catch { /* ignore */ }
    arming = false;
    ready = true;
    video.muted = false;
    syncMute();
    const attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(() => {
        video.muted = true;
        syncMute();
        soundStarted = false;
        gate.hidden = false;
        video.play().catch(() => {});
      });
    }
  }
  function holdPlayback() {
    hold = true;
    video.pause();
  }
  function releasePlayback() {
    hold = false;
    if (!video.ended) video.play().catch(() => {});
  }

  function prefersNativeHls() {
    const ua = navigator.userAgent || '';
    const iphone = /iPad|iPhone|iPod/.test(ua);
    const ipadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const safari = /safari/i.test(ua) && !/chrome|android|crios|fxios|edg|opr/i.test(ua);
    return iphone || ipadOs || safari;
  }
  function kick() {
    video.muted = true;
    video.playsInline = true;
    video.controls = false;
    syncMute();
    video.play().catch(() => {});
  }
  let hlsPlayer = null;
  function useMp4() {
    if (video.dataset.mode === 'mp4') return;
    if (hlsPlayer) {
      try { hlsPlayer.destroy(); } catch { /* already gone */ }
      hlsPlayer = null;
    }
    video.dataset.mode = 'mp4';
    video.src = MP4_SRC;
    kick();
  }
  function useHls() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.13/dist/hls.min.js';
    script.async = true;
    script.onload = () => {
      if (!window.Hls || !window.Hls.isSupported()) { useMp4(); return; }
      const hls = new window.Hls({ capLevelToPlayerSize: true });
      hlsPlayer = hls;
      let retried = false;
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) return;
        const manifest = data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_ERROR
          || data.details === window.Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
          || data.details === window.Hls.ErrorDetails.MANIFEST_PARSING_ERROR;
        if (!manifest && !retried && data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          retried = true;
          hls.recoverMediaError();
          return;
        }
        if (!manifest && !retried && data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          retried = true;
          hls.startLoad();
          return;
        }
        useMp4();
      });
      video.dataset.mode = 'hls';
      hls.loadSource(HLS_SRC);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, kick);
    };
    script.onerror = useMp4;
    document.head.appendChild(script);
    setTimeout(() => {
      if (video.dataset.mode !== 'mp4' && video.readyState === 0 && video.currentTime === 0) useMp4();
    }, 12000);
  }

  video.disablePictureInPicture = true;
  video.disableRemotePlayback = true;
  video.controls = false;
  video.addEventListener('loadedmetadata', applyResume);
  video.addEventListener('play', () => { video.controls = false; });
  video.addEventListener('timeupdate', guardTime);
  video.addEventListener('seeking', guardTime);
  video.addEventListener('seeked', guardTime);
  video.addEventListener('pause', () => {
    if (hold || video.ended) return;
    video.play().catch(() => {});
  });
  video.addEventListener('enterpictureinpicture', () => {
    if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
  });
  video.addEventListener('contextmenu', (event) => event.preventDefault());
  player.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('pagehide', persistTime);

  if (prefersNativeHls()) {
    video.dataset.mode = 'native';
    video.src = HLS_SRC;
    kick();
  } else {
    useHls();
  }

  gate.addEventListener('click', (event) => {
    event.stopPropagation();
    startWithSound();
  });
  player.addEventListener('click', (event) => {
    if (event.target.closest('.mute') || event.target.closest('.sound-gate')) return;
    if (!soundStarted) startWithSound();
  });
  muteBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!soundStarted) { startWithSound(); return; }
    video.muted = !video.muted;
    syncMute();
    if (video.paused && !hold) video.play().catch(() => {});
  });

  function isSeekKey(event) {
    const key = event.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'MediaTrackNext', 'MediaTrackPrevious', 'MediaPlayPause', 'MediaStop'].includes(key)) return true;
    if (key === 'j' || key === 'J' || key === 'l' || key === 'L' || key === 'k' || key === 'K' || key === 'f' || key === 'F') return true;
    if (key.length === 1 && key >= '0' && key <= '9') return true;
    if (key === ' ') {
      const el = event.target;
      if (el && el.closest && el.closest('button, a, input, textarea, select')) return false;
      return true;
    }
    return false;
  }
  function lightboxOpen() { return !lightbox.hidden; }
  function trapFocus(event) {
    const nodes = [...dialog.querySelectorAll('button, input')].filter((el) => {
      if (el.disabled || el.classList.contains('hp')) return false;
      if (el.closest('[hidden]') || el.closest('[inert]')) return false;
      return true;
    });
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  window.addEventListener('keydown', (event) => {
    if (lightboxOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === 'Tab') trapFocus(event);
    }
    const typing = event.target && event.target.closest && event.target.closest('input, textarea, select');
    if (typing) return;
    if (isSeekKey(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  if (params.get('reveal') === '1') reveal({ persist: false, settle: false });
  else if (readRevealed()) reveal({ persist: false, settle: true });

  function goTo(next, animate) {
    step = next;
    panes.forEach((pane, index) => {
      const on = index === step - 1;
      pane.classList.toggle('is-on', on);
      pane.inert = !on;
    });
    const pane = panes[step - 1];
    viewport.hidden = false;
    if (!animate) viewport.style.transition = 'none';
    viewport.style.height = pane.scrollHeight + 'px';
    stepBar.style.width = (step / 3) * 100 + '%';
    stepLabel.hidden = false;
    stepLabel.textContent = 'Step ' + step + ' of 3';
    const heading = pane.querySelector('h2');
    if (heading) dialog.setAttribute('aria-labelledby', heading.id);
    if (!animate) requestAnimationFrame(() => { viewport.style.transition = ''; });
    const focusable = pane.querySelector('button, input');
    if (focusable) focusable.focus();
  }
  function openLightbox() {
    if (finished) {
      lastFocus = document.activeElement;
      lightbox.hidden = false;
      document.body.classList.add('lb-open');
      holdPlayback();
      thanks.focus();
      return;
    }
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    holdPlayback();
    requestAnimationFrame(() => goTo(step || 1, false));
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lb-open');
    releasePlayback();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  cta.addEventListener('click', openLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.closest('[data-close]')) closeLightbox();
  });
  document.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.textContent.replace(/\s+/g, ' ').trim();
      if (button.dataset.kind === 'rev') rev = answer;
      if (button.dataset.kind === 'pain') pain = answer;
      goTo(Math.min(3, step + 1), true);
    });
  });
  window.addEventListener('resize', () => {
    if (lightbox.hidden || finished) return;
    viewport.style.height = panes[step - 1].scrollHeight + 'px';
  });

  function fieldSlot(name) { return form.querySelector('[data-err="' + name + '"]'); }
  function showErrors(errors) {
    ['name', 'email', 'phone'].forEach((name) => {
      const input = form.querySelector('[name="' + name + '"]');
      const slot = fieldSlot(name);
      const message = errors[name] || '';
      if (slot) slot.textContent = message;
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    });
  }
  form.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.name) return;
    const slot = fieldSlot(input.name);
    if (slot) slot.textContent = '';
    input.removeAttribute('aria-invalid');
    formAlert.textContent = '';
  });
  function clientErrors(values) {
    const errors = {};
    if (!values.name) errors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Please enter a valid email.';
    const phoneDigits = values.phone.replace(/\D/g, '');
    if (values.phone && (phoneDigits.length < 7 || phoneDigits.length > 15)) errors.phone = "That phone number doesn't look right.";
    return errors;
  }
  function trackingFields() {
    const fields = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'li_fat_id'].forEach((key) => {
      const value = params.get(key);
      if (value) fields[key] = value.slice(0, 512);
    });
    return fields;
  }
  function buildTerm() {
    const real = (params.get('utm_term') || '').slice(0, 512);
    const tag = 'vsl-' + variant + '|rev:' + rev + '|pain:' + pain;
    if (!real) return tag.slice(0, 512);
    const combined = real + '|' + tag;
    if (combined.length <= 512) return combined;
    const room = 512 - tag.length - 1;
    if (room <= 0) return tag.slice(0, 512);
    return real.slice(0, room) + '|' + tag;
  }
  function showThanks() {
    finished = true;
    viewport.hidden = true;
    stepLabel.hidden = true;
    thanks.hidden = false;
    stepBar.style.width = '100%';
    dialog.setAttribute('aria-labelledby', 'thanks-copy');
    thanks.focus();
  }
  const submitLabel = submitBtn.textContent;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (finished) return;
    const data = new FormData(form);
    const values = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      website: String(data.get('website') || ''),
    };
    formAlert.textContent = '';
    const errors = clientErrors(values);
    showErrors(errors);
    if (Object.keys(errors).length) {
      const first = form.querySelector('[name="' + Object.keys(errors)[0] + '"]');
      if (first) first.focus();
      return;
    }
    const payload = Object.assign({
      name: values.name,
      email: values.email,
      phone: values.phone,
      website: values.website,
      session_id: sessionId,
      visitor_id: visitorId,
    }, trackingFields(), { utm_term: buildTerm() });
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const response = await fetch(HIRE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
      });
      if (response.status === 429) {
        formAlert.textContent = 'Too many attempts right now. Please wait a minute and try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        return;
      }
      let body = {};
      try { body = await response.json(); } catch { body = {}; }
      if (response.status === 400 || (body && body.errors)) {
        showErrors(body.errors || {});
        const known = body.errors && ['name', 'email', 'phone'].some((key) => body.errors[key]);
        if (!known) formAlert.textContent = (body && body.error) || 'Please check the form and try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        const firstName = body.errors && Object.keys(body.errors)[0];
        const first = firstName && form.querySelector('[name="' + firstName + '"]');
        if (first) first.focus();
        return;
      }
      if (!response.ok || !body.ok) {
        formAlert.textContent = 'Something went wrong. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        return;
      }
      showThanks();
    } catch {
      formAlert.textContent = 'We could not reach the server. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
})();

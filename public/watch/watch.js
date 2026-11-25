'use strict';
// Standalone /watch/ player. No pause, no seek-ahead, CTA at 523.5s, hire lightbox.
(function () {
  const HLS_SRC = 'https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/hls/master.m3u8';
  const MP4_SRC = 'https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/vsl-720p.mp4';
  const HIRE_URL = 'https://aiify-free-file.joshua-509.workers.dev/api/hire';
  const EVENT_URL = 'https://aiify-free-file.joshua-509.workers.dev/api/vsl/event';
  const REVEAL_AT = 523.5;
  const TIME_KEY = 'aiify.vsl.maxTime';
  const REVEAL_KEY = 'aiify.vsl.revealed';
  const JUMP_FLOOR = 1.25;
  // First 30 seconds of vsl-720p.mp4, transcribed and checked against the spoken hook.
  const CAPTIONS = [
    [0, 2.38, 'Every business owner who bought AI'],
    [2.38, 4.42, 'and got stuck made the same mistake.'],
    [5.02, 6.94, 'They thought buying the tool was the job.'],
    [7.42, 8.08, "It isn't."],
    [8.84, 9.72, "If you've been thinking,"],
    [10.06, 12.22, 'we should be doing so much more with AI.'],
    [12.82, 14.72, 'If you hear competitors already are,'],
    [15.12, 16.88, 'and if you bought some tools but'],
    [16.88, 19.9, "you're still caught in a time loop doing most things manually,"],
    [20.48, 20.98, 'keep watching.'],
    [21.7, 23.46, 'The tool was never the hard part.'],
    [23.94, 25.72, 'Wrapping your business around it is.'],
    [26.4, 29.22, 'Nobody who sold you an AI tool does the hard part.'],
    [29.84, 30, 'But why is that?'],
  ];

  const params = new URLSearchParams(location.search);
  const variant = (document.documentElement.dataset.v || 'a').toLowerCase();
  /* vsl-speed:start */
  function playbackSpeed(raw) {
    if (raw == null) return 1;
    const text = String(raw).trim();
    if (!text) return 1;
    const value = Number(text);
    if (!Number.isFinite(value)) return 1;
    return Math.min(2, Math.max(0.5, value));
  }
  /* vsl-speed:end */
  const ua = navigator.userAgent || '';
  const ipadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const device = /iPad|Tablet/i.test(ua) || ipadOs ? 'tablet' : /Mobi|Android|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop';
  const isMobileUX = device !== 'desktop';
  /* vsl-speed-split:start */
  const SPEED_KEY = 'aiify.vsl.speedArm';
  function speedAssignment(params) {
    const raw = params.get('speed');
    if (raw != null && String(raw).trim() !== '' && Number.isFinite(Number(raw))) {
      return { rate: playbackSpeed(raw), source: 'url' };
    }
    let arm = null;
    try { arm = localStorage.getItem(SPEED_KEY); } catch { /* private mode */ }
    if (arm !== '1' && arm !== '1.25') {
      const bit = crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] & 1 : Math.random() < 0.5 ? 1 : 0;
      arm = bit ? '1.25' : '1';
      try { localStorage.setItem(SPEED_KEY, arm); } catch { /* private mode */ }
    }
    return { rate: Number(arm), source: 'split' };
  }
  /* vsl-speed-split:end */
  const speed = speedAssignment(params);
  const rate = speed.rate;
  const isTest = params.get('aiify_test') === '1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = document.getElementById('vsl');
  const player = document.getElementById('player');
  const gate = document.getElementById('sound-gate');
  const tap = document.getElementById('tap-sound');
  const captions = document.getElementById('captions');
  const muteBtn = document.getElementById('mute');
  const progress = document.getElementById('progress');
  const ctaSlot = document.getElementById('cta-slot');
  const cta = document.getElementById('cta');
  const lightbox = document.getElementById('lightbox');
  const dialog = document.getElementById('dialog');
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
  const resumeAt = readSaved();
  const sentKeys = new Set();
  let userGesture = false;
  let autoplayNoted = false;
  let soundNoted = false;
  let soundDetail = 'toggle';
  let playbackBegun = false;

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

  function onceFlag(key) {
    if (sentKeys.has(key)) return false;
    try {
      if (sessionStorage.getItem(key) === '1') { sentKeys.add(key); return false; }
      sessionStorage.setItem(key, '1');
    } catch { /* memory only */ }
    sentKeys.add(key);
    return true;
  }
  function videoTime() {
    const t = Number(video && video.currentTime);
    return Number.isFinite(t) ? Math.round(t * 10) / 10 : 0;
  }
  function rawUtms() {
    const fields = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'li_fat_id'].forEach((key) => {
      const value = params.get(key);
      if (value) fields[key] = value.slice(0, 512);
    });
    return fields;
  }
  function track(event, detail) {
    if (!onceFlag('aiify.vsl.sent.' + event)) return;
    const body = Object.assign({
      session_id: sessionId,
      visitor_id: visitorId,
      page: 'watch',
      variant: variant,
      speed_arm: speed.rate,
      speed_source: speed.source,
      device: device,
      event: event,
      video_time: videoTime(),
      client_ts: new Date().toISOString(),
    }, rawUtms());
    if (detail) body.detail = String(detail).slice(0, 40);
    if (isTest) body.test = true;
    const json = JSON.stringify(body);
    try {
      const blob = new Blob([json], { type: 'text/plain;charset=UTF-8' });
      if (navigator.sendBeacon && navigator.sendBeacon(EVENT_URL, blob)) return;
    } catch { /* fall through */ }
    try {
      fetch(EVENT_URL, {
        method: 'POST',
        body: json,
        keepalive: true,
        credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      }).catch(() => {});
    } catch { /* best effort */ }
  }
  // Insight Tag 10091706. Empty values are skipped. Calls queue on lintrk until insight.min.js loads.
  const LI_CONVERSIONS = {
    page_view: 32485082,
    watch_50: 32485074,
    cta_click: 32485066,
    lead_submitted: 32485058,
  };
  function ensureLintrk() {
    if (typeof window.lintrk === 'function') return;
    window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = [];
  }
  function liConvert(key) {
    if (isTest) return;
    const id = LI_CONVERSIONS[key];
    if (!id) return;
    ensureLintrk();
    if (!onceFlag('aiify.vsl.li.' + key)) return;
    try { window.lintrk('track', { conversion_id: id }); } catch { /* ignore */ }
  }
  function noteSoundOn() {
    if (video.muted || soundNoted) return;
    soundNoted = true;
    track('sound_on', soundDetail);
  }
  function noteMilestones(t) {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 535.3;
    [['watch_10s', 10], ['watch_25', 0.25 * duration], ['watch_50', 0.5 * duration], ['watch_75', 0.75 * duration]].forEach((pair) => {
      const name = pair[0];
      const threshold = pair[1];
      if (threshold < resumeAt) return;
      if (t >= threshold) {
        track(name);
        if (name === 'watch_50') liConvert('watch_50');
      }
    });
  }
  function reveal(options) {
    const opts = options || {};
    if (opts.reason && params.get('reveal') !== '1') track('cta_revealed', opts.reason);
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
    syncSoundChrome();
  }
  function syncCaptions() {
    if (!captions) return;
    const t = Number(video.currentTime) || 0;
    if (!video.muted || t >= 30) {
      captions.hidden = true;
      return;
    }
    const cue = CAPTIONS.find((row) => t >= row[0] && t < row[1]);
    captions.hidden = !cue;
    if (cue) captions.textContent = cue[2];
  }
  function syncSoundChrome() {
    const mutedPlayback = video.muted && (autoplayNoted || !video.paused);
    if (tap) tap.hidden = !mutedPlayback;
    if (mutedPlayback) gate.hidden = true;
    else if (isMobileUX && !soundStarted) gate.hidden = false;
    syncCaptions();
  }
  function applyRate() {
    try {
      if (video.playbackRate !== rate) video.playbackRate = rate;
    } catch { /* media not ready */ }
    try { video.preservesPitch = true; } catch { /* older browsers */ }
    try { video.webkitPreservesPitch = true; } catch { /* Safari */ }
  }
  function snapTo(back) {
    arming = true;
    try { video.currentTime = back; } catch { /* not seekable yet */ }
    arming = false;
    applyRate();
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
    // Allowance tracks the requested rate so 1.25x–2x playback is not a skip.
    const allowance = Math.max(JUMP_FLOOR, elapsed * rate * 1.5 + 0.5);
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
      noteMilestones(t);
    }
    if (t >= REVEAL_AT) reveal({ persist: true, settle: false, reason: 'play' });
    paintProgress();
    syncCaptions();
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
          if (cap >= REVEAL_AT) reveal({ persist: true, settle: true, reason: 'restored' });
        }
      }
    }
    lastSample = performance.now();
    ready = true;
    video.controls = false;
    applyRate();
  }

  function startWithSound() {
    userGesture = true;
    soundDetail = 'gate';
    if (soundStarted) {
      video.muted = false;
      applyRate();
      syncMute();
      const again = video.play();
      if (!video.paused) noteSoundOn();
      if (again && again.then) again.then(() => noteSoundOn()).catch(() => {});
      return;
    }
    soundStarted = true;
    gate.hidden = true;
    if (tap) tap.hidden = true;
    arming = true;
    wall = 0;
    lastSample = performance.now();
    try { video.currentTime = 0; } catch { /* ignore */ }
    arming = false;
    ready = true;
    video.muted = false;
    applyRate();
    syncMute();
    const attempt = video.play();
    if (!video.paused) noteSoundOn();
    if (attempt && attempt.then) {
      attempt.then(() => noteSoundOn()).catch(() => {
        video.muted = true;
        syncMute();
        soundStarted = false;
        gate.hidden = false;
        video.play().catch(() => {});
      });
    }
  }
  function unmuteFromTap() {
    userGesture = true;
    soundDetail = 'tap';
    video.muted = false;
    soundStarted = true;
    gate.hidden = true;
    if (tap) tap.hidden = true;
    applyRate();
    syncMute();
    const attempt = video.play();
    if (!video.paused) noteSoundOn();
    if (attempt && attempt.then) attempt.then(() => noteSoundOn()).catch(() => {});
  }
  function startDesktop() {
    video.muted = false;
    applyRate();
    soundDetail = 'autoplay';
    const attempt = video.play();
    const rejected = () => {
      video.muted = true;
      soundDetail = 'toggle';
      applyRate();
      syncMute();
      const mutedPlay = video.play();
      const show = () => { if (tap) tap.hidden = false; syncMute(); };
      if (mutedPlay && mutedPlay.then) mutedPlay.then(show).catch(show);
      else show();
    };
    if (attempt && attempt.then) {
      attempt.then(() => {
        soundStarted = true;
        gate.hidden = true;
        if (tap) tap.hidden = true;
        syncMute();
        noteSoundOn();
      }).catch(rejected);
    } else rejected();
  }
  function beginPlayback() {
    if (playbackBegun) return;
    playbackBegun = true;
    applyResume();
    video.playsInline = true;
    video.controls = false;
    applyRate();
    if (isMobileUX) kick();
    else startDesktop();
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
    applyRate();
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
    playbackBegun = false;
    video.dataset.mode = 'mp4';
    video.src = MP4_SRC;
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
      hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
      hls.on(window.Hls.Events.LEVEL_SWITCHED, applyRate);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, applyRate);
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
  applyRate();
  video.addEventListener('loadedmetadata', () => { applyResume(); beginPlayback(); });
  video.addEventListener('play', () => { video.controls = false; applyRate(); });
  video.addEventListener('playing', () => {
    applyRate();
    if (!autoplayNoted && !userGesture) {
      autoplayNoted = true;
      track('video_autoplay_started', video.muted ? 'muted' : 'sound');
    }
    if (!video.muted) noteSoundOn();
    syncSoundChrome();
  });
  video.addEventListener('ended', () => track('watch_complete'));
  video.addEventListener('ratechange', () => { if (video.playbackRate !== rate) applyRate(); });
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

  if (!isMobileUX) gate.hidden = true;
  if (tap) tap.hidden = true;
  const soundLabel = tap && tap.querySelector('[data-sound-label]');
  if (soundLabel && (isMobileUX || matchMedia('(pointer: coarse)').matches)) soundLabel.textContent = 'Tap for sound';
  if (prefersNativeHls()) {
    video.dataset.mode = 'native';
    video.src = HLS_SRC;
  } else {
    useHls();
  }

  gate.addEventListener('click', (event) => {
    event.stopPropagation();
    track('play_click');
    startWithSound();
  });
  if (tap) {
    tap.addEventListener('click', (event) => {
      event.stopPropagation();
      unmuteFromTap();
    });
  }
  player.addEventListener('click', (event) => {
    if (event.target.closest('.mute') || event.target.closest('.sound-gate') || event.target.closest('#tap-sound')) return;
    if (tap && !tap.hidden) { unmuteFromTap(); return; }
    if (!soundStarted) {
      track('play_click');
      startWithSound();
    }
  });
  muteBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!soundStarted) {
      if (tap && !tap.hidden) { unmuteFromTap(); return; }
      track('play_click');
      startWithSound();
      return;
    }
    video.muted = !video.muted;
    if (!video.muted) soundDetail = 'toggle';
    syncMute();
    if (!video.muted) noteSoundOn();
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
  else if (readRevealed()) reveal({ persist: false, settle: true, reason: 'restored' });

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
    track('lightbox_opened');
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
  cta.addEventListener('click', () => {
    track('cta_click');
    liConvert('cta_click');
    openLightbox();
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.closest('[data-close]')) closeLightbox();
  });
  document.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.textContent.replace(/\s+/g, ' ').trim();
      if (button.dataset.kind === 'rev') { rev = answer; track('lb_step1_answered', answer); }
      if (button.dataset.kind === 'pain') { pain = answer; track('lb_step2_answered', answer); }
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
    if (input.name === 'name' || input.name === 'email' || input.name === 'phone') track('lb_form_started');
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
    }, trackingFields(), {
      utm_term: buildTerm(),
      page: 'watch',
      page_variant: 'watch-' + variant,
      speed_arm: speed.rate,
      speed_source: speed.source,
      device: device,
    }, isTest ? { test: true, no_alert: true } : {});
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
        track('lead_error', '429');
        formAlert.textContent = 'Too many attempts right now. Please wait a minute and try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        return;
      }
      let body = {};
      try { body = await response.json(); } catch { body = {}; }
      if (response.status === 400 || (body && body.errors)) {
        track('lead_error', String(response.status || 400));
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
        track('lead_error', String(response.status || 'network'));
        formAlert.textContent = 'Something went wrong. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        return;
      }
      liConvert('lead_submitted');
      showThanks();
    } catch {
      track('lead_error', 'network');
      formAlert.textContent = 'We could not reach the server. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
  track('page_view');
  liConvert('page_view');
})();

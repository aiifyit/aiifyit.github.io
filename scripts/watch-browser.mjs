// Headless checks for /watch/. Not part of npm test (needs Chrome).
//   node scripts/watch-browser.mjs
import { createServer } from 'node:http';
import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const root = join(process.cwd(), 'public');
const outDir = '/opt/cursor/artifacts/watch';
mkdirSync(outDir, { recursive: true });
const shots = [];
const failures = [];

function check(name, ok, detail) {
  if (ok) console.log('ok  ', name);
  else {
    failures.push(name + (detail ? `: ${detail}` : ''));
    console.error('FAIL', name, detail || '');
  }
}

function contentType(file) {
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  }[extname(file)] || 'application/octet-stream';
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = normalize(join(root, pathname));
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try {
    const info = statSync(file);
    if (info.isDirectory()) { res.writeHead(302, { Location: pathname + '/' }); res.end(); return; }
    res.writeHead(200, { 'Content-Type': contentType(file) });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
// The media worker allows Origin http://localhost, not 127.0.0.1.
const origin = `http://localhost:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--mute-audio',
    '--hide-scrollbars',
  ],
});

async function prepare(page, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 });
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    window.__wrongVariant = [];
    const look = () => {
      const selected = document.documentElement.getAttribute('data-v') || 'a';
      document.querySelectorAll('[data-variant]').forEach((el) => {
        if (getComputedStyle(el).display !== 'none' && el.getAttribute('data-variant') !== selected) {
          window.__wrongVariant.push(el.getAttribute('data-variant') + '@' + selected);
        }
      });
    };
    new MutationObserver(look).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    const tick = () => { look(); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}

async function openWatch(page, search) {
  await page.goto(origin + '/watch/' + (search || ''), { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('h1');
  await page.evaluate(() => document.fonts.ready).catch(() => {});
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => {
    const started = performance.now();
    const finish = () => setTimeout(resolve, Math.max(0, 900 - (performance.now() - started)));
    const finite = document.getAnimations().filter((anim) => {
      if (anim.playState === 'finished' || anim.playState === 'idle') return false;
      const timing = anim.effect && anim.effect.getTiming ? anim.effect.getTiming() : {};
      return timing.iterations !== Infinity && Number.isFinite(timing.iterations);
    });
    if (!finite.length) { finish(); return; }
    Promise.all(finite.map((anim) => anim.finished.catch(() => {}))).then(finish);
  }));
}

async function lightboxState(page) {
  return page.evaluate(() => {
    const lightbox = document.getElementById('lightbox');
    const sheet = document.querySelector('.sheet');
    const view = document.getElementById('lb-viewport').getBoundingClientRect();
    const lb = getComputedStyle(lightbox);
    const panel = getComputedStyle(sheet);
    const box = lightbox.getBoundingClientRect();
    const alpha = (color) => {
      const match = String(color).match(/rgba?\(([^)]+)\)/);
      if (!match) return color === 'transparent' ? 0 : 1;
      const parts = match[1].split(',').map((part) => parseFloat(part));
      return parts.length === 4 ? parts[3] : 1;
    };
    const z = (el) => {
      const value = getComputedStyle(el).zIndex;
      return value === 'auto' ? 0 : Number(value);
    };
    const panes = [...document.querySelectorAll('.pane')].map((pane) => {
      const rect = pane.getBoundingClientRect();
      const style = getComputedStyle(pane);
      const overlap = Math.min(rect.right, view.right) - Math.max(rect.left, view.left);
      return {
        step: pane.dataset.pane,
        opacity: Number(style.opacity),
        visibility: style.visibility,
        left: rect.left,
        right: rect.right,
        overlap,
        inside: rect.left >= view.left - 2 && rect.right <= view.right + 2,
      };
    });
    const shown = panes.filter((pane) => pane.opacity > 0.95 && pane.visibility === 'visible');
    const split = panes.filter((pane) => pane.overlap > 20 && pane.overlap < view.width - 20);
    const pointInside = (el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return 'offscreen';
      const hit = document.elementFromPoint(x, y);
      return hit && hit.closest('#lightbox') ? 'lightbox' : (hit && (hit.id || hit.className)) || 'none';
    };
    return {
      position: lb.position,
      opacity: Number(lb.opacity),
      z: z(lightbox),
      gateZ: z(document.getElementById('sound-gate')),
      ctaZ: z(document.getElementById('cta')),
      playerZ: z(document.getElementById('player')),
      sheetOpacity: Number(panel.opacity),
      sheetAlpha: alpha(panel.backgroundColor),
      covers: box.left <= 1 && box.top <= 1 && box.right >= innerWidth - 1 && box.bottom >= innerHeight - 1,
      gateHit: pointInside(document.getElementById('sound-gate')),
      ctaHit: pointInside(document.getElementById('cta')),
      shown: shown.map((pane) => pane.step),
      split: split.map((pane) => pane.step),
      panes,
    };
  });
}

function lightboxOk(state) {
  const ctaCovered = state.ctaHit === 'lightbox' || state.ctaHit === 'offscreen';
  return state.position === 'fixed'
    && state.opacity === 1
    && state.z >= 40
    && state.z > state.gateZ
    && state.z > state.ctaZ
    && state.z > state.playerZ
    && state.sheetOpacity === 1
    && state.sheetAlpha === 1
    && state.covers
    && state.gateHit === 'lightbox'
    && ctaCovered
    && state.shown.length === 1
    && state.split.length === 0;
}

async function shot(page, name) {
  await settle(page);
  if (name.includes('step-')) {
    const state = await lightboxState(page);
    check(name + ' settled cover', lightboxOk(state), JSON.stringify(state));
  }
  const path = join(outDir, name + '.png');
  await page.screenshot({ path, type: 'png' });
  shots.push(path);
  console.log('shot', path);
}

function visibleHeadline(page) {
  return page.evaluate(() => {
    const shown = [...document.querySelectorAll('[data-variant]')].filter((el) => getComputedStyle(el).display !== 'none');
    return {
      variant: document.documentElement.dataset.v,
      shown: shown.map((el) => el.dataset.variant),
      text: shown[0] ? shown[0].querySelector('h1').textContent : '',
    };
  });
}

const headlines = {
  a: "You Were Sold a Lie About AI. Buying the Tool Was Never the Job. Here's What the People Selling It Won't Tell You Is Missing.",
  b: 'How Your Competitors Are Getting Faster, Leaner and Cheaper Using the Same AI Tools You Already Pay For, and How to Close the Gap Before It Gets Wide.',
  c: 'Get 10 to 20 Hours of Your Week Back Without Hiring, Without Buying More Tools, and Without Your Business Waiting on You.',
};

async function clickChoice(page, text) {
  const ok = await page.evaluate((label) => {
    const button = [...document.querySelectorAll('.choice')].find((el) => el.textContent.replace(/\s+/g, ' ').trim() === label);
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!ok) throw new Error('missing choice ' + text);
}

try {
  for (const width of [1280, 390]) {
    const label = width === 1280 ? 'desktop' : 'mobile';
    const height = width === 1280 ? 800 : 844;
    for (const variant of ['a', 'b', 'c']) {
      const page = await browser.newPage();
      await prepare(page, width, height);
      await openWatch(page, '?v=' + variant);
      await new Promise((r) => setTimeout(r, 400));
      const state = await visibleHeadline(page);
      check(label + ' variant ' + variant, state.variant === variant && state.shown.length === 1 && state.shown[0] === variant && state.text === headlines[variant], JSON.stringify(state));
      const aligned = await page.evaluate(() => {
        const stage = document.querySelector('.stage').getBoundingClientRect();
        const eyebrow = document.querySelector('.eyebrow');
        const block = document.querySelector('[data-variant="' + document.documentElement.dataset.v + '"]');
        const heading = block.querySelector('h1');
        const sub = block.querySelector('.sub');
        const mid = (rect) => (rect.left + rect.right) / 2;
        const stageMid = mid(stage);
        const headingBox = heading.getBoundingClientRect();
        const subBox = sub.getBoundingClientRect();
        const eye = getComputedStyle(eyebrow);
        return {
          heading: getComputedStyle(heading).textAlign,
          sub: getComputedStyle(sub).textAlign,
          eye: eye.textAlign,
          justify: eye.justifyContent,
          headingDelta: Math.abs(mid(headingBox) - stageMid),
          subDelta: Math.abs(mid(subBox) - stageMid),
          headingInside: headingBox.left >= stage.left - 1 && headingBox.right <= stage.right + 1,
        };
      });
      check(label + ' headline centered ' + variant, aligned.heading === 'center' && aligned.sub === 'center' && aligned.eye === 'center' && aligned.justify === 'center' && aligned.headingDelta < 2 && aligned.subDelta < 2 && aligned.headingInside, JSON.stringify(aligned));
      const wrong = await page.evaluate(() => window.__wrongVariant);
      check(label + ' no flash ' + variant, !wrong.length, JSON.stringify(wrong));
      if (width === 390) {
        const fold = await page.evaluate(() => {
          const box = document.getElementById('player').getBoundingClientRect();
          return { top: box.top, bottom: box.bottom, height: innerHeight };
        });
        check('mobile video above the fold ' + variant, fold.top >= 0 && fold.bottom <= fold.height + 1, JSON.stringify(fold));
      }
      await shot(page, label + '-variant-' + variant);
      await page.close();
    }

    const mapped = await browser.newPage();
    await prepare(mapped, width, height);
    await openWatch(mapped, '?utm_content=spring-competitors-ad');
    const mappedState = await visibleHeadline(mapped);
    check(label + ' utm competitors', mappedState.variant === 'b' && mappedState.shown[0] === 'b');
    await mapped.close();

    const reveal = await browser.newPage();
    await prepare(reveal, width, height);
    await openWatch(reveal, '?reveal=1');
    await reveal.waitForFunction(() => {
      const button = document.getElementById('cta');
      if (!button || button.closest('[hidden]')) return false;
      const box = button.getBoundingClientRect();
      return box.width > 80 && box.height > 20;
    }, { timeout: 4000 });
    await new Promise((r) => setTimeout(r, 700));
    const buttonLook = await reveal.evaluate(() => {
      const button = document.getElementById('cta');
      const style = getComputedStyle(button);
      return {
        text: button.textContent.trim(),
        transform: style.textTransform,
        family: style.fontFamily,
        background: style.backgroundImage,
        shadow: style.boxShadow,
      };
    });
    check(label + ' reveal button', /book your strategy call/i.test(buttonLook.text) && buttonLook.transform === 'uppercase' && /anton/i.test(buttonLook.family) && buttonLook.background.includes('linear-gradient') && buttonLook.shadow.includes('rgb(79, 122, 12)'), JSON.stringify(buttonLook));
    const antonReady = await reveal.evaluate(() => document.fonts.check('44px Anton'));
    check(label + ' Anton loaded', antonReady);
    await reveal.evaluate(() => document.getElementById('cta').scrollIntoView({ block: 'center', inline: 'center' }));
    await new Promise((r) => setTimeout(r, 200));
    await shot(reveal, label + '-reveal');

    if (width === 1280) {
      const posts = [];
      await reveal.setRequestInterception(true);
      reveal.on('request', (req) => {
        const url = req.url();
        const finish = async () => {
          if (!url.includes('/api/hire')) { await req.continue(); return; }
          const originHeader = req.headers().origin || '*';
          if (req.method() === 'OPTIONS') {
            await req.respond({
              status: 204,
              headers: {
                'Access-Control-Allow-Origin': originHeader,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'content-type',
              },
            });
            return;
          }
          if (req.method() !== 'POST') { await req.continue(); return; }
          const raw = req.postData();
          let body = {};
          try { body = JSON.parse(raw || '{}'); } catch (error) { body = { parseError: String(error) }; }
          posts.push(body);
          const headers = { 'Access-Control-Allow-Origin': originHeader, 'Content-Type': 'application/json' };
          if (posts.length === 1) {
            await req.respond({ status: 400, headers, body: JSON.stringify({ ok: false, errors: { email: 'Use your work email.' } }) });
          } else if (posts.length === 2) {
            await req.respond({ status: 429, headers, body: '{}' });
          } else {
            await req.respond({ status: 200, headers, body: JSON.stringify({ ok: true }) });
          }
        };
        finish().catch(async () => { try { await req.continue(); } catch { /* already handled */ } });
      });
      await reveal.goto(origin + '/watch/?reveal=1&utm_source=linkedin&utm_medium=paid&utm_campaign=vsl&utm_content=sold-a-lie-v1&utm_term=spring&li_fat_id=fat123', { waitUntil: 'domcontentloaded' });
      await reveal.waitForSelector('#cta');
      await reveal.evaluate(() => document.getElementById('cta').click());
      await reveal.waitForSelector('#dialog[aria-modal="true"]');
      await shot(reveal, 'desktop-step-1');
      check('step 1 question', (await reveal.$eval('#q1', (el) => el.textContent)) === "What's your business doing per year?");
      await clickChoice(reveal, 'Under $1M');
      await reveal.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 2 of 3');
      await shot(reveal, 'desktop-step-2');
      check('step 2 question', (await reveal.$eval('#q2', (el) => getComputedStyle(el).display !== 'none' && el.textContent)) === "What's eating your team's time most?");
      await clickChoice(reveal, 'Follow-ups & admin');
      await reveal.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 3 of 3');
      await shot(reveal, 'desktop-step-3');
      await reveal.type('input[name="name"]', 'Ada Lovelace');
      await reveal.type('input[name="email"]', 'ada@example.com');
      await reveal.type('input[name="phone"]', '5551234567');
      await reveal.click('#lead-submit');
      await reveal.waitForFunction(() => (document.querySelector('[data-err="email"]') || {}).textContent === 'Use your work email.');
      check('400 email inline', true);
      await reveal.click('#lead-submit');
      await reveal.waitForFunction(() => document.getElementById('form-alert').textContent.includes('Too many attempts'));
      const stillEnabled = await reveal.$eval('#lead-submit', (el) => !el.disabled);
      check('429 keeps the form usable', stillEnabled);
      await reveal.click('#lead-submit');
      await reveal.waitForFunction(() => document.getElementById('thanks-copy').textContent.includes("I'll personally reach out within one business day"));
      check('success copy', (await reveal.$eval('#thanks-copy', (el) => el.textContent)) === "You're in. I'll personally reach out within one business day to set up your strategy call.");
      const payload = posts[posts.length - 1];
      const expectedTerm = 'spring|vsl-a|rev:Under $1M|pain:Follow-ups & admin';
      check('submit payload', payload && payload.name === 'Ada Lovelace' && payload.email === 'ada@example.com' && payload.phone === '5551234567' && payload.website === '' && payload.utm_source === 'linkedin' && payload.utm_medium === 'paid' && payload.utm_campaign === 'vsl' && payload.utm_content === 'sold-a-lie-v1' && payload.utm_term === expectedTerm && payload.li_fat_id === 'fat123' && /^[A-Za-z0-9_-]{8,64}$/.test(payload.session_id) && /^[A-Za-z0-9_-]{8,64}$/.test(payload.visitor_id) && posts.length === 3, JSON.stringify(payload));
      await reveal.keyboard.press('Escape');
      await reveal.waitForFunction(() => document.getElementById('lightbox').hidden);
      check('escape closes lightbox', true);
    } else {
      await reveal.evaluate(() => document.getElementById('cta').click());
      await reveal.waitForSelector('.choice');
      await shot(reveal, 'mobile-step-1');
      await clickChoice(reveal, '$5–20M');
      await reveal.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 2 of 3');
      await shot(reveal, 'mobile-step-2');
      await clickChoice(reveal, 'Ops & reporting');
      await reveal.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 3 of 3');
      await shot(reveal, 'mobile-step-3');
      check('mobile lightbox steps', true);
    }
    await reveal.close();
  }

  async function openSpeed(query) {
    const page = await browser.newPage();
    await prepare(page, 1280, 800);
    await page.evaluateOnNewDocument(() => {
      if (!location.pathname.includes('/watch')) return;
      try { localStorage.removeItem('aiify.vsl.maxTime'); } catch { /* ignore */ }
    });
    await openWatch(page, query);
    return page;
  }
  async function waitUntilPlaying(page, rate) {
    await page.waitForFunction((expected) => {
      const video = document.getElementById('vsl');
      return video && !video.paused && video.currentTime > 0.35 && Math.abs(video.playbackRate - expected) < 0.001 && video.preservesPitch === true;
    }, { timeout: 25000 }, rate);
  }

  const speed125 = await openSpeed('?v=a&speed=1.25');
  await waitUntilPlaying(speed125, 1.25);
  await speed125.evaluate(() => { document.getElementById('vsl').playbackRate = 1; });
  await speed125.waitForFunction(() => Math.abs(document.getElementById('vsl').playbackRate - 1.25) < 0.001);
  await speed125.click('#sound-gate');
  await speed125.waitForFunction(() => {
    const video = document.getElementById('vsl');
    return Math.abs(video.playbackRate - 1.25) < 0.001 && video.preservesPitch === true && video.currentTime < 1.5;
  });
  const afterRestart = await speed125.evaluate(() => document.getElementById('vsl').currentTime);
  await new Promise((r) => setTimeout(r, 800));
  const paced = await speed125.evaluate(() => {
    const video = document.getElementById('vsl');
    return { time: video.currentTime, rate: video.playbackRate, pitch: video.preservesPitch };
  });
  check('speed=1.25 sticks after restart', Math.abs(paced.rate - 1.25) < 0.001 && paced.pitch === true && paced.time > afterRestart + 0.4, JSON.stringify({ afterRestart, paced }));
  await speed125.close();

  const speed2 = await openSpeed('?speed=2');
  await waitUntilPlaying(speed2, 2);
  const started = await speed2.evaluate(() => ({ time: document.getElementById('vsl').currentTime, now: performance.now() }));
  await new Promise((r) => setTimeout(r, 1200));
  const moved = await speed2.evaluate(() => {
    const video = document.getElementById('vsl');
    return { time: video.currentTime, now: performance.now(), rate: video.playbackRate, paused: video.paused };
  });
  const elapsed = (moved.now - started.now) / 1000;
  const advanced = moved.time - started.time;
  check('speed=2 is not treated as a skip', !moved.paused && Math.abs(moved.rate - 2) < 0.001 && advanced > elapsed * 1.45 && advanced < elapsed * 2.8, JSON.stringify({ elapsed, advanced, moved }));
  const beforeFastSeek = moved.time;
  await speed2.evaluate(() => { document.getElementById('vsl').currentTime += 40; });
  await new Promise((r) => setTimeout(r, 500));
  const afterFastSeek = await speed2.evaluate(() => document.getElementById('vsl').currentTime);
  check('speed=2 still blocks a real skip', afterFastSeek < beforeFastSeek + 4, 'before ' + beforeFastSeek + ' after ' + afterFastSeek);
  await speed2.close();

  const speedJunk = await openSpeed('?speed=junk');
  await waitUntilPlaying(speedJunk, 1);
  const junk = await speedJunk.evaluate(() => {
    const video = document.getElementById('vsl');
    return { rate: video.playbackRate, pitch: video.preservesPitch };
  });
  check('speed=junk stays at 1', Math.abs(junk.rate - 1) < 0.001 && junk.pitch === true, JSON.stringify(junk));
  await speedJunk.close();

  for (const width of [1440, 1280, 768, 390, 360]) {
    const page = await browser.newPage();
    await prepare(page, width, width >= 768 ? 900 : 780);
    await openWatch(page, '?reveal=1');
    await page.waitForSelector('#cta');
    await page.evaluate(() => document.getElementById('cta').click());
    await page.waitForSelector('.choice');
    await clickChoice(page, 'Under $1M');
    await page.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 2 of 3');
    await clickChoice(page, 'Sales & leads');
    await page.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 3 of 3');
    await settle(page);
    const fit = await page.evaluate(() => new Promise((resolve) => {
      const button = document.getElementById('lead-submit');
      const sheet = document.querySelector('.sheet');
      const samples = [];
      const started = performance.now();
      const read = () => {
        const buttonBox = button.getBoundingClientRect();
        const sheetBox = sheet.getBoundingClientRect();
        const style = getComputedStyle(button);
        const range = document.createRange();
        range.selectNodeContents(button);
        const lines = [...range.getClientRects()].filter((rect) => rect.width > 1 && rect.height > 1);
        samples.push({
          left: buttonBox.left - sheetBox.left,
          right: sheetBox.right - buttonBox.right,
          top: buttonBox.top - sheetBox.top,
          bottom: sheetBox.bottom - buttonBox.bottom,
          lines: lines.length,
          overflow: button.scrollWidth - button.clientWidth,
          font: style.fontSize,
          width: style.width,
          box: style.boxSizing,
          whiteSpace: style.whiteSpace,
        });
      };
      const tick = () => {
        read();
        if (performance.now() - started < 1100) requestAnimationFrame(tick);
        else resolve(samples);
      };
      requestAnimationFrame(tick);
    }));
    const inside = fit.every((sample) => sample.left >= -0.5 && sample.right >= -0.5 && sample.top >= -0.5 && sample.bottom >= 8 && sample.lines === 1 && sample.overflow <= 1 && sample.box === 'border-box' && sample.whiteSpace === 'nowrap');
    const worst = fit.reduce((min, sample) => Math.min(min, sample.left, sample.right, sample.bottom), Infinity);
    check('submit fits ' + width, inside, JSON.stringify({ worst, sample: fit[0], count: fit.length }));
    await page.close();
  }

  const player = await browser.newPage();
  await prepare(player, 1280, 800);
  const logs = [];
  player.on('console', (msg) => { if (msg.type() === 'error') logs.push(msg.text()); });
  player.on('pageerror', (err) => logs.push(String(err)));
  await player.evaluateOnNewDocument(() => {
    if (!location.pathname.includes('/watch')) return;
    localStorage.setItem('aiify.vsl.maxTime', '12');
  });
  await openWatch(player, '');
  try {
  await player.waitForFunction(() => {
    const video = document.getElementById('vsl');
    return video && !video.paused && video.currentTime > 8 && (video.dataset.mode === 'hls' || video.dataset.mode === 'mp4' || video.dataset.mode === 'native');
  }, { timeout: 25000 });
  } catch (error) {
    const debug = await player.evaluate(() => {
      const video = document.getElementById('vsl');
      return { mode: video.dataset.mode, paused: video.paused, time: video.currentTime, ready: video.readyState, src: (video.currentSrc || '').slice(0, 80) };
    });
    check('video plays', false, error.message + ' ' + JSON.stringify(debug) + ' ' + logs.slice(0, 6).join(' | '));
    await player.close();
    throw error;
  }
  const playing = await player.evaluate(() => {
    const video = document.getElementById('vsl');
    return { paused: video.paused, time: video.currentTime, mode: video.dataset.mode, controls: video.controls, attr: video.hasAttribute('controls'), pip: video.disablePictureInPicture, remote: video.disableRemotePlayback };
  });
  check('video plays', playing.paused === false && playing.time > 0.3, JSON.stringify(playing) + ' logs=' + logs.join(' | '));
  // A resume seek lands near the saved 12s. Playback from 0 would first cross 8s still near 8s.
  check('resumes saved progress', playing.time >= 11 && playing.time < 16, String(playing.time));
  check('no native controls', playing.controls === false && playing.attr === false && playing.pip === true && playing.remote === true, JSON.stringify(playing));
  const blockedMenu = await player.evaluate(() => {
    const video = document.getElementById('vsl');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    return !video.dispatchEvent(event);
  });
  check('right click blocked', blockedMenu);
  const beforeSeek = await player.evaluate(() => document.getElementById('vsl').currentTime);
  await player.evaluate(() => { document.getElementById('vsl').currentTime = 90; });
  await new Promise((r) => setTimeout(r, 400));
  const afterSeek = await player.evaluate(() => document.getElementById('vsl').currentTime);
  check('seeking snaps back', afterSeek < beforeSeek + 3, 'before ' + beforeSeek + ' after ' + afterSeek);
  await player.focus('#player');
  await player.keyboard.press('ArrowRight');
  await player.keyboard.press('l');
  await new Promise((r) => setTimeout(r, 250));
  const afterKeys = await player.evaluate(() => document.getElementById('vsl').currentTime);
  check('keyboard seek blocked', afterKeys < afterSeek + 3, 'after keys ' + afterKeys);
  await player.evaluate(() => document.getElementById('vsl').pause());
  await player.waitForFunction(() => !document.getElementById('vsl').paused, { timeout: 2000 }).catch(() => {});
  const resumed = await player.evaluate(() => !document.getElementById('vsl').paused);
  check('pause does not stick', resumed);
  await player.close();
} finally {
  await browser.close();
  server.close();
}

const verify = spawnSync('python3', ['-c', `
import struct, sys
from pathlib import Path
bad = []
for path in sys.argv[1:]:
    data = Path(path).read_bytes()
    ok_sig = data[:8] == b'\\x89PNG\\r\\n\\x1a\\n'
    w = h = 0
    if ok_sig and data[12:16] == b'IHDR':
        w, h = struct.unpack('>II', data[16:24])
    print(f'{Path(path).name} {w}x{h} bytes={len(data)}')
    if (not ok_sig) or len(data) < 20000 or w < 300 or h < 400:
        bad.append(f'{Path(path).name} {w}x{h} {len(data)}')
print('BAD ' + ','.join(bad) if bad else 'PNGS_OK')
`, ...shots], { encoding: 'utf8' });
process.stdout.write(verify.stdout || '');
process.stderr.write(verify.stderr || '');
if (verify.status !== 0 || !(verify.stdout || '').includes('PNGS_OK')) failures.push('screenshot check');
if (failures.length) {
  console.error('FAILED\\n' + failures.join('\\n'));
  process.exit(1);
}
console.log('ALL_OK', shots.length, 'screenshots');

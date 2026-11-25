// Acceptance checks for /watch tracking. Not part of npm test.
//   node scripts/watch-tracking-browser.mjs
import { createServer } from 'node:http';
import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = join(process.cwd(), 'public');
const outDir = '/opt/cursor/artifacts/watch';
mkdirSync(outDir, { recursive: true });
const failures = [];
function check(name, ok, detail) {
  if (ok) console.log('ok  ', name);
  else { failures.push(name + (detail ? ': ' + detail : '')); console.error('FAIL', name, detail || ''); }
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
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://localhost:${server.address().port}`;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-dev-shm-usage', '--mute-audio'],
});

async function arm(page, { mobile = false, blockUnmuted = false, width = 1280, height = 800 } = {}) {
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.setUserAgent(mobile
    ? 'Mozilla/5.0 (Linux; Android 13; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
    : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.evaluateOnNewDocument((block) => {
    window.__events = [];
    window.__hire = [];
    window.__li = [];
    window.lintrk = function (action, payload) {
      window.__li.push({ action, payload });
      window.lintrk.q = window.lintrk.q || [];
      window.lintrk.q.push([action, payload]);
    };
    window.lintrk.q = [];
    try {
      localStorage.removeItem('aiify.vsl.maxTime');
      localStorage.removeItem('aiify.vsl.revealed');
    } catch { /* ignore */ }
    navigator.sendBeacon = (url, data) => {
      if (String(url).includes('/api/vsl/event') && data && data.text) {
        data.text().then((text) => { try { window.__events.push(JSON.parse(text)); } catch { /* ignore */ } });
      }
      return true;
    };
    const orig = window.fetch;
    window.fetch = async (input, init) => {
      const url = String((input && input.url) || input);
      if (url.includes('/api/vsl/event') || url.includes('/api/hire')) {
        let text = '';
        const body = init && init.body;
        if (typeof body === 'string') text = body;
        else if (body && body.text) text = await body.text();
        const parsed = text ? JSON.parse(text) : {};
        if (url.includes('/api/hire')) window.__hire.push(parsed);
        else window.__events.push(parsed);
        return new Response(JSON.stringify({ ok: true, stored: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return orig(input, init);
    };
    if (block) {
      const play = HTMLMediaElement.prototype.play;
      let blocked = false;
      HTMLMediaElement.prototype.play = function () {
        if (!this.muted && !blocked) {
          blocked = true;
          return Promise.reject(new DOMException('autoplay blocked', 'NotAllowedError'));
        }
        return play.apply(this, arguments);
      };
    }
  }, blockUnmuted);
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/vsl/event') || url.includes('/api/hire')) {
      req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true, stored: 1 }) }).catch(() => {});
      return;
    }
    if (url.includes('snap.licdn.com') || url.includes('px.ads.linkedin.com')) { req.abort().catch(() => {}); return; }
    req.continue().catch(() => {});
  });
}

async function open(page, search) {
  await page.goto(origin + '/watch/' + search, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.__events.some((event) => event.event === 'page_view'), { timeout: 10000 });
}
function named(events, name) { return events.filter((event) => event.event === name); }

try {
  for (const [search, variant] of [['?v=a&aiify_test=1', 'a'], ['?v=b&aiify_test=1', 'b'], ['?v=c&aiify_test=1', 'c'], ['?utm_content=sold-a-lie-v1&aiify_test=1', 'a'], ['?utm_content=competitors&aiify_test=1', 'b'], ['?utm_content=hours-back&aiify_test=1', 'c']]) {
    const page = await browser.newPage();
    await arm(page);
    await open(page, search);
    const events = await page.evaluate(() => window.__events);
    const views = named(events, 'page_view');
    const view = views[0] || {};
    check('page_view ' + search, views.length === 1 && view.variant === variant && view.page === 'watch' && view.speed_source === 'split' && (view.speed_arm === 1 || view.speed_arm === 1.25) && view.device === 'desktop' && view.test === true, JSON.stringify(view));
    const li = await page.evaluate(() => window.__li);
    check('test traffic skips the landed conversion ' + variant, li.some((call) => call.payload && call.payload.conversion_id === 32485082) === false, JSON.stringify(li));
    await page.close();
  }

  const sticky = await browser.newPage();
  await arm(sticky);
  await open(sticky, '?v=a&aiify_test=1');
  const firstArm = await sticky.evaluate(() => localStorage.getItem('aiify.vsl.speedArm'));
  await sticky.reload({ waitUntil: 'domcontentloaded' });
  await sticky.waitForFunction((arm) => {
    const video = document.getElementById('vsl');
    return localStorage.getItem('aiify.vsl.speedArm') === arm && video && Math.abs(video.playbackRate - Number(arm)) < 0.001;
  }, {}, firstArm);
  const secondArm = await sticky.evaluate(() => localStorage.getItem('aiify.vsl.speedArm'));
  check('speed arm persists', firstArm === secondArm && (firstArm === '1' || firstArm === '1.25'), firstArm + ' ' + secondArm);
  await sticky.close();

  const override = await browser.newPage();
  await arm(override);
  await override.evaluateOnNewDocument(() => localStorage.setItem('aiify.vsl.speedArm', '1'));
  await open(override, '?v=a&speed=1.5&aiify_test=1');
  const overridden = await override.evaluate(() => ({
    arm: localStorage.getItem('aiify.vsl.speedArm'),
    event: window.__events.find((event) => event.event === 'page_view'),
  }));
  check('explicit speed overrides without rewriting the arm', overridden.arm === '1' && overridden.event.speed_arm === 1.5 && overridden.event.speed_source === 'url', JSON.stringify(overridden));
  await override.close();

  const quiet = await browser.newPage();
  await arm(quiet);
  await open(quiet, '?reveal=1&aiify_test=1');
  const revealEvents = await quiet.evaluate(() => window.__events.filter((event) => event.event === 'cta_revealed'));
  check('reveal=1 does not send cta_revealed', revealEvents.length === 0, JSON.stringify(revealEvents));
  const liQuiet = await quiet.evaluate(() => window.__li);
  check('test mode skips lintrk', liQuiet.length === 0, JSON.stringify(liQuiet));
  await quiet.close();

  const live = await browser.newPage();
  await arm(live);
  await open(live, '?v=a');
  const landed = await live.evaluate(() => window.__li.filter((call) => call.action === 'track' && call.payload && call.payload.conversion_id === 32485082));
  check('page_view conversion once', landed.length === 1, JSON.stringify(landed));
  await live.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 400));
  const landedAgain = await live.evaluate(() => window.__li.filter((call) => call.payload && call.payload.conversion_id === 32485082));
  check('page_view conversion stays once per session', landedAgain.length === 0, JSON.stringify(landedAgain));
  await live.close();

  const forward = await browser.newPage();
  await arm(forward);
  await open(forward, '?speed=2&aiify_test=1');
  await forward.waitForFunction(() => {
    const video = document.getElementById('vsl');
    return video && !video.paused && video.currentTime > 0.2;
  }, { timeout: 25000 });
  await forward.evaluate(() => new Promise((resolve) => {
    const video = document.getElementById('vsl');
    let n = 0;
    const timer = setInterval(() => {
      video.currentTime = (video.currentTime || 0) + 1.1;
      if (++n > 14) { clearInterval(timer); resolve(); }
    }, 40);
  }));
  await new Promise((r) => setTimeout(r, 300));
  const beforeSkip = await forward.evaluate(() => window.__events.map((event) => event.event));
  await forward.evaluate(() => { document.getElementById('vsl').currentTime += 80; });
  await new Promise((r) => setTimeout(r, 400));
  const afterSkip = await forward.evaluate(() => window.__events.map((event) => event.event));
  check('watch_10s fires once from real progress', beforeSkip.filter((name) => name === 'watch_10s').length === 1, JSON.stringify(beforeSkip));
  check('snapped skip adds no milestone', afterSkip.filter((name) => name === 'watch_25').length === 0 && afterSkip.filter((name) => name === 'watch_10s').length === 1, JSON.stringify(afterSkip));
  await forward.close();

  const resumed = await browser.newPage();
  await arm(resumed);
  await resumed.evaluateOnNewDocument(() => localStorage.setItem('aiify.vsl.maxTime', '300'));
  await open(resumed, '?aiify_test=1');
  await resumed.waitForFunction(() => document.getElementById('vsl').currentTime > 250, { timeout: 25000 });
  await new Promise((r) => setTimeout(r, 500));
  const resumeEvents = await resumed.evaluate(() => window.__events.map((event) => event.event));
  check('resume skips earlier milestones', !resumeEvents.includes('watch_10s') && !resumeEvents.includes('watch_25') && !resumeEvents.includes('watch_50'), JSON.stringify(resumeEvents));
  await resumed.close();

  const revealed = await browser.newPage();
  await arm(revealed);
  await open(revealed, '?speed=2&aiify_test=1');
  await revealed.waitForFunction(() => !document.getElementById('vsl').paused, { timeout: 25000 });
  await revealed.evaluate(() => new Promise((resolve) => {
    const video = document.getElementById('vsl');
    const timer = setInterval(() => {
      if (video.currentTime >= 524) { clearInterval(timer); resolve(); return; }
      video.currentTime = Math.min(530, (video.currentTime || 0) + 1.1);
    }, 20);
  }));
  await revealed.waitForFunction(() => window.__events.some((event) => event.event === 'cta_revealed' && event.detail === 'play'), { timeout: 8000 });
  check('cta_revealed at playback', true);
  await revealed.close();

  const hire = await browser.newPage();
  await arm(hire);
  await open(hire, '?v=b&reveal=1&aiify_test=1&utm_source=linkedin&utm_term=spring');
  await hire.waitForSelector('#cta');
  await hire.evaluate(() => document.getElementById('cta').click());
  await hire.waitForSelector('.choice');
  await hire.evaluate(() => [...document.querySelectorAll('.choice')].find((el) => el.textContent.trim() === 'Under $1M').click());
  await hire.waitForFunction(() => document.getElementById('lb-step').textContent === 'Step 2 of 3');
  await hire.evaluate(() => [...document.querySelectorAll('.choice')].find((el) => el.textContent.includes('Sales')).click());
  await hire.waitForSelector('input[name="name"]', { visible: true });
  await hire.evaluate(() => {
    const fill = (name, value) => {
      const input = document.querySelector('[name="' + name + '"]');
      input.focus();
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    fill('name', 'Ada Lovelace');
    fill('email', 'ada@example.com');
  });
  await hire.click('#lead-submit');
  try {
    await hire.waitForFunction(() => window.__hire.length > 0, { timeout: 8000 });
  } catch (error) {
    const debug = await hire.evaluate(() => ({
      hire: window.__hire,
      events: window.__events.map((event) => event.event + (event.detail ? ':' + event.detail : '')),
      alert: document.getElementById('form-alert').textContent,
      step: document.getElementById('lb-step').textContent,
      name: document.querySelector('[name="name"]').value,
      thanks: !document.getElementById('thanks').hidden,
    }));
    console.error('hire debug', JSON.stringify(debug));
    throw error;
  }
  const payload = await hire.evaluate(() => window.__hire[0]);
  const hireEvents = await hire.evaluate(() => window.__events.map((event) => event.event + (event.detail ? ':' + event.detail : '')));
  check('hire payload', payload.page === 'watch' && payload.page_variant === 'watch-b' && (payload.speed_arm === 1 || payload.speed_arm === 1.25) && payload.speed_source === 'split' && payload.device === 'desktop' && payload.test === true && payload.no_alert === true && payload.utm_term.startsWith('spring|vsl-b|'), JSON.stringify(payload));
  check('lightbox events', hireEvents.includes('cta_click') && hireEvents.includes('lightbox_opened') && hireEvents.includes('lb_step1_answered:Under $1M') && hireEvents.some((name) => name.startsWith('lb_step2_answered')) && hireEvents.includes('lb_form_started') && !hireEvents.includes('lead_submitted') && !hireEvents.includes('cta_revealed'), JSON.stringify(hireEvents));
  await hire.close();

  const desktop = await browser.newPage();
  await arm(desktop, { width: 1440, height: 900 });
  await open(desktop, '?aiify_test=1');
  await desktop.waitForFunction(() => window.__events.some((event) => event.event === 'video_autoplay_started'), { timeout: 25000 });
  const soundStart = await desktop.evaluate(() => ({
    events: window.__events.filter((event) => event.event === 'video_autoplay_started' || event.event === 'sound_on'),
    gate: document.getElementById('sound-gate').hidden,
    tap: document.getElementById('tap-sound').hidden,
  }));
  check('desktop autoplay with sound', soundStart.events.some((event) => event.event === 'video_autoplay_started' && event.detail === 'sound') && soundStart.events.some((event) => event.event === 'sound_on' && event.detail === 'autoplay') && soundStart.gate && soundStart.tap, JSON.stringify(soundStart));
  await desktop.close();

  const blocked = await browser.newPage();
  await arm(blocked, { blockUnmuted: true, width: 1440, height: 900 });
  await open(blocked, '?aiify_test=1');
  await blocked.waitForSelector('#tap-sound:not([hidden])', { timeout: 25000 });
  const mutedStart = await blocked.evaluate(() => window.__events.find((event) => event.event === 'video_autoplay_started'));
  check('desktop muted fallback', mutedStart && mutedStart.detail === 'muted', JSON.stringify(mutedStart));
  await blocked.screenshot({ path: join(outDir, 'desktop-tap-1440.png'), type: 'png' });
  const timeBeforeTap = await blocked.evaluate(() => document.getElementById('vsl').currentTime);
  await blocked.click('#tap-sound');
  await blocked.waitForFunction(() => window.__events.some((event) => event.event === 'sound_on' && event.detail === 'tap') && document.getElementById('vsl').muted === false, { timeout: 8000 });
  const afterTap = await blocked.evaluate(() => ({ muted: document.getElementById('vsl').muted, time: document.getElementById('vsl').currentTime, hidden: document.getElementById('tap-sound').hidden }));
  check('tap for sound unmutes', afterTap.muted === false && afterTap.hidden && (timeBeforeTap < 15 ? afterTap.time < 3 : true), JSON.stringify({ timeBeforeTap, afterTap }));
  await blocked.close();

  const mobile = await browser.newPage();
  await arm(mobile, { mobile: true, width: 390, height: 844 });
  await open(mobile, '?aiify_test=1');
  await mobile.waitForFunction(() => window.__events.some((event) => event.event === 'video_autoplay_started' && event.detail === 'muted'), { timeout: 25000 });
  const gate = await mobile.evaluate(() => ({ gate: document.getElementById('sound-gate').hidden, tap: document.getElementById('tap-sound').hidden, device: window.__events[0].device }));
  check('mobile keeps the gate', gate.gate === false && gate.tap === true && gate.device === 'mobile', JSON.stringify(gate));
  await mobile.screenshot({ path: join(outDir, 'mobile-gate-390.png'), type: 'png' });
  await mobile.click('#sound-gate');
  await mobile.waitForFunction(() => window.__events.some((event) => event.event === 'play_click') && window.__events.some((event) => event.event === 'sound_on' && event.detail === 'gate'), { timeout: 8000 });
  check('mobile gate events', true);
  await mobile.close();
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error('FAILED\n' + failures.join('\n'));
  process.exit(1);
}
console.log('TRACKING_OK');

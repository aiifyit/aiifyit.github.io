// Capture phone reel screenshots for /watch. Run from the repo root.
import { createServer } from 'node:http';
import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = join(process.cwd(), 'public');
const outDir = '/opt/cursor/artifacts/watch-reel';
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
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-dev-shm-usage', '--mute-audio', '--hide-scrollbars'],
});

const devices = [
  {
    name: 'iphone',
    width: 390,
    height: 844,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    ios: true,
  },
  {
    name: 'android',
    width: 412,
    height: 915,
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    ios: false,
  },
];

async function layout(page) {
  return page.evaluate(() => {
    const video = document.getElementById('vsl');
    const box = video.getBoundingClientRect();
    const caption = document.getElementById('captions');
    const cap = caption.getBoundingClientRect();
    const chip = document.querySelector('.tap-sound__card');
    const chipBox = chip ? chip.getBoundingClientRect() : null;
    const header = document.querySelector('.top').getBoundingClientRect();
    const eyebrow = getComputedStyle(document.querySelector('.eyebrow')).display;
    const gate = getComputedStyle(document.getElementById('sound-gate')).display;
    const fit = getComputedStyle(video).objectFit;
    return {
      reel: document.documentElement.classList.contains('reel'),
      muted: video.muted,
      paused: video.paused,
      time: video.currentTime,
      playsinline: video.playsInline,
      fit,
      stage: (() => { const s = document.querySelector('.stage').getBoundingClientRect(); return { top: s.top, bottom: innerHeight - s.bottom, left: s.left, right: innerWidth - s.right }; })(),
      headerH: header.height,
      eyebrow,
      gate,
      video: { top: box.top, left: box.left, right: innerWidth - box.right, bottom: innerHeight - box.bottom, h: box.height, w: box.width },
      view: { w: innerWidth, h: innerHeight },
      caption: { hidden: caption.hidden, text: caption.textContent, top: cap.top / innerHeight, bottom: cap.bottom / innerHeight },
      chip: chipBox && !document.getElementById('tap-sound').hidden ? {
        text: document.querySelector('[data-sound-label]').textContent,
        top: chipBox.top,
        right: innerWidth - chipBox.right,
        left: chipBox.left,
        w: chipBox.width,
        h: chipBox.height,
      } : null,
    };
  });
}

try {
  for (const device of devices) {
    const page = await browser.newPage();
    await page.setViewport({ width: device.width, height: device.height, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.setUserAgent(device.ua);
    await page.evaluateOnNewDocument((ios) => {
      window.__fullscreen = null;
      window.__iosFullscreen = false;
      Element.prototype.requestFullscreen = function () {
        window.__fullscreen = this === document.documentElement ? 'document' : (this.id || this.tagName);
        return Promise.resolve();
      };
      if (ios) {
        HTMLVideoElement.prototype.webkitEnterFullscreen = function () { window.__iosFullscreen = true; };
      }
      try { localStorage.removeItem('aiify.vsl.maxTime'); localStorage.removeItem('aiify.vsl.revealed'); } catch { /* ignore */ }
    }, device.ios);
    await page.goto(origin + '/watch/?v=a&speed=1&aiify_test=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForFunction(() => {
      const video = document.getElementById('vsl');
      return video && !video.paused && video.muted && video.currentTime > 0.15;
    }, { timeout: 25000 });
    // Land as close to the open as playback allows.
    const early = await layout(page);
    await page.screenshot({ path: join(outDir, device.name + '-0s.png'), type: 'png' });
    const ratio = early.video.h / Math.max(1, early.video.w);
    check(device.name + ' fills viewport at start', early.reel && early.playsinline && early.fit === 'contain' && early.headerH === 0 && early.eyebrow === 'none' && early.gate === 'none' && Math.abs(early.stage.top) <= 2 && Math.abs(early.stage.left) <= 2 && Math.abs(early.stage.right) <= 2 && Math.abs(early.stage.bottom) <= 2 && Math.abs(early.video.left) <= 2 && Math.abs(early.video.right) <= 2 && ratio > 0.5 && ratio < 0.62, JSON.stringify(early));
    check(device.name + ' chip at start', early.chip && early.chip.text === 'Captions on. Tap for sound.' && early.chip.top < 80 && early.chip.right >= 0 && early.chip.left > early.view.w * 0.35, JSON.stringify(early.chip));

    await page.evaluate(() => new Promise((resolve) => {
      const video = document.getElementById('vsl');
      const timer = setInterval(() => {
        if (video.currentTime >= 9) { clearInterval(timer); resolve(); return; }
        video.currentTime = Math.min(9.15, (video.currentTime || 0) + 0.9);
      }, 50);
    }));
    await page.waitForFunction(() => {
      const video = document.getElementById('vsl');
      const caption = document.getElementById('captions');
      return video.currentTime >= 8.7 && video.currentTime < 12 && caption && !caption.hidden && caption.textContent.length > 4;
    }, { timeout: 8000 });
    const mid = await layout(page);
    await page.screenshot({ path: join(outDir, device.name + '-9s.png'), type: 'png' });
    const videoBottom = 1 - (mid.video.bottom / mid.view.h);
    check(device.name + ' caption around 9s', mid.time >= 8.7 && mid.time < 12 && mid.caption.hidden === false && mid.caption.top > videoBottom - 0.02 && mid.caption.bottom < 0.96, JSON.stringify({ time: mid.time, caption: mid.caption, videoBottom }));
    check(device.name + ' still one sound ask', mid.chip && mid.chip.text === 'Captions on. Tap for sound.' && mid.gate === 'none' && mid.eyebrow === 'none', JSON.stringify(mid.chip));

    const before = mid.time;
    await page.touchscreen.tap(device.width / 2, device.height / 2);
    await page.waitForFunction(() => document.getElementById('vsl').muted === false && document.getElementById('tap-sound').hidden, { timeout: 8000 });
    const after = await page.evaluate(() => ({
      muted: document.getElementById('vsl').muted,
      time: document.getElementById('vsl').currentTime,
      rate: document.getElementById('vsl').playbackRate,
      chip: document.getElementById('tap-sound').hidden,
      captions: document.getElementById('captions').hidden,
      fullscreen: window.__fullscreen,
      ios: window.__iosFullscreen,
    }));
    await page.screenshot({ path: join(outDir, device.name + '-after-tap.png'), type: 'png' });
    const fullscreenOk = device.ios ? after.ios === true : after.fullscreen === 'document';
    check(device.name + ' tap unmutes in place once', after.muted === false && after.chip && after.captions && after.time + 0.4 >= before && Math.abs(after.rate - 1) < 0.001 && fullscreenOk, JSON.stringify({ before, after }));

    await page.goto(origin + '/watch/?v=a&reveal=1&speed=1&aiify_test=1', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForFunction(() => {
      const button = document.getElementById('cta');
      if (!button || button.closest('[hidden]')) return false;
      const box = button.getBoundingClientRect();
      return box.width > 100 && box.bottom < innerHeight - 4 && box.top > innerHeight * 0.5;
    }, { timeout: 8000 });
    const cta = await page.evaluate(() => {
      const button = document.getElementById('cta');
      const box = button.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        text: button.textContent.trim(),
        top: box.top,
        bottom: innerHeight - box.bottom,
        left: box.left,
        right: innerWidth - box.right,
        h: innerHeight,
        hit: hit && (hit.id || hit.className),
      };
    });
    await page.screenshot({ path: join(outDir, device.name + '-cta.png'), type: 'png' });
    check(device.name + ' cta visible on the reel', /book your strategy call/i.test(cta.text) && cta.bottom >= 8 && cta.top > cta.h * 0.45 && cta.left >= 0 && cta.right >= 0 && String(cta.hit).includes('cta'), JSON.stringify(cta));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error('FAILED\n' + failures.join('\n'));
  process.exit(1);
}
console.log('REEL_SHOTS_OK');

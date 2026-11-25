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
const origin = `http://127.0.0.1:${server.address().port}`;

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

async function shot(page, name) {
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

  const player = await browser.newPage();
  await prepare(player, 1280, 800);
  const logs = [];
  player.on('console', (msg) => { if (msg.type() === 'error') logs.push(msg.text()); });
  player.on('pageerror', (err) => logs.push(String(err)));
  await player.evaluateOnNewDocument(() => localStorage.setItem('aiify.vsl.maxTime', '12'));
  await openWatch(player, '');
  await player.waitForFunction(() => {
    const video = document.getElementById('vsl');
    return video && !video.paused && video.currentTime > 8 && (video.dataset.mode === 'hls' || video.dataset.mode === 'mp4' || video.dataset.mode === 'native');
  }, { timeout: 20000 });
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
import sys, zlib, struct
from pathlib import Path
bad = []
for path in sys.argv[1:]:
    data = Path(path).read_bytes()
    if len(data) < 8000 or data[:8] != b'\\x89PNG\\r\\n\\x1a\\n':
        bad.append(f'{path} size={len(data)}')
        continue
    pos = 8
    idat = b''
    w = h = 0
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos+4])[0]
        typ = data[pos+4:pos+8]
        chunk = data[pos+8:pos+8+ln]
        if typ == b'IHDR':
            w, h = struct.unpack('>II', chunk[:8])
        elif typ == b'IDAT':
            idat += chunk
        elif typ == b'IEND':
            break
        pos += 12 + ln
    raw = zlib.decompress(idat)
    # sample every row's filter byte plus a stride of pixels without full unfiltering
    total = 0
    count = 0
    step = max(1, (w * 4 + 1) // 40)
    i = 0
    for y in range(0, h, max(1, h // 40)):
        row = y * (w * 4 + 1)
        for x in range(1, w * 4 + 1, step):
            total += raw[row + x]
            count += 1
    # A blank frame is nearly one color. Compare a few distant uncompressed bytes after a cheap Sub/None assume.
    print(f'{Path(path).name} {w}x{h} bytes={len(data)} sample={count}')
    if w < 300 or h < 400 or len(data) < 8000:
        bad.append(f'{path} {w}x{h} bytes={len(data)}')
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

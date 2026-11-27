import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile('public/watch/index.html', 'utf8');
const css = await readFile('public/watch/watch.css', 'utf8');
const js = await readFile('public/watch/watch.js', 'utf8');
const captionsJs = await readFile('public/watch/captions.js', 'utf8');

function variantFn() {
  const start = html.indexOf('/* vsl-variant:start */');
  const end = html.indexOf('/* vsl-variant:end */');
  assert.ok(start > -1 && end > start, 'variant function is marked in the head');
  const source = html.slice(start, end);
  return vm.runInNewContext(`${source}\nresolveVariant`, { URLSearchParams });
}

const headlines = {
  a: "You Were Sold a Lie About AI. Buying the Tool Was Never the Job. Here's What the People Selling It Won't Tell You Is Missing.",
  b: 'How Your Competitors Are Getting Faster, Leaner and Cheaper Using the Same AI Tools You Already Pay For, and How to Close the Gap Before It Gets Wide.',
  c: 'Get 10 to 20 Hours of Your Week Back Without Hiring, Without Buying More Tools, and Without Your Business Waiting on You.',
};

function speedFn() {
  const start = js.indexOf('/* vsl-speed:start */');
  const end = js.indexOf('/* vsl-speed:end */');
  assert.ok(start > -1 && end > start, 'playback speed function is marked');
  return vm.runInNewContext(`${js.slice(start, end)}\nplaybackSpeed`);
}

test('speed split is sticky, even, and yields to an explicit speed', () => {
  const speedSrc = js.slice(js.indexOf('/* vsl-speed:start */'), js.indexOf('/* vsl-speed:end */'));
  const splitSrc = js.slice(js.indexOf('/* vsl-speed-split:start */'), js.indexOf('/* vsl-speed-split:end */'));
  const store = new Map();
  const speedAssignment = vm.runInNewContext(`${speedSrc}\n${splitSrc}\nspeedAssignment`, {
    localStorage: {
      getItem: (key) => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    },
    crypto: { getRandomValues: (bytes) => { bytes[0] = Math.floor(Math.random() * 256); return bytes; } },
    Math, Number, String, Uint8Array,
  });
  const counts = { 1: 0, 1.25: 0 };
  for (let i = 0; i < 1000; i++) {
    store.delete('aiify.vsl.speedArm');
    const assigned = speedAssignment(new URLSearchParams(''));
    assert.equal(assigned.source, 'split');
    counts[assigned.rate] += 1;
  }
  assert.ok(counts[1] >= 450 && counts[1] <= 550, JSON.stringify(counts));
  assert.ok(counts[1.25] >= 450 && counts[1.25] <= 550, JSON.stringify(counts));
  store.set('aiify.vsl.speedArm', '1');
  const override = speedAssignment(new URLSearchParams('speed=1.5'));
  assert.equal(override.rate, 1.5);
  assert.equal(override.source, 'url');
  assert.equal(store.get('aiify.vsl.speedArm'), '1');
  const invalid = speedAssignment(new URLSearchParams('speed=junk'));
  assert.equal(invalid.source, 'split');
  assert.ok(invalid.rate === 1 || invalid.rate === 1.25);
  assert.match(js, /page_view: 32485082/);
  assert.match(js, /watch_50: 32485074/);
  assert.match(js, /cta_click: 32485066/);
  assert.match(js, /lead_submitted: 32485058/);
  assert.match(html, /_linkedin_partner_id = "10091706"/);
  assert.match(html, /lintrk\.q\.push/);
});

test('speed query is clamped between 0.5 and 2', () => {
  const playbackSpeed = speedFn();
  assert.equal(playbackSpeed(null), 1);
  assert.equal(playbackSpeed(''), 1);
  assert.equal(playbackSpeed('   '), 1);
  assert.equal(playbackSpeed('junk'), 1);
  assert.equal(playbackSpeed('1.25abc'), 1);
  assert.equal(playbackSpeed('Infinity'), 1);
  assert.equal(playbackSpeed('1'), 1);
  assert.equal(playbackSpeed('1.25'), 1.25);
  assert.equal(playbackSpeed('2'), 2);
  assert.equal(playbackSpeed('0.5'), 0.5);
  assert.equal(playbackSpeed('3'), 2);
  assert.equal(playbackSpeed('0.1'), 0.5);
  assert.equal(playbackSpeed('-4'), 0.5);
  assert.equal(html.includes('playbackRate'), false);
  assert.equal(html.includes('>speed<'), false);
});

test('variant query and utm_content choose a headline before paint', () => {
  const resolveVariant = variantFn();
  assert.equal(resolveVariant(''), 'a');
  assert.equal(resolveVariant('?v=a'), 'a');
  assert.equal(resolveVariant('?v=B'), 'b');
  assert.equal(resolveVariant('?v=c'), 'c');
  assert.equal(resolveVariant('?v=nope'), 'a');
  assert.equal(resolveVariant('?utm_content=ad-sold-a-lie-v2'), 'a');
  assert.equal(resolveVariant('?utm_content=Competitors-Retarget'), 'b');
  assert.equal(resolveVariant('?utm_content=hours-back-lookalike'), 'c');
  assert.equal(resolveVariant('?v=b&utm_content=sold-a-lie'), 'b');
  assert.equal(resolveVariant('?v=zzz&utm_content=hours-back'), 'c');
  const headEnd = html.indexOf('</head>');
  const variantScript = html.lastIndexOf('resolveVariant(location.search)', headEnd);
  assert.ok(variantScript > -1 && variantScript < headEnd, 'variant script runs in the head');
  assert.ok(html.indexOf('document.documentElement.setAttribute(\'data-v\', variant)') < headEnd);
  assert.doesNotMatch(html.slice(html.indexOf('<script>'), html.indexOf('</script>', html.indexOf('resolveVariant'))), /async|defer/);
  assert.ok(html.indexOf('.variant { display: none; }') < html.indexOf('data-variant="a"'));
});

test('watch page is a standalone noindex VSL with the hire contract', () => {
  for (const headline of Object.values(headlines)) assert.ok(html.includes(headline), headline);
  assert.equal((html.match(/<h1>/g) || []).length, 3);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.ok(html.includes('Watch this short video. Turn your sound on.'));
  assert.ok(html.includes('Click to play with sound'));
  assert.ok(js.includes('https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/hls/master.m3u8'));
  assert.ok(js.includes('https://aiify-vsl-media.joshua-509.workers.dev/vsl/v1/vsl-720p.mp4'));
  assert.ok(html.includes('poster-alt-frame.jpg'));
  assert.ok(js.includes('523.5'));
  assert.ok(js.includes('https://aiify-free-file.joshua-509.workers.dev/api/hire'));
  assert.ok(html.includes('name="website"'));
  assert.ok(html.includes("You're in. I'll personally reach out within one business day to set up your strategy call."));
  assert.ok(html.includes('_linkedin_partner_id = "10091706"'));
  assert.ok(html.includes('family=Anton'));
  assert.ok(css.includes('#b7fe3c') && css.includes('#8fd41e') && css.includes('#4f7a0c'));
  assert.ok(css.includes('Anton'));
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /classList.add\('reel'\)/);
  assert.match(html, /\/watch\/captions\.js/);
  assert.match(js, /Captions on\. Tap for sound\./);
  assert.match(js, /webkitEnterFullscreen/);
  assert.match(js, /!isReel\(\) && t >= 30/);
  assert.match(css, /100dvh/);
  assert.match(css, /object-fit: contain/);
  assert.match(css, /html\.reel \.sound-gate \{ display: none !important; \}/);
  assert.equal(html.includes('<nav'), false);
  assert.equal(html.includes('<footer'), false);
  assert.equal(html.includes('<a '), false);
  assert.equal(html.includes('controls='), false);
  assert.doesNotMatch(html, /calendly|timewithjosh/i);
  for (const label of ['Under $1M', '$1–5M', '$5–20M', '$20M+', 'Follow-ups &amp; admin', 'Sales &amp; leads', 'Ops &amp; reporting', 'Customer service']) {
    assert.ok(html.includes(label), label);
  }
});

test('caption track covers the whole video and keeps the checked hook', () => {
  const cues = vm.runInNewContext(`${captionsJs}\nwindow.VSL_CAPTIONS`, { window: {} });
  assert.ok(cues.length > 80, String(cues.length));
  assert.equal(cues[0][2], 'Every business owner who bought AI');
  assert.equal(cues.find((cue) => cue[2] === "If you've been thinking,")[0], 8.84);
  assert.ok(cues.some((cue) => cue[2] === 'The tool was never the hard part.'));
  assert.ok(cues.some((cue) => cue[2].includes('Josh Pellicer')));
  assert.ok(cues.some((cue) => /coordinated swarm/i.test(cue[2])));
  assert.ok(cues.at(-1)[1] > 520, String(cues.at(-1)));
  for (let i = 0; i < cues.length; i++) {
    const [start, end, text] = cues[i];
    assert.equal(typeof text, 'string');
    assert.ok(text.length > 0 && text.length <= 90, text);
    assert.ok(end > start, text);
    if (i) assert.ok(start >= cues[i - 1][1] - 0.001, text);
  }
  const at = (t) => cues.find((cue) => t >= cue[0] && t < cue[1]);
  assert.ok(at(9));
  assert.match(at(46)[2], /Fat Camp|funny thing|easy/);
  assert.match(at(60)[2], /runs on AI/);
  assert.match(at(240)[2], /swarm|together|business/);
  assert.ok(at(520));
});

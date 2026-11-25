import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile('public/watch/index.html', 'utf8');
const css = await readFile('public/watch/watch.css', 'utf8');
const js = await readFile('public/watch/watch.js', 'utf8');

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
  assert.equal(html.includes('<nav'), false);
  assert.equal(html.includes('<footer'), false);
  assert.equal(html.includes('<a '), false);
  assert.equal(html.includes('controls='), false);
  assert.doesNotMatch(html, /calendly|timewithjosh/i);
  for (const label of ['Under $1M', '$1–5M', '$5–20M', '$20M+', 'Follow-ups &amp; admin', 'Sales &amp; leads', 'Ops &amp; reporting', 'Customer service']) {
    assert.ok(html.includes(label), label);
  }
});

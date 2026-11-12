import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { escapeHtml } from './article-template.mjs';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const articles = await Promise.all((await readdir('content/articles')).filter(name => name.endsWith('.json')).map(async name => JSON.parse(await readFile(`content/articles/${name}`, 'utf8'))));
const index = await readFile('dist/articles/index.html', 'utf8');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const home = await readFile('dist/index.html', 'utf8');
assert(home.includes('Joshua Pellicer'));
assert(!home.includes('Joshua Fulkner'));
assert(!home.includes('Sam Depp'));
assert(!home.includes('Co-Founder &amp; CTO'));
function assertNoPartnerLink(html, label) {
  assert(!html.includes('href="/partner-program/"'), `${label} must not link to the partner page`);
  assert(!html.includes('>Partner Program<'), `${label} must not label a Partner Program link`);
}
assertNoPartnerLink(index, 'Article index');
assertNoPartnerLink(home, 'Homepage');
assert(!home.includes('name="robots" content="noindex'), 'Homepage must stay indexable');
assert(!index.includes('name="robots" content="noindex'), 'Article index must stay indexable');
for (const article of articles) {
  const path = `/articles/${article.slug}/`;
  const html = await readFile(`dist${path}index.html`, 'utf8');
  assertNoPartnerLink(html, path);
  assert(!html.includes('name="robots" content="noindex'), `${path} must stay indexable`);
  assert(html.includes(`<h1>${escapeHtml(article.title)}</h1>`), 'Raw HTML headline');
  assert(html.includes(`<link rel="canonical" href="${site.url}${path}">`), 'Canonical');
  assert(html.includes(`<meta name="description" content="${escapeHtml(article.description)}">`));
  assert(html.includes(`<meta property="og:type" content="article">`));
  for (const section of article.sections) for (const paragraph of section.paragraphs) assert(html.includes(escapeHtml(paragraph)), 'Every paragraph in raw HTML');
  const jsonld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(jsonld.headline, article.title);
  assert.equal(jsonld.description, article.description);
  assert.equal(jsonld.url, site.url + path);
  assert.equal(jsonld.author.name, site.name);
  assert(index.includes(`href="${path}"`), 'Index links to article');
  assert(sitemap.includes(`<loc>${site.url}${path}</loc>`));
  assert.equal((html.match(/<h1>/g) ?? []).length, 1);
  assert(!html.includes('src="/assets/'), 'Static articles need no app JavaScript');
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    if (!href.startsWith('/')) continue;
    const clean = href.split(/[?#]/)[0];
    const disk = `dist${clean}${clean.endsWith('/') ? 'index.html' : ''}`;
    if (clean === '/book') await stat('dist/book/index.html');
    else await stat(disk);
  }
}
for (const route of ['book', 'inquire', 'sow', 'partner-program']) {
  const entry = await readFile(`dist/${route}/index.html`, 'utf8');
  assert(entry.includes(home.match(/<script type="module"[^>]*><\/script>/)[0]), `Preserved ${route} app bundle`);
  assert(entry.includes('<div id="root"></div>'), `Preserved ${route} React root`);
}
assert((await readFile('dist/book/index.html', 'utf8')).includes(`rel="canonical" href="${site.url}/inquire/"`), 'Booking canonical');
assert((await readFile('dist/sow/index.html', 'utf8')).includes('name="robots" content="noindex, nofollow"'), 'Do not index SOW entry');
assert.equal(await readFile('dist/404.html', 'utf8'), home, 'Preserved SPA fallback');
assert(!sitemap.includes('/sow'), 'Do not index private workspace');
assert(!sitemap.includes('client-feedback'), 'Do not index feedback form');
console.log(`Raw HTML, metadata, JSON-LD, internal links and app entry checks passed (${articles.length} article).`);

const services = JSON.parse(await readFile('content/services.json', 'utf8'));
for (const service of services) {
  const route = `/services/${service.slug}/`;
  const html = await readFile(`dist${route}index.html`, 'utf8');
  assertNoPartnerLink(html, route);
  assert(html.includes(`<h1>${escapeHtml(service.title)}</h1>`));
  assert(html.includes(`rel="canonical" href="${site.url}${route}"`));
  assert(html.includes('action="/inquire/" method="get"'));
  assert(html.includes(`name="service" value="${service.slug}"`));
  assert(html.includes('Get started →'));
  assert(!html.includes('type="email"'));
  const jsonld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(jsonld['@type'], 'Service');
  assert.equal(jsonld.url, site.url + route);
  assert(sitemap.includes(`<loc>${site.url}${route}</loc>`));
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    if (!href.startsWith('/')) continue;
    const clean=href.split(/[?#]/)[0];
    await stat(`dist${clean}${clean.endsWith('/') ? 'index.html' : ''}`);
  }
}
console.log(`Service funnel checks passed (${services.length} pages).`);

assert((await readFile('dist/inquire/index.html', 'utf8')).includes(`rel="canonical" href="${site.url}/inquire/"`), 'Inquiry canonical');
for (const name of await readdir('dist/assets')) {
  if (!name.endsWith('.js')) continue;
  const bundle = await readFile(`dist/assets/${name}`, 'utf8');
  assert(!bundle.includes('calendly.com/jon-aiifyit/30min'), 'Broken calendar must not be linked or loaded by shipped code');
}

assert(!sitemap.includes('/book/'), 'Do not index duplicate booking alias');

const offer = await readFile('dist/partner-program/index.html', 'utf8');
const offerRedirect = await readFile('dist/new-offer/index.html', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
assert(offer.includes('name="robots" content="noindex, nofollow"'), 'Hidden offer is noindex');
assert(offer.includes('name="googlebot" content="noindex, nofollow"'), 'Hidden offer is noindex for googlebot');
assert(offer.includes('name="bingbot" content="noindex, nofollow"'), 'Hidden offer is noindex for bingbot');
assert(offer.includes('<title>Offer AI Agent Swarms Under Your Brand | AIify Partner Program</title>'));
assert(offer.includes('content="Offer your clients done-for-them AI agent swarms under your brand. You keep the client and set the price. We co-manage the work behind you for a fixed fee."'));
assert(offer.includes('<h1>Give your clients a premium AI offer under your brand.</h1>'));
assert(offer.includes('Message us'));
assert(!offer.includes('Get a quote'));
assert(offer.includes('We reply personally. No automated sequence.'));
assert(offer.includes(`rel="canonical" href="${site.url}/partner-program/"`));
assert(offer.includes(`property="og:url" content="${site.url}/partner-program/"`));
assert(offer.includes('mailto:joshua@aiifyit.com'));
assert(offer.includes('Source%3A%20%2Fpartner-program'), 'Quote draft names the offer page');
assert(!offer.includes('/images/offer/hero.webp'), 'Graphic hero needs no photo preload');
assert(offer.includes(`${site.url}/images/offer/hero.jpg`));
assert(!offer.includes('Book a call'));
assert(!offer.includes('Get your quarterly goals done'));
assert(!offer.includes('The tool is not the problem'));
assert(!offer.includes('calendly.com'), 'Hidden offer must use the mailto handoff');
assert.notEqual(offer, home, 'Offer entry is its own document, not the homepage shell');
assert(offerRedirect.includes('http-equiv="refresh"'), 'Old URL uses a meta refresh');
assert(offerRedirect.includes('location.replace'), 'Old URL uses JS location.replace');
assert(offerRedirect.includes('location.search') && offerRedirect.includes('location.hash'), 'Redirect preserves query and hash');
assert(offerRedirect.includes(`rel="canonical" href="${site.url}/partner-program/"`), 'Redirect canonical points at the new URL');
assert(offerRedirect.includes('name="robots" content="noindex, nofollow"'), 'Redirect is noindex');
assert(!offerRedirect.includes('<div id="root"></div>'), 'Old URL is a static redirect, not the app shell');
assert(!sitemap.includes('new-offer'), 'Do not list the old offer URL in the sitemap');
assert(!sitemap.includes('partner-program'), 'Do not list the hidden offer in the sitemap');
assert(!sitemap.includes('/partners/'), 'Do not publish a partners route');
assert(!robots.includes('new-offer'), 'Do not list the old offer URL in robots.txt');
assert(!robots.includes('partner-program'), 'Do not list the hidden offer in robots.txt');
assert(!robots.includes('Disallow: /partner-program'), 'Do not Disallow the partner page; crawlers must be able to see noindex');
assert.equal(robots, `User-agent: *\nAllow: /\nDisallow: /sow\nDisallow: /client-feedback/\nSitemap: ${site.url}/sitemap.xml\n`);
assert(!home.includes('new-offer'), 'Homepage shell must not link the old offer URL');
assert(!home.includes('partner-program'), 'Homepage shell must not link the hidden offer');
for (const file of [
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'scripts/article-template.mjs',
  'src/pages/MarketingPage.tsx',
  'src/data/constants.ts',
  'content/site.json',
]) {
  const text = await readFile(file, 'utf8');
  assert(!text.includes('new-offer'), `${file} must not link the old offer URL`);
  assert(!/\/partners(?!-)/.test(text), `${file} must not add a partners route`);
}
for (const file of [
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'scripts/article-template.mjs',
  'src/pages/MarketingPage.tsx',
  'src/data/constants.ts',
  'content/site.json',
]) {
  const text = await readFile(file, 'utf8');
  assert(!text.includes('partner-program'), `${file} must not link the partner page`);
  assert(!text.includes('>Partner Program<'), `${file} must not show a Partner Program nav label`);
}
for (const route of ['book', 'inquire']) {
  const html = await readFile(`dist/${route}/index.html`, 'utf8');
  assertNoPartnerLink(html, route);
  assert(html.includes('<noscript>'));
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert(html.includes('<h1>Get started</h1>'));
  assert(html.includes('mailto:joshua@aiifyit.com'));
  assert(html.includes('<title>Get started | AIify</title>'));
}

const homeCopy = JSON.parse(await readFile('src/data/homeCopy.json', 'utf8'));
assert(home.includes(`<h1>${escapeHtml(homeCopy.hero.heading)}</h1>`));
assert(home.includes(escapeHtml(homeCopy.hero.body)));
assert(home.includes(escapeHtml(homeCopy.economics.body)));
assert(home.includes('Your first company account is $10,000 a month. Each account after that is $4,000 a month.'));
assert(home.includes(escapeHtml(homeCopy.quote.body)));
assert.equal((home.match(/<h1\b/g) ?? []).length, 1);
const initialRoot = home.slice(home.indexOf('<div id="root">'));
for (const section of ['intro', 'model', 'evidence', 'economics', 'ownership', 'quote', 'explore']) {
  assert(initialRoot.includes(escapeHtml(homeCopy[section].heading)), `${section} heading in initial HTML`);
}
for (const faq of homeCopy.ownership.questions) {
  assert(initialRoot.includes(escapeHtml(faq.q)));
  assert(initialRoot.includes(escapeHtml(faq.a)));
}
const originalHome = await readFile('index.html', 'utf8');
assert.equal(home.match(/<title>.*?<\/title>/)[0], originalHome.match(/<title>.*?<\/title>/)[0]);
for (const meta of ['name="description"', 'property="og:image"', 'name="twitter:image"']) {
  const pattern = new RegExp(`<meta ${meta} content="[^"]*"`);
  assert.equal(home.match(pattern)[0], originalHome.match(pattern)[0]);
}
assert(home.includes(`property="og:image" content="${site.url}/og-image.png"`));
assert(home.includes(`name="twitter:image" content="${site.url}/og-image.png"`));
const png = await readFile('dist/og-image.png');
assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
assert.equal(png.toString('ascii', 12, 16), 'IHDR');
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
assert(png.includes(Buffer.from('IDAT')) && png.includes(Buffer.from('IEND')), 'PNG contains image data and an end chunk');
for (const slug of ['about', 'privacy', 'terms']) {
  const page = JSON.parse(await readFile(`content/pages/${slug}.json`, 'utf8'));
  const html = await readFile(`dist/${slug}/index.html`, 'utf8');
  assertNoPartnerLink(html, slug);
  assert(!/noindex/i.test(html), `${slug} stays indexable`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert(html.includes(`<h1>${escapeHtml(page.heading)}</h1>`));
  assert(html.includes(escapeHtml(page.intro)));
  assert(html.includes(`rel="canonical" href="${site.url}/${slug}/"`));
  assert(!html.includes('type="module"'), 'Static information pages need no app JS');
  assert(sitemap.includes(`<loc>${site.url}/${slug}/</loc>`));
  if (page.founder) {
    assert(html.includes('src="/images/team/joshua.jpg"'));
    await stat('dist/images/team/joshua.jpg');
    assert(html.includes(escapeHtml(page.founder.bio)));
    assert(!/87%|millions saved/.test(html));
  }
  for (const section of page.sections ?? []) {
    assert(html.includes(`<h2>${escapeHtml(section.title)}</h2>`));
    for (const paragraph of section.paragraphs) assert(html.includes(escapeHtml(paragraph)));
  }
  for (const href of ['/about/', '/privacy/', '/terms/']) assert(html.includes(`href="${href}"`));
}
for (const bot of ['robots', 'googlebot', 'bingbot']) {
  for (const html of [offer, offerRedirect]) assert(html.includes(`name="${bot}" content="noindex, nofollow"`));
  for (const html of [home, index]) assert(!new RegExp(`name="${bot}" content="[^"]*noindex`).test(html));
}
for (const service of services) assert(!/noindex/i.test(await readFile(`dist/services/${service.slug}/index.html`, 'utf8')));
try {
  assert(!(await readFile('dist/llms.txt', 'utf8')).includes('partner-program'));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log('Homepage prerender, PNG, information pages, inquiry title and indexing checks passed.');

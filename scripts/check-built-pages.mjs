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
for (const article of articles) {
  const path = `/articles/${article.slug}/`;
  const html = await readFile(`dist${path}index.html`, 'utf8');
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
for (const route of ['book', 'inquire', 'sow', 'new-offer']) {
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
  assert(html.includes(`<h1>${escapeHtml(service.title)}</h1>`));
  assert(html.includes(`rel="canonical" href="${site.url}${route}"`));
  assert(html.includes('action="/inquire/" method="get"'));
  assert(html.includes(`name="service" value="${service.slug}"`));
  assert(html.includes('Skip this step and prepare an email'));
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

const offer = await readFile('dist/new-offer/index.html', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
assert(offer.includes('name="robots" content="noindex, nofollow"'), 'Hidden offer is noindex');
assert(offer.includes('<title>Get your quarterly goals done without hiring anyone or learning AI | AIify</title>'));
assert(offer.includes('content="You tell us what has to get done this quarter. A chief of staff, developers, and a project manager use AI on that work every day, and you say OK before anything goes out."'));
assert(offer.includes('<h1>Get your quarterly goals done without hiring anyone or learning AI.</h1>'));
assert(offer.includes(`rel="canonical" href="${site.url}/new-offer/"`));
assert(offer.includes('Book a call'));
assert(offer.includes('mailto:joshua@aiifyit.com'));
assert(!offer.includes('I need to hit my number'));
assert(!offer.includes('cannot track'));
assert(!offer.includes('calendly.com'), 'Hidden offer must use the mailto handoff');
assert(!sitemap.includes('new-offer'), 'Do not list the hidden offer in the sitemap');
assert(!robots.includes('new-offer'), 'Do not list the hidden offer in robots.txt');
assert.equal(robots, `User-agent: *\nAllow: /\nDisallow: /sow\nDisallow: /client-feedback/\nSitemap: ${site.url}/sitemap.xml\n`);
assert(!home.includes('new-offer'), 'Homepage shell must not link the hidden offer');
for (const file of [
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/pages/MarketingPage.tsx',
  'src/data/constants.ts',
  'content/site.json',
]) {
  assert(!(await readFile(file, 'utf8')).includes('new-offer'), `${file} must not link the hidden offer`);
}
const offerSource = await readFile('src/pages/NewOfferPage.tsx', 'utf8');
for (const phrase of [
  'Book a call',
  'Get your quarterly goals done without hiring anyone or learning AI.',
  'You tell us what has to get done this quarter.',
  'The CRM updates itself',
  'Follow-ups, quotes, and reminders',
  'company knowledge base',
  'Someone watching the meeting',
  'An AI agent that belongs to your company',
  'until you say OK',
  'department head',
  'Chief of staff',
  'PLACEHOLDER',
  'P.S.',
  "You're not short on ideas or ambition. You're short on time.",
]) {
  assert(offerSource.includes(phrase), `Offer page missing ${phrase}`);
}
for (const banned of [
  'Dreamlawn', 'Midwest', 'Drobenak', 'Heritage', 'Coalmarch', 'Real Green', 'new-mover', '1995',
  '$9,500', '$400,000', '400K', '$7,500', '$8,000', 'Lever Audit', 'Lever Map',
  'Grokbot', 'Hermes', 'RAG', 'Payroll', 'payroll',
  'I need to hit my number', 'done paying', 'can\'t track', 'can’t track',
  'my business', 'My data', 'We tried agencies', 'I want to book', 'What I am', 'for me',
  'short an aim', 'short a goal',
]) {
  assert(!offerSource.includes(banned), `Offer page must not mention ${banned}`);
}
assert(!/\bmy\b/i.test(offerSource), 'Write to the owner: no prospect "my"');
assert(!/\bme\b/.test(offerSource), 'Write to the owner: no prospect "me"');
assert(!/\bI\b/.test(offerSource), 'Write to the owner: no prospect "I"');
const offerCopy = offerSource.replace(/className="[^"]*"/g, '');
for (const vague of ['follow-through', 'leverage', 'mechanism', 'outcomes', 'transform', 'bolt-on', 'sign-off', 'We do the digging']) {
  assert(!offerCopy.toLowerCase().includes(vague), `Offer page must not say ${vague}`);
}
for (const vague of [/\bsystems\b/i, /\blever\b/i, /\baim\b/i]) {
  assert(!vague.test(offerCopy), `Offer page must not say ${vague}`);
}
for (const route of ['book', 'inquire']) {
  const html = await readFile(`dist/${route}/index.html`, 'utf8');
  assert(html.includes('<noscript>'));
  assert(html.includes('mailto:joshua@aiifyit.com'));
  assert(html.includes('<title>Email Joshua about your workflow | AIify It</title>'));
}

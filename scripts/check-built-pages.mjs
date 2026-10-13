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
for (const route of ['book', 'inquire', 'sow']) {
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
for (const route of ['book', 'inquire']) {
  const html = await readFile(`dist/${route}/index.html`, 'utf8');
  assert(html.includes('<noscript>'));
  assert(html.includes('mailto:joshua@aiifyit.com'));
  assert(html.includes('<title>Email Joshua about your workflow | AIify It</title>'));
}

import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { renderPage } from './page-template.mjs';
import { renderHome } from './home-template.mjs';
import { auditDirectory } from './content-audit.mjs';
import { renderService } from './service-template.mjs';
import { renderArticle, renderIndex, escapeHtml, safeJson } from './article-template.mjs';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const inquiry = JSON.parse(await readFile('content/inquiry.json', 'utf8'));
if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(inquiry.recipient)) throw new Error('Invalid inquiry recipient');
const services = JSON.parse(await readFile('content/services.json', 'utf8'));
const articles = await Promise.all((await readdir('content/articles')).filter(name => name.endsWith('.json')).sort().map(async name => JSON.parse(await readFile(`content/articles/${name}`, 'utf8'))));
const { errors, warnings } = await auditDirectory();
for (const warning of warnings) console.warn(warning);
if (errors.length) throw new Error(errors.join('\n'));
const shell = await readFile('dist/index.html', 'utf8');
const stylesheets = [...shell.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(match => match[1]);
if (!stylesheets.length) throw new Error('Built site stylesheet not found');
const homeCopy = JSON.parse(await readFile('src/data/homeCopy.json', 'utf8'));
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homeCopy.ownership.questions.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};
const home = shell
  .replace('</head>', `<script type="application/ld+json">${safeJson(faqSchema)}</script>\n</head>`)
  .replace('<div id="root"></div>', `<div id="root">${renderHome(homeCopy)}</div>`);
await writeFile('dist/index.html', home);
await copyFile('dist/index.html', 'dist/404.html');
for (const slug of ['about', 'privacy', 'terms']) {
  const page = JSON.parse(await readFile(`content/pages/${slug}.json`, 'utf8'));
  await mkdir(`dist/${slug}`, { recursive: true });
  await writeFile(`dist/${slug}/index.html`, renderPage(site, page, stylesheets));
}
function hiddenOfferShell(shell) {
  const title = 'Offer AI Agent Swarms Under Your Brand | AIify Partner Program';
  const description = 'Offer your clients done-for-them AI agent swarms under your brand. You keep the client and set the price. We co-manage the work behind you for a fixed fee.';
  const url = `${site.url}/partner-program/`;
  const image = `${site.url}/images/offer/hero.jpg`;
  const hero = 'Give your clients a premium AI offer under your brand.';
  const subhead = 'Offer your clients a premium offer they really want: done-for-them AI agent swarms, co-managed by our expert AI management team. You keep your clients, and we serve them with you.';
  const mailto = `mailto:${inquiry.recipient}?subject=${encodeURIComponent('AIify partnership inquiry')}&body=${encodeURIComponent(["I'd like to talk about a partnership.", '', 'Source: /partner-program', 'Name: ', 'Company: ', 'Email: ', '', 'Anything we should know:', ''].join('\r\n'))}`;
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(url)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(image)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(image)}$2`)
    .replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${url}"`)
    .replace('</head>', `<script>document.documentElement.dataset.page="offer"</script>\n<meta name="robots" content="noindex, nofollow">\n<meta name="googlebot" content="noindex, nofollow">\n<meta name="bingbot" content="noindex, nofollow">\n</head>`)
    .replace('<div id="root"></div>', `<noscript><main style="max-width:42rem;margin:0 auto;padding:64px 24px;min-height:100vh;font-family:system-ui,sans-serif;background:#f3f0e8;color:#1c1915"><p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px">AIify Partner Program</p><h1>${escapeHtml(hero)}</h1><p>${escapeHtml(subhead)}</p><p><a href="${escapeHtml(mailto)}">Message us</a></p><p>We reply personally. No automated sequence.</p></main></noscript>\n<div id="root"></div>`);
}

for (const route of ['book', 'inquire', 'sow', 'partner-program']) {
  await mkdir(`dist/${route}`, { recursive: true });
  let routeShell;
  if (route === 'sow') routeShell = shell.replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>');
  else if (route === 'partner-program') routeShell = hiddenOfferShell(shell);
  else {
    routeShell = shell
      .replace(/(<meta name="twitter:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.title)}$2`)
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(inquiry.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.description)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.description)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.description)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*("[^>]*>)/, `$1${site.url}/inquire/$2`)
      .replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${site.url}/inquire/"`)
      .replace('<div id="root"></div>', `<noscript><main style="max-width:640px;margin:80px auto;padding:24px;font-family:system-ui"><h1>Get started</h1><p><a href="mailto:${escapeHtml(inquiry.recipient)}">${escapeHtml(inquiry.recipient)}</a></p><p>Opens a draft in your email app; review and send it there. You can also copy the address into your usual inbox.</p></main></noscript><div id="root"></div>`);
  }
  await writeFile(`dist/${route}/index.html`, routeShell);
}
const partnerUrl = `${site.url}/partner-program/`;
await mkdir('dist/new-offer', { recursive: true });
await writeFile('dist/new-offer/index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AIify Partner Program</title>
    <meta http-equiv="refresh" content="0;url=${partnerUrl}">
    <link rel="canonical" href="${partnerUrl}">
    <meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">
    <meta name="bingbot" content="noindex, nofollow">
    <script>
      (function () {
        var dest = ${JSON.stringify(partnerUrl)};
        location.replace(dest + location.search + location.hash);
      })();
    </script>
  </head>
  <body>
    <p>This page has moved to <a href="${partnerUrl}">${partnerUrl}</a>.</p>
  </body>
</html>
`);
await mkdir('dist/articles', { recursive: true });
await writeFile('dist/articles/index.html', renderIndex(site, articles, stylesheets));
for (const article of articles) {
  await mkdir(`dist/articles/${article.slug}`, { recursive: true });
  await writeFile(`dist/articles/${article.slug}/index.html`, renderArticle(site, article, stylesheets, articles));
}
for (const service of services) {
  await mkdir(`dist/services/${service.slug}`, { recursive: true });
  await writeFile(`dist/services/${service.slug}/index.html`, renderService(site, service, stylesheets, articles));
}
// Public, verified routes only: never index SOW workspaces or client-feedback forms.
const routes = [...site.routes.filter(route => route !== '/book/'), ...articles.map(article => `/articles/${article.slug}/`)];
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${escapeHtml(site.url + route)}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /sow\nDisallow: /client-feedback/\nSitemap: ${site.url}/sitemap.xml\n`);
try {
  const llms = await readFile('dist/llms.txt', 'utf8');
  if (llms.includes('partner-program')) throw new Error('Do not list the partner page in llms.txt');
} catch (error) {
  if (error.code !== 'ENOENT' && !String(error.message).includes('Do not list the partner page')) throw error;
  if (String(error.message).includes('Do not list the partner page')) throw error;
}
console.log(`Rendered ${articles.length} article(s), article index, sitemap, and existing app entry points.`);

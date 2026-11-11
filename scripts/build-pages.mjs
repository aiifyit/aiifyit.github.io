import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { auditDirectory } from './content-audit.mjs';
import { renderService } from './service-template.mjs';
import { renderArticle, renderIndex, escapeHtml } from './article-template.mjs';
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
await copyFile('dist/index.html', 'dist/404.html');
function hiddenOfferShell(shell) {
  const title = 'Offer AI Agent Swarms Under Your Name | AIify Partner Program';
  const description = 'Put a premium AI offer in front of your clients under your own brand. You keep the relationship and set the price. AIify sets up and co-manages the swarm behind you for a fixed fee.';
  const url = `${site.url}/new-offer/`;
  const image = `${site.url}/images/offer/hero.jpg`;
  const hero = 'Give your clients a premium AI offer under your name.';
  const subhead = 'AI agent swarm co-management for your clients, members, coaches, or portfolio companies. It goes out under your brand and we fulfill it. You keep the relationship, set the price, and keep the margin.';
  const mailto = `mailto:${inquiry.recipient}?subject=${encodeURIComponent('AIify partner quote')}&body=${encodeURIComponent(['Hi Joshua,', '', "I'd like a quote for offering AI co-management under our name.", '', 'Source: /new-offer', 'Name: ', 'Company: ', 'Email: ', 'Rough number of seats: ', '', 'Anything we should know:', ''].join('\r\n'))}`;
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(url)}$2`)
    .replace('property="og:image" content="/og-image.png"', `property="og:image" content="${escapeHtml(image)}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace('name="twitter:image" content="/og-image.png"', `name="twitter:image" content="${escapeHtml(image)}"`)
    .replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${url}"`)
    .replace('</head>', `<script>document.documentElement.dataset.page="offer"</script>\n<meta name="robots" content="noindex, nofollow">\n</head>`)
    .replace('<div id="root"></div>', `<noscript><main style="max-width:42rem;margin:0 auto;padding:64px 24px;min-height:100vh;font-family:system-ui,sans-serif;background:#f3f0e8;color:#1c1915"><p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px">AIify Partner Program</p><h1>Give your clients a premium AI offer under your name.</h1><p>${escapeHtml(hero)}</p><p>${escapeHtml(subhead)}</p><p><a href="${escapeHtml(mailto)}">Get a quote</a></p><p>We reply personally. No automated sequence.</p></main></noscript>\n<div id="root"></div>`);
}

for (const route of ['book', 'inquire', 'sow', 'new-offer']) {
  await mkdir(`dist/${route}`, { recursive: true });
  let routeShell;
  if (route === 'sow') routeShell = shell.replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>');
  else if (route === 'new-offer') routeShell = hiddenOfferShell(shell);
  else {
    routeShell = shell
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(inquiry.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.description)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(inquiry.description)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*("[^>]*>)/, `$1${site.url}/inquire/$2`)
      .replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${site.url}/inquire/"`)
      .replace('<div id="root"></div>', `<noscript><main style="max-width:640px;margin:80px auto;padding:24px;font-family:system-ui"><h1>Email Joshua</h1><p><a href="mailto:${escapeHtml(inquiry.recipient)}">${escapeHtml(inquiry.recipient)}</a></p><p>Opens a draft in your email app; review and send it there. You can also copy the address into your usual inbox.</p></main></noscript><div id="root"></div>`);
  }
  await writeFile(`dist/${route}/index.html`, routeShell);
}
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
console.log(`Rendered ${articles.length} article(s), article index, sitemap, and existing app entry points.`);

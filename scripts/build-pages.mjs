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
  const title = "Payroll for a department you don't have to hire | AIify";
  const description = 'A bolt-on AI department: people using AI every day to help you hit the quarterly goals you already set. You do not hire them. AI is the tool. Humans manage it.';
  const url = `${site.url}/new-offer/`;
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(url)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*("[^>]*>)/, `$1${escapeHtml(description)}$2`)
    .replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${url}"`)
    .replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>')
    .replace('<div id="root"></div>', `<noscript><main style="max-width:42rem;margin:64px auto;padding:24px;font-family:system-ui,sans-serif"><p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">The Lever Loop</p><h1>Payroll for a department you don't have to hire.</h1><p>A bolt-on AI department. People using AI every day to help you hit the goals you already set. AI is the tool. Humans manage it.</p><p><a href="mailto:joshua@aiifyit.com?subject=Bolt-on%20AI%20department">Book a call</a></p></main></noscript>\n<div id="root"></div>`);
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

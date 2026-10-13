import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { auditDirectory } from './content-audit.mjs';
import { renderArticle, renderIndex, escapeHtml } from './article-template.mjs';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const articles = await Promise.all((await readdir('content/articles')).filter(name => name.endsWith('.json')).sort().map(async name => JSON.parse(await readFile(`content/articles/${name}`, 'utf8'))));
const { errors, warnings } = await auditDirectory();
for (const warning of warnings) console.warn(warning);
if (errors.length) throw new Error(errors.join('\n'));
const shell = await readFile('dist/index.html', 'utf8');
const stylesheets = [...shell.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(match => match[1]);
if (!stylesheets.length) throw new Error('Built site stylesheet not found');
await copyFile('dist/index.html', 'dist/404.html');
for (const route of ['book', 'sow']) {
  await mkdir(`dist/${route}`, { recursive: true });
  const routeShell = route === 'book'
    ? shell.replace(`rel="canonical" href="${site.url}/"`, `rel="canonical" href="${site.url}/book/"`)
    : shell.replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>');
  await writeFile(`dist/${route}/index.html`, routeShell);
}
await mkdir('dist/articles', { recursive: true });
await writeFile('dist/articles/index.html', renderIndex(site, articles, stylesheets));
for (const article of articles) {
  await mkdir(`dist/articles/${article.slug}`, { recursive: true });
  await writeFile(`dist/articles/${article.slug}/index.html`, renderArticle(site, article, stylesheets));
}
// Public, verified routes only: never index SOW workspaces or client-feedback forms.
const routes = [...site.routes, ...articles.map(article => `/articles/${article.slug}/`)];
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${escapeHtml(site.url + route)}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /sow\nDisallow: /client-feedback/\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Rendered ${articles.length} article(s), article index, sitemap, and existing app entry points.`);

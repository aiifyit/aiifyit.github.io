import { escapeHtml as e, renderDocument } from './article-template.mjs';

export function renderPage(site, page, stylesheets) {
  const path = `/${page.slug}/`;
  const founder = page.founder;
  const body = `<main id="main" class="info-page"><header class="article-hero"><p class="article-eyebrow">AIify / ${e(page.title)}</p><h1>${e(page.heading)}</h1><p class="article-deck">${e(page.intro)}</p></header><div class="article-prose">${founder ? `<section class="info-founder"><img src="${e(founder.image)}" alt="${e(founder.name)}" width="${e(founder.imageWidth)}" height="${e(founder.imageHeight)}"><div><h2>${e(founder.name)}</h2><p>${e(founder.title)}</p><p>${e(founder.bio)}</p></div></section>` : ''}${(page.sections ?? []).map(section => `<section><h2>${e(section.title)}</h2>${section.paragraphs.map(paragraph => `<p>${e(paragraph)}</p>`).join('')}</section>`).join('')}</div></main>`;
  return renderDocument(site, stylesheets, {
    title: page.title, description: page.description, path, body,
    schema: { '@context': 'https://schema.org', '@type': page.slug === 'about' ? 'AboutPage' : 'WebPage', name: page.heading, description: page.description, url: site.url + path },
  });
}

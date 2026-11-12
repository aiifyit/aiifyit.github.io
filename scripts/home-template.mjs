import { escapeHtml as e } from './article-template.mjs';

// Initial root content for non-JS readers; React replaces it on startup.
export function renderHome(copy) {
  const p = text => `<p>${e(text)}</p>`;
  const points = items => items.map(item => `<article><h3>${e(item.title)}</h3>${p(item.body)}</article>`).join('');
  const section = (id, data, extra = '') => `<section id="${id}" class="offer-section offer-wrap">${data.label ? `<p class="offer-eyebrow">${e(data.label)}</p>` : ''}<h2>${e(data.heading)}</h2>${data.body ? p(data.body) : ''}${extra}</section>`;
  return `<div class="offer-page home-offer"><main>
    <section id="hero" class="offer-section offer-wrap"><p class="offer-eyebrow">${e(copy.program)}</p><h1>${e(copy.hero.heading)}</h1>${p(copy.hero.body)}<a href="#quote">${e(copy.cta)}</a> <a href="#pricing">${e(copy.hero.secondary)}</a></section>
    ${section('how-it-works', copy.model, `<ol>${copy.model.steps.map(step => `<li><h3>${e(step.title)}</h3>${p(step.body)}</li>`).join('')}</ol>${p(copy.model.platform)}`)}
    ${section('leaders', copy.intro, p(copy.intro.lead) + p(copy.intro.question) + `<h3>${e(copy.intro.compareLabel)}</h3>` + ['hard', 'ours'].map(key => `<article><h3>${e(copy.intro[key].label)}</h3>${p(copy.intro[key].sub)}<ul>${copy.intro[key].items.map(item => `<li>${e(item)}</li>`).join('')}</ul></article>`).join('') + p(copy.intro.closing))}
    ${section('credit', copy.evidence, `<ul>${copy.evidence.facts.map(fact => `<li>${e(fact)}</li>`).join('')}</ul>${p(copy.evidence.closing)}`)}
    ${section('pricing', copy.economics, points(copy.economics.points) + p(`${copy.economics.accountLabel}: ${copy.economics.accountFee}`) + p(`${copy.economics.addLabel}: ${copy.economics.additionalAccountFee}`) + p(copy.economics.accountMembers.join(' + ')))}
    ${section('ownership', copy.ownership, points(copy.ownership.points) + `<h3>${e(copy.ownership.questionsLabel)}</h3>` + copy.ownership.questions.map(item => `<details open><summary>${e(item.q)}</summary>${p(item.a)}</details>`).join(''))}
    ${section('about', { ...copy.about, body: '' }, `<div class="home-founder-row"><img src="${e(copy.about.image)}" alt="${e(copy.about.name)}" width="${copy.about.imageWidth}" height="${copy.about.imageHeight}" loading="lazy"><div><h3>${e(copy.about.name)}</h3><p class="offer-prose">${e(copy.about.title)}</p><p class="offer-prose mt-6">${e(copy.about.body)}</p><a class="offer-text-link inline-block mt-6" href="${e(copy.about.href)}">${e(copy.about.linkLabel)}</a></div></div>`)}
    ${section('quote', copy.quote, `<a href="/inquire/">${e(copy.cta)}</a>${p(copy.quote.reply)}`)}
    ${section('services', copy.explore, '<ul><li><a href="/services/workflow-automation/">Workflow automation</a></li><li><a href="/services/custom-ai-agents/">Custom AI agents</a></li><li><a href="/services/workflow-integration/">Workflow integration</a></li><li><a href="/articles/">All articles</a></li></ul>')}
  </main><footer class="offer-wrap"><nav aria-label="Footer navigation"><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/inquire/">Get started</a></nav></footer></div>`;
}

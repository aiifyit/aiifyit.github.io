import { escapeHtml as e, renderDocument, renderRelated, safeJson } from './article-template.mjs';
// Public editorial choices only. Missing guides fall back to matching library entries.
const SERVICE_READING_PRIORITY = {
  'workflow-automation': ['ai-workflow-wrong-route', 'business-automation-monitoring-alerts', 'email-work-order-intake-automation', 'ai-workflow-end-to-end-testing'],
  'workflow-integration': ['ai-call-transcript-crm-matching', 'sales-to-delivery-handoff-automation', 'ai-crm-overwriting-good-data', 'ai-workflow-code-handoff'],
};
export function serviceRelatedArticles(serviceSlug, articles) {
  const candidates = articles.filter(article => article.cta.href === `/services/${serviceSlug}/`);
  const preferred = SERVICE_READING_PRIORITY[serviceSlug];
  if (!preferred) return candidates.slice(0, 4);
  const rank = slug => { const position = preferred.indexOf(slug); return position === -1 ? preferred.length : position; };
  return candidates.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug)).slice(0, 4);
}
export function renderService(site, service, stylesheets, articles) {
  const path = `/services/${service.slug}/`;
  const booking = `/inquire/?service=${service.slug}`;
  const related = serviceRelatedArticles(service.slug, articles);
  const body = `<main id="main" class="service-page">
    <nav class="article-topline" aria-label="Breadcrumb"><a href="/#services">← All services</a><a href="/articles/">Explore the guides</a></nav>
    <header class="article-hero"><p class="article-eyebrow">AIify It / ${e(service.slug.replaceAll('-', ' '))}</p><h1>${e(service.title)}</h1><p class="article-deck">${e(service.intro)}</p><div class="service-actions"><a class="article-button" data-booking-link href="${booking}">Start an inquiry ↗</a><a href="#prepare">Or prepare for the conversation ↓</a></div><p class="service-note">Send a short email to Joshua. No appointment needed.</p></header>
    <div class="service-fit-grid"><section><h2>Is this a useful place to start?</h2><ul>${service.fit.map(item => `<li>${e(item)}</li>`).join('')}</ul></section><section><h2>What we can discuss</h2><ul>${service.discuss.map(item => `<li>${e(item)}</li>`).join('')}</ul></section></div>
    <section class="service-prepare" id="prepare" aria-labelledby="prepare-heading"><div><p class="article-eyebrow">Start with a clear question</p><h2 id="prepare-heading">Bring one workflow. Start with one question.</h2><p>Choose a topic if you already know where you want help. You can also go straight to the email draft.</p><p>In your note, think about what starts the process, where it gets stuck, and what a correct outcome looks like. Keep customer records and other sensitive material out of the email.</p></div>
    <form action="/inquire/" method="get" class="service-qualifier"><input type="hidden" name="service" value="${e(service.slug)}"><input type="hidden" name="source" disabled><label for="priority">What would you like to focus on? <span>(optional)</span></label><select id="priority" name="priority"><option value="">Not sure yet</option>${[['manual-work','Reducing repetitive manual work'],['routing','Fixing routing or decision errors'],['integrations','Connecting existing systems'],['new-agent','Planning a custom AI agent']].map(([value, label]) => `<option value="${value}" ${service.priority === value ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="article-button" type="submit">Prepare an email to Joshua ↗</button><p class="service-note">No contact details collected here. Your selected topic is included in an email draft you review and send.</p><a data-booking-link href="${booking}">Skip this step and prepare an email →</a></form></section>
    <section class="service-process"><h2>From a useful conversation to a workable plan</h2><ol><li><h3>Understand the workflow</h3><p>Map the systems, dependencies and decisions behind the work.</p></li><li><h3>Define a focused build</h3><p>Agree on responsibilities, boundaries and the tests a pilot needs.</p></li><li><h3>Deploy and improve</h3><p>AIify It deploys, manages and optimizes the automation as operations change.</p></li></ol></section>
    ${renderRelated(related)}
    <script type="application/json" id="funnel-context">${safeJson({sources:articles.map(article => article.slug)})}</script><script src="/funnel.js" defer></script>
  </main>`;
  const schema = {'@context':'https://schema.org','@type':'Service',name:service.title,description:service.description,url:site.url+path,provider:{'@type':'Organization',name:site.name,url:site.url}};
  return renderDocument(site,stylesheets,{title:service.title,description:service.description,path,body,schema});
}

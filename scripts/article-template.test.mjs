import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderArticle, renderIndex, escapeHtml, safeJson } from './article-template.mjs';
const site = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url)));
const article = JSON.parse(readFileSync(new URL('../content/articles/ai-workflow-wrong-route.json', import.meta.url)));
test('template escapes text and script-closing sequences', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert(!safeJson({ value: '</script><script>alert(1)</script>' }).includes('</script>'));
  const malicious = structuredClone(article);
  malicious.sections[0].paragraphs = ['<img src=x onerror=alert(1)>'];
  const html = renderArticle(site, malicious, ['/assets/test.css']);
  assert(!html.includes('<img src=x'));
  assert(html.includes('&lt;img src=x'));
});
test('article and index use centralized identity and ordinary links', () => {
  const html = renderArticle(site, article, ['/assets/test.css']);
  const index = renderIndex(site, [article], ['/assets/test.css']);
  assert(html.includes(`By ${site.name}`));
  assert(html.includes(`href="${site.url}/articles/${article.slug}/"`));
  assert(index.includes(`href="/articles/${article.slug}/"`));
  assert(html.includes('aria-label="In this article"'));
  assert(!html.includes('type="module"'));
  assert(html.includes('id="main"'));
});

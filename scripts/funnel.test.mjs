import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { auditArticles, auditServices } from './content-audit.mjs';
import { renderService } from './service-template.mjs';
import { relatedArticles } from './article-template.mjs';
const site=JSON.parse(readFileSync(new URL('../content/site.json',import.meta.url)));
const service=JSON.parse(readFileSync(new URL('../content/services.json',import.meta.url)))[0];
const article=JSON.parse(readFileSync(new URL('../content/articles/ai-workflow-wrong-route.json',import.meta.url)));
const approvedServices=JSON.parse(readFileSync(new URL('../content/services.json',import.meta.url))).map(s=>({...s,review:{privacy:'approved',claims:'approved',reviewedOn:'2026-10-13'}}));
test('services reject missing pages, unknown fields and unreviewed copy',()=>{
 assert.deepEqual(auditServices(approvedServices,site).errors,[]);
 assert(auditServices(approvedServices.slice(1),site).errors.some(e=>e.includes('no page generated')));
 assert(auditServices([{...approvedServices[0],privateNotes:'unapproved'},...approvedServices.slice(1)],site).errors.some(e=>e.includes('unknown field')));
 assert(auditServices([{...approvedServices[0],review:{privacy:'pending',claims:'approved',reviewedOn:'2026-10-13'}},...approvedServices.slice(1)],site).errors.some(e=>e.includes('explicitly approved')));
});
test('whole library rejects duplicate titles and descriptions',()=>{
 const errors=auditArticles([article,{...article,slug:'other-topic'}],site).errors;
 assert(errors.some(e=>e.includes('duplicate title')));assert(errors.some(e=>e.includes('duplicate description')));
});
test('related articles exclude self and prefer relevant service',()=>{
 const relevant={...article,slug:'related-topic'};const other={...article,slug:'other-topic',category:'Other',cta:{...article.cta,href:'/book/'}};
 assert.equal(relatedArticles(article,[article,other,relevant])[0].slug,'related-topic');
 assert(!relatedArticles(article,[article,other,relevant]).some(a=>a.slug===article.slug));
});
test('service funnel works as an optional GET form without personal-data fields',()=>{
 const html=renderService(site,service,[],[article]);
 assert(html.includes('action="/book/" method="get"'));
 assert(html.includes('Skip this step and open the calendar'));
 assert(html.includes('value=""'));
 assert(!html.includes('type="email"'));assert(!html.includes('type="text"'));
 assert(html.includes(`href="/book/?service=${service.slug}"`));
 assert(html.includes(`href="/articles/${article.slug}/"`));
});
test('client handoff forwards only a known public source slug',()=>{
 const code=readFileSync(new URL('../public/funnel.js',import.meta.url),'utf8');
 function run(search){
  const field={value:'',disabled:true};let href='/book/?service=workflow-automation';
  const document={getElementById:()=>({textContent:JSON.stringify({sources:[article.slug]})}),querySelector:()=>field,querySelectorAll:()=>[{getAttribute:()=>href,setAttribute:(_key,value)=>{href=value;}}]};
  runInNewContext(code,{document,window:{location:{search,origin:'https://example.com'}},URL,URLSearchParams});return {field,href};
 }
 assert.equal(run('?source='+article.slug).field.value,article.slug);
 for(const search of ['?source=private-client-name','?source=user%40example.com','?source=https://evil.example/','?source='+article.slug+'&source=private-client-name']){
  assert.equal(run(search).field.disabled,true);assert(!run(search).href.includes('source='));
 }
});

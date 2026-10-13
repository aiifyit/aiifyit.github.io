import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryDraft, INQUIRY_EMAIL, INQUIRY_MESSAGE_LIMIT } from '../src/data/inquiry.ts';
test('empty optional overview creates a usable draft to the fixed recipient',()=>{
 const draft=createInquiryDraft();assert.equal(draft.recipient,'joshua@aiifyit.com');assert(draft.mailto.startsWith(`mailto:${INQUIRY_EMAIL}?subject=`));assert(!draft.mailto.includes('bcc='));
});
test('message reserves stay in encoded body, never become headers',()=>{
 const message='Need help with A&B + C? #test\nBcc: nobody@example.invalid';const d=createInquiryDraft(message);
 const u=new URL(d.mailto);assert.equal(u.pathname,INQUIRY_EMAIL);assert.equal(u.searchParams.size,2);assert.equal(u.searchParams.get('body'),d.body);assert(d.body.includes(message.replace('\n','\r\n')));assert(!d.mailto.includes(' '));assert(d.mailto.includes('%20'));assert(d.mailto.includes('%0D%0A'));
});
test('only public context changes the fixed subject and body',()=>{
 const d=createInquiryDraft('', '?service=custom-ai-agents&priority=new-agent&source=known-article&email=private@example.invalid',['known-article']);assert(d.subject.includes('Custom AI agents'));assert(d.body.includes('/articles/known-article/'));assert(!d.body.includes('private@example.invalid'));
 const unknown=createInquiryDraft('', '?service=__proto__&source=private-name&recipient=evil@example.invalid',[]);assert.deepEqual(unknown.context,{});assert.equal(unknown.recipient,INQUIRY_EMAIL);
});
test('duplicate context, control characters and overlength text fail safely',()=>{
 assert.deepEqual(createInquiryDraft('', '?service=custom-ai-agents&service=workflow-automation').context,{});
 assert.throws(()=>createInquiryDraft('x'.repeat(INQUIRY_MESSAGE_LIMIT+1)),/500/);assert.throws(()=>createInquiryDraft('hello\0there'),/control/);
});
test('all newline forms normalize to CRLF and input is not persisted',()=>{
 const d=createInquiryDraft('a\rb\nc\r\nd');assert(d.body.endsWith('a\r\nb\r\nc\r\nd'));assert.equal(d.mailto.replaceAll('%0D%0A','').includes('%0A'),false);assert.equal(createInquiryDraft().body.includes('a\r\nb'),false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactDraft, CONTACT_LEAD_TYPE, OFFER_LEAD_ENDPOINT, INQUIRY_EMAIL } from '../src/data/contactLead.ts';
import { formatWebsiteInquiryEmail } from '../src/data/websiteInquiryEmail.ts';

test('website inquiry draft uses a distinct subject and layout, not the partner format', () => {
  const draft = createContactDraft({
    name: 'Jordan Lee',
    company: 'Example Company',
    email: 'jordan@example.com',
    message: 'We would like to set up a co-managed agent swarm for our executive team.',
    source: '/',
    cta: 'Homepage contact form',
    phone: '555-0100',
  });
  assert.equal(draft.recipient, INQUIRY_EMAIL);
  assert.equal(draft.subject, 'Website inquiry: Jordan Lee (Example Company) via /');
  assert.match(draft.body, /AIIFY WEBSITE INQUIRY/);
  assert.doesNotMatch(draft.body, /Partner inquiry|AIify Partner Program page/);
  assert.match(draft.body, /Name: Jordan Lee/);
  assert.match(draft.body, /Email: jordan@example.com/);
  assert.match(draft.body, /Company: Example Company/);
  assert.match(draft.body, /Phone: 555-0100/);
  assert.match(draft.body, /Page: https:\/\/aiifyit.com\//);
  assert.match(draft.body, /CTA clicked: Homepage contact form/);
  assert.match(draft.body, /Sent: .+\sET/);
  assert.match(draft.body, /Message\r\n-------\r\nWe would like to set up a co-managed agent swarm for our executive team\./);
  assert.match(draft.html, /Website inquiry/);
  assert.equal(draft.payload.type, CONTACT_LEAD_TYPE);
  assert.equal(draft.payload.cta, 'Homepage contact form');
  assert.match(OFFER_LEAD_ENDPOINT, /aiify-offer-lead/);
  assert.ok(draft.mailto.startsWith(`mailto:${INQUIRY_EMAIL}?subject=`));
});

test('contact draft requires a message and omits phone when blank', () => {
  assert.throws(() => createContactDraft({ name: 'Jordan', company: 'Example Company', email: 'jordan@example.com', message: '', source: '/', cta: 'Inquiry contact form' }), /little about/);
  const draft = createContactDraft({ name: 'Jordan', company: 'Example Company', email: 'jordan@example.com', message: 'Hello', source: '/inquire/', cta: 'Inquiry contact form' });
  assert.equal(draft.subject, 'Website inquiry: Jordan (Example Company) via /inquire/');
  assert.equal(draft.body.includes('Phone:'), false);
  assert.equal('phone' in draft.payload, false);
});

test('website inquiry HTML escapes untrusted fields', () => {
  const email = formatWebsiteInquiryEmail({
    name: 'A <B>',
    email: 'a@b.com',
    company: 'C & D',
    message: '<script>alert(1)</script>',
    source: '/inquire/',
    cta: 'Inquiry contact form',
    sent: 'Wednesday, November 11, 2026, 6:00 PM ET',
  });
  assert.equal(email.html.includes('<script>'), false);
  assert.match(email.html, /A &lt;B&gt;/);
  assert.match(email.html, /C &amp; D/);
  assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

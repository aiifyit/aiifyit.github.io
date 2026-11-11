import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfferQuoteDraft, OFFER_QUOTE_SOURCE, OFFER_LEAD_ENDPOINT } from '../src/data/offerQuote.ts';
import { INQUIRY_EMAIL } from '../src/data/inquiry.ts';

const base = { name: 'Ada Cole', company: 'North Line', email: 'ada@northline.example', note: 'We serve growing companies.' };

test('quote draft goes to the inquiry address and names the offer page', () => {
  const draft = createOfferQuoteDraft(base);
  const url = new URL(draft.mailto);
  assert.equal(draft.recipient, INQUIRY_EMAIL);
  assert.equal(url.pathname, INQUIRY_EMAIL);
  assert.equal(url.searchParams.size, 2);
  assert.equal(draft.subject, 'AIify partnership inquiry');
  assert.equal(draft.source, OFFER_QUOTE_SOURCE);
  assert.equal(draft.source, '/new-offer');
  assert.match(draft.body, /Source: \/new-offer/);
  assert.match(draft.body, /Name: Ada Cole/);
  assert.doesNotMatch(draft.body, /seats/i);
  assert.ok(draft.body.startsWith("I'd like to talk about a partnership."));
  assert.match(OFFER_LEAD_ENDPOINT, /^https:\/\/aiify-offer-lead\.joshua-509\.workers\.dev\/submit$/);
  assert.doesNotMatch(draft.body, /Service type:/);
  assert.match(draft.body, /Anything we should know/);
});

test('a required note travels in the body, never as headers', () => {
  const draft = createOfferQuoteDraft({
    ...base,
    note: 'Bcc: nobody@example.invalid\nTwo offices.',
  });
  const url = new URL(draft.mailto);
  assert.equal(url.searchParams.size, 2);
  assert.equal(url.searchParams.get('body'), draft.body);
  assert.match(draft.body, /Anything we should know:\r\nBcc: nobody@example.invalid\r\nTwo offices\./);
  assert.equal(draft.mailto.includes(' '), false);
  assert.equal(draft.mailto.includes('Bcc:'), false);
});

test('line breaks and a bad address fail before a draft is built', () => {
  assert.throws(() => createOfferQuoteDraft({ ...base, name: 'Ada\r\nBcc: evil@example.invalid' }), /one line/);
  assert.throws(() => createOfferQuoteDraft({ ...base, email: 'not-an-email' }), /valid email/);
  assert.throws(() => createOfferQuoteDraft({ ...base, note: 'x'.repeat(501) }), /500/);
  assert.throws(() => createOfferQuoteDraft({ ...base, company: 'North\u0000Line' }), /control/);
});

test('a message is required', () => {
  assert.throws(() => createOfferQuoteDraft({ ...base, note: '  ' }), { message: 'Tell us a little about what you need.' });
});

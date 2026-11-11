import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfferQuoteDraft, OFFER_QUOTE_SOURCE } from '../src/data/offerQuote.ts';
import { INQUIRY_EMAIL } from '../src/data/inquiry.ts';

const base = { name: 'Ada Cole', company: 'North Line', email: 'ada@northline.example', seats: '10' };

test('quote draft goes to the inquiry address and names the offer page', () => {
  const draft = createOfferQuoteDraft(base);
  const url = new URL(draft.mailto);
  assert.equal(draft.recipient, INQUIRY_EMAIL);
  assert.equal(url.pathname, INQUIRY_EMAIL);
  assert.equal(url.searchParams.size, 2);
  assert.equal(draft.subject, 'AIify partner quote');
  assert.equal(draft.source, OFFER_QUOTE_SOURCE);
  assert.equal(draft.source, '/new-offer');
  assert.match(draft.body, /Source: \/new-offer/);
  assert.match(draft.body, /Name: Ada Cole/);
  assert.match(draft.body, /Rough number of seats: 10/);
  assert.doesNotMatch(draft.body, /Service type:/);
  assert.doesNotMatch(draft.body, /Anything we should know/);
});

test('an optional note travels in the body, never as headers', () => {
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

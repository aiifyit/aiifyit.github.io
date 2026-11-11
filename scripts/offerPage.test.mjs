import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const files = [
  'src/pages/NewOfferPage.tsx',
  'src/data/offerQuote.ts',
  'src/data/offerCopy.json',
  'src/index.css',
  ...(await readdir('src/components/offer')).map((name) => `src/components/offer/${name}`),
];
const source = (await Promise.all(files.map(async (file) => readFile(file, 'utf8')))).join('\n');

const copy = JSON.parse(await readFile('src/data/offerCopy.json', 'utf8'));
const phrases = [copy.program, copy.cta, copy.hero.heading, copy.hero.body, copy.hero.secondary,
  copy.model.heading, ...copy.model.steps.map(step => step.title), copy.model.platform,
  copy.intro.heading, copy.intro.lead, copy.intro.question, ...copy.intro.hard.items, ...copy.intro.ours.items,
  copy.intro.closing, ...copy.evidence.facts, copy.economics.heading, copy.economics.body,
  ...copy.economics.points.flatMap(point => [point.title, point.body]),
  ...copy.economics.accountMembers, copy.ownership.heading, copy.quote.heading, copy.quote.body, copy.quote.reply];

test('locked offer copy is present and the page stays on /partner-program', () => {
  for (const phrase of phrases) assert.ok(source.includes(phrase), `missing: ${phrase}`);
  for (const old of ['Get a quote', 'Rough number of seats', 'Standard', '$2,000', 'Three people', 'two members', 'text-decoration:line-through', 'is-handled']) assert.equal(source.includes(old), false, `removed: ${old}`);
  assert.equal(copy.intro.ours.items.length, 3);
  const beforePricing = [copy.description, copy.hero.heading, copy.hero.body, copy.intro.heading, copy.intro.lead, copy.intro.question, ...copy.intro.hard.items, ...copy.intro.ours.items, copy.intro.closing, copy.model.heading, copy.model.body, ...copy.model.steps.flatMap(step => [step.title, step.body]), copy.model.platform, copy.evidence.heading, copy.evidence.body, ...copy.evidence.facts, copy.evidence.closing].join('\n');
  assert.doesNotMatch(beforePricing, /\$[\d]|\d[,.]?\d{3}/);
  assert.doesNotMatch(beforePricing, /three people|seats/i);
  assert.match(source, /value=\{OFFER_QUOTE_SOURCE\}|OFFER_QUOTE_SOURCE = '\/partner-program'/);
  assert.match(source, /https:\/\/aiifyit.com\/partner-program\//);
  assert.doesNotMatch(source, /\/partners(?!-)/);
  assert.equal(source.includes('Book a call'), false);
  assert.equal(source.includes('calendly.com'), false);
  assert.equal(source.includes('Sign up'), false);
  assert.equal(source.includes('Buy now'), false);
  assert.equal(source.includes('Get started'), false);
  for (const name of ['Hoganix', 'Scaling Up', 'Vistage', 'YPO', 'Brian', 'Morgan', 'Nasdaq', 'Brexit', 'BRXY']) {
    assert.equal(source.includes(name), false, `must not name ${name}`);
  }
});

test('offer uses graphics and preserves the social image', async () => {
  assert.doesNotMatch(source, /OfferPhoto|OfferCalculator|copy\.calculator|offerEconomics/);
  assert.match(source, /<svg/);
  assert.match(source, /useReducedMotion/);
  assert.match(source, /aria-selected/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /useInView/);
  assert.match(source, /https:\/\/aiifyit.com\/images\/offer\/hero.jpg/);
  assert.ok((await readFile('public/images/offer/hero.jpg')).length > 1000);
});

test('form preserves accessible validation and delivery safeguards', () => {
  assert.match(source, /required rows=\{4\}/);
  assert.match(source, /aria-invalid/);
  assert.match(source, /aria-describedby/);
  assert.match(source, /role="alert"/);
  assert.match(source, /name="website" tabIndex=\{-1\} autoComplete="off"/);
  assert.match(source, /if \(website\)/);
  assert.match(source, /AbortController/);
  assert.match(source, /15000/);
  assert.match(source, /'Content-Type': 'application\/json'/);
});

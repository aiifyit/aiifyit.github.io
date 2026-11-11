import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const files = [
  'src/pages/NewOfferPage.tsx',
  'src/data/offerQuote.ts',
  'src/data/offerCopy.json',
  ...(await readdir('src/components/offer')).map((name) => `src/components/offer/${name}`),
];
const source = (await Promise.all(files.map(async (file) => readFile(file, 'utf8')))).join('\n');

const phrases = [
  "AIify Partner Program",
  "Give your clients a premium AI offer under your brand.",
  "Offer your clients a premium offer they really want: done-for-them AI agent swarms, co-managed by our expert AI management team. You keep your clients, and we serve them with you.",
  "Get a quote",
  "See the partner economics",
  "You have the clients. Now you have the offer.",
  "What your clients get",
  "Set up for them.",
  "Built with them every week.",
  "You bring the client.",
  "Aimed at their goals.",
  "Credit goes to their people.",
  "We currently co-manage in Grok Bot, and our approach doesn't depend on any one platform.",
  "What you don't have to do",
  "Pay for an in-house AI team",
  "Recruit and vet AI talent",
  "Hire a manager to run them",
  "Scramble to stay on top of AI",
  "Test every new tool",
  "Run payroll for them",
  "Carry insurance for them",
  "Replace people when they quit",
  "Train and retrain the team",
  "Do all of this while running your company and handling your own industry expansion",
  "Partner with us and we do all of that for you, under your brand. You keep your customer.",
  "What it looks like when it works",
  "Three people, $10,000 a month.",
  "We connected to their systems, including one with no API. For that one, we sign in and pull the numbers several times during the workday.",
  "We built live dashboards their team uses to run the business.",
  "Within two weeks, the savings covered more than a year of the cost.",
  "They wanted to continue.",
  "You set the price. We charge a fixed fee. The difference is yours.",
  "$2,000 per seat per month",
  "$4,000 per executive per month",
  "Partners often charge about $10,000 a month. That's an example, not a requirement. You set the price.",
  "Tool-only seats without co-management run around $500 per seat per month.",
  "Your client. Your work. Your long-term position.",
  "Will my clients know AIify is involved?",
  "Shouldn't we just build this team ourselves?",
  "Is this just software?",
  "Tell us who you'd offer this to.",
  "We reply personally. No automated sequence.",
];

test('locked offer copy is present and the page stays on /new-offer', () => {
  for (const phrase of phrases) assert.ok(source.includes(phrase), `missing: ${phrase}`);
  assert.equal(source.includes('The tool is not the problem.'), false);
  assert.match(source, /value=\{OFFER_QUOTE_SOURCE\}|OFFER_QUOTE_SOURCE = '\/new-offer'/);
  assert.equal(source.includes('/partners'), false);
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import copy from '../src/data/homeCopy.json' with { type: 'json' };
import offerCopy from '../src/data/offerCopy.json' with { type: 'json' };

test('homepage anchors and section endings clear the sticky header on desktop and mobile', async () => {
  const css = await readFile('src/index.css', 'utf8');
  const offset = Number(css.match(/html\[data-page="offer"\]\s*\{[^}]*scroll-padding-top:\s*([\d.]+)rem/)?.[1]);
  assert.ok(offset >= 6.5, 'Scroll padding must clear the 88–89px header with slack');
  const margin = Number(css.match(/\.home-offer #hero,\s*\.home-offer \.offer-section\s*\{[^}]*scroll-margin-top:\s*([\d.]+)rem/)?.[1]);
  assert.equal(margin, 0, 'Section scroll margin must stay 0 so it does not add to html scroll padding');
  const bottom = Number(css.match(/\.home-offer \.offer-section\s*\{[^}]*padding-bottom:\s*([\d.]+)rem/)?.[1]);
  assert.ok(bottom >= offset, 'Homepage bottom padding must cover the scroll offset');
  // The homepage rule is more specific than the shared mobile padding-block reset.
  assert.match(css, /@media \(max-width:899px\)\s*\{[^}]*\}[^}]*\.offer-section\s*\{ padding-block:4rem; \}/);
  assert.match(css, /(?:^|\n)\.offer-section \{ padding-block:6rem; \}/);
});

test('homepage copy is the direct offer, not the partner program', () => {
  assert.equal(copy.cta, 'Get started');
  assert.equal(copy.hero.heading, 'Custom AI swarms that run your business.');
  assert.match(copy.hero.body, /We build them\. You own them\. We use them together\./);
  assert.match(copy.intro.heading, /don't have time to set it up/);
  assert.equal(copy.intro.heading, "“We know AI could do more for us. We just don't have time to set it up.”");
  assert.equal(copy.intro.ours.label, 'Hire us');
  assert.equal(offerCopy.intro.ours.label, 'Our way');
  assert.equal(copy.intro.ours.items.length, 3);
  assert.equal(copy.model.steps.length, 5);
  assert.match(copy.evidence.facts[0], /One account is an executive and their chief of staff\./);
  assert.equal(copy.economics.accountFeeAmount, 10000);
  assert.equal(copy.economics.additionalAccountFeeAmount, 4000);
  assert.equal(copy.economics.additionalAccountFee, '$4,000 / month');
  assert.match(copy.economics.body, /first company account is \$10,000 a month/i);
  assert.match(copy.economics.body, /each (?:additional account|account after that) is \$4,000 a month/i);
  assert.match(copy.economics.body, /account covers one executive plus their chief of staff or executive assistant/i);
  assert.match(copy.quote.body, /first company account is \$10,000 a month/i);
  assert.match(copy.quote.body, /each (?:additional account|one you add after that) is \$4,000 a month/i);
  assert.equal(offerCopy.economics.accountFeeAmount, 4000);
  assert.match(JSON.stringify(offerCopy), /sell(?:ing)? it for \$10,000/i);
  assert.equal(copy.ownership.label, 'What you own');
  const early = [copy.hero.heading, copy.hero.body, copy.intro.heading, copy.intro.lead, copy.intro.question, ...copy.intro.hard.items, ...copy.intro.ours.items, copy.intro.closing, copy.model.heading, copy.model.body, ...copy.model.steps.flatMap((s) => [s.title, s.body]), copy.evidence.heading, copy.evidence.body, ...copy.evidence.facts, copy.evidence.closing].join('\n');
  assert.doesNotMatch(early, /\$[\d]|\d[,.]?\d{3}/);
  const all = JSON.stringify(copy);
  assert.doesNotMatch(all, /Our way/i);
  assert.doesNotMatch(all, /under your brand|white-label|keep the client|Partner Program|sell(?:ing)? it for \$10,000/i);
  assert.doesNotMatch(all, /three people|two seats/i);
  assert.doesNotMatch(all, /That's the offer|That's it\.|Here's the deal|Simple as that|No fluff/i);
  assert.doesNotMatch(all, /game-changer|supercharge|seamless|\bleverage\b|unlock/i);
  assert.doesNotMatch(all, /in today's fast-paced world|economic buyer|win-result/i);
  assert.doesNotMatch(all, /\u2014/);
  assert.doesNotMatch(copy.evidence.closing, /^Imagine\b/i);
});

test('site header, footer, and article chrome do not link to the partner page', async () => {
  const files = [
    'src/components/layout/Header.tsx',
    'src/components/layout/Footer.tsx',
    'src/data/constants.ts',
    'src/pages/MarketingPage.tsx',
    'scripts/article-template.mjs',
  ];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /href="\/partner-program\/"/);
    assert.doesNotMatch(source, />Partner Program</);
  }
});

test('homepage metadata describes first and additional account prices', async () => {
  const html = await readFile('index.html', 'utf8');
  for (const name of ['description', 'og:description', 'twitter:description']) {
    const description = html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1];
    assert.ok(description, `Missing ${name} metadata`);
    assert.match(description, /first company account is \$10,000 per month/i);
    assert.match(description, /each additional account is \$4,000 per month/i);
  }
});

test('homepage ledger uses first and additional account fees with a first-rate fallback', async () => {
  const graphics = await readFile('src/components/home/HomeGraphics.tsx', 'utf8');
  assert.match(graphics, /additionalAccountFee\?: string/);
  assert.match(graphics, /additionalAccountFeeAmount\?: number/);
  const stack = graphics.slice(graphics.indexOf('export function HomeAccountStack'));
  assert.match(stack, /const firstAccountFee = copy\.economics\.accountFeeAmount;/);
  assert.match(stack, /const additionalAccountFee = copy\.economics\.additionalAccountFeeAmount \?\? firstAccountFee;/);
  assert.match(stack, /<strong>\{i === 0 \? copy\.economics\.accountFee : \(copy\.economics\.additionalAccountFee \?\? copy\.economics\.accountFee\)\}<\/strong>/);
  assert.match(stack, /\(firstAccountFee \+ \(accounts - 1\) \* additionalAccountFee\)\.toLocaleString\('en-US'\)/);
  assert.doesNotMatch(stack, /unitFee|accounts\s*\*\s*\w+|\?\?\s*4000/);
});

test('homepage ledger renders row prices and totals for one through six accounts and legacy copy', async () => {
  const graphics = await readFile('src/components/home/HomeGraphics.tsx', 'utf8');
  const { outputText } = ts.transpileModule(graphics.slice(graphics.indexOf('export function HomeAccountStack')), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  });
  // Fix the hook state to inspect each ledger size without changing animation behavior.
  const loadStack = new Function('exports', 'require', 'partnerCopy', 'useState', 'useRef', 'useInView', 'useReducedMotion', 'useEffect', 'motion', 'UserRound', outputText);
  const staticMotion = { div: ({ children, className }) => createElement('div', { className }, children) };
  const legacyHomeCopy = structuredClone(copy);
  delete legacyHomeCopy.economics.additionalAccountFee;
  delete legacyHomeCopy.economics.additionalAccountFeeAmount;
  for (const [ledgerCopy, rowFee, totals] of [
    [copy, '$4,000 / month', [10000, 14000, 18000, 22000, 26000, 30000]],
    [legacyHomeCopy, '$10,000 / month', [10000, 20000, 30000, 40000, 50000, 60000]],
    [offerCopy, offerCopy.economics.accountFee, [4000, 8000, 12000, 16000, 20000, 24000]],
  ]) {
    for (const [index, total] of totals.entries()) {
      const accounts = index + 1;
      const exports = {};
      loadStack(exports, createRequire(import.meta.url), offerCopy, () => [accounts, () => {}], () => ({ current: null }), () => false, () => true, () => {}, staticMotion, () => null);
      const html = renderToStaticMarkup(createElement(exports.HomeAccountStack, { copy: ledgerCopy }));
      assert.deepEqual([...html.matchAll(/<strong>(.*?)<\/strong>/g)].map(match => match[1]), [ledgerCopy.economics.accountFee, ...Array(accounts - 1).fill(rowFee)]);
      assert.ok(html.includes(`$${total.toLocaleString('en-US')} / month to AIify`), `Expected ${accounts} accounts to total $${total}`);
    }
  }
});

test('the homepage page uses the inquiry form and the partner page files stay partner-only', async () => {
  const page = await readFile('src/pages/MarketingPage.tsx', 'utf8');
  assert.match(page, /homeCopy/);
  assert.match(page, /createContactDraft/);
  assert.match(page, /Homepage contact form/);
  assert.match(page, /source="\/"/);
  assert.match(page, /<ContactForm\b/);
  assert.doesNotMatch(page, /OfferQuoteForm/);
  const inquiry = await readFile('src/pages/InquiryPage.tsx', 'utf8');
  assert.match(inquiry, /<ContactForm\b/);
  const contact = await readFile('src/components/ui/ContactForm.tsx', 'utf8');
  assert.match(contact, /<LeadForm\b/);
  assert.match(contact, /submitLeadRequest\(OFFER_LEAD_ENDPOINT, draft.payload\)/);
  const lead = await readFile('src/components/ui/LeadForm.tsx', 'utf8');
  assert.match(lead, /href="\/privacy\/"/);
  assert.match(lead, /href="\/terms\/"/);
  assert.doesNotMatch(page, /createOfferQuoteDraft|partner-program|Message us/);
  assert.match(page, /HomeSwarm/);
  assert.match(page, /HomeStepGraphic/);
  assert.match(page, /HomeComparisonArt/);
  assert.match(page, /<LeadersChapter\b[^>]*showCompareToggle=\{false\}[^>]*\/>/);
  assert.match(page, /HomeProofGraphic/);
  assert.match(page, /HomeAccountStack/);
  assert.match(page, /HomeOwnership/);
  assert.match(page, /HomeQuoteAmbient/);
  assert.match(page, /components\/home\/HomeGraphics/);
  assert.doesNotMatch(page, /components\/offer\/OfferGraphics/);
  assert.doesNotMatch(page, /components\/offer\/AccountStack/);
  assert.match(page, /aiify-logo\.png/);
  assert.match(page, /spacexsi-transformation-partner\.svg/);
  assert.match(page, /home-hero-lockup/);
  const offerPage = await readFile('src/pages/NewOfferPage.tsx', 'utf8');
  assert.doesNotMatch(offerPage, /variant="direct"/);
  assert.doesNotMatch(offerPage, /HomeSwarm|HomeGraphics|HomeStepGraphic|HomeAccountStack/);
  assert.match(offerPage, /AgentSwarm/);
  assert.match(offerPage, /AccountStack/);
  assert.match(offerPage, /<LeadersChapter\s*\/>/);
  assert.doesNotMatch(offerPage, /showCompareToggle/);
  const form = await readFile('src/components/offer/OfferQuoteForm.tsx', 'utf8');
  assert.equal(form.includes('Get started'), false);
});

test('comparison toggle and automatic selection remain enabled by default for the partner page', async () => {
  const chapter = await readFile('src/components/offer/LeadersChapter.tsx', 'utf8');
  assert.match(chapter, /showCompareToggle = true/);
  assert.match(chapter, /showCompareToggle\?: boolean/);
  assert.match(chapter, /if \(!showCompareToggle \|\| !visible \|\| reduced \|\| played\.current\) return/);
  assert.match(chapter, /setSelected\('ours'\); \}, 1400\)/);
  assert.match(chapter, /<h3>\{copy\.intro\.compareLabel\}<\/h3>/);
  assert.match(chapter, /showCompareToggle && <div className="offer-segment" role="group"/);
  assert.match(chapter, /<button[^>]*aria-pressed=/);
  assert.match(chapter, /showCompareToggle && \(key === 'ours'\) === !!ours \? 'is-selected' : ''/);

  const homepageSources = await Promise.all([
    'src/pages/MarketingPage.tsx',
    'src/components/home/HomeGraphics.tsx',
    'src/index.css',
  ].map(path => readFile(path, 'utf8')));
  for (const source of homepageSources) assert.doesNotMatch(source, /Our way/i);
  assert.match(homepageSources[1], /\['Hire', 'Train', 'Tools', 'Payroll'\]/);
  assert.match(homepageSources[2], /\.home-offer \.offer-compare-toolbar \{ display:block; \}/);
});

test('the site nav uses the AIIFY wordmark and hides it on the homepage until the hero logo is scrolled past', async () => {
  const logo = await readFile('src/components/ui/Logo.tsx', 'utf8');
  assert.match(logo, /aiify-logo\.webp/);
  assert.match(logo, /aiify-logo\.png/);
  assert.doesNotMatch(logo, /hero-video/);
  const header = await readFile('src/components/layout/Header.tsx', 'utf8');
  assert.match(header, /IntersectionObserver/);
  assert.match(header, /home-hero-lockup/);
  assert.match(header, /site-nav-logo/);
  assert.match(header, /rootMargin: '-\d+px 0px 0px 0px'/);
  const app = await readFile('src/App.tsx', 'utf8');
  assert.match(app, /dataset\.home/);
});

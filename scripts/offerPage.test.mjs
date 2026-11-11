import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const files = [
  'src/pages/NewOfferPage.tsx',
  'src/data/offerEconomics.ts',
  'src/data/offerQuote.ts',
  ...(await readdir('src/components/offer')).map((name) => `src/components/offer/${name}`),
];
const source = (await Promise.all(files.map(async (file) => readFile(file, 'utf8')))).join('\n');

const phrases = [
  'AIify Partner Program',
  'The tool is not the problem.',
  "People don't use AI unless someone builds it into their work and stays with them. Education alone comes too late, so we do the work for and with your clients, and results start while they are still learning. The companies that win will offer this without building a new internal machine to run it.",
  'AI agent swarm co-management, offered under your name and delivered by us.',
  'Get a quote',
  'See the partner economics',
  'For leaders who want to offer this without building it.',
  "You serve clients, members, coaches, or portfolio companies. They need AI that actually gets used. You don't want to hire, train, and manage a team to deliver it.",
  'We work in the background. You stay the face of the offer.',
  'You set the price.',
  'You charge what your market will bear.',
  'We fulfill.',
  'Setup, live working sessions, daily care, and ongoing direction.',
  'You keep the spread.',
  'Your price minus our fulfillment fee is your margin.',
  'This works in any industry where people have real work to move and too little time to learn a new system on their own.',
  'Not a tool. Not a course. A team that stays.',
  'We set up the agent swarm with your client\'s team and then co-manage it with them, week after week.',
  '1. Setup',
  'We configure the swarm around the work your client\'s people already do. Nothing generic.',
  '2. Build-with-you sessions',
  'Each person who will use the system gets a working session, about 30 minutes a week at the start. We build with them live on the call. They leave with something real, not a training deck.',
  '3. Daily remote care',
  'Our people log into the client\'s agent account every day. We see what is moving and where people are stuck, and we push the work through.',
  '4. Quarterly aim',
  'Each quarter, the client\'s goals go into the system. Co-management then aims at what matters now, not what mattered at kickoff.',
  'The credit stays with them.',
  'Your client\'s people show up to meetings with what they built. We don\'t play the hero. That is why the work keeps going.',
  'We currently co-manage in Grok Bot. We are platform-agnostic, so if a better system appears, we move with it.',
  'A recent engagement with an executive team.',
  'Three people on one account, at $10,000 a month.',
  'We connected to their systems, including one with no API. For that one, we sign in and pull the numbers several times during the workday.',
  'We built live dashboards their team uses to run the business.',
  'Within two weeks, the savings already covered more than a year of the engagement\'s cost.',
  'The team wanted to keep going.',
  'That is what happened in one engagement. It is not a guarantee. It shows what is possible when the system is built into the work and someone stays with it.',
  'We used to build custom AI operations for large companies. Co-management makes a bigger impression because the client\'s own people get the credit, and the work doesn\'t stop when the project ends.',
  'Your price. Our fee. Your margin.',
  'We charge you a fixed fulfillment fee per seat. You set your own price.',
  'Standard co-management',
  'One person',
  '$2,000 per seat per month',
  'Executive co-management',
  'The executive plus the person who acts as their chief of staff',
  '$4,000 per executive per month',
  'Many partners price executive-level work around $10,000 a month. That\'s an example of what the market bears, not a required price. You decide.',
  'A tool seat alone runs about $500 a month. That is software, and it\'s not what this offer is. What you\'re selling is the people who make the software get used.',
  'Estimate your partner margin',
  'Enter your numbers. All results are estimates based on our fulfillment fees and the price you set. They don\'t include your own sales, delivery, or overhead costs.',
  'Seats you could enroll',
  'The number of people (or executives) you think you could bring into the program.',
  'Your monthly price per seat',
  'What you would charge your client for each seat per month.',
  'Service type',
  'Standard co-management ($2,000 per seat per month fulfillment)',
  'Executive co-management ($4,000 per seat per month fulfillment)',
  'Estimated monthly amount due to AIify',
  'Estimated monthly gross profit',
  '(Your price − AIify fulfillment fee) × seats',
  'Estimated annualized gross profit',
  'Monthly gross profit × 12',
  'At this price there is no spread. Your price per seat needs to be above the fulfillment fee for this offer to make you a profit.',
  'These are estimates, not projections of sales or client results. Your final terms come with your quote.',
  'The client is yours. So is what we build for them.',
  'The relationship.',
  'The offer carries your name. You own the client.',
  'The client-specific work.',
  'The instructions, playbooks, and agent setups built for your clients belong to you.',
  'The long view.',
  'We plan to stay for the long term and keep adjusting with you as the work changes.',
  'We keep our own methods. Everything we build for a client is, at bottom, a set of instructions for agents, and those instructions stay with you.',
  'Three questions partners ask',
  'Will my clients know AIify is involved?',
  'The offer runs under your name. Our team works with your clients\' people as part of your delivery. You own the relationship and decide how we\'re introduced.',
  'Shouldn\'t we just build this team internally?',
  'We can help you do that later. It\'s rarely cheaper, because you\'d have to hire, train, and manage the people yourself. This model gives you the margin without the headcount.',
  'Is this just software?',
  'No. The software is a small part of the offer. What you\'re offering is setup, weekly sessions where we build with each person, daily hands-on care, and quarterly direction.',
  'Tell us who you\'d offer this to.',
  'We\'ll come back with a quote based on your seats and service mix.',
  'Rough number of seats',
  'Anything we should know',
  'We reply personally. No automated sequence.',
];

test('locked offer copy is present and the page stays on /new-offer', () => {
  for (const phrase of phrases) assert.ok(source.includes(phrase), `missing: ${phrase}`);
  assert.match(source, /value=\{OFFER_QUOTE_SOURCE\}|OFFER_QUOTE_SOURCE = '\/new-offer'/);
  assert.equal(source.includes('/partners'), false);
  assert.equal(source.includes('Book a call'), false);
  assert.equal(source.includes('calendly.com'), false);
  assert.equal(source.includes('Sign up'), false);
  assert.equal(source.includes('Buy now'), false);
  assert.equal(source.includes('Get started'), false);
});

test('offer photographs are optimized beside a jpeg fallback', async () => {
  assert.match(source, /\/images\/offer\/\$\{name\}\.webp/);
  assert.match(source, /\/images\/offer\/\$\{name\}\.jpg/);
  for (const name of ['hero', 'stay-in-front', 'built-with-you', 'they-get-the-credit', 'you-keep-the-client']) {
    const jpeg = await readFile(`public/images/offer/${name}.jpg`);
    const webp = await readFile(`public/images/offer/${name}.webp`);
    assert.ok(jpeg.length > 1000, name);
    assert.ok(webp.length > 1000, name);
    assert.ok(webp.length < jpeg.length, name);
    assert.match(source, new RegExp(`name="${name}"`));
  }
});

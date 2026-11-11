import { useEffect, useState } from 'react';
import OfferCalculator, { type QuoteCarry } from '../components/offer/OfferCalculator';
import OfferPhoto from '../components/offer/OfferPhoto';
import OfferQuoteForm from '../components/offer/OfferQuoteForm';
import Reveal from '../components/offer/Reveal';
import StepSequence from '../components/offer/StepSequence';
import { type OfferService } from '../data/offerEconomics.ts';

const PAGE_TITLE = 'Offer AI Co-Management Under Your Name | AIify Partners';
const DESCRIPTION = 'Offer AI agent swarm co-management to your clients under your own name. AIify sets it up, builds with their people, and runs it in the background. You keep the client and the margin.';
const CANONICAL = 'https://aiifyit.com/new-offer/';
const OG_IMAGE = 'https://aiifyit.com/images/offer/hero.jpg';

const frame = 'mx-auto w-full max-w-6xl px-6';
const heading = 'max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl';
const prose = 'max-w-2xl text-lg leading-relaxed text-[var(--offer-muted)]';
const primaryButton =
  'inline-flex items-center justify-center rounded-xl bg-[var(--offer-navy)] px-7 py-3.5 text-sm font-semibold text-[#f4f1ea] transition-colors hover:bg-[var(--offer-navy-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--offer-navy)]';

function remember(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector(selector);
  if (!element) return () => {};
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);
  return () => {
    if (previous === null) element.removeAttribute(attribute);
    else element.setAttribute(attribute, previous);
  };
}

function useOfferMetadata() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    const restore = [
      remember('meta[name="description"]', 'content', DESCRIPTION),
      remember('meta[property="og:title"]', 'content', PAGE_TITLE),
      remember('meta[property="og:description"]', 'content', DESCRIPTION),
      remember('meta[property="og:url"]', 'content', CANONICAL),
      remember('meta[property="og:image"]', 'content', OG_IMAGE),
      remember('meta[name="twitter:title"]', 'content', PAGE_TITLE),
      remember('meta[name="twitter:description"]', 'content', DESCRIPTION),
      remember('meta[name="twitter:image"]', 'content', OG_IMAGE),
      remember('link[rel="canonical"]', 'href', CANONICAL),
    ];
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const createdRobots = !robots;
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute('content');
    robots.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = previousTitle;
      restore.forEach((undo) => undo());
      if (createdRobots) robots?.remove();
      else if (previousRobots) robots?.setAttribute('content', previousRobots);
      else robots?.removeAttribute('content');
    };
  }, []);
}

const QUESTIONS = [
  {
    q: 'Will my clients know AIify is involved?',
    a: "The offer runs under your name. Our team works with your clients' people as part of your delivery. You own the relationship and decide how we're introduced.",
  },
  {
    q: "Shouldn't we just build this team internally?",
    a: "We can help you do that later. It's rarely cheaper, because you'd have to hire, train, and manage the people yourself. This model gives you the margin without the headcount.",
  },
  {
    q: 'Is this just software?',
    a: "No. The software is a small part of the offer. What you're offering is setup, weekly sessions where we build with each person, daily hands-on care, and quarterly direction.",
  },
];

export default function NewOfferPage() {
  useOfferMetadata();
  const [seats, setSeats] = useState('');
  const [service, setService] = useState<OfferService | undefined>(undefined);
  const [pricePerSeat, setPricePerSeat] = useState<number | undefined>(undefined);

  const carryQuote = (carry: QuoteCarry) => {
    setSeats(carry.seats);
    setService(carry.service);
    setPricePerSeat(carry.price);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('quote')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('quote-heading')?.focus({ preventScroll: true });
  };

  return (
    <main className="offer-page">
      <a href="#quote" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-24 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to the quote form
      </a>

      <section className="py-14 md:py-20 lg:py-24">
        <div className={`${frame} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--offer-muted)]">AIify Partner Program</p>
            <div className="mt-5 h-px w-12 bg-[var(--offer-navy)]" aria-hidden="true" />
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.5rem]">
              The tool is not the problem.
            </h1>
            <p className={`mt-6 ${prose}`}>
              People don't use AI unless someone builds it into their work and stays with them. Education alone comes too late, so we do the work for and with your clients, and results start while they are still learning. The companies that win will offer this without building a new internal machine to run it.
            </p>
            <p className="mt-6 max-w-xl text-xl font-medium leading-snug tracking-tight">
              AI agent swarm co-management, offered under your name and delivered by us.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a href="#quote" className={primaryButton}>Get a quote</a>
              <a href="#partner-economics" className="text-sm font-semibold text-[var(--offer-navy)] underline decoration-[var(--offer-line)] underline-offset-4 hover:decoration-[var(--offer-navy)]">
                See the partner economics
              </a>
            </div>
          </div>
          <OfferPhoto
            name="hero"
            alt="Woman in a cream suit seated at a desk beside a monitor showing charts"
            position="70% 42%"
            priority
            className="aspect-[4/3] lg:aspect-[5/4]"
          />
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className={`${frame} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
          <div className="order-1 lg:order-2">
            <Reveal>
              <h2 className={heading}>For leaders who want to offer this without building it.</h2>
              <div className={`mt-6 space-y-5 ${prose}`}>
                <p>You serve clients, members, coaches, or portfolio companies. They need AI that actually gets used. You don't want to hire, train, and manage a team to deliver it.</p>
                <p>We work in the background. You stay the face of the offer.</p>
              </div>
              <ul className="mt-8 max-w-xl space-y-4">
                <li className="rounded-xl px-4 py-3 transition-colors hover:bg-[#f7f4ee]">
                  <strong className="font-semibold">You set the price.</strong> You charge what your market will bear.
                </li>
                <li className="rounded-xl px-4 py-3 transition-colors hover:bg-[#f7f4ee]">
                  <strong className="font-semibold">We fulfill.</strong> Setup, live working sessions, daily care, and ongoing direction.
                </li>
                <li className="rounded-xl px-4 py-3 transition-colors hover:bg-[#f7f4ee]">
                  <strong className="font-semibold">You keep the spread.</strong> Your price minus our fulfillment fee is your margin.
                </li>
              </ul>
              <p className={`mt-8 ${prose}`}>
                This works in any industry where people have real work to move and too little time to learn a new system on their own.
              </p>
            </Reveal>
          </div>
          <OfferPhoto
            name="stay-in-front"
            alt="Man in a light blue shirt standing with his hands in his pockets, looking out over a city"
            position="64% 28%"
            className="order-2 aspect-[4/3] lg:order-1"
          />
        </div>
      </section>

      <StepSequence />

      <section className="bg-white py-20 md:py-28">
        <div className={frame}>
          <Reveal>
            <OfferPhoto
              name="they-get-the-credit"
              alt="Man in a navy suit presenting charts to three colleagues seated along a conference table"
              position="center 42%"
              className="aspect-video"
            />
            <h2 className={`${heading} mt-12`}>A recent engagement with an executive team.</h2>
            <p className="mt-6 text-xl font-medium tracking-tight">Three people on one account, at $10,000 a month.</p>
            <ul className="mt-8 max-w-3xl space-y-4">
              <li className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-[var(--offer-muted)]">
                <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[var(--offer-navy)]" aria-hidden="true" />
                <span>We connected to their systems, including one with no API. For that one, we sign in and pull the numbers several times during the workday.</span>
              </li>
              <li className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-[var(--offer-muted)]">
                <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[var(--offer-navy)]" aria-hidden="true" />
                <span>We built live dashboards their team uses to run the business.</span>
              </li>
              <li className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-[var(--offer-muted)]">
                <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[var(--offer-navy)]" aria-hidden="true" />
                <span>Within two weeks, the savings already covered more than a year of the engagement's cost.</span>
              </li>
              <li className="grid grid-cols-[auto_1fr] gap-4 leading-relaxed text-[var(--offer-muted)]">
                <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[var(--offer-navy)]" aria-hidden="true" />
                <span>The team wanted to keep going.</span>
              </li>
            </ul>
            <p className={`mt-8 ${prose}`}>
              That is what happened in one engagement. It is not a guarantee. It shows what is possible when the system is built into the work and someone stays with it.
            </p>
            <p className="mt-8 max-w-2xl border-t border-[var(--offer-line)] pt-8 leading-relaxed text-[var(--offer-muted)]">
              We used to build custom AI operations for large companies. Co-management makes a bigger impression because the client's own people get the credit, and the work doesn't stop when the project ends.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="partner-economics" className="scroll-mt-28 bg-[#e9e2d6] py-20 md:py-28">
        <div className={frame}>
          <Reveal>
            <h2 className={heading}>Your price. Our fee. Your margin.</h2>
            <p className={`mt-6 ${prose}`}>We charge you a fixed fulfillment fee per seat. You set your own price.</p>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--offer-ink)]/20 text-sm">
                    <th scope="col" className="pb-4 pr-6 font-semibold">Service</th>
                    <th scope="col" className="pb-4 pr-6 font-semibold">What it covers</th>
                    <th scope="col" className="pb-4 font-semibold">AIify fulfillment fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--offer-ink)]/10 transition-colors hover:bg-white/50">
                    <th scope="row" className="py-5 pr-6 align-top font-semibold">Standard co-management</th>
                    <td className="py-5 pr-6 align-top text-[var(--offer-muted)]">One person</td>
                    <td className="py-5 align-top">$2,000 per seat per month</td>
                  </tr>
                  <tr className="transition-colors hover:bg-white/50">
                    <th scope="row" className="py-5 pr-6 align-top font-semibold">Executive co-management</th>
                    <td className="py-5 pr-6 align-top text-[var(--offer-muted)]">The executive plus the person who acts as their chief of staff</td>
                    <td className="py-5 align-top">$4,000 per executive per month</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={`mt-8 space-y-5 ${prose}`}>
              <p>Many partners price executive-level work around $10,000 a month. That's an example of what the market bears, not a required price. You decide.</p>
              <p>A tool seat alone runs about $500 a month. That is software, and it's not what this offer is. What you're selling is the people who make the software get used.</p>
            </div>
          </Reveal>
          <OfferCalculator onQuote={carryQuote} />
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className={frame}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <h2 className={heading}>The client is yours. So is what we build for them.</h2>
              <div className="mt-8 max-w-xl divide-y divide-[var(--offer-line)] border-y border-[var(--offer-line)]">
                <div className="py-5 transition-colors hover:bg-[#f7f4ee]">
                  <h3 className="font-semibold">The relationship.</h3>
                  <p className="mt-2 leading-relaxed text-[var(--offer-muted)]">The offer carries your name. You own the client.</p>
                </div>
                <div className="py-5 transition-colors hover:bg-[#f7f4ee]">
                  <h3 className="font-semibold">The client-specific work.</h3>
                  <p className="mt-2 leading-relaxed text-[var(--offer-muted)]">The instructions, playbooks, and agent setups built for your clients belong to you.</p>
                </div>
                <div className="py-5 transition-colors hover:bg-[#f7f4ee]">
                  <h3 className="font-semibold">The long view.</h3>
                  <p className="mt-2 leading-relaxed text-[var(--offer-muted)]">We plan to stay for the long term and keep adjusting with you as the work changes.</p>
                </div>
              </div>
              <p className={`mt-8 ${prose}`}>
                We keep our own methods. Everything we build for a client is, at bottom, a set of instructions for agents, and those instructions stay with you.
              </p>
            </Reveal>
            <OfferPhoto
              name="you-keep-the-client"
              alt="Two people at a marble table reviewing a printed page together"
              position="center 28%"
              className="aspect-[4/3]"
            />
          </div>

          <div className="mt-20 max-w-3xl">
            <h3 className="text-2xl font-semibold tracking-tight">Three questions partners ask</h3>
            <div className="mt-6 divide-y divide-[var(--offer-line)] border-y border-[var(--offer-line)]">
              {QUESTIONS.map((item) => (
                <details key={item.q} open className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span aria-hidden="true" className="mt-1 text-xl leading-none text-[var(--offer-muted)] transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl leading-relaxed text-[var(--offer-muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="quote" className="scroll-mt-28 py-20 md:py-28">
        <div className={`${frame} grid items-start gap-12 lg:grid-cols-12`}>
          <div className="lg:col-span-5">
            <h2 id="quote-heading" tabIndex={-1} className={`${heading} outline-none`}>Tell us who you'd offer this to.</h2>
            <p className={`mt-6 ${prose}`}>We'll come back with a quote based on your seats and service mix.</p>
          </div>
          <div className="lg:col-span-7">
            <OfferQuoteForm seats={seats} onSeats={setSeats} service={service} pricePerSeat={pricePerSeat} />
          </div>
        </div>
      </section>
    </main>
  );
}

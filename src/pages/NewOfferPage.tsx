import { useEffect, useState } from 'react';
import CreditChapter from '../components/offer/CreditChapter';
import LeadersChapter from '../components/offer/LeadersChapter';
import OfferCalculator, { type QuoteCarry } from '../components/offer/OfferCalculator';
import OfferChrome from '../components/offer/OfferChrome';
import OfferPhoto from '../components/offer/OfferPhoto';
import OfferQuoteForm from '../components/offer/OfferQuoteForm';
import OwnershipChapter from '../components/offer/OwnershipChapter';
import StepSequence from '../components/offer/StepSequence';
import { type OfferService } from '../data/offerEconomics.ts';

const PAGE_TITLE = 'Offer AI Co-Management Under Your Name | AIify Partners';
const DESCRIPTION = 'Offer AI agent swarm co-management to your clients under your own name. AIify sets it up, builds with their people, and runs it in the background. You keep the client and the margin.';
const CANONICAL = 'https://aiifyit.com/new-offer/';
const OG_IMAGE = 'https://aiifyit.com/images/offer/hero.jpg';

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

export default function NewOfferPage() {
  useOfferMetadata();
  const [playService, setPlayService] = useState<OfferService>('executive');
  const [seats, setSeats] = useState('');
  const [service, setService] = useState<OfferService | undefined>(undefined);
  const [pricePerSeat, setPricePerSeat] = useState<number | undefined>(undefined);
  const [quoted, setQuoted] = useState(false);

  const carryQuote = (carry: QuoteCarry) => {
    setSeats(carry.seats);
    setService(carry.service);
    setPricePerSeat(carry.price);
    setQuoted(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('quote')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('quote-heading')?.focus({ preventScroll: true });
  };

  return (
    <div className="offer-page">
      <a href="#quote" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-20 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
        Skip to the quote form
      </a>
      <OfferChrome />
      <main>
        <section id="offer" className="scroll-mt-24 lg:grid lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2">
          <div className="relative h-[54vh] min-h-[280px] lg:order-2 lg:h-auto lg:min-h-full">
            <OfferPhoto
              name="hero"
              alt="Woman in a cream suit seated at a desk beside a monitor showing charts"
              position="68% 40%"
              priority
              bleed
              look
            />
          </div>
          <div className="flex items-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
            <div className="w-full max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--offer-muted)]">AIify Partner Program</p>
              <div className="mt-5 h-px w-12 bg-[var(--offer-brass)]" aria-hidden="true" />
              <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                The tool is not the problem.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[var(--offer-muted)]">
                People don't use AI unless someone builds it into their work and stays with them. Education alone comes too late, so we do the work for and with your clients, and results start while they are still learning. The companies that win will offer this without building a new internal machine to run it.
              </p>
              <p className="mt-6 max-w-xl border-l-2 border-[var(--offer-brass)] pl-5 text-xl font-medium leading-snug tracking-tight">
                AI agent swarm co-management, offered under your name and delivered by us.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <a href="#quote" className="offer-btn">Get a quote</a>
                <a href="#partner-economics" className="text-sm font-semibold text-[var(--offer-navy)] underline decoration-[var(--offer-brass)] underline-offset-4 hover:decoration-[var(--offer-navy)]">
                  See the partner economics
                </a>
              </div>
            </div>
          </div>
        </section>

        <LeadersChapter />
        <StepSequence />
        <CreditChapter />

        <section id="partner-economics" className="scroll-mt-24 bg-[var(--offer-bg-deep)] py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">Your price. Our fee. Your margin.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--offer-muted)]">We charge you a fixed fulfillment fee per seat. You set your own price.</p>
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
                  <tr
                    onClick={() => setPlayService('standard')}
                    className={`cursor-pointer border-b border-[var(--offer-ink)]/10 transition-colors ${playService === 'standard' ? 'bg-white shadow-[inset_3px_0_0_var(--offer-brass)]' : 'hover:bg-white/60'}`}
                  >
                    <th scope="row" className="py-5 pr-6 align-top font-semibold">
                      <button type="button" className="text-left font-semibold" aria-pressed={playService === 'standard'} onClick={() => setPlayService('standard')}>
                        Standard co-management
                      </button>
                    </th>
                    <td className="py-5 pr-6 align-top text-[var(--offer-muted)]">One person</td>
                    <td className="py-5 align-top text-xl font-semibold tracking-tight">$2,000 per seat per month</td>
                  </tr>
                  <tr
                    onClick={() => setPlayService('executive')}
                    className={`cursor-pointer transition-colors ${playService === 'executive' ? 'bg-white shadow-[inset_3px_0_0_var(--offer-brass)]' : 'hover:bg-white/60'}`}
                  >
                    <th scope="row" className="py-5 pr-6 align-top font-semibold">
                      <button type="button" className="text-left font-semibold" aria-pressed={playService === 'executive'} onClick={() => setPlayService('executive')}>
                        Executive co-management
                      </button>
                    </th>
                    <td className="py-5 pr-6 align-top text-[var(--offer-muted)]">The executive plus the person who acts as their chief of staff</td>
                    <td className="py-5 align-top text-xl font-semibold tracking-tight">$4,000 per executive per month</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-[var(--offer-muted)]">
              <p>Many partners price executive-level work around $10,000 a month. That's an example of what the market bears, not a required price. You decide.</p>
              <p>A tool seat alone runs about $500 a month. That is software, and it's not what this offer is. What you're selling is the people who make the software get used.</p>
            </div>
            <OfferCalculator service={playService} onService={setPlayService} onQuote={carryQuote} />
          </div>
        </section>

        <OwnershipChapter />

        <section id="quote" className="scroll-mt-24">
          <div className="relative h-[42vh] min-h-[260px]">
            <OfferPhoto name="hero" alt="" position="18% 48%" bleed still />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f3eee4] via-[#f3eee4]/25 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto -mt-20 w-full max-w-6xl px-6 pb-20">
            <div className="grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h2 id="quote-heading" tabIndex={-1} className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance outline-none md:text-5xl">
                  Tell us who you'd offer this to.
                </h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--offer-muted)]">We'll come back with a quote based on your seats and service mix.</p>
              </div>
              <div className="lg:col-span-7">
                <OfferQuoteForm seats={seats} onSeats={setSeats} service={service} pricePerSeat={pricePerSeat} highlighted={quoted} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--offer-line)] px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--offer-muted)]">AIify Partner Program</p>
          <a href="#quote" className="text-sm font-semibold text-[var(--offer-navy)]">Get a quote</a>
        </div>
      </footer>
    </div>
  );
}

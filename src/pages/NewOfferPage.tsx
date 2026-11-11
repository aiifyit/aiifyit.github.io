import { useEffect, useState } from 'react';
import CreditChapter from '../components/offer/CreditChapter';
import LeadersChapter from '../components/offer/LeadersChapter';
import OfferCalculator, { type QuoteCarry } from '../components/offer/OfferCalculator';
import OfferChrome, { OfferBrand } from '../components/offer/OfferChrome';
import copy from '../data/offerCopy.json';
import OfferPhoto from '../components/offer/OfferPhoto';
import OfferQuoteForm from '../components/offer/OfferQuoteForm';
import OwnershipChapter from '../components/offer/OwnershipChapter';
import StepSequence from '../components/offer/StepSequence';
import { type OfferService } from '../data/offerEconomics.ts';

const PAGE_TITLE = copy.title;
const DESCRIPTION = copy.description;
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
        <section id="offer" className="offer-hero" aria-labelledby="offer-heading">
          <OfferPhoto name="hero" alt="A woman working a live operations dashboard at a standing desk in a sunlit architecture studio" priority bleed />
          <div className="offer-hero-shade" />
          <div className="offer-hero-content offer-wrap">
            <p className="offer-eyebrow">{copy.program}</p>
            <h1 id="offer-heading">{copy.hero.heading}</h1>
            <p className="offer-hero-subhead">{copy.hero.body}</p>
            <div className="offer-hero-actions"><a href="#quote" className="offer-btn">{copy.cta}</a><a href="#partner-economics" className="offer-text-link">{copy.hero.secondary}<span aria-hidden="true"> ↗</span></a></div>
          </div>
        </section>

        <LeadersChapter />
        <StepSequence />
        <CreditChapter />

        <section id="partner-economics" className="offer-economics offer-section" aria-labelledby="economics-heading">
          <div className="offer-wrap">
            <p className="offer-eyebrow">{copy.economics.label}</p>
            <h2 id="economics-heading">{copy.economics.heading}</h2>
            <p className="offer-prose mt-6">{copy.economics.body}</p>
            <div className="offer-fee-table">
              <table><caption>{copy.economics.feesLabel}</caption><thead><tr><th scope="col">Coverage</th><th scope="col">What it includes</th><th scope="col">Your fee to AIify</th></tr></thead>
                <tbody><tr><th scope="row">Standard</th><td>AI agent swarm co-management for one user</td><td>$2,000 per seat per month</td></tr><tr><th scope="row">Executive</th><td>Coverage for one executive plus the person who acts as their chief of staff</td><td>$4,000 per executive per month</td></tr></tbody>
              </table>
            </div>
            <div className="offer-price-context"><div><h3>{copy.economics.marketLabel}</h3><p>{copy.economics.market}</p></div><div><h3>{copy.economics.priceLabel}</h3><p>{copy.economics.price}</p></div></div>
            <OfferCalculator service={playService} onService={setPlayService} onQuote={carryQuote} />
          </div>
        </section>

        <OwnershipChapter />

        <section id="quote" className="offer-quote offer-section">
          <div className="offer-wrap offer-quote-grid">
            <div><p className="offer-eyebrow">{copy.program}</p><h2 id="quote-heading" tabIndex={-1}>{copy.quote.heading}</h2><p className="offer-prose mt-6">{copy.quote.body}</p></div>
            <OfferQuoteForm seats={seats} onSeats={setSeats} service={service} pricePerSeat={pricePerSeat} highlighted={quoted} />
          </div>
        </section>
      </main>
      <footer className="offer-footer"><div className="offer-wrap"><OfferBrand /><a href="#quote" className="offer-text-link">{copy.cta}</a></div></footer>
    </div>
  );
}

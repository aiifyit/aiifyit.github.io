import { useEffect } from 'react';
import CreditChapter from '../components/offer/CreditChapter';
import BurdenChapter from '../components/offer/BurdenChapter';
import LeadersChapter from '../components/offer/LeadersChapter';
import OfferChrome, { OfferBrand } from '../components/offer/OfferChrome';
import copy from '../data/offerCopy.json';
import { AgentSwarm, FeeIllustration, QuoteAmbient } from '../components/offer/OfferGraphics';
import Reveal from '../components/offer/Reveal';
import OfferQuoteForm from '../components/offer/OfferQuoteForm';
import OwnershipChapter from '../components/offer/OwnershipChapter';
import StepSequence from '../components/offer/StepSequence';
import { OfferHeading, QuoteButton } from '../components/offer/OfferMotion';

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

  return (
    <div className="offer-page">
      <a href="#quote" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-20 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
        Skip to the quote form
      </a>
      <OfferChrome />
      <main>
        <section id="offer" className="offer-hero" aria-labelledby="offer-heading">

          <div className="offer-wrap offer-hero-grid"><div className="offer-hero-content">
            <p className="offer-eyebrow">{copy.program}</p>
            <h1 id="offer-heading">{copy.hero.heading}</h1>
            <p className="offer-hero-subhead">{copy.hero.body}</p>
            <div className="offer-hero-actions"><QuoteButton /><a href="#partner-economics" className="offer-text-link">{copy.hero.secondary}<span aria-hidden="true"> ↗</span></a></div>
          </div><AgentSwarm /></div>
        </section>

        <StepSequence />
        <LeadersChapter />
        <BurdenChapter />
        <CreditChapter />

        <section id="partner-economics" className="offer-economics offer-section" aria-labelledby="economics-heading">
          <Reveal className="offer-wrap">
            <p className="offer-eyebrow">{copy.economics.label}</p>
            <OfferHeading id="economics-heading">{copy.economics.heading}</OfferHeading>
            <p className="offer-prose mt-6">{copy.economics.body}</p>
            <div className="offer-fee-table">
              <table><caption>{copy.economics.feesLabel}</caption><thead><tr><th scope="col">Coverage</th><th scope="col">What it includes</th><th scope="col">Your fee to AIify</th></tr></thead>
                <tbody><tr><th scope="row">Standard</th><td>AI agent swarm co-management for one user</td><td>$2,000 per seat per month wholesale</td></tr><tr><th scope="row">Executive</th><td>Coverage for one executive plus the person who acts as their chief of staff</td><td>$4,000 per executive per month wholesale</td></tr></tbody>
              </table>
            </div>
            <FeeIllustration />
            <div className="offer-price-context"><div><h3>{copy.economics.marketLabel}</h3><p>{copy.economics.market}</p></div><div><h3>{copy.economics.priceLabel}</h3><p>{copy.economics.price}</p></div></div>

          </Reveal>
        </section>

        <OwnershipChapter />

        <section id="quote" className="offer-quote offer-section">
          <Reveal className="offer-wrap offer-quote-grid">
            <div><p className="offer-eyebrow">{copy.program}</p><OfferHeading id="quote-heading" tabIndex={-1}>{copy.quote.heading}</OfferHeading><p className="offer-prose mt-6">{copy.quote.body}</p><QuoteAmbient /></div>
            <OfferQuoteForm />
          </Reveal>
        </section>
      </main>
      <footer className="offer-footer"><div className="offer-wrap"><OfferBrand /><a href="#quote" className="offer-text-link">{copy.cta}</a></div></footer>
    </div>
  );
}

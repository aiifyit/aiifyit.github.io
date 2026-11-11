import { useEffect } from 'react';
import CreditChapter from '../components/offer/CreditChapter';
import LeadersChapter from '../components/offer/LeadersChapter';
import OfferChrome, { OfferBrand } from '../components/offer/OfferChrome';
import copy from '../data/offerCopy.json';
import { AgentSwarm, QuoteAmbient } from '../components/offer/OfferGraphics';
import Reveal from '../components/offer/Reveal';
import OfferQuoteForm from '../components/offer/OfferQuoteForm';
import OwnershipChapter from '../components/offer/OwnershipChapter';
import AccountStack from '../components/offer/AccountStack';
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
        <CreditChapter />

        <section id="partner-economics" className="offer-economics offer-section" aria-labelledby="economics-heading">
          <Reveal className="offer-wrap">
            <p className="offer-eyebrow">{copy.economics.label}</p>
            <OfferHeading id="economics-heading">{copy.economics.heading}</OfferHeading>
            <p className="offer-prose mt-6">{copy.economics.body}</p>
            <div className="offer-account-grid"><ul className="offer-economics-points">{copy.economics.points.map(point => <li key={point.title}><h3>{point.title}</h3><p>{point.body}</p></li>)}</ul><AccountStack /></div>

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

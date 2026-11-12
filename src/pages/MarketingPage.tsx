import {
  HomeAccountStack,
  HomeComparisonArt,
  HomeOwnership,
  HomeProofGraphic,
  HomeQuoteAmbient,
  HomeStepGraphic,
  HomeSwarm,
} from '../components/home/HomeGraphics';
import CreditChapter from '../components/offer/CreditChapter';
import LeadersChapter from '../components/offer/LeadersChapter';
import ContactForm from '../components/ui/ContactForm';
import type { LeadFormData } from '../components/ui/LeadForm';
import OwnershipChapter from '../components/offer/OwnershipChapter';
import Reveal from '../components/offer/Reveal';
import StepSequence from '../components/offer/StepSequence';
import { OfferHeading, QuoteButton } from '../components/offer/OfferMotion';
import copy from '../data/homeCopy.json';
import { createContactDraft } from '../data/contactLead';

const SERVICES = [
  { href: '/services/workflow-automation/', title: 'Workflow automation' },
  { href: '/services/custom-ai-agents/', title: 'Custom AI agents' },
  { href: '/services/workflow-integration/', title: 'Workflow integration' },
];

function createHomeDraft(fields: LeadFormData) {
  return createContactDraft({
    name: fields.name,
    company: fields.company,
    email: fields.email,
    message: fields.message,
    phone: fields.phone,
    website: fields.website,
    source: '/',
    cta: 'Homepage contact form',
  });
}

export default function MarketingPage() {
  return (
    <div className="offer-page home-offer">
      <a href="#quote" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-24 focus:z-50 focus:bg-white focus:px-4 focus:py-2">
        Skip to the contact form
      </a>
      <main>
        <section id="hero" className="offer-hero" aria-labelledby="hero-heading">
          <div className="offer-wrap offer-hero-grid">
            <div className="offer-hero-content">
              <div className="home-hero-lockup">
                <picture>
                  <source srcSet="/images/aiify-logo.webp" type="image/webp" />
                  <img src="/images/aiify-logo.png" alt="AIify" width={631} height={167} />
                </picture>
                <img
                  src="/images/spacexsi-transformation-partner.svg"
                  alt="AIify It is a registered SpaceX Super Intelligence Transformation Partner"
                  width={1442}
                  height={252}
                />
              </div>
              <p className="offer-eyebrow">{copy.program}</p>
              <h1 id="hero-heading">{copy.hero.heading}</h1>
              <p className="offer-hero-subhead">{copy.hero.body}</p>
              <div className="offer-hero-actions">
                <QuoteButton cta={copy.cta} />
                <a href="#pricing" className="offer-text-link">{copy.hero.secondary}<span aria-hidden="true"> ↗</span></a>
              </div>
            </div>
            <HomeSwarm />
          </div>
        </section>

        <StepSequence copy={copy} sectionId="how-it-works" Graphic={HomeStepGraphic} />
        <LeadersChapter copy={copy} cta={copy.cta} Art={HomeComparisonArt} showCompareToggle={false} />
        <CreditChapter copy={copy} Graphic={HomeProofGraphic} />

        <section id="pricing" className="offer-economics offer-section" aria-labelledby="pricing-heading">
          <Reveal className="offer-wrap">
            <p className="offer-eyebrow">{copy.economics.label}</p>
            <OfferHeading id="pricing-heading">{copy.economics.heading}</OfferHeading>
            <p className="offer-prose mt-6">{copy.economics.body}</p>
            <div className="offer-account-grid">
              <ul className="offer-economics-points">
                {copy.economics.points.map((point) => (
                  <li key={point.title}><h3>{point.title}</h3><p>{point.body}</p></li>
                ))}
              </ul>
              <HomeAccountStack copy={copy} />
            </div>
          </Reveal>
        </section>

        <OwnershipChapter copy={copy} Graphic={HomeOwnership} />

        <section id="quote" className="offer-quote offer-section">
          <Reveal className="offer-wrap offer-quote-grid">
            <div>
              <p className="offer-eyebrow">{copy.program}</p>
              <OfferHeading id="quote-heading" tabIndex={-1}>{copy.quote.heading}</OfferHeading>
              <p className="offer-prose mt-6">{copy.quote.body}</p>
              <HomeQuoteAmbient />
            </div>
            <ContactForm source="/" cta="Homepage contact form" createDraft={createHomeDraft} reply={copy.quote.reply} />
          </Reveal>
        </section>

        <section id="services" className="offer-section" aria-labelledby="services-heading">
          <Reveal className="offer-wrap">
            <p className="offer-eyebrow">{copy.explore.label}</p>
            <OfferHeading id="services-heading">{copy.explore.heading}</OfferHeading>
            <p className="offer-prose mt-6">{copy.explore.body}</p>
            <ul className="home-explore-links">
              {SERVICES.map((service) => (
                <li key={service.href}><a href={service.href}>{service.title}</a></li>
              ))}
              <li><a href="/articles/">All articles</a></li>
            </ul>
          </Reveal>
        </section>
      </main>
    </div>
  );
}

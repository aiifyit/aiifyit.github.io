import { OfferHeading } from './OfferMotion';
import partnerCopy from '../../data/offerCopy.json';

type Copy = typeof partnerCopy;
import { LiveDashboard } from './OfferGraphics';
import Reveal from './Reveal';

export default function CreditChapter({ copy = partnerCopy }: { copy?: Copy }) {
  return (
    <section id="credit" className="offer-section offer-wrap" aria-labelledby="credit-heading">
      <div className="offer-evidence-heading"><OfferHeading id="credit-heading">{copy.evidence.heading}</OfferHeading><p className="offer-prose">{copy.evidence.body}</p></div>
      <div className="offer-evidence">
        <Reveal><LiveDashboard /></Reveal>
        <div><ul>{copy.evidence.facts.map((fact, i) => <li key={fact} className={i === 0 ? 'offer-evidence-lead' : ''}>{fact}</li>)}</ul><p className="offer-evidence-close">{copy.evidence.closing}</p></div>
      </div>
    </section>
  );
}

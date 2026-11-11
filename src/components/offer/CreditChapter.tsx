import copy from '../../data/offerCopy.json';
import OfferPhoto from './OfferPhoto';

export default function CreditChapter() {
  return (
    <section id="credit" className="offer-section offer-wrap" aria-labelledby="credit-heading">
      <div className="offer-evidence-heading"><h2 id="credit-heading">{copy.evidence.heading}</h2><p className="offer-prose">{copy.evidence.body}</p></div>
      <div className="offer-evidence">
        <OfferPhoto name="they-get-the-credit" alt="A business owner showing a live dashboard on a tablet to a colleague in a plant nursery" />
        <div><ul>{copy.evidence.facts.map((fact, i) => <li key={fact} className={i === 0 ? 'offer-evidence-lead' : ''}>{fact}</li>)}</ul><p className="offer-evidence-close">{copy.evidence.closing}</p></div>
      </div>
    </section>
  );
}

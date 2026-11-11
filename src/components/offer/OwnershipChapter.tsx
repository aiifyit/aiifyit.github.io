import copy from '../../data/offerCopy.json';
import { OwnershipSplit } from './OfferGraphics';
import Reveal from './Reveal';

export default function OwnershipChapter() {
  return (
    <section id="ownership" className="offer-section offer-wrap" aria-labelledby="ownership-heading">
      <div className="offer-ownership-top"><div><p className="offer-eyebrow">{copy.ownership.label}</p><h2 id="ownership-heading">{copy.ownership.heading}</h2></div><Reveal><OwnershipSplit /></Reveal></div>
      <div className="offer-ownership-points">{copy.ownership.points.map((point) => <div key={point.title}><h3>{point.title}</h3><p>{point.body}</p></div>)}</div>
      <div className="offer-questions"><h3>{copy.ownership.questionsLabel}</h3><div>{copy.ownership.questions.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></div>
    </section>
  );
}

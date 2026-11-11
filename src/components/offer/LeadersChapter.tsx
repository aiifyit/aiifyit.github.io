import { OfferHeading } from './OfferMotion';
import copy from '../../data/offerCopy.json';
import { BrandLayers } from './OfferGraphics';
import Reveal from './Reveal';

export default function LeadersChapter() {
  return (
    <section id="leaders" className="offer-section offer-wrap" aria-labelledby="leaders-heading">
      <div className="offer-intro">
        <Reveal><OfferHeading id="leaders-heading">{copy.intro.heading}</OfferHeading></Reveal>
        <div className="offer-prose">{copy.intro.body.map((p) => <p key={p}>{p}</p>)}</div>
      </div>
      <div className="offer-relationship">
        <Reveal><BrandLayers /></Reveal>
        <div className="offer-benefits">
          <p className="offer-eyebrow">{copy.intro.label}</p>
          <ul>{copy.intro.points.map((p, i) => <li key={p.title}><span className="offer-index">0{i + 1}</span><div><h3>{p.title}</h3><p>{p.body}</p></div></li>)}</ul>
        </div>
      </div>
      <p className="offer-built-for"><strong>Built for:</strong> {copy.intro.builtFor}</p>
    </section>
  );
}

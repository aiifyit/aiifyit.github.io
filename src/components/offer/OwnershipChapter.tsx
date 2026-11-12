import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { OfferHeading } from './OfferMotion';
import partnerCopy from '../../data/offerCopy.json';

type Copy = typeof partnerCopy;
import { OwnershipSplit } from './OfferGraphics';
import Reveal from './Reveal';

export default function OwnershipChapter({ copy = partnerCopy, variant = 'partner', Graphic = OwnershipSplit }: { copy?: Copy; variant?: 'partner' | 'direct'; Graphic?: ComponentType<{ variant?: 'partner' | 'direct' }> }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  return (
    <section id="ownership" className="offer-section offer-wrap" aria-labelledby="ownership-heading">
      <div className="offer-ownership-top"><div><p className="offer-eyebrow">{copy.ownership.label}</p><OfferHeading id="ownership-heading">{copy.ownership.heading}</OfferHeading></div><Reveal><Graphic variant={variant} /></Reveal></div>
      <div className="offer-ownership-points">{copy.ownership.points.map((point) => <div key={point.title}><h3>{point.title}</h3><p>{point.body}</p></div>)}</div>
      <div className="offer-questions"><h3>{copy.ownership.questionsLabel}</h3><div>{copy.ownership.questions.map((item, i) => <div className="offer-faq" key={item.q}><button type="button" id={`offer-faq-${i}`} aria-expanded={open === i} aria-controls={`offer-answer-${i}`} onClick={() => setOpen(open === i ? null : i)}>{item.q}<span aria-hidden="true">{open === i ? '−' : '+'}</span></button><AnimatePresence initial={false}>{open === i && <motion.div id={`offer-answer-${i}`} role="region" aria-labelledby={`offer-faq-${i}`} initial={{ height: reduced ? 'auto' : 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: reduced ? 'auto' : 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }} className="offer-faq-answer"><p>{item.a}</p></motion.div>}</AnimatePresence></div>)}</div></div>
    </section>
  );
}

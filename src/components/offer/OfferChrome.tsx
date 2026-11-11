import { motion, useReducedMotion, useScroll } from 'framer-motion';
import copy from '../../data/offerCopy.json';
import Logo from '../ui/Logo';

export function OfferBrand() {
  return (
    <a href="/" className="offer-brand" aria-label="AIify home — AIify Partner Program">
      <Logo className="offer-brand-logo" />
      <span>{copy.program}</span>
    </a>
  );
}

export default function OfferChrome() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  return (
    <header className="offer-header">
      <div className="offer-header-inner">
        <OfferBrand />
        <a href="#quote" className="offer-btn offer-btn-sm">{copy.cta}</a>
      </div>
      {!reduced && <motion.div style={{ scaleX: scrollYProgress }} className="offer-reading-progress" />}
    </header>
  );
}

import { motion, useReducedMotion, useScroll } from 'framer-motion';

export function OfferBrand() {
  return (
    <a href="/" className="offer-brand" aria-label="AIify home — AIify Partner Program">
      <picture>
        <source srcSet="/images/offer/partner-program-logo.webp" type="image/webp" />
        <img src="/images/offer/partner-program-logo.png" alt="AIify Partner Program" width={1134} height={517} />
      </picture>
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
        <a href="#quote" className="offer-btn offer-btn-sm">Get a quote</a>
      </div>
      {!reduced && <motion.div style={{ scaleX: scrollYProgress }} className="offer-reading-progress" />}
    </header>
  );
}

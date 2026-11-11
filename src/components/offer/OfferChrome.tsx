import { QuoteButton } from './OfferMotion';
import { motion, useReducedMotion, useScroll } from 'framer-motion';

export function OfferBrand({ tone = 'mint' }: { tone?: 'mint' | 'ink' }) {
  const file = tone === 'ink' ? 'partner-program-logo-ink' : 'partner-program-logo';
  return (
    <a href="/" className="offer-brand" aria-label="AIify home, AIify Partner Program">
      <picture>
        <source srcSet={`/images/offer/${file}.webp`} type="image/webp" />
        <img src={`/images/offer/${file}.png`} alt="AIify Partner Program" width={647} height={262} />
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
        <QuoteButton small />
      </div>
      {!reduced && <motion.div style={{ scaleX: scrollYProgress }} className="offer-reading-progress" />}
    </header>
  );
}

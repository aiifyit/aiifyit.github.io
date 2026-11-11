import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import Logo from '../ui/Logo';

export default function OfferChrome() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b bg-[#f3eee4]/95 backdrop-blur-md ${scrolled ? 'border-[var(--offer-line)]' : 'border-transparent'}`}>
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-5 sm:px-8">
        <a href="/" aria-label="AIify home" className="relative block h-11 w-[6.5rem] shrink-0 overflow-hidden bg-black">
          <Logo className="pointer-events-none absolute left-1/2 top-1/2 h-[5.5rem] max-w-none -translate-x-1/2 -translate-y-[46%]" />
        </a>
        <a href="#quote" className="offer-btn offer-btn-sm">Get a quote</a>
      </div>
      {reduced ? null : (
        <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--offer-brass)]" />
      )}
    </header>
  );
}

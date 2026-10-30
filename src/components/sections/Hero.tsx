import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import {
  HERO_EYEBROW,
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_BULLETS,
  HERO_STATS,
} from '../../data/constants';

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: 'easeOut' as const },
        };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent-glow)] blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Container className="py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.p
            {...fadeUp(0)}
            className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest mb-6"
          >
            {HERO_EYEBROW}
          </motion.p>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            {HERO_HEADLINE}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10"
          >
            {HERO_SUBHEADLINE}
          </motion.p>

          {/* Bullets */}
          <motion.ul
            {...fadeUp(0.3)}
            className="flex flex-col items-center gap-3 mb-10"
          >
            {HERO_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <Check
                  className="w-5 h-5 mt-0.5 text-[var(--color-accent)] shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[var(--color-text-muted)]">{bullet}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.4)}
            className="flex flex-row flex-wrap items-center justify-center gap-4"
          >
            <Button
              href="/inquire/"
              variant="primary"
              size="sm"
            >
              Discuss your workflow
            </Button>
            <Button href="#process" variant="ghost" size="sm">
              See How It Works
            </Button>
          </motion.div>

          <img
            src="/images/spacexsi-transformation-partner.svg"
            alt="AIify It is a registered SpaceX Super Intelligence Transformation Partner"
            width={1442}
            height={252}
            className="mx-auto mt-[25px] mb-16 block h-[72px] w-auto max-w-full object-contain"
          />
        </div>

        {/* Stats Bar */}
        <motion.div
          {...fadeUp(0.5)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 max-w-4xl mx-auto"
        >
          {HERO_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center px-6 py-4 ${
                i < HERO_STATS.length - 1
                  ? 'lg:border-r lg:border-[var(--color-border-subtle)]'
                  : ''
              }`}
            >
              <p className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

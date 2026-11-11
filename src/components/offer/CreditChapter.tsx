import { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import OfferPhoto from './OfferPhoto';

const FACTS = [
  'We connected to their systems, including one with no API. For that one, we sign in and pull the numbers several times during the workday.',
  'We built live dashboards their team uses to run the business.',
  "Within two weeks, the savings already covered more than a year of the engagement's cost.",
  'The team wanted to keep going.',
];

const CROPS = ['36% 42%', '70% 36%', '55% 48%', '48% 40%'];

export default function CreditChapter() {
  const factRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pinned, setPinned] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion() === true;
  const active = hover ?? pinned;

  const choose = (index: number, behavior: ScrollBehavior) => {
    setHover(null);
    setPinned(index);
    factRefs.current[index]?.scrollIntoView({ behavior, block: 'center' });
  };

  return (
    <section id="credit" className="scroll-mt-24 lg:grid lg:grid-cols-2" aria-labelledby="credit-heading">
      <div className="relative h-[62vh] min-h-[320px] lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)]">
        <OfferPhoto
          name="they-get-the-credit"
          alt="Man in a navy suit presenting charts to three colleagues seated along a conference table"
          position={CROPS[active]}
          bleed
          look
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1714]/75 to-transparent p-5 pt-16">
          <label className="block">
            <span className="sr-only">A recent engagement with an executive team.</span>
            <input
              type="range"
              className="offer-scrub"
              min={0}
              max={FACTS.length - 1}
              step={1}
              value={pinned}
              aria-valuetext={FACTS[pinned]}
              onChange={(event) => choose(Number(event.target.value), reduced ? 'auto' : 'smooth')}
            />
          </label>
        </div>
      </div>

      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-20">
        <h2 id="credit-heading" className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
          The credit stays with them.
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--offer-muted)]">
          Your client's people show up to meetings with what they built. We don't play the hero. That is why the work keeps going.
        </p>
        <p className="mt-6 max-w-xl leading-relaxed text-[var(--offer-muted)]">
          We currently co-manage in Grok Bot. We are platform-agnostic, so if a better system appears, we move with it.
        </p>

        <h2 className="mt-16 max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
          A recent engagement with an executive team.
        </h2>
        <p className="mt-5 text-xl font-medium tracking-tight">Three people on one account, at $10,000 a month.</p>
        <div className="mt-8 max-w-xl border-b border-[var(--offer-line)]" onMouseLeave={() => setHover(null)}>
          {FACTS.map((fact, index) => {
            const current = index === active;
            return (
              <button
                key={fact}
                ref={(node) => { factRefs.current[index] = node; }}
                type="button"
                aria-pressed={index === pinned}
                onMouseEnter={() => setHover(index)}
                onFocus={() => setPinned(index)}
                onClick={() => {
                  setHover(null);
                  setPinned(index);
                }}
                className={`flex w-full gap-4 border-t border-[var(--offer-line)] py-5 text-left transition-colors ${current ? 'bg-white/70 shadow-[inset_3px_0_0_var(--offer-brass)]' : 'hover:bg-white/40'}`}
              >
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${current ? 'bg-[var(--offer-brass)]' : 'bg-[var(--offer-navy)]'}`} aria-hidden="true" />
                <span className="leading-relaxed text-[var(--offer-muted)]">{fact}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-8 max-w-xl space-y-5 leading-relaxed text-[var(--offer-muted)]">
          <p>That is what happened in one engagement. It is not a guarantee. It shows what is possible when the system is built into the work and someone stays with it.</p>
          <p>We used to build custom AI operations for large companies. Co-management makes a bigger impression because the client's own people get the credit, and the work doesn't stop when the project ends.</p>
        </div>
      </div>
    </section>
  );
}

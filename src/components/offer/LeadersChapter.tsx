import { useState } from 'react';
import OfferPhoto from './OfferPhoto';

const POINTS = [
  {
    title: 'You set the price.',
    body: 'You charge what your market will bear.',
    position: '78% 28%',
  },
  {
    title: 'We fulfill.',
    body: 'Setup, live working sessions, daily care, and ongoing direction.',
    position: '30% 42%',
  },
  {
    title: 'You keep the spread.',
    body: 'Your price minus our fulfillment fee is your margin.',
    position: '68% 18%',
  },
];

export default function LeadersChapter() {
  const [pinned, setPinned] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? pinned;

  return (
    <section id="leaders" className="scroll-mt-24 lg:grid lg:grid-cols-2" aria-labelledby="leaders-heading">
      <div className="relative h-[58vh] min-h-[300px] lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)]">
        <OfferPhoto
          name="stay-in-front"
          alt="Man in a light blue shirt standing with his hands in his pockets, looking out over a city"
          position={POINTS[active].position}
          bleed
          look
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1714]/70 to-transparent p-5 pt-16">
          <label className="block">
            <span className="sr-only">For leaders who want to offer this without building it.</span>
            <input
              type="range"
              className="offer-scrub"
              min={0}
              max={POINTS.length - 1}
              step={1}
              value={pinned}
              aria-valuetext={POINTS[pinned].title}
              onChange={(event) => {
                setHover(null);
                setPinned(Number(event.target.value));
              }}
            />
          </label>
        </div>
      </div>
      <div className="flex items-center px-6 py-12 sm:px-10 lg:min-h-[calc(100svh-4rem)] lg:px-14 lg:py-16">
        <div className="w-full max-w-xl">
          <h2 id="leaders-heading" className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
            For leaders who want to offer this without building it.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--offer-muted)]">
            <p>You serve clients, members, coaches, or portfolio companies. They need AI that actually gets used. You don't want to hire, train, and manage a team to deliver it.</p>
            <p>We work in the background. You stay the face of the offer.</p>
          </div>
          <div
            className="mt-8 border-b border-[var(--offer-line)]"
            onMouseLeave={() => setHover(null)}
          >
            {POINTS.map((point, index) => {
              const current = index === active;
              return (
                <button
                  key={point.title}
                  type="button"
                  aria-pressed={index === pinned}
                  onMouseEnter={() => setHover(index)}
                  onFocus={() => setPinned(index)}
                  onClick={() => setPinned(index)}
                  className={`block w-full border-t border-[var(--offer-line)] px-4 py-4 text-left transition-colors ${current ? 'bg-white/75 shadow-[inset_3px_0_0_var(--offer-brass)]' : 'hover:bg-white/45'}`}
                >
                  <strong className="font-semibold">{point.title}</strong>
                  <span className="mt-1 block leading-relaxed text-[var(--offer-muted)]">{point.body}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-8 text-lg leading-relaxed text-[var(--offer-muted)]">
            This works in any industry where people have real work to move and too little time to learn a new system on their own.
          </p>
        </div>
      </div>
    </section>
  );
}

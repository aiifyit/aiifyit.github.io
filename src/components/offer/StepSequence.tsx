import { useEffect, useRef, useState } from 'react';
import OfferPhoto from './OfferPhoto';
import Reveal from './Reveal';

const STEPS = [
  {
    title: '1. Setup',
    body: "We configure the swarm around the work your client's people already do. Nothing generic.",
  },
  {
    title: '2. Build-with-you sessions',
    body: 'Each person who will use the system gets a working session, about 30 minutes a week at the start. We build with them live on the call. They leave with something real, not a training deck.',
  },
  {
    title: '3. Daily remote care',
    body: "Our people log into the client's agent account every day. We see what is moving and where people are stuck, and we push the work through.",
  },
  {
    title: '4. Quarterly aim',
    body: "Each quarter, the client's goals go into the system. Co-management then aims at what matters now, not what mattered at kickoff.",
  },
];

export default function StepSequence() {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
      const marker = window.innerHeight * 0.42;
      let current = 0;
      steps.forEach((step, index) => {
        if (step.getBoundingClientRect().top < marker) current = index;
      });
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section className="py-20 md:py-28" aria-labelledby="co-management-heading">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <h2 id="co-management-heading" className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
            Not a tool. Not a course. A team that stays.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--offer-muted)]">
            We set up the agent swarm with your client's team and then co-manage it with them, week after week.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <OfferPhoto
              name="built-with-you"
              alt="Two colleagues at a conference table, one holding a pen, looking toward a large screen"
              position="38% 46%"
              className="aspect-[4/3]"
            />
          </div>

          <ol ref={listRef} className="relative">
            <div className="absolute bottom-10 left-[15px] top-10 w-px bg-[var(--offer-line)]" aria-hidden="true" />
            <div
              className="offer-progress absolute left-[15px] top-10 w-px origin-top bg-[var(--offer-navy)] transition-transform duration-500 ease-out"
              style={{ height: 'calc(100% - 5rem)', transform: `scaleY(${STEPS.length <= 1 ? 1 : active / (STEPS.length - 1)})` }}
              aria-hidden="true"
            />
            {STEPS.map((step, index) => {
              const current = index === active;
              const reached = index <= active;
              return (
                <li
                  key={step.title}
                  data-step
                  aria-current={current ? 'step' : undefined}
                  className={`relative py-6 pl-14 transition-colors ${current ? 'opacity-100' : 'opacity-80'} hover:opacity-100`}
                >
                  <span
                    className={`absolute left-[9px] top-9 h-3.5 w-3.5 rounded-full border transition-colors ${
                      reached
                        ? 'border-[var(--offer-navy)] bg-[var(--offer-navy)]'
                        : 'border-[var(--offer-line)] bg-[var(--offer-bg)]'
                    }`}
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-[var(--offer-muted)]">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-20 border-t border-[var(--offer-line)] pt-16 md:mt-28">
          <Reveal>
            <h3 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-balance md:text-5xl md:leading-[1.12]">
              The credit stays with them.
            </h3>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--offer-muted)] md:text-xl">
              Your client's people show up to meetings with what they built. We don't play the hero. That is why the work keeps going.
            </p>
          </Reveal>
          <p className="mt-10 max-w-2xl leading-relaxed text-[var(--offer-muted)]">
            We currently co-manage in Grok Bot. We are platform-agnostic, so if a better system appears, we move with it.
          </p>
        </div>
      </div>
    </section>
  );
}

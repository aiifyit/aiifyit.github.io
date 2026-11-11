import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import OfferPhoto from './OfferPhoto';

const STEPS = [
  {
    title: '1. Setup',
    body: "We configure the swarm around the work your client's people already do. Nothing generic.",
    position: '34% 44%',
  },
  {
    title: '2. Build-with-you sessions',
    body: 'Each person who will use the system gets a working session, about 30 minutes a week at the start. We build with them live on the call. They leave with something real, not a training deck.',
    position: '58% 40%',
  },
  {
    title: '3. Daily remote care',
    body: "Our people log into the client's agent account every day. We see what is moving and where people are stuck, and we push the work through.",
    position: '28% 58%',
  },
  {
    title: '4. Quarterly aim',
    body: "Each quarter, the client's goals go into the system. Co-management then aims at what matters now, not what mattered at kickoff.",
    position: '74% 38%',
  },
];

export default function StepSequence() {
  const listRef = useRef<HTMLOListElement>(null);
  const lock = useRef(0);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      if (performance.now() < lock.current) return;
      const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
      const marker = window.innerHeight * 0.46;
      let current = 0;
      steps.forEach((step, index) => {
        if (step.getBoundingClientRect().top < marker) current = index;
      });
      setActive((prev) => (prev === current ? prev : current));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const showStep = (index: number, behavior: ScrollBehavior) => {
    lock.current = performance.now() + (behavior === 'smooth' ? 800 : 250);
    setActive(index);
    listRef.current?.querySelectorAll<HTMLElement>('[data-step]')[index]?.scrollIntoView({ behavior, block: 'center' });
  };

  return (
    <section id="co-management" className="scroll-mt-24" aria-labelledby="co-management-heading">
      <div className="lg:grid lg:grid-cols-2">
        <div className="relative h-[62vh] min-h-[320px] lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)]">
          <OfferPhoto
            name="built-with-you"
            alt="Two colleagues at a conference table, one holding a pen, looking toward a large screen"
            position={STEPS[active].position}
            bleed
            look
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1714]/75 via-[#1a1714]/35 to-transparent p-5 pt-20 sm:p-7">
            <label className="block">
              <span className="sr-only">Co-management steps</span>
              <input
                type="range"
                className="offer-scrub"
                min={0}
                max={STEPS.length - 1}
                step={1}
                value={active}
                aria-valuetext={STEPS[active].title}
                onChange={(event) => showStep(Number(event.target.value), reduced ? 'auto' : 'smooth')}
              />
            </label>
            <p className="mt-3 text-sm font-semibold tracking-tight text-[#f6f1e8]">{STEPS[active].title}</p>
          </div>
        </div>

        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-20">
          <h2 id="co-management-heading" className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
            Not a tool. Not a course. A team that stays.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--offer-muted)]">
            We set up the agent swarm with your client's team and then co-manage it with them, week after week.
          </p>
          <ol ref={listRef} className="relative mt-8">
            <div className="absolute bottom-6 left-[15px] top-6 w-px bg-[var(--offer-line)]" aria-hidden="true" />
            <div
              className="offer-progress absolute left-[15px] top-6 w-px origin-top bg-[var(--offer-navy)]"
              style={{ height: 'calc(100% - 3rem)', transform: `scaleY(${active / (STEPS.length - 1)})` }}
              aria-hidden="true"
            />
            {STEPS.map((step, index) => {
              const current = index === active;
              return (
                <li key={step.title} data-step className="lg:min-h-[58vh]">
                  <button
                    type="button"
                    aria-current={current ? 'step' : undefined}
                    onClick={() => showStep(index, reduced ? 'auto' : 'smooth')}
                    className={`relative w-full py-7 pl-12 text-left transition-colors ${current ? 'opacity-100' : 'opacity-65 hover:opacity-100'}`}
                  >
                    <span
                      className={`absolute left-[9px] top-9 h-3.5 w-3.5 rounded-full border ${current ? 'border-[var(--offer-navy)] bg-[var(--offer-navy)]' : 'border-[var(--offer-line)] bg-[var(--offer-bg)]'}`}
                      aria-hidden="true"
                    />
                    <h3 className={`tracking-tight ${current ? 'text-2xl font-semibold md:text-3xl' : 'text-xl font-semibold'}`}>{step.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-[var(--offer-muted)]">{step.body}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

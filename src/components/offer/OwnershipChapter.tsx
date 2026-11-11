import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import OfferPhoto from './OfferPhoto';

const POINTS = [
  {
    title: 'The relationship.',
    body: 'The offer carries your name. You own the client.',
    position: '50% 28%',
  },
  {
    title: 'The client-specific work.',
    body: 'The instructions, playbooks, and agent setups built for your clients belong to you.',
    position: '48% 70%',
  },
  {
    title: 'The long view.',
    body: 'We plan to stay for the long term and keep adjusting with you as the work changes.',
    position: '42% 32%',
  },
];

const QUESTIONS = [
  {
    q: 'Will my clients know AIify is involved?',
    a: "The offer runs under your name. Our team works with your clients' people as part of your delivery. You own the relationship and decide how we're introduced.",
  },
  {
    q: "Shouldn't we just build this team internally?",
    a: "We can help you do that later. It's rarely cheaper, because you'd have to hire, train, and manage the people yourself. This model gives you the margin without the headcount.",
  },
  {
    q: 'Is this just software?',
    a: "No. The software is a small part of the offer. What you're offering is setup, weekly sessions where we build with each person, daily hands-on care, and quarterly direction.",
  },
];

export default function OwnershipChapter() {
  const [pinned, setPinned] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [question, setQuestion] = useState(0);
  const reduced = useReducedMotion() === true;
  const active = hover ?? pinned;

  const onTabKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const next = forward ? (index + 1) % QUESTIONS.length : (index - 1 + QUESTIONS.length) % QUESTIONS.length;
    setQuestion(next);
    document.getElementById(`offer-q-${next}`)?.focus();
  };

  return (
    <section id="ownership" className="scroll-mt-24 lg:grid lg:grid-cols-2" aria-labelledby="ownership-heading">
      <div className="relative h-[58vh] min-h-[300px] lg:sticky lg:top-16 lg:order-2 lg:h-[calc(100svh-4rem)]">
        <OfferPhoto
          name="you-keep-the-client"
          alt="Two people at a marble table reviewing a printed page together"
          position={POINTS[active].position}
          bleed
          look
        />
      </div>
      <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-20">
        <h2 id="ownership-heading" className="max-w-xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
          The client is yours. So is what we build for them.
        </h2>
        <div className="mt-8 max-w-xl border-b border-[var(--offer-line)]" onMouseLeave={() => setHover(null)}>
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
                className={`block w-full border-t border-[var(--offer-line)] px-4 py-5 text-left transition-colors ${current ? 'bg-white/75 shadow-[inset_3px_0_0_var(--offer-brass)]' : 'hover:bg-white/45'}`}
              >
                <span className="font-semibold">{point.title}</span>
                <span className="mt-2 block leading-relaxed text-[var(--offer-muted)]">{point.body}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-8 max-w-xl leading-relaxed text-[var(--offer-muted)]">
          We keep our own methods. Everything we build for a client is, at bottom, a set of instructions for agents, and those instructions stay with you.
        </p>

        <h3 className="mt-16 text-2xl font-semibold tracking-tight">Three questions partners ask</h3>
        <div role="tablist" aria-label="Three questions partners ask" className="mt-6 max-w-xl border-b border-[var(--offer-line)]">
          {QUESTIONS.map((item, index) => {
            const selected = index === question;
            return (
              <button
                key={item.q}
                id={`offer-q-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="offer-q-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setQuestion(index)}
                onMouseEnter={() => setQuestion(index)}
                onKeyDown={(event) => onTabKey(event, index)}
                className={`relative block w-full border-t border-[var(--offer-line)] py-4 text-left text-lg font-semibold transition-colors ${selected ? 'text-[var(--offer-ink)]' : 'text-[var(--offer-muted)] hover:text-[var(--offer-ink)]'}`}
              >
                {item.q}
                {selected ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--offer-brass)]" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        <div role="tabpanel" id="offer-q-panel" aria-labelledby={`offer-q-${question}`} className="max-w-xl pt-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={QUESTIONS[question].q}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="leading-relaxed text-[var(--offer-muted)]"
            >
              {QUESTIONS[question].a}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

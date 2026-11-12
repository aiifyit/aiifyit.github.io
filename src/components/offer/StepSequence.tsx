import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import partnerCopy from '../../data/offerCopy.json';

type Copy = typeof partnerCopy;
import { StepGraphic } from './OfferGraphics';
import { OfferHeading } from './OfferMotion';

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia('(min-width:900px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
export default function StepSequence({ copy = partnerCopy, sectionId = 'co-management', variant = 'partner' }: { copy?: Copy; sectionId?: string; variant?: 'partner' | 'direct' }) {
  const last = Math.max(copy.model.steps.length - 1, 0);
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia('(min-width:900px)').matches, () => false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const selecting = useRef(false);
  const selectionTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(selectionTimer.current), []);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] });
  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (!window.matchMedia('(min-width:900px)').matches || selecting.current) return;
    const steps = ref.current?.querySelectorAll<HTMLElement>('.offer-step-row');
    if (!steps) return;
    let closest = 0, distance = Infinity;
    steps.forEach((step, i) => { const r = step.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2); if (d < distance) { distance = d; closest = i; } });
    setActive(closest);
  });
  function select(index: number) {
    selecting.current = true;
    window.clearTimeout(selectionTimer.current);
    selectionTimer.current = window.setTimeout(() => { selecting.current = false; }, 1200);
    setActive(index);
    document.getElementById(`offer-step-${index}`)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  }
  return <section id={sectionId} className="offer-model offer-section" aria-labelledby={`${sectionId}-heading`}><div className="offer-wrap">
    <p className="offer-eyebrow">{copy.model.label}</p><div className="offer-intro offer-how-intro"><OfferHeading id={`${sectionId}-heading`}>{copy.model.heading}</OfferHeading><p className="offer-prose">{copy.model.body}</p></div>
    <div className="offer-how-grid" ref={ref}>
      <svg className="offer-step-connector" viewBox="0 0 20 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M10 0V1000" stroke="#A3D7E233"/><motion.path d="M10 0V1000" stroke="#7DC1D0" strokeWidth="2" style={{ pathLength: reduced ? 1 : scrollYProgress }}/><motion.circle cx="10" r="4" fill="#7DC1D0" animate={{ cy: active * 200 + 100 }} transition={{ duration: reduced ? 0 : .5 }}/></svg>
      <div className="offer-step-list" role={desktop ? "tablist" : "group"} aria-orientation={desktop ? "vertical" : undefined} aria-label={copy.model.label}>{copy.model.steps.map((step,i) => <article id={`offer-step-${i}`} key={step.title} role={desktop ? "presentation" : undefined} className={`offer-step-row ${active === i ? 'is-active' : ''}`}>
        <button id={`offer-step-button-${i}`} role={desktop ? "tab" : undefined} aria-selected={desktop ? active === i : undefined} aria-pressed={desktop ? undefined : active === i} tabIndex={desktop && active !== i ? -1 : 0} aria-controls={desktop ? "offer-step-display" : undefined} onClick={() => select(i)} onKeyDown={event => {
          let next = i;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i+1)%copy.model.steps.length;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i+last)%copy.model.steps.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = last;
          else return;
          event.preventDefault(); select(next); document.getElementById(`offer-step-button-${next}`)?.focus({ preventScroll: true });
        }}><span className="offer-step-index" aria-hidden="true">0{i+1}</span><span><span className="offer-step-title">{step.title}</span><span className="offer-step-body">{step.body}</span></span></button>
        <div className="offer-mobile-step"><StepGraphic step={i} variant={variant}/></div>
      </article>)}</div>
      <div className="offer-step-sticky" id="offer-step-display" role={desktop ? "tabpanel" : undefined} tabIndex={desktop ? 0 : undefined} aria-labelledby={desktop ? `offer-step-button-${active}` : undefined}><div className="offer-step-stage"><AnimatePresence mode="wait" initial={false}><motion.div key={active} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0 }} transition={{ duration: .22 }}><StepGraphic step={active} variant={variant}/></motion.div></AnimatePresence></div><p className="offer-step-caption"><span>0{active+1} / 0{copy.model.steps.length}</span>{copy.model.steps[active].title}</p></div>
    </div><p className="offer-platform">{copy.model.platform}</p>
  </div></section>;
}

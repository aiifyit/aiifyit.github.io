import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import copy from '../../data/offerCopy.json';
import OfferPhoto from './OfferPhoto';

const FRAMES = [
  { name: 'built-with-you', position: '50% 50%', zoom: 1, alt: 'Two colleagues building a workflow together on a laptop at a workshop workbench' },
  { name: 'built-with-you', position: '62% 58%', zoom: 1.25, alt: 'A close view of two colleagues working on the laptop together' },
  { name: 'built-with-you', position: '55% 80%', zoom: 1.55, alt: 'The laptop on the workbench during a working session' },
  { name: 'they-get-the-credit', position: '42% 55%', zoom: 1.25, alt: 'A close view of a live dashboard on a tablet in a plant nursery' },
  { name: 'they-get-the-credit', position: '50% 50%', zoom: 1, alt: 'A business owner showing a live dashboard on a tablet to a colleague in a plant nursery' },
];

export default function StepSequence() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const step = copy.model.steps[active];
  return (
    <section id="co-management" className="offer-model offer-section" aria-labelledby="co-management-heading">
      <div className="offer-wrap">
        <div className="offer-intro"><h2 id="co-management-heading">{copy.model.heading}</h2><p className="offer-prose">{copy.model.body}</p></div>
        <p className="offer-eyebrow mb-5">{copy.model.label}</p>
        <div className="offer-beats" role="tablist" aria-label={copy.model.label}>
          {copy.model.steps.map((item, index) => (
            <button key={item.title} id={`offer-beat-${index}`} type="button" role="tab" aria-selected={active === index}
              aria-controls="offer-beat-panel" tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % FRAMES.length;
                else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + FRAMES.length - 1) % FRAMES.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = FRAMES.length - 1;
                else return;
                event.preventDefault(); setActive(next); document.getElementById(`offer-beat-${next}`)?.focus();
              }}><span>0{index + 1}</span>{item.title}</button>
          ))}
        </div>
        <div id="offer-beat-panel" role="tabpanel" aria-labelledby={`offer-beat-${active}`} tabIndex={0} className="offer-sequence-panel">
          <motion.div key={active} initial={reduced ? false : { opacity: 0.65 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="offer-sequence-photo">
            <OfferPhoto {...FRAMES[active]} bleed />
          </motion.div>
          <div className="offer-beat-copy"><span className="offer-beat-number" aria-hidden="true">0{active + 1}</span><h3>{step.title}</h3><p>{step.body}</p></div>
        </div>
        <p className="offer-platform">{copy.model.platform}</p>
      </div>
    </section>
  );
}

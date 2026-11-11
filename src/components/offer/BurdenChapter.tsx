import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import copy from '../../data/offerCopy.json';
import Reveal from './Reveal';

const items = copy.burden.items;

export default function BurdenChapter() {
  const reduced = useReducedMotion() === true;
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, margin: '-120px 0px' });
  const [handled, setHandled] = useState<boolean[]>(() => items.map(() => false));
  const [touched, setTouched] = useState(false);
  const allHandled = handled.every(Boolean);

  useEffect(() => {
    if (!inView || touched) return;
    const timers = items.map((_, i) => window.setTimeout(() => {
      setHandled((prev) => prev.map((value, j) => (j === i ? true : value)));
    }, reduced ? 0 : 500 + i * 260));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, reduced, touched]);

  const toggle = (index: number) => {
    setTouched(true);
    setHandled((prev) => prev.map((value, j) => (j === index ? !value : value)));
  };
  const setAll = (value: boolean) => {
    setTouched(true);
    setHandled(items.map(() => value));
  };
  const count = handled.filter(Boolean).length;

  return (
    <section id="burden" className="offer-burden offer-section" aria-labelledby="burden-heading">
      <div className="offer-wrap">
        <div className="offer-burden-head">
          <div>
            <p className="offer-eyebrow">{copy.burden.label}</p>
            <Reveal><h2 id="burden-heading">{copy.burden.heading}</h2></Reveal>
            <p className="offer-burden-body">{copy.burden.body}</p>
          </div>
          <div className="offer-burden-controls">
            <p className="offer-burden-count" aria-live="polite"><strong>{count}</strong> of {items.length} handled by AIify</p>
            <div className="offer-burden-switch" role="group" aria-label="Compare doing it yourself with partnering">
              <button type="button" aria-pressed={!allHandled && count === 0} onClick={() => setAll(false)}>On your own</button>
              <button type="button" aria-pressed={allHandled} onClick={() => setAll(true)}>With AIify</button>
            </div>
          </div>
        </div>
        <ul ref={listRef} className="offer-burden-list">
          {items.map((item, i) => (
            <li key={item.task}>
              <button type="button" className="offer-burden-item" aria-pressed={handled[i]} onClick={() => toggle(i)} data-handled={handled[i] ? 'true' : 'false'}>
                <span className="offer-burden-mark" aria-hidden="true">{handled[i] ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span className="offer-burden-task-wrap"><span className="offer-burden-task">{item.task}</span></span>
                <motion.span
                  className="offer-burden-handled"
                  initial={false}
                  animate={handled[i] ? { opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : -8 }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                >
                  {item.handled}
                </motion.span>
                <span className="sr-only">{handled[i] ? ' (handled by AIify)' : ' (on you)'}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="offer-burden-close">
          <p>{copy.burden.closing}</p>
          <a href="#quote" className="offer-btn">{copy.cta}</a>
        </div>
      </div>
    </section>
  );
}

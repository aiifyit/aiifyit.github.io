import { useMagnetic } from './useMagnetic';
import { useRef, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';

export function GraphicFrame({ children, label, className = '' }: { children: (running: boolean) => ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '40px' });
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 22 }), sy = useSpring(y, { stiffness: 90, damping: 22 });
  return <motion.div ref={ref} className={`offer-graphic offer-glass ${className}`} data-paused={!visible || reduced} style={{ x: sx, y: sy }} onPointerMove={e => {
    if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - bounds.left) / bounds.width - .5) * 9;
    const dy = ((e.clientY - bounds.top) / bounds.height - .5) * 7;
    x.set(dx); y.set(dy);
    e.currentTarget.style.setProperty('--offer-pointer-x', `${dx}px`);
    e.currentTarget.style.setProperty('--offer-pointer-y', `${dy}px`);
  }} onPointerLeave={e => { x.set(0); y.set(0); e.currentTarget.style.setProperty('--offer-pointer-x', '0px'); e.currentTarget.style.setProperty('--offer-pointer-y', '0px'); }} role="img" aria-label={label}>{children(visible && !reduced)}</motion.div>;
}
export function Packet({ path, running, delay = 0, duration = 4 }: { path: string; running: boolean; delay?: number; duration?: number }) {
  return running ? <circle r="3" fill="#A3D7E2" className="offer-data-dot"><animateMotion path={path} dur={`${duration}s`} begin={`${-delay}s`} repeatCount="indefinite" /></circle> : null;
}
export function OfferHeading({ children, id, tabIndex }: { children: string; id: string; tabIndex?: number }) {
  const reduced = useReducedMotion();
  return <motion.h2 id={id} tabIndex={tabIndex} aria-label={children} initial="hidden" whileInView="shown" viewport={{ once: true, amount: .4 }} transition={{ staggerChildren: reduced ? 0 : .035 }}>{children.split(' ').map((word, i) => <motion.span key={i} aria-hidden="true" className="offer-heading-word" variants={{ hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }, shown: { opacity: 1, y: 0 } }} transition={{ duration: .45 }}>{word}{'\u00a0'}</motion.span>)}</motion.h2>;
}
export function QuoteButton({ small = false }: { small?: boolean }) {
  const magnetic = useMagnetic();
  return <motion.a href="#quote" className={`offer-btn ${small ? 'offer-btn-sm' : ''}`} {...magnetic}>Get a quote</motion.a>;
}

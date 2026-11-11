import { type PointerEvent } from 'react';
import { useMotionValue, useReducedMotion } from 'framer-motion';

export function useMagnetic() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  return { style: { x, y }, onPointerMove: (e: PointerEvent<HTMLElement>) => {
    if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
    const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * .08); y.set((e.clientY - r.top - r.height / 2) * .12);
  }, onPointerLeave: () => { x.set(0); y.set(0); } };
}

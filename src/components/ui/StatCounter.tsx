import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function StatCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const currentValue = useCountUp(value, duration, isInView);

  return (
    <span ref={ref}>
      {prefix}
      {currentValue}
      {suffix}
    </span>
  );
}

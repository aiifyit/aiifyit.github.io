import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface OfferPhotoProps {
  name: string;
  alt: string;
  position: string;
  priority?: boolean;
  className?: string;
  bleed?: boolean;
  still?: boolean;
  look?: boolean;
}

function parsePosition(position: string) {
  const [xRaw, yRaw] = position.trim().split(/\s+/);
  const x = Number.parseFloat(xRaw ?? '50');
  const y = Number.parseFloat(yRaw ?? '50');
  return { x: Number.isFinite(x) ? x : 50, y: Number.isFinite(y) ? y : 50 };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function OfferPhoto({
  name,
  alt,
  position,
  priority = false,
  className = '',
  bleed = false,
  still = false,
  look = false,
}: OfferPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() === true;
  const [fine, setFine] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  const frameRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.16]);
  const drift = !reduced && !still;
  const interactive = look && fine && !reduced;
  const base = parsePosition(position);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    offsetRef.current = {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 14,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 10,
    };
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      setOffset(offsetRef.current);
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      className={`offer-photo overflow-hidden bg-[#e7e1d6] ${bleed ? 'absolute inset-0 h-full w-full' : 'relative'} ${interactive ? 'cursor-crosshair' : ''} ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <motion.div className="h-full w-full" style={drift ? { y, scale } : undefined}>
        <picture className="block h-full">
          <source srcSet={`/images/offer/${name}.webp`} type="image/webp" />
          <img
            src={`/images/offer/${name}.jpg`}
            alt={alt}
            width={1280}
            height={720}
            draggable={false}
            className="h-full w-full max-w-none object-cover"
            style={{
              objectPosition: `${clamp(base.x + offset.x, 8, 92)}% ${clamp(base.y + offset.y, 8, 92)}%`,
              transition: reduced ? 'none' : 'object-position 220ms linear',
            }}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
          />
        </picture>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(18,14,10,0.22)]" aria-hidden="true" />
    </div>
  );
}

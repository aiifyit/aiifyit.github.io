import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface OfferPhotoProps {
  name: string;
  alt: string;
  position: string;
  priority?: boolean;
  className?: string;
}

export default function OfferPhoto({ name, alt, position, priority = false, className = '' }: OfferPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  return (
    <motion.div
      ref={ref}
      className={`offer-photo relative overflow-hidden rounded-2xl bg-[#e7e1d6] shadow-[0_30px_70px_-46px_rgba(28,25,21,0.65)] ring-1 ring-black/5 ${className}`}
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div className="h-full w-full" style={reduced ? undefined : { y }}>
        <picture className="block h-full">
          <source srcSet={`/images/offer/${name}.webp`} type="image/webp" />
          <img
            src={`/images/offer/${name}.jpg`}
            alt={alt}
            width={1280}
            height={720}
            className={`w-full max-w-none object-cover ${reduced ? 'h-full' : 'h-[114%] -mt-[7%]'}`}
            style={{ objectPosition: position }}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
          />
        </picture>
      </motion.div>
    </motion.div>
  );
}

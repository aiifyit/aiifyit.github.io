interface OfferPhotoProps {
  name: string;
  alt: string;
  position?: string;
  priority?: boolean;
  className?: string;
  bleed?: boolean;
  zoom?: number;
}

export default function OfferPhoto({ name, alt, position = '50% 50%', priority = false, className = '', bleed = false, zoom = 1 }: OfferPhotoProps) {
  return (
    <div className={`offer-photo ${bleed ? 'absolute inset-0' : 'relative'} ${className}`}>
      <picture>
        <source srcSet={`/images/offer/${name}.webp`} type="image/webp" />
        <img src={`/images/offer/${name}.jpg`} alt={alt} width={1280} height={720}
          style={{ objectPosition: position, transform: `scale(${zoom})`, transformOrigin: position }}
          loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined} />
      </picture>
    </div>
  );
}

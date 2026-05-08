interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-10' }: LogoProps) {
  return (
    <video
      src="/images/team/hero-video.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label="AIify"
      className={`${className} w-auto object-contain`}
    />
  );
}

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-10' }: LogoProps) {
  return (
    <picture>
      <source srcSet="/images/aiify-logo.webp" type="image/webp" />
      <img
        src="/images/aiify-logo.png"
        alt="AIify"
        width={631}
        height={167}
        className={`${className} w-auto object-contain`}
      />
    </picture>
  );
}

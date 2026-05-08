import Container from '../ui/Container';
import { SOCIAL_PROOF_LOGOS } from '../../data/constants';

function LogoWordmark({ name }: { name: string }) {
  return (
    <span className="text-lg md:text-xl font-semibold whitespace-nowrap opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 text-[var(--color-text)] select-none px-8">
      {name}
    </span>
  );
}

export default function SocialProof() {
  return (
    <section id="social-proof" className="py-12 md:py-16 overflow-hidden">
      <Container>
        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest text-center mb-8">
          Professionals from leading firms trust AIify
        </p>
      </Container>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {/* Duplicate logo set for seamless loop */}
          {[...SOCIAL_PROOF_LOGOS, ...SOCIAL_PROOF_LOGOS].map((logo, i) => (
            <LogoWordmark key={`${logo}-${i}`} name={logo} />
          ))}
        </div>
      </div>
    </section>
  );
}

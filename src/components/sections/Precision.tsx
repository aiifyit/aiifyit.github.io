import { Check } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import ScrollReveal from '../ui/ScrollReveal';
import {
  PRECISION_HEADING,
  PRECISION_BODY,
  PRECISION_BULLETS,
  PRECISION_CLOSING,
} from '../../data/constants';

export default function Precision() {
  return (
    <section id="precision" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading heading={PRECISION_HEADING} align="left" />

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <ScrollReveal>
            <div>
              <p className="text-base leading-relaxed text-[var(--color-text-muted)] mb-8">
                {PRECISION_BODY}
              </p>

              <ul className="flex flex-col gap-5">
                {PRECISION_BULLETS.map((bullet) => (
                  <li key={bullet.title} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 mt-1 text-[var(--color-accent)] shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-semibold text-[var(--color-text)]">
                        {bullet.title}:
                      </span>{' '}
                      <span className="text-[var(--color-text-muted)]">
                        {bullet.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-lg font-semibold text-[var(--color-text)]">
                {PRECISION_CLOSING}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <img
              src="/images/team/precision-workspace.jpg"
              alt="Office workspace"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover rounded-2xl border border-[var(--color-border-subtle)]"
            />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}

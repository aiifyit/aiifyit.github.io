import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import StatCounter from '../ui/StatCounter';
import ScrollReveal from '../ui/ScrollReveal';
import { RESULTS_HEADING, RESULTS_SUBHEADING, RESULTS_STATS } from '../../data/constants';

export default function Results() {
  return (
    <section id="results" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading
          heading={RESULTS_HEADING}
          subheading={RESULTS_SUBHEADING}
          subheadingClassName="italic"
        />

        <div className="max-w-4xl mx-auto">
          {RESULTS_STATS.map((stat, i) => (
            <ScrollReveal key={stat.description} delay={i * 0.1}>
              <div
                className={`flex flex-col md:flex-row md:items-center gap-4 md:gap-12 py-8 ${
                  i < RESULTS_STATS.length - 1
                    ? 'border-b border-[var(--color-border-subtle)]'
                    : ''
                }`}
              >
                <div className="text-4xl md:text-5xl font-bold text-[var(--color-text)] shrink-0 md:w-56 md:text-right">
                  <StatCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

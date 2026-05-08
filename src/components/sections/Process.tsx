import { ClipboardCheck, Bot, Rocket } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import GradientText from '../ui/GradientText';
import Card from '../ui/Card';
import ScrollReveal from '../ui/ScrollReveal';
import { PROCESS_HEADING, PROCESS_SUBHEADING, PROCESS_STEPS } from '../../data/constants';

const iconMap: Record<string, React.ReactNode> = {
  ClipboardCheck: <ClipboardCheck className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Rocket: <Rocket className="w-8 h-8" />,
};

export default function Process() {
  return (
    <section id="process" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading
          heading={
            <>
              {PROCESS_HEADING} <GradientText>AIified</GradientText> Operation
            </>
          }
          subheading={PROCESS_SUBHEADING}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Dashed connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed border-[var(--color-border)] -translate-y-1/2 -z-10"
            aria-hidden="true"
          />

          {PROCESS_STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <Card className="h-full relative">
                <span className="text-5xl font-bold text-[var(--color-accent)] opacity-30 mb-4 block">
                  {step.number}
                </span>
                <div className="text-[var(--color-accent)] mb-4">
                  {iconMap[step.iconName]}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

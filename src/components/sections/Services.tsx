import { Workflow, TrendingUp, ShieldCheck, Bot, Plug } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Card from '../ui/Card';
import ScrollReveal from '../ui/ScrollReveal';
import {
  SERVICES_HEADING,
  SERVICES_SUBHEADING,
  SERVICES,
  SERVICES_FULL_WIDTH,
} from '../../data/constants';

const iconMap: Record<string, React.ReactNode> = {
  Workflow: <Workflow className="w-8 h-8" />,
  TrendingUp: <TrendingUp className="w-8 h-8" />,
  ShieldCheck: <ShieldCheck className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Plug: <Plug className="w-8 h-8" />,
};

export default function Services() {
  return (
    <section id="services" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading
          heading={SERVICES_HEADING}
          subheading={SERVICES_SUBHEADING}
        />

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 0.1}>
              <Card className="h-full">
                <div className="text-[var(--color-accent)] mb-4">
                  {iconMap[service.iconName]}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {service.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Full-width card */}
        <ScrollReveal delay={0.4}>
          <Card>
            <div className="text-[var(--color-accent)] mb-4">
              {iconMap[SERVICES_FULL_WIDTH.iconName]}
            </div>
            <h3 className="text-xl font-bold mb-3">{SERVICES_FULL_WIDTH.title}</h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              {SERVICES_FULL_WIDTH.description}
            </p>
          </Card>
        </ScrollReveal>
      </Container>
    </section>
  );
}

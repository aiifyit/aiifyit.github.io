import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import GradientText from '../ui/GradientText';
import ScrollReveal from '../ui/ScrollReveal';
import { ABOUT_SUBHEADING, ABOUT_BODY, TEAM_MEMBERS } from '../../data/constants';

export default function About() {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading
          heading={
            <>
              About <GradientText>AIify</GradientText>
            </>
          }
        />

        <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* Team group photo */}
            <img
              src="/images/team/team-group.jpg"
              alt="The AIify team"
              loading="lazy"
              decoding="async"
              width={1600}
              height={1200}
              className="aspect-[4/3] w-full object-cover rounded-2xl border border-[var(--color-border-subtle)]"
            />

            {/* Copy */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {ABOUT_SUBHEADING}
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                {ABOUT_BODY}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Team Grid */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-10 max-w-5xl mx-auto">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center w-40">
                <div className="w-28 h-28 rounded-full overflow-hidden border border-[var(--color-border-subtle)] mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    style={{
                      objectPosition: member.objectPosition ?? 'center',
                      transform: `scale(${member.scale ?? 1})`,
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-bold text-[var(--color-text)]">{member.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{member.title}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

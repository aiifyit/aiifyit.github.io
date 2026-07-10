import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import GradientText from '../ui/GradientText';
import ScrollReveal from '../ui/ScrollReveal';
import { ABOUT_SUBHEADING, ABOUT_BODY, TEAM_SUBHEADING, TEAM_MEMBERS } from '../../data/constants';

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
              width={1672}
              height={941}
              className="aspect-video w-full object-cover rounded-2xl border border-[var(--color-border-subtle)]"
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
          <div className="text-center mb-10 md:mb-14">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
              Meet the <GradientText>Team</GradientText>
            </h3>
            <p className="mt-4 text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
              {TEAM_SUBHEADING}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-14 max-w-4xl mx-auto">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center">
                <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden border border-[var(--color-border-subtle)] mb-5">
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
                <p className="text-lg md:text-xl font-bold text-[var(--color-text)]">{member.name}</p>
                <p className="mt-1 text-sm md:text-base text-[var(--color-text-muted)]">{member.title}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

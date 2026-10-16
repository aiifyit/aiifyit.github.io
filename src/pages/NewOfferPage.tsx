import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { INQUIRY_EMAIL } from '../data/inquiry';

const PAGE_TITLE = 'Where to aim AI | The Lever Loop | AIify';

const GOAL_CALL_BODY = [
  'Hi Joshua,',
  '',
  'I want to book a call about The Lever Loop.',
  '',
  'The business:',
  '',
  'What I am already pushing this quarter:',
  '',
  'Where I suspect the money is, if I have a hunch:',
  '',
].join('\n');

const GOAL_CALL_MAILTO = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('Where to aim it')}&body=${encodeURIComponent(GOAL_CALL_BODY)}`;

const AUDIT_PARTS = [
  {
    title: 'Owner economics',
    text: 'Where the money and the time actually sit. Margin, cost, the sale, the hours. We aim at value, not at whatever tool is popular this month.',
  },
  {
    title: 'Outside-in research',
    text: 'What is real in your market, set next to what is being sold as the next big move. Most of the fifty ideas die here.',
  },
  {
    title: 'Inside-out data',
    text: 'Your file, your jobs, your routes, your numbers. The aim has to fit this company. A messy file is a normal place to start.',
  },
  {
    title: 'Opportunity scoring',
    text: 'Each surviving move is scored on size, speed, what it costs to prove, and how sure we can be. One of them should be obvious. If none is, we say so.',
  },
  {
    title: 'The Lever Map',
    text: 'One page. The place we will aim, what we will build, and what your numbers have to show before we do anything bigger.',
  },
];

const SPRINT_WORK = [
  'The operation, automated where the rule is clear enough to trust.',
  'A lead test, when a lead test is the lever: a control group, and a kill line and a scale line written before the first dollar.',
  'The data, read in the numbers you already use to run the company.',
  'A custom tool, built by our developers, when a tool is the move that pays.',
];

const REASONS = [
  {
    title: 'We aim before we build',
    text: 'The field is full of moves. The audit throws out the ones that do not pay in your business. We do not start with a tool and go looking for a use for it.',
  },
  {
    title: 'Proof in your numbers',
    text: 'A bigger bet follows a result you can read. If the move spends money, that spend is tracked and it has a kill line. If the move is inside the operation, the proof is hours, cost, or margin. Same rule either way.',
  },
  {
    title: 'Constraint first',
    text: 'Eliyahu Goldratt’s book The Goal is plain about this. A business moves at the speed of its constraint. The highest-value place to aim is the constraint on the outcome you already want. Work anywhere else feels busy and does not change the result.',
  },
  {
    title: 'Builders, not advisors',
    text: 'The person on the research and the data stays with the developers who build. You are not left with a deck to assign. You end the quarter with something running.',
  },
  {
    title: 'Skin in the game',
    text: 'The audit fee comes back if we cannot find a lever worth ten times that fee. If we miss work we promised to ship, the next month is half price. You can add a bonus that is paid only if the outcome we agreed is hit.',
  },
  {
    title: 'A weekly scoreboard',
    text: 'You should see the proof while it is forming. The scoreboard is short. The lever is on it. So is the number we said would move. So is what we stopped.',
  },
];

const GET_ITEMS = [
  'A quarter aimed at the priority you are already running.',
  'The Lever Audit and the Lever Map.',
  'A research and data lead, plus developers who build.',
  'One build, 30 to 60 days, on the highest-value place.',
  'Proof in your numbers, with kill and scale lines wherever money is spent.',
  'A weekly scoreboard.',
  'A quarter-end review, then the next place to aim.',
  'Code and data in your company’s name.',
  'An optional bonus, agreed up front, paid only if that outcome is hit.',
];

const GUARANTEES = [
  {
    title: 'Full audit refund',
    text: 'You pay for the Lever Audit. If it does not find a lever worth at least 10 times the audit fee, we refund that fee. “Worth” means the economics on the Lever Map: margin, cost taken out, or a result in the numbers you already run the company on. If we cannot show it, you should not continue.',
  },
  {
    title: 'No dollar moves without a way to read it',
    text: 'If a move costs money to test, we do not spend it until the result will show up in your numbers. A source, a holdout where the list is big enough, a before and after you can audit. If we cannot read it, we do not spend it.',
  },
  {
    title: 'Kill lines written before spend',
    text: 'Every test has a scale line and a kill line before the first invoice. Miss the kill line and the spend stops. We do not renegotiate the line after the money is gone.',
  },
  {
    title: 'Half price next month if we miss on execution',
    text: 'A miss means work we committed, in writing, to ship that month did not ship, and the reason is on our side. The next month is half price. A test that hits its kill line is not a miss. Stopping a loser is the job.',
  },
  {
    title: 'You own the code and the data',
    text: 'What we build for you is yours. The repo, the exports, and the accounts sit with your company. Leaving does not mean leaving the work behind.',
  },
];

const FOR_YOU = [
  'You own or operate a home-service company, a route business, or more than one location, and you want an edge.',
  'You already have the goals, the team, and the capital. You will not spend your week sorting through AI news.',
  'You will open the customer file, the operation, and a rough view of margin, so the aim is yours and not a generic one.',
  'You want the people who find the place to be the people who build it.',
];

const NOT_FOR_YOU = [
  'You want a brand campaign, a logo, or a monthly report of activity.',
  'You want an agency that sells one channel, or a deck you will have to go and execute.',
  'You will not share data. We cannot aim at a business we are not allowed to see.',
  'You want a demo, a chatbot, or a model with no tie to how you make money.',
  'You want the cheapest pair of hands, and you are ready to manage them.',
  'You want advice to hand to another team. This partnership builds.',
];

const QUESTIONS = [
  {
    q: 'We tried agencies.',
    a: 'An agency sells the thing it sells. That can be the right buy when you already know the move. It is the wrong buy when the question is which move, in this business, is worth making. We start from your operation and your numbers. If a test misses its line, it stops, including one we recommended. The scoreboard is the record.',
  },
  {
    q: 'AI is hype.',
    a: 'Most of the fifty moves are. Treat the category that way until a specific move shows up in your numbers. We do not lead with a model. We lead with the place it would have to pay. If that place is a cleaner handoff or a control-group test, that is the work. If it is a tool, our developers build the tool.',
  },
  {
    q: 'My data is a mess.',
    a: 'That is the usual start. The audit is the dig. You do not need a perfect warehouse. You need access, and a team that will sit in the file until it can support a decision about where to aim. If it cannot support one, we will say so, and we will not build on a guess.',
  },
  {
    q: 'How fast does this move?',
    a: 'Your priorities come first, because they tell us where to look. The audit comes before the build. Sprints run 30 to 60 days. Once the work is in motion you get a scoreboard every week. Some levers show a leading number in weeks. A result you would scale is allowed to take the quarter. We prove the first one in your numbers before we ask you to fund the next. This page will not promise you a revenue figure.',
  },
  {
    q: 'What does it cost?',
    a: 'The Lever Audit starts at $7,500. A larger file or more locations can cost more, and we will tell you that number before you agree. The partnership starts at $8,000 a month, scoped for the quarter and agreed on the call, against the place we are aiming. An optional bonus is paid only if the outcome named up front is hit. The buttons on this page do not show a price. The price follows the aim.',
  },
];

const SCOREBOARD_ROWS = [
  ['The lever this quarter', 'blank'],
  ['The proof we are watching', 'blank'],
  ['Your number for that proof', 'blank'],
  ['Money spent, if the lever spends money', 'blank'],
  ['Kill line', 'Written before the work'],
  ['Scale line', 'Written before the work'],
  ['Stopped this week', 'blank'],
  ['Next place to look', 'blank'],
];

function GoalCall({ note }: { note: string }) {
  return (
    <div>
      <Button href={GOAL_CALL_MAILTO} size="lg" className="w-full sm:w-auto">
        Book a call
      </Button>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]">{note}</p>
    </div>
  );
}

export default function NewOfferPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previousContent = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      document.title = previousTitle;
      if (created || previousContent === 'noindex, nofollow') meta?.remove();
      else if (previousContent) meta?.setAttribute('content', previousContent);
    };
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden pt-8 pb-12 md:pt-16 md:pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--color-accent-glow)] blur-3xl md:h-[680px] md:w-[680px]" />
        </div>
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">The Lever Loop · AIify</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              Everyone says AI is huge.
            </h1>
            <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-[var(--color-text)] sm:text-3xl">
              Where's the money in my business, and who's going to do the work?
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                That is the useful question. The Lever Loop is how we answer it. We find the one place AI will pay in your business, our developers build it, we prove it in your numbers, and then we find the next one.
              </p>
              <p>
                You already have the goals, the team, and the capital. You know AI should be an unfair advantage here. What you do not have is a clean way to pick the move, or a team that will both find it and build it while your people keep running the company.
              </p>
            </div>
            <div className="mt-8">
              <GoalCall note={`Opens a draft to ${INQUIRY_EMAIL}. Nothing is sent until you send it. No price on this button.`} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="problem-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="problem-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              You are not short a goal. You are short an aim, and a builder.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Good operators already know what the year is for. The quarter has priorities. The team is busy hitting them. The gap is not ambition. The gap is where, in this business, AI is actually worth pointing.
              </p>
              <p>
                <span className="font-semibold text-[var(--color-text)]">Where.</span> There is no shortage of ideas. A model on the phones. A tool for the office. A test on a new channel. A pass through the customer file. Fifty moves, and a new one every week from someone selling it. You cannot tell which of them would pay here, and you will not give up a week to research it. You are running the company.
              </p>
              <p>
                <span className="font-semibold text-[var(--color-text)]">Who.</span> Your people are already doing the work that makes the money. An agency sells the one thing it sells. A consultant hands you a deck. A freelancer still needs you to manage them. None of those both find the opportunity and build it.
              </p>
              <p>
                <span className="font-semibold text-[var(--color-text)]">Proof.</span> You have heard the pitches. You will put real money behind a move after it shows up in your own numbers. That is the right standard. The first job is a proof you can read, small enough to stop if it misses.
              </p>
              <p className="text-[var(--color-text)]">
                Find the place. Build that one thing. Prove it. Then aim again. That is the whole offer.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="offer-heading">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">The offer</p>
            <h2 id="offer-heading" className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              The Lever Loop
            </h2>
            <p className="mt-4 text-xl leading-relaxed text-[var(--color-text)]">
              AIify’s quarterly operating-partner program.
            </p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                One place. One build. One proof. Then the next place. You are not hiring a demo, and you are not hiring a tour of tools. You are hiring the aim and the build, in the same team.
              </p>
              <p>
                Joshua Pellicer and AIify come in for the quarter as the people who do the work: a lead on the research and the data, and developers who build. The work is custom. Two companies in the same trade can leave with different builds, because the aim comes from the business in front of us.
              </p>
              <p>
                Your own priorities set the context. What you are already pushing this quarter tells us where to look, and which fashionable project to ignore. The partnership is priced per quarter. An optional bonus can be tied to the outcome we name up front. The price is set on the call. It is not printed on the button.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="how-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="how-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              How it works
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Four moves. The same four every quarter. The work inside them changes, because the place worth aiming at changes.
            </p>
          </div>

          <ol className="mx-auto mt-12 max-w-3xl space-y-6">
            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">01</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">Your quarter sets the aim</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                You already know what this quarter is for. A market, a margin, a crew, a line of work. Bring that. We use it as the map. We do not invent a goal for you, and we do not grade you against one. If a project does not touch what you are already pushing, it is not the lever.
              </p>
            </li>

            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">02</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">The Lever Audit</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                Deep research, plus your own data, before anyone builds. The job is to name the highest-value place to aim, and to throw out the moves that are only noise.
              </p>
              <dl className="mt-6 space-y-5">
                {AUDIT_PARTS.map((part) => (
                  <div key={part.title}>
                    <dt className="font-semibold text-[var(--color-text)]">{part.title}</dt>
                    <dd className="mt-1 text-base leading-relaxed text-[var(--color-text-muted)]">{part.text}</dd>
                  </div>
                ))}
              </dl>
            </li>

            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">03</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">30 to 60 day sprints</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                We build that one thing. Not five projects. The sprint uses whatever the lever actually needs.
              </p>
              <ul className="mt-6 space-y-3">
                {SPRINT_WORK.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-[var(--color-text-muted)]">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>

            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">04</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">Prove it, then aim again</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                Every week, one scoreboard. The lever, the proof, what we stopped, what is next. At the end of the quarter we keep what your numbers supported, drop what they did not, and point the next quarter at the next place. Then the loop runs again.
              </p>
              <div className="mt-6 overflow-hidden rounded-xl border border-dashed border-[var(--color-border)]">
                <p className="bg-[var(--color-surface-2)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  Placeholder layout · not a result
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <caption className="sr-only">Empty weekly scoreboard layout. No client numbers.</caption>
                    <thead>
                      <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                        <th scope="col" className="px-4 py-3 font-medium">Line</th>
                        <th scope="col" className="px-4 py-3 font-medium">This week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCOREBOARD_ROWS.map(([line, value]) => (
                        <tr key={line} className="border-b border-[var(--color-border-subtle)] last:border-0">
                          <th scope="row" className="px-4 py-3 font-medium text-[var(--color-text)]">{line}</th>
                          <td className="px-4 py-3 text-[var(--color-text-muted)]">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="px-4 py-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  The cells say “blank” because this is the shape of the weekly scoreboard, not a client’s week. Your numbers go here after the work starts. None are filled in on this page.
                </p>
              </div>
            </li>
          </ol>

          <div className="mx-auto mt-12 max-w-3xl">
            <GoalCall note="If this is the team you wanted on the aim and the build, book the call." />
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="why-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="why-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Why this will work
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Six reasons. Each one is a rule of the work.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {REASONS.map((reason, index) => (
              <article key={reason.title} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{reason.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">{reason.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 max-w-3xl rounded-2xl border border-[var(--color-border-subtle)] p-6 md:p-8">
            <h3 className="text-xl font-bold tracking-tight">A public example. Not your lever, unless the audit says so.</h3>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--color-text-muted)]">
              <p>
                People argue about a lot of moves. Speed to the first reply is one of them, and the public research is old enough to read for yourself. The InsideSales.com / MIT lead-response study, led by James Oldroyd, measured web leads. Its finding: the odds of contacting a lead if called in 5 minutes versus 30 minutes drop 100 times, and the odds of qualifying that lead drop 21 times. The study did not measure close rate. It is a reason to look at first response. It is not a reason to assume first response is your lever.
              </p>
              <p>
                Valve+Meter’s secret-shopper study sent inquiries to 466 U.S. home-service companies. It reported that 95% did not respond within five minutes. That is an industry pattern. It is not a number from a company we work with, and it is not a claim about your shop. If the audit says speed is the place to aim, we prove it on your file before we build anything.
              </p>
              <p className="text-sm">
                Sources:{' '}
                <a className="text-[var(--color-accent)] underline underline-offset-4" href="https://web.archive.org/web/20090529010553/http://www.leadresponsemanagement.org/mit_study" target="_blank" rel="noopener noreferrer">
                  InsideSales.com / MIT lead-response study
                </a>
                {' · '}
                <a className="text-[var(--color-accent)] underline underline-offset-4" href="https://valveandmeter.com/wp-content/uploads/2024/03/VM_Speed2Lead.pdf" target="_blank" rel="noopener noreferrer">
                  Valve+Meter, Speed to Lead in Home Services
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="get-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="get-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              What you get
            </h2>
            <ul className="mt-8 space-y-4">
              {GET_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg leading-relaxed">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="risk-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="risk-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              You should not have to fund a hunch
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              You have the capital. You also have the sense to wait for a result you can read. These terms put the downside of a bad aim on us.
            </p>
            <div className="mt-8 space-y-6">
              {GUARANTEES.map((item) => (
                <article key={item.title}>
                  <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">{item.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-10">
              <GoalCall note="Book the call if the terms are the part you wanted in writing. The button still has no price on it." />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="pay-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="pay-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Optional pay when the agreed outcome hits
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                The quarterly fee pays for the aim and the build. On top of it, you can tie a bonus to the outcome you already care about this quarter. Before the work starts we agree on that outcome, on what counts as hitting it, and on the bonus.
              </p>
              <p>
                Hit it and the bonus is paid. Miss it and the bonus is not paid. The bonus is optional. It does not change the kill lines, and it does not turn the quarter into a hunt for a goal you did not already have.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="fit-heading">
        <Container>
          <h2 id="fit-heading" className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Who this is for
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <h3 className="text-xl font-bold">This is for you if</h3>
              <ul className="mt-5 space-y-4">
                {FOR_YOU.map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed text-[var(--color-text-muted)]">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <h3 className="text-xl font-bold">This is not for you if</h3>
              <ul className="mt-5 space-y-4">
                {NOT_FOR_YOU.map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-relaxed text-[var(--color-text-muted)]">
                    <X className="mt-1 h-5 w-5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="results-placeholder-heading">
        <Container>
          <div className="max-w-3xl rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-10">
            <p className="inline-block rounded bg-[var(--color-accent)] px-2 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-bg)]">
              PLACEHOLDER — not a result
            </p>
            <h2 id="results-placeholder-heading" className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              Past results
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              <p>
                Completed quarters will be listed here only after the numbers are sourced and the client has approved the wording. Nothing in this block is a result.
              </p>
              <p>
                This page does not describe an engagement, name a customer, or show a before and after. If you want proof from a finished quarter, ask on the call. We will tell you what we can share. We will not write a result to fill the space.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-12 md:pb-16 lg:pb-20" aria-labelledby="testimonials-placeholder-heading">
        <Container>
          <div className="max-w-3xl rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-10">
            <p className="inline-block rounded bg-[var(--color-accent)] px-2 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-bg)]">
              PLACEHOLDER — not a testimonial
            </p>
            <h2 id="testimonials-placeholder-heading" className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
              What owners say
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              <p>
                No quotes are published here. A quote will be added only with the client’s written approval, under their name or with a description they accept.
              </p>
              <p>Until that approval exists, this block stays empty on purpose. An empty box is more honest than a sentence we made up.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="faq-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Questions you should ask
            </h2>
            <div className="mt-8 divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
              {QUESTIONS.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-2xl font-normal leading-none text-[var(--color-accent)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="book" className="relative overflow-hidden border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="close-heading">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent-glow)] blur-3xl" />
        </div>
        <Container>
          <div className="max-w-3xl">
            <h2 id="close-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              If you want the edge, book the call.
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Bring the business, the priority you are already running, and whether you will open the data. If you have a hunch about where the money is, bring that too. Joshua Pellicer will tell you if The Lever Loop fits this quarter.
              </p>
              <p>Three things are enough.</p>
            </div>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-lg leading-relaxed text-[var(--color-text)]">
              <li>What you are already pushing.</li>
              <li>Where you suspect AI could pay, if you have a hunch.</li>
              <li>Whether you will open the data.</li>
            </ol>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              We will say if we should work together. If we should not, we will say that too.
            </p>
            <div className="mt-8">
              <GoalCall note={`Opens a draft to ${INQUIRY_EMAIL}. You review it in your own email app and send it yourself. Joshua replies from AIify.`} />
            </div>
            <p className="mt-10 border-t border-[var(--color-border-subtle)] pt-6 text-base leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">P.S.</span> The audit fee comes back if we cannot find a lever worth ten times that fee. Kill lines are written before any spend. You own what we build. The only decision on the call is whether we should aim the next quarter at your business.
            </p>
          </div>
        </Container>
      </section>

      <div className="h-24 md:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]/95 backdrop-blur-xl md:hidden">
        <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button href={GOAL_CALL_MAILTO} size="sm" className="w-full">
            Book a call
          </Button>
        </div>
      </div>
    </main>
  );
}

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { INQUIRY_EMAIL } from '../data/inquiry';

const PAGE_TITLE = 'Hit the number this quarter | The Lever Loop | AIify';

const GOAL_CALL_BODY = [
  'Hi Joshua,',
  '',
  'I want to book a goal call about The Lever Loop.',
  '',
  'The number I need to hit this quarter:',
  '',
  'The business:',
  '',
  'The last thing I paid for that I could not track:',
  '',
].join('\n');

const GOAL_CALL_MAILTO = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('Goal call - the quarterly number')}&body=${encodeURIComponent(GOAL_CALL_BODY)}`;

const AUDIT_PARTS = [
  {
    title: 'Owner economics',
    text: 'Cost per sale, gross margin, and payback. What a sale is allowed to cost if you are going to scale it. What gets killed.',
  },
  {
    title: 'Outside-in research',
    text: 'How buyers actually find a company like yours. Where you show up. Where you are invisible. What is public about the channels and the competitors.',
  },
  {
    title: 'Inside-out data',
    text: 'The customer file, the estimates that never closed, the cancels, the routes, the source codes. We dig. A messy file is a normal starting point.',
  },
  {
    title: 'Opportunity scoring',
    text: 'Each find is scored against the goal: how big it is, how fast it can move, what it costs to get proof, and how sure we can be.',
  },
  {
    title: 'The Lever Map',
    text: 'One page. The biggest constraint between you and the number, and the opportunities sitting next to it. This is the plan for the quarter.',
  },
];

const SPRINT_WORK = [
  'Operations that eat hours, automated where the rule is clear enough to trust.',
  'Small lead tests. A control group. A kill line and a scale line written before the first dollar goes out.',
  'The read on the data, in the numbers you already use: cost per lead, cost per sale, close rate, payback.',
  'Custom tools, built by our developers, when a tool is actually the constraint.',
];

const REASONS = [
  {
    title: 'We test before we scale',
    text: 'Money follows proof. A small test with a control group tells you whether a channel earns its keep. Clear the line and it gets more budget. Miss the line and it dies. There is no six-month “let’s see.”',
  },
  {
    title: 'Attribution on every dollar',
    text: 'No dollar moves unless it can be tied to a lead and a sale. Source codes, unique links, call tracking where the phone matters, a holdout when a list is big enough to split. If it cannot be tracked, it is not spent.',
  },
  {
    title: 'Constraint first',
    text: 'Eliyahu Goldratt’s book The Goal named what operators already know. A business moves at the speed of its constraint. Effort piled anywhere else feels busy and does not change the number. The audit exists to name that constraint. We do not start with a tool and go looking for a job for it.',
  },
  {
    title: 'Builders, not advisors',
    text: 'The person in the research and the data stays in the room with the developers who build. You end the quarter with something running: a workflow, a test in market, a tool your people use, a scoreboard your operator can read on Friday.',
  },
  {
    title: 'Skin in the game',
    text: 'The audit fee comes back if we cannot find a lever worth ten times that fee. If we miss on work we promised to ship, the next month is half price. You can add a bonus that is paid only if the quarterly number is hit.',
  },
  {
    title: 'A weekly scoreboard',
    text: 'You should not be wondering, in week six, whether this is working. The scoreboard is short. The number is on it. So is the kill line. So is what we stopped.',
  },
];

const GET_ITEMS = [
  'The quarterly goal, written as one number.',
  'The Lever Audit and the Lever Map.',
  'A research and data lead, plus developers who build.',
  'Sprints of 30 to 60 days on the single biggest lever.',
  'Tests with control groups, tracking, and kill and scale lines set before spend.',
  'A weekly scoreboard.',
  'A quarter-end review, then the next goal.',
  'Code and data in your company’s name.',
  'An optional bonus, agreed up front, paid only if the number is hit.',
];

const GUARANTEES = [
  {
    title: 'Full audit refund',
    text: 'You pay for the Lever Audit. If it does not find a lever worth at least 10 times the audit fee, we refund that fee. “Worth” means the economics written on the Lever Map: margin, cost taken out, or a contribution to the quarterly number that we can show you. If we cannot show it, you should not continue.',
  },
  {
    title: 'No dollar moves without tracking',
    text: 'If a spend cannot be tied to a source and a sale, it does not go out. This is a rule of the work, not a slogan on a proposal.',
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
  'You own or operate a home-service company, a route business, or more than one location.',
  'You think in cost per sale, margin, and payback. You have a number for this quarter.',
  'You will open the customer file, the lead sources, and a rough view of margin.',
  'You want the people who find the constraint to be the people who build the fix.',
];

const NOT_FOR_YOU = [
  'You want a brand campaign, a logo, or a monthly report of activity.',
  'You will not share data. A constraint we are not allowed to see stays hidden.',
  'You want a demo, a chatbot, or a model with no tie to a number.',
  'You are shopping for the cheapest month-to-month vendor.',
  'You want advice to hand to another team. This partnership builds.',
];

const QUESTIONS = [
  {
    q: 'We tried agencies.',
    a: 'Then you already know the failure. Activity, a report, and no sale you can point at. This is not a retainer for a channel. A test that misses its kill line gets cut, including one we recommended. The scoreboard is the argument, every week, in the numbers you asked for.',
  },
  {
    q: 'AI is hype.',
    a: 'Treat it that way until it moves a number. We do not lead with a model. We lead with the constraint. If the lever is a cleaner source code and a control-group test, that is the work. If the lever is a tool, our developers build the tool. The word is not the product. The number is.',
  },
  {
    q: 'My data is a mess.',
    a: 'That is the usual start. The audit is the dig. You do not need a perfect warehouse or five tidy years of source codes. You need access, and a team willing to sit in the mess until it will support a decision. If the file cannot support one, we will say so, and we will not spend media on a guess.',
  },
  {
    q: 'How fast does this move?',
    a: 'The goal is locked at the start. The audit comes before the build. Sprints run 30 to 60 days inside the quarter. Once the work is in motion you get a scoreboard every week, not a reveal on the last day. Some levers show a leading number in weeks: response rate, speed to first contact, cost per lead. A cost per sale you can scale is allowed to take the quarter. This page will not promise you a revenue figure.',
  },
  {
    q: 'What does it cost?',
    a: 'The Lever Audit starts at $7,500. A larger file or more locations can cost more, and we will tell you that number before you agree. The partnership starts at $8,000 a month, scoped for the quarter and agreed on the goal call, against the number you bring. An optional bonus is paid only if that number is hit. The buttons on this page do not show a price. The price follows the goal.',
  },
];

const SCOREBOARD_ROWS = [
  ['Goal for the quarter', 'blank'],
  ['Sales tied to a source', 'blank'],
  ['Spend tied to a source', 'blank'],
  ['Cost per sale', 'blank'],
  ['Kill line', 'Written before the spend'],
  ['Scale line', 'Written before the spend'],
  ['Stopped this week', 'blank'],
  ['Build next', 'blank'],
];

function GoalCall({ note }: { note: string }) {
  return (
    <div>
      <Button href={GOAL_CALL_MAILTO} size="lg" className="w-full sm:w-auto">
        Book a goal call
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
              I need to hit my number this quarter.
            </h1>
            <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-[var(--color-text)] sm:text-3xl">
              I’m done paying for marketing I can’t track.
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                If that is the sentence in your head, stay. This page is for owners and investor-operators of home-service and multi-location businesses. People who already think in cost per sale, margin, and payback.
              </p>
              <p>
                The Lever Loop is a quarterly partnership built around the one number you have to hit. We lock it. We find the constraint in the way. A research lead and our developers then go after that constraint, and the weekly scoreboard shows whether the number moved.
              </p>
            </div>
            <div className="mt-8">
              <GoalCall note={`Opens a draft to ${INQUIRY_EMAIL}. Nothing is sent until you send it. Bring the number. There is no price on this button.`} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="problem-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="problem-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              You have the number. You do not have the trail.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                You already did the hard thinking. Customers to add. Revenue to book. A cost per sale you can live with. Margin that pays a new customer back inside the year. The quarter has a date on it. The number does not care about a new logo.
              </p>
              <p>
                Then the money goes out, and the trail goes cold. Ads run. Mail drops. A retainer sends a report full of clicks, impressions, and “awareness.” Nobody can put a finger on a dollar and name the sale it bought. You have funded that kind of quarter before. You are not funding it again.
              </p>
              <p>
                So this quarter opens with two bad choices. Spend and hope. Or hold the budget and watch the season go by. Hope is not a system. Sitting still does not hit the number either.
              </p>
              <p>
                The thing in the way is specific. One constraint. A follow-up that is too slow. A customer list nobody has worked. A route that makes the next-door sale cheaper than a stranger across town. A channel you are scaling before it has earned the scale. Until that constraint has a name, every new tactic is another guess with a cleaner invoice.
              </p>
              <p className="text-[var(--color-text)]">
                Name the constraint. Prove the fix on a small test. Spend only where the proof is. That is the whole offer.
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
                One goal. One number. One quarter. You are not hiring a demo, and you are not hiring a deck. You are hiring a team that gets on the number with you.
              </p>
              <p>
                Joshua Pellicer and AIify come in for the quarter as the people who do the work: a lead on the research and the data, and developers who build. The work is custom. Two companies in the same trade can leave the quarter with different builds, because the build follows the goal.
              </p>
              <p>
                The partnership is priced per quarter. An optional bonus can be tied to hitting the goal. The price is set on the goal call, against that goal. It is not printed on the button.
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
              Four moves. The same four every quarter. The work inside them changes, because your constraint changes.
            </p>
          </div>

          <ol className="mx-auto mt-12 max-w-3xl space-y-6">
            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">01</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">Lock the quarterly goal</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                In the first working session we write the one goal and the number that means it happened. Not three goals. One. Revenue, customers, cost per sale, margin, payback. If it cannot be counted, it is not the goal. A sale, when sales are the number, means a booked job with payment attached. A lead is not a sale. A quote is not a sale.
              </p>
            </li>

            <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">02</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight">The Lever Audit</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                Research plus the data, before anyone builds. The job of the audit is to find the biggest constraint between you and the goal, and the opportunities hiding beside it.
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
                We pull the single biggest lever. Not five projects. The one that moves the number. The sprint uses whatever that lever actually needs.
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
              <h3 className="mt-3 text-2xl font-bold tracking-tight">A weekly scoreboard, then repeat</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                Every week, one scoreboard. The number, the spend, what is working, what hit a kill line, what we do next. At the end of the quarter we review against the goal, keep what proved out, stop what did not, and set the next number. Then the loop runs again.
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
            <GoalCall note="If the four moves are the conversation you wanted, book the goal call. Bring the number." />
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
              Six reasons. Each one is a rule we can be fired for breaking.
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
            <h3 className="text-xl font-bold tracking-tight">Two public studies. Not our clients.</h3>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Speed shows up often enough in home services that it is worth naming, as research you can read yourself. The InsideSales.com / MIT lead-response study, led by James Oldroyd, measured web leads. Its finding: the odds of contacting a lead if called in 5 minutes versus 30 minutes drop 100 times, and the odds of qualifying that lead drop 21 times. The study did not measure close rate. Use it as a reason to time the first response. Do not read it as a revenue promise.
              </p>
              <p>
                Valve+Meter’s secret-shopper study sent inquiries to 466 U.S. home-service companies. It reported that 95% did not respond within five minutes. That is an industry pattern. It is not a number from a company we work with, and it is not a claim about your shop. If speed is the constraint, we prove it on your file before we build anything.
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
              The risk sits with us until the work proves out
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              You have paid for work you could not track. The downside of finding out should not sit on you alone. These are the terms.
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
              <GoalCall note="Book the goal call if the terms are the part you needed to see. The button still has no price on it." />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="pay-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="pay-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Optional pay for hitting the goal
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                The quarterly fee pays for the team and the work. On top of it, you can tie a bonus to the goal. Before the quarter starts we agree on the number, on what counts as hitting it, and on the bonus.
              </p>
              <p>
                Hit the number and the bonus is paid. Miss it and the bonus is not paid. The bonus is optional. Some owners want the extra stake. Some do not. Either way, the kill lines stay where they were written.
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
                This page does not describe an engagement, name a customer, or show a before and after. If you want proof from a finished quarter, ask on the goal call. We will tell you what we can share. We will not write a result to fill the space.
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
              Bring the number. We will tell you if we should work this quarter.
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                If the quarter has a number on it, and you are done paying for work you cannot trace to a sale, book the goal call with Joshua Pellicer.
              </p>
              <p>Bring three things.</p>
            </div>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-lg leading-relaxed text-[var(--color-text)]">
              <li>The number.</li>
              <li>The last thing you paid for that you could not track.</li>
              <li>Whether you will open the data.</li>
            </ol>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              We will say if The Lever Loop fits. If it does not, we will say that too.
            </p>
            <div className="mt-8">
              <GoalCall note={`Opens a draft to ${INQUIRY_EMAIL}. You review it in your own email app and send it yourself. Joshua replies from AIify.`} />
            </div>
            <p className="mt-10 border-t border-[var(--color-border-subtle)] pt-6 text-base leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">P.S.</span> The audit fee comes back if we cannot find a lever worth ten times that fee. Kill lines are written before any spend. You own what we build. The only decision on the call is whether your number and this team belong in the same quarter.
            </p>
          </div>
        </Container>
      </section>

      <div className="h-24 md:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]/95 backdrop-blur-xl md:hidden">
        <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button href={GOAL_CALL_MAILTO} size="sm" className="w-full">
            Book a goal call
          </Button>
        </div>
      </div>
    </main>
  );
}

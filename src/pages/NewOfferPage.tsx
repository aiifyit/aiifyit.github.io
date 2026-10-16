import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { INQUIRY_EMAIL } from '../data/inquiry';

const PAGE_TITLE = "Payroll for a department you don't have to hire | AIify";

const GOAL_CALL_BODY = [
  'Hi Joshua,',
  '',
  'Booking a call about a bolt-on AI department.',
  '',
  'The business:',
  '',
  'The goal already set for this quarter:',
  '',
  'How that goal is being chased by hand today:',
  '',
].join('\n');

const GOAL_CALL_MAILTO = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('Bolt-on AI department')}&body=${encodeURIComponent(GOAL_CALL_BODY)}`;

const SYSTEMS = [
  {
    title: 'A no-touch CRM',
    text: 'Calls and meetings already leave a transcript. This system reads those transcripts and keeps the customer record current. Your people do not stop to type the notes in.',
  },
  {
    title: 'An automation builder',
    text: 'When a job should happen the same way every time, this system builds that automation, ships it, and tests that it did the job. The automation is checked before it counts as done.',
  },
  {
    title: 'A knowledge base',
    text: 'Your people search the company’s own documents and data. They ask in plain words. The answer comes from the files and the numbers the company already has.',
  },
  {
    title: 'A live meeting watcher',
    text: 'It watches the meeting while the meeting is happening. What gets decided, asked, or promised becomes work for the agent: a task, a follow-up, a change to make.',
  },
  {
    title: 'An agent for your company',
    text: 'You get one AI agent, dedicated to your company. It plans the work toward the goals you set, and it does the implementation. A person manages the agent. AI is the tool.',
  },
];

const START_STEPS = [
  {
    title: 'We join your quarterly goal-setting',
    text: 'You already set the goals. We sit in that meeting. We do not invent a goal for you, and we do not grade you against one.',
  },
  {
    title: 'A second tack, beside the manual one',
    text: 'You already have a way of chasing the goal by hand. We take a different tack alongside that. The manual work stays while the new system is built.',
  },
  {
    title: 'First build follows the top goal',
    text: 'Five systems are available. The first one we build is the one that maps to your top goal. The others wait until a goal calls for them.',
  },
];

const ROLES = [
  {
    title: 'Chief of staff',
    text: 'Keeps the department pointed at the goals you already set.',
  },
  {
    title: 'Developers and senior developers',
    text: 'Build the systems that have to exist in your company.',
  },
  {
    title: 'Operations lead',
    text: 'Keeps the day-to-day work of the department running.',
  },
  {
    title: 'Project managers',
    text: 'A project manager is assigned to you, so the work has an owner on our side.',
  },
  {
    title: 'AI developers',
    text: 'Build the agent work and the connections it needs.',
  },
  {
    title: 'AI-agent managers',
    text: 'People trained to manage the agents, so a person is accountable for what an agent does.',
  },
];

const GET_ITEMS = [
  'A department beside the company you already run. You do not hire it.',
  'People using AI every day on the quarterly goals you already set.',
  'The first system, chosen because it maps to your top goal.',
  'The other systems as later goals call for them.',
  'A weekly report mapped to each department head.',
  'Your sign-off before anything touches a live system.',
];

const FOR_YOU = [
  'You own or run the company, and this quarter already has a goal.',
  'You have seen how cheap the tools are, and you do not have the hours to hire for the work, vet it, manage it, and check that it actually works.',
  'You want your people supported on the goals they already own.',
  'You will open the documents and the data the work needs, and you will sign off before anything goes live.',
];

const NOT_FOR_YOU = [
  'You want a demo, a chatbot, or a tool with no tie to a goal you already set.',
  'You want software to take the company over so you can step away.',
  'You will not open the files, or you will not sign off on live work.',
  'You want the cheapest pair of hands, and you are ready to manage them yourself.',
  'You want a brand campaign, or a monthly report of activity.',
];

const QUESTIONS = [
  {
    q: 'You can just do this yourself.',
    a: 'The tools are cheap. That is why it looks like a job you can take on yourself. Buying a tool is the easy part. Hiring for the work, vetting what gets built, managing it, and checking that it actually works are the rest of the job. That job is full time. You already have one.',
  },
  {
    q: 'AI is hype.',
    a: 'A lot of it is. We do not ask you to trust a pitch. The agent drafts the work and puts it in a queue. You sign off before anything touches a live system. The weekly report shows the result against the goal you already set. If the work is idle, the report shows that too.',
  },
  {
    q: 'Your data is a mess.',
    a: 'That is a normal start. The knowledge base searches the documents and the data you already have. It does not need a perfect archive on day one. It needs access. If the files cannot support the work, we will say so before we build on them.',
  },
  {
    q: 'How fast does this move?',
    a: 'We join the goal-setting you already do for the quarter. The first build is the system that maps to the top goal. After that, the work shows up in the weekly report. This page will not promise you a revenue figure or a date.',
  },
  {
    q: 'What does it cost?',
    a: 'PLACEHOLDER. The price is not printed on this page. We will tell you the number on the call, before you agree. The buttons do not show a price.',
  },
  {
    q: 'Will this replace your people?',
    a: 'Your people stay. The weekly report maps results to each department head, so the help shows up on the goals they already own. The point is that they feel supported, not replaced. Agents draft and queue. You sign off before anything touches a live system.',
  },
];

const REPORT_ROWS = [
  ['Department head', 'blank'],
  ['Goal they already own', 'blank'],
  ['What moved this week', 'blank'],
  ['Waiting on your sign-off', 'blank'],
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
              Payroll for a department you don't have to hire.
            </h1>
            <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-[var(--color-text)] sm:text-3xl">
              A bolt-on AI department. People, using AI, on the goals you already set.
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Every day, a team uses AI to help you hit the quarterly goals you already have. You do not hire them. You do not run the tools. AI is the tool, not the employee. Humans manage it.
              </p>
              <p>
                The department bolts on beside the company you already run. Your people stay on their jobs. This team does the AI work those jobs do not have hours for.
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
              You are not short on ideas or ambition. You are short on time.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                AI is cheap. The tools are easy to buy, so it looks like a job you can do yourself. You still cannot hire for it, vet it, manage it, or make sure it actually works. That work is a full-time job. Running the company already is one.
              </p>
              <p>
                The week is spent on the company. The leftover hours are not enough to sort the tools, staff the work, and check the result. Ideas are not the shortage. Hours are.
              </p>
              <p className="text-[var(--color-text)]">
                We do the digging. We do the building. You stay on the company.
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
              A bolt-on AI department
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                A team of people, using AI, working every day toward the goals you set for the quarter. The department sits beside the company you already run. You keep the company. We do this work.
              </p>
              <p>
                Humans manage the department. The agent drafts and queues. AI stays the tool.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="systems-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="systems-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Five systems
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              This is the work the department can take on. Plain systems. The first one we build is the one that matches your top goal.
            </p>
          </div>
          <ol className="mx-auto mt-12 max-w-3xl space-y-6">
            {SYSTEMS.map((system, index) => (
              <li key={system.title} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{system.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">{system.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="start-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="start-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              How it starts
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              We start from the quarter you are already planning. The manual approach stays in place while the first system is built.
            </p>
          </div>
          <ol className="mx-auto mt-12 max-w-3xl space-y-6">
            {START_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-12 max-w-3xl">
            <GoalCall note="Bring the goal you already set. We will tell you which system we would build first." />
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="safety-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="safety-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              A person stays in the loop
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Agents draft the work and put it in a queue. A person reviews that queue. Nothing touches a live system without your sign-off.
              </p>
              <p>
                You see the change before it goes out. A draft can sit. A live system does not change until you say so.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="report-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="report-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              A weekly report for each department head
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Every week, the results are mapped to each department head. The people who own those goals can see what moved, and what is waiting on a sign-off.
              </p>
              <p>
                The report is there so your people feel supported, not replaced. The work shows up as help on a goal they already have.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-dashed border-[var(--color-border)]">
              <p className="bg-[var(--color-surface)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                Placeholder layout · not a result
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <caption className="sr-only">Empty weekly report layout. No client numbers.</caption>
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                      <th scope="col" className="px-4 py-3 font-medium">Line</th>
                      <th scope="col" className="px-4 py-3 font-medium">This week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REPORT_ROWS.map(([line, value]) => (
                      <tr key={line} className="border-b border-[var(--color-border-subtle)] last:border-0">
                        <th scope="row" className="px-4 py-3 font-medium text-[var(--color-text)]">{line}</th>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                The cells say “blank” because this is the shape of the weekly report, not a client’s week. Your numbers go here after the work starts. None are filled in on this page.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="team-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="team-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              The people on the department
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Roles, not a headcount. Humans hold these jobs. AI is the tool they use.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ROLES.map((role) => (
              <article key={role.title} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-6 md:p-8">
                <h3 className="text-xl font-bold tracking-tight">{role.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">{role.text}</p>
              </article>
            ))}
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

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="fit-heading">
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
                Finished work will be listed here only after the numbers are sourced and the client has approved the wording. Nothing in this block is a result.
              </p>
              <p>
                This page does not describe an engagement, name a customer, or show a before and after. If you want proof from finished work, ask on the call. We will tell you what we can share. We will not write a result to fill the space.
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
              If you want the department, book the call.
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Bring the business and the goal you already set for this quarter. We will tell you which system we would build first, and whether we should work together. If we should not, we will say that too.
              </p>
              <p>Three things are enough.</p>
            </div>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-lg leading-relaxed text-[var(--color-text)]">
              <li>The goal you already set.</li>
              <li>How you are chasing it by hand today.</li>
              <li>Whether you will open the documents and the data, and sign off before anything goes live.</li>
            </ol>
            <div className="mt-8">
              <GoalCall note={`Opens a draft to ${INQUIRY_EMAIL}. You review it in your own email app and send it yourself. AIify replies from that address.`} />
            </div>
            <p className="mt-10 border-t border-[var(--color-border-subtle)] pt-6 text-base leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">P.S.</span> Agents draft and queue the work. Nothing touches a live system without your sign-off. You are not hiring a department on this page. You are booking a call to see if this one fits the quarter you already have.
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

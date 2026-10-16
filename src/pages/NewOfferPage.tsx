import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { INQUIRY_EMAIL } from '../data/inquiry';

const PAGE_TITLE = 'Get your quarterly goals done without hiring anyone or learning AI | AIify';

const SUBHEAD = 'You tell us what has to get done this quarter. A chief of staff, developers, and a project manager use AI on that work every day, and you say OK before anything goes out.';

const GOAL_CALL_BODY = [
  'Hi Joshua,',
  '',
  'Booking a call about getting this quarter\'s goals done.',
  '',
  'The business:',
  '',
  'The goal that matters most this quarter:',
  '',
  'How the team handles that by hand today:',
  '',
].join('\n');

const GOAL_CALL_MAILTO = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('Quarterly goals')}&body=${encodeURIComponent(GOAL_CALL_BODY)}`;

const BUILDS = [
  {
    title: 'The CRM updates itself',
    text: 'Your calls and your meetings are already being recorded. We connect those recordings to the CRM, and the notes land on the contact without a salesperson typing them in. On a Tuesday that looks like this: the call ends, the record is updated, and the next step is written down. It matters because the deal dies when the note stays in someone’s head until they forget it. Your salespeople stop doing data entry, and the next person who opens the record can see what was said.',
  },
  {
    title: 'Follow-ups, quotes, and reminders',
    text: 'We build the automations, we test them on real examples before they run, and we keep them running after that. A follow-up the day after a quote goes out. A reminder when a job is coming due. A note to the office when a customer says yes. If one of them breaks on a Tuesday, the developers fix it. You don’t find out three weeks later that the emails quietly stopped. The point is that the busy week doesn’t get to skip the step you already decided should happen every time.',
  },
  {
    title: 'One place for what the company already knows',
    text: 'This is a company knowledge base. Your docs, your prices, your policies, and the answers you have already given customers go in one place. Your team asks a question in normal words and gets the answer from that pile. The AI asks the same place, so it isn’t making up a price from the open internet. When you change a price, you change it there, and the next answer uses the new number. A new hire and a tired Tuesday both get the same answer you would have given yourself.',
  },
  {
    title: 'Someone watching the meeting',
    text: 'It listens while the meeting is happening. When somebody says “we should call them back” or “we should change that price,” it turns that sentence into a task with a name on it, and a draft of the email or the note. The meeting doesn’t end as a recording nobody opens on Thursday. The “we should” either gets done, or it sits on the list until you tell us to drop it. That’s the difference between a decision and a sentence that dies in the room.',
  },
  {
    title: 'An AI agent that belongs to your company',
    text: 'We set one up for you. It isn’t a new employee and it isn’t a chatbot on your website. It knows the goals you picked, it plans the work, and it does the pieces a tool can do: a first draft, a pass through the docs, the next list of tasks. Our team checks it before it comes to you. It does not email a customer, and it does not change a tool you use to run the company, on its own. You get the daily work pointed at the goal, with a person still reading it.',
  },
];

const START_STEPS = [
  {
    title: 'We sit in the meeting where you set the quarter',
    text: 'You already have that meeting. We join it. We don’t walk in with a goal we made up for you, and we don’t score you against one. We listen to the goals you already chose and to how the team is chasing them by hand.',
  },
  {
    title: 'We pick the goal that matters most',
    text: 'There are usually a few. We ask a plain question: if only one of these moved, which one would change the quarter? That one goes first. The rest stay on your list, and your people keep doing them the way they do them now.',
  },
  {
    title: 'We build that piece next to the work you already do',
    text: 'If the goal is sales follow-up, we start with the CRM and the reminders. If the goal is the office giving the same answer every time, we start with the docs and the prices. We don’t rip out the spreadsheet on day one. Your team keeps working. The new piece sits beside that, and you can see it on a normal week before we touch the next thing.',
  },
  {
    title: 'Then we go to the next goal',
    text: 'When the first one is running, and you’ve seen what it did on a real week, we pick the next goal and build the next piece. Same order every time. One goal, the piece that moves it, then the next.',
  },
];

const ROLES = [
  {
    title: 'Chief of staff',
    text: 'This person runs your account. They look at the goals you set and decide what the team works on this week. When the priority changes, you tell them, and the week changes with it.',
  },
  {
    title: 'Developers',
    text: 'They build the automations, connect them to the tools you already use, test them, and fix them when a follow-up or a quote flow breaks. You don’t manage that work.',
  },
  {
    title: 'Project manager',
    text: 'One project manager is assigned to you. They know the list, they know what’s waiting on your OK, and they are the person you call when you want a straight answer about where things stand.',
  },
];

const GET_ITEMS = [
  'A chief of staff running your account against the goals you already set for the quarter.',
  'Developers who build the automations, test them, connect them to your tools, and fix them when they break.',
  'A project manager assigned to you.',
  'A CRM that fills itself in from your call and meeting recordings, so salespeople stop typing notes.',
  'Follow-ups, quotes, and reminders that we test before they run and keep running after that.',
  'Your docs, prices, policies, and old answers in one place your team and the AI can ask.',
  'A meeting watcher that turns “we should” into a task and a draft.',
  'An AI agent set up for your company. It plans and does the tool-work toward your goals. Our team checks it.',
  'A plain report each week to every department head: what got done for them, and what moved.',
  'Your OK before a draft goes to a customer or into a tool you use to run the company.',
];

const FOR_YOU = [
  'You run the company, and this quarter already has goals you care about.',
  'You’ve seen how cheap the AI tools are, and you know you don’t have the person to figure out where they fit, set them up, connect them, check the work, and fix them when they break.',
  'You want each department head to see help on the work they already own.',
  'You’ll let us read the recordings, the docs, and the tools, and you’ll look at a draft before it goes to a customer.',
];

const NOT_FOR_YOU = [
  'You want a demo you can click and then forget.',
  'You want software emailing customers while you stay out of it.',
  'You won’t share the recordings or the docs, or you won’t read the drafts.',
  'You want the cheapest freelancer, and you’re ready to manage them yourself.',
  'You want a new logo, or a monthly packet of charts that doesn’t change anyone’s Tuesday.',
];

const QUESTIONS = [
  {
    q: 'You could just do this yourself.',
    a: 'You can buy the tools. That’s the cheap part, and it’s why this looks easy. The actual job is figuring out where it fits in your company, setting it up, connecting it to the tools you already use, checking what it produces, and fixing it on the day it breaks. You don’t have that person. Hiring one takes a long time, good ones cost real money, and you can’t tell a good one from a bad one until a quarter has already gone by. That job is what our team does every day.',
  },
  {
    q: 'Isn’t most of this hype?',
    a: 'A lot of what you see in a demo is. Here’s how this works on a normal week. The AI writes a draft and lines it up. A person on our team reads it. You say OK before it goes to a customer or into the software you run the company on. Every week your department heads see what got done and what moved. If nothing got done, the report says that. You don’t have to believe a pitch. You can read the week.',
  },
  {
    q: 'Your files are a mess.',
    a: 'That’s a normal starting point. We don’t need a perfect set of folders on day one. We need the docs, the prices, the policies, and the recordings you already have, plus permission to read them. Those go in one place your team can ask in plain words. If a file can’t support the answer, we say so before we build anything on top of it. We won’t guess at a price you didn’t write down.',
  },
  {
    q: 'How soon does something real happen?',
    a: 'We sit in the goal meeting you already run. We pick the one goal that would change the quarter. The first thing we build is the piece that moves that goal, next to the way your team already works. After that, you see it in the weekly report: what got done, and what is waiting on your OK. This page will not promise you a dollar figure or a date.',
  },
  {
    q: 'What does it cost?',
    a: 'PLACEHOLDER. The price is not on this page. We’ll tell you the number on the call, before you agree to anything. The buttons don’t show a price.',
  },
  {
    q: 'Will this replace your people?',
    a: 'Your people stay in their jobs. Once a week, each department head gets a plain report of what got done for them and what moved on the goal they already own. We write it that way so they feel backed up, not replaced. The AI drafts. Our people check the draft. You say OK before it goes anywhere a customer can see. Nobody’s job gets handed to a tool.',
  },
];

const REPORT_ROWS = [
  ['Department head', 'blank'],
  ['What got done for them', 'blank'],
  ['What moved', 'blank'],
  ['Waiting on your OK', 'blank'],
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
            <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">AIify</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              Get your quarterly goals done without hiring anyone or learning AI.
            </h1>
            <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-[var(--color-text)] sm:text-3xl">
              {SUBHEAD}
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Picture a Tuesday. A salesperson hangs up, and the notes are already on the contact. A quote from yesterday gets a follow-up because we built that reminder and we watched it send. After the staff meeting, the “we should” items are tasks with names on them, plus a draft of the email. You didn’t learn a new tool to get that, and you didn’t post a job for it.
              </p>
              <p>
                The people doing that work are ours. They use AI tools all day on the goals you already set. The AI writes the draft and lines the work up. Our people run it, check it, and fix it. You stay on the company.
              </p>
            </div>
            <div className="mt-8">
              <GoalCall note={`This opens a draft to ${INQUIRY_EMAIL}. It doesn’t send until you send it. The button doesn’t show a price.`} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="problem-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="problem-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              You're not short on ideas or ambition. You're short on time.
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                AI is cheap. You can buy a tool this afternoon, so it looks like a job you can knock out yourself. It isn’t. Somebody has to figure out where it fits in your company, set it up, connect it to the tools you already use, check the work it does, and fix it when it breaks.
              </p>
              <p>
                You don’t have that person. Hiring one is slow, and a good one is expensive. Even after you hire, you can’t tell a good one from a bad one until the quarter is already gone. Your week is spent running the company. There isn’t a spare Tuesday for the setup, the checking, and the fixing.
              </p>
              <p className="text-[var(--color-text)]">
                You keep running the company. We put our people on the setup, the checking, and the fixing.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="offer-heading">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">What you get</p>
            <h2 id="offer-heading" className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              People who already do this every day
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                You get a team. A chief of staff runs your account, which means someone is looking at the goals you set and deciding what gets worked this week. Developers build what has to be built and hook it to the tools you already open. A project manager is assigned to you, so when you call, you get a person who knows the work.
              </p>
              <p>
                They use AI tools every day on those goals. AI is the tool. Our people run it. You don’t learn the software, and you don’t go hire someone who already has.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="builds-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="builds-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Five things we set up
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              We don’t drop all five on you in the first week. We start with the one that moves the goal you care about most. Here’s what each one does on a normal day, and why you’d want it.
            </p>
          </div>
          <ol className="mx-auto mt-12 max-w-3xl space-y-6">
            {BUILDS.map((item, index) => (
              <li key={item.title} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{item.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">{item.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="start-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="start-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              How we start
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Four steps. We do them in this order, and we don’t skip to a build before we’ve heard the goals.
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
            <GoalCall note="Bring the goal that matters most. We’ll tell you what we’d build first." />
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 lg:py-20" aria-labelledby="safety-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="safety-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Nothing goes out until you say OK
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                The AI drafts the email, the note, the task. It lines them up. A person on our team reads that list before you do.
              </p>
              <p>
                Nothing goes into the software you use to run the company, and nothing goes out to a customer, until you say OK. If you don’t like the draft, it sits there. A customer does not get an email you haven’t read.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="report-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="report-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Every department head gets a plain report each week
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Once a week, each department head gets a short report in plain words. It says what got done for them, and what moved on the goal they already own. A sales manager can see which follow-ups went out. An office manager can see which questions the team stopped answering from scratch.
              </p>
              <p>
                We send it so your people feel backed up, not replaced. The report is help on work they already have. It is not a plan to take their job.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-dashed border-[var(--color-border)]">
              <p className="bg-[var(--color-surface)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                Placeholder layout · not a result
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <caption className="sr-only">Empty weekly report. No numbers from a real week.</caption>
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
                The cells say “blank” because this is the shape of the weekly report, not a real week. Your numbers go here after the work starts. None are filled in on this page.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-12 md:py-16 lg:py-20" aria-labelledby="team-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="team-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              Who is on the team
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Three jobs. These are people. The AI is the tool they use.
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
            Is this for you
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
                Finished work will be written here only after the numbers are checked and that company has agreed to the wording. Nothing in this box is a result.
              </p>
              <p>
                This page doesn’t name a customer, and it doesn’t show a before and after. If you want to hear what finished work looked like, ask on the call. We’ll tell you what we can share. We won’t make up a story to fill the box.
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
                There are no quotes here. A quote gets added only after that person has said yes in writing, under their name or with a description they accept.
              </p>
              <p>Until that yes exists, this box stays empty on purpose. An empty box is more honest than a sentence we wrote for them.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] py-12 md:py-16 lg:py-20" aria-labelledby="faq-heading">
        <Container>
          <div className="max-w-3xl">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
              What you’ll want to ask
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
              If you want this on the quarter, book the call.
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Bring the goals you already set, and tell us which one matters most. We’ll tell you what we’d build first, and whether we should work together. If we shouldn’t, we’ll say that too.
              </p>
              <p>Three things are enough to start the conversation.</p>
            </div>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-lg leading-relaxed text-[var(--color-text)]">
              <li>The goal that matters most this quarter.</li>
              <li>How your team chases it by hand today.</li>
              <li>Whether you’ll share the recordings and the docs, and say OK before anything goes to a customer.</li>
            </ol>
            <div className="mt-8">
              <GoalCall note={`This opens a draft to ${INQUIRY_EMAIL}. You read it in your own email and you send it yourself. We reply from that address.`} />
            </div>
            <p className="mt-10 border-t border-[var(--color-border-subtle)] pt-6 text-base leading-relaxed text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">P.S.</span> The AI can write the draft and line up the task. It does not send the email, and it does not change the software you run the company on, until you say OK. You’re not hiring anyone by booking the call. You’re checking whether we fit the quarter you already have.
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

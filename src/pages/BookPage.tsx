import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import CalendlyEmbed from '../components/ui/CalendlyEmbed';
import { CALENDLY_URL } from '../data/constants';
import { BOOKING_PRIORITIES, BOOKING_SERVICES, createBookingUrl, parseBookingContext } from '../data/booking';

// Vite imports only public slugs, rather than shipping entire articles in the app.
const publishedSlugs = Object.values(import.meta.glob<string>('../../content/articles/*.json', {
  eager: true,
  import: 'slug',
}));

export default function BookPage() {
  const { search } = useLocation();
  const context = parseBookingContext(search, publishedSlugs);
  const selectedService = context.service ? BOOKING_SERVICES[context.service] : undefined;
  const selectedPriority = context.priority ? BOOKING_PRIORITIES[context.priority] : undefined;
  const bookingUrl = createBookingUrl(CALENDLY_URL, context);

  return (
    <main className="py-16 md:py-24">
      <Container>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Book a Call
          </h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            Pick a time that works for you. Free 30-minute strategy call · No obligation.
          </p>
        </div>

        <section
          aria-labelledby="call-preparation-heading"
          className="max-w-4xl mx-auto mb-8 p-6 md:p-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
        >
          <h2 id="call-preparation-heading" className="text-xl font-semibold mb-4">
            Make the most of your call
          </h2>
          {(selectedService || selectedPriority) && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 mb-5">
              {selectedService && (
                <div>
                  <dt className="text-sm text-[var(--color-text-muted)]">Service</dt>
                  <dd className="font-medium">{selectedService.label}</dd>
                </div>
              )}
              {selectedPriority && (
                <div>
                  <dt className="text-sm text-[var(--color-text-muted)]">Priority</dt>
                  <dd className="font-medium">{selectedPriority.label}</dd>
                </div>
              )}
            </dl>
          )}
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-muted)]">
            <li>{selectedService?.preparation ?? 'Choose one workflow you want to improve and describe what a successful result would look like.'}</li>
            {selectedPriority && <li>{selectedPriority.preparation}</li>}
            <li>A plain-language overview is enough. Keep passwords, customer records, and other confidential details out of your booking notes.</li>
          </ul>
          {(selectedService || selectedPriority || context.source) && (
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              Only your fixed-choice selections and any linked public article are included in the calendar link.
            </p>
          )}
          {context.source && (
            <a className="inline-block mt-4 text-sm text-[var(--color-accent)] underline underline-offset-4" href={`/articles/${context.source}/`}>
              Revisit the article before your call
            </a>
          )}
        </section>

        <div className="relative max-w-4xl mx-auto">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent-glow)] blur-3xl rounded-full -z-10"
            aria-hidden="true"
          />
          <CalendlyEmbed url={bookingUrl} />
        </div>
      </Container>
    </main>
  );
}

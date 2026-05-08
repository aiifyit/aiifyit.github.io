import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import CalendlyEmbed from '../components/ui/CalendlyEmbed';
import { CALENDLY_URL } from '../data/constants';

export default function BookPage() {
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

        <div className="relative max-w-4xl mx-auto">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent-glow)] blur-3xl rounded-full -z-10"
            aria-hidden="true"
          />
          <CalendlyEmbed url={CALENDLY_URL} />
        </div>
      </Container>
    </main>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import GradientText from '../ui/GradientText';
import LeadForm, { type LeadFormData } from '../ui/LeadForm';
import Modal from '../ui/Modal';
import ScrollReveal from '../ui/ScrollReveal';
import Button from '../ui/Button';
import { CTA_HEADING, CTA_SUBHEADING, LEAD_WEBHOOK_URL } from '../../data/constants';

export default function CTA() {
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    try {
      if (LEAD_WEBHOOK_URL) {
        await fetch(LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            submittedAt: new Date().toISOString(),
            source: 'aiifyit.com CTA',
          }),
        });
      } else {
        // Webhook not configured yet — surface in console for local dev
        console.info('[LeadForm] LEAD_WEBHOOK_URL is empty. Captured data:', data);
      }
      setConfirmOpen(true);
    } catch (err) {
      console.error('[LeadForm] submission failed', err);
      setErrorOpen(true);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="cta" className="py-12 md:py-16 lg:py-20">
      <Container>
        <SectionHeading
          heading={
            <>
              {CTA_HEADING} <GradientText>AIify</GradientText> Your Business?
            </>
          }
          subheading={CTA_SUBHEADING}
        />

        <ScrollReveal>
          <div className="relative w-full max-w-2xl mx-auto">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent-glow)] blur-3xl rounded-full -z-10"
              aria-hidden="true"
            />

            <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 md:p-8">
              <LeadForm onSubmit={handleSubmit} submitting={submitting} />
            </div>
          </div>
        </ScrollReveal>

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
          We respond within one business day.
        </p>
      </Container>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-glow)] flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[var(--color-accent)]" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-text)]">
            Your information has been saved
          </h3>
          <p className="text-[var(--color-text-muted)] max-w-md">
            We will contact you shortly.
          </p>
          <Link
            to="/book"
            onClick={() => setConfirmOpen(false)}
            className="inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg)] font-semibold px-8 py-4 rounded-xl mt-2"
          >
            Book a call with us
          </Link>
        </div>
      </Modal>

      <Modal open={errorOpen} onClose={() => setErrorOpen(false)} title="Something went wrong">
        <div className="flex flex-col gap-4 py-2">
          <p className="text-[var(--color-text-muted)]">
            We couldn't submit your info. Please try again, or email us directly.
          </p>
          <Button
            variant="primary"
            size="default"
            onClick={() => setErrorOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </section>
  );
}

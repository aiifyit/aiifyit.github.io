import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import LeadForm, { type LeadFormData } from '../components/ui/LeadForm';
import { parseBookingContext } from '../data/booking';
import { createContactDraft, OFFER_LEAD_ENDPOINT, INQUIRY_EMAIL } from '../data/contactLead';
import { submitLeadRequest } from '../data/leadSubmission';

const publicSlugs = Object.values(import.meta.glob<string>('../../content/articles/*.json', { eager: true, import: 'slug' }));

function inquirySource(search: string) {
  const context = parseBookingContext(search, publicSlugs);
  const params = new URLSearchParams();
  if (context.service) params.set('service', context.service);
  if (context.priority) params.set('priority', context.priority);
  if (context.source) params.set('source', context.source);
  const query = params.toString();
  return query ? `/inquire/?${query}` : '/inquire/';
}

export default function InquiryPage() {
  const { search } = useLocation();
  const source = inquirySource(search);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mailto, setMailto] = useState('');
  const context = parseBookingContext(search, publicSlugs);

  const handleSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setError('');
    setMailto('');
    let draft;
    try {
      draft = createContactDraft({
        name: data.name,
        company: data.company,
        email: data.email,
        message: data.message,
        phone: data.phone,
        website: data.website,
        source,
        cta: 'Inquiry contact form',
      });
    } catch (err) {
      setSubmitting(false);
      throw err;
    }
    setMailto(draft.mailto);
    if (data.website) {
      setSuccess(true);
      setSubmitting(false);
      return;
    }
    if (!OFFER_LEAD_ENDPOINT) {
      window.location.href = draft.mailto;
      setSubmitting(false);
      return;
    }
    try {
      await submitLeadRequest(OFFER_LEAD_ENDPOINT, draft.payload);
      setSuccess(true);
      setMailto('');
    } catch (err) {
      console.error('[InquiryForm] submission failed', err);
      setError('Your message could not be delivered. Please try again or use the email draft below.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="py-12 md:py-20">
      <Container>
        <div className="max-w-2xl mx-auto">
          <a href="/articles/" className="text-sm text-[var(--color-accent)]">← Explore the articles</a>
          <p className="mt-10 mb-3 text-xs uppercase tracking-widest text-[var(--color-accent)]">Start a conversation</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">What would you like to improve?</h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] mb-8">Tell us about your workflow or AI project. We'll get back to you personally.</p>
          {context.source && <a href={`/articles/${context.source}/`} className="block mb-6 text-sm text-[var(--color-accent)]">Return to the related article →</a>}
          <section aria-label="Contact form" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
            {success ? (
              <p role="status" className="leading-relaxed">Thanks. Your message is on its way to Joshua. We reply personally.</p>
            ) : (
              <>
                <LeadForm onSubmit={handleSubmit} submitting={submitting} />
                {error && <p role="alert" className="text-red-300 mt-4 text-sm">{error}</p>}
                {mailto && error && (
                  <p className="mt-3 text-sm">
                    <a href={mailto} className="text-[var(--color-accent)] underline underline-offset-4">Email Joshua ↗</a>
                  </p>
                )}
              </>
            )}
          </section>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)] mt-6">
            If the form doesn't go through, email <a className="text-[var(--color-accent)] underline underline-offset-4" href={`mailto:${INQUIRY_EMAIL}`}>{INQUIRY_EMAIL}</a>.
          </p>
        </div>
      </Container>
    </main>
  );
}

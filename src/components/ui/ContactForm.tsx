import { useState } from 'react';
import LeadForm, { type LeadFormData } from './LeadForm';
import { createContactDraft, OFFER_LEAD_ENDPOINT, INQUIRY_EMAIL } from '../../data/contactLead';
import { submitLeadRequest } from '../../data/leadSubmission';

interface ContactFormProps {
  source: string;
  cta: string;
  createDraft?: (data: LeadFormData) => ReturnType<typeof createContactDraft>;
  className?: string;
  reply?: string;
}

export default function ContactForm({ source, cta, createDraft, className = '', reply }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mailto, setMailto] = useState('');

  const handleSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setError('');
    setMailto('');
    let draft;
    try {
      draft = createDraft ? createDraft(data) : createContactDraft({
        name: data.name,
        company: data.company,
        email: data.email,
        message: data.message,
        phone: data.phone,
        website: data.website,
        source,
        cta,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check the form and try again.');
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
    <div className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] p-6 md:p-8 ${className}`}>
      <section aria-label="Contact form">
        {success ? (
          <p role="status" className="leading-relaxed">Thanks. Your message is on its way to Joshua. We reply personally.</p>
        ) : (
          <>
            <LeadForm onSubmit={handleSubmit} submitting={submitting} />
            {error && <p role="alert" className="text-red-300 mt-4 text-sm">{error}</p>}
            {mailto && (
              <p className="mt-3 text-sm">
                <a href={mailto} className="text-[var(--color-accent)] underline underline-offset-4">Open an email draft ↗</a>
              </p>
            )}
          </>
        )}
      </section>
      {reply && <p className="mt-4 text-sm text-[var(--color-text-muted)]">{reply}</p>}
      <p className="text-sm leading-relaxed text-[var(--color-text-muted)] mt-6">
        If the form doesn't go through, email <a className="text-[var(--color-accent)] underline underline-offset-4" href={`mailto:${INQUIRY_EMAIL}`}>{INQUIRY_EMAIL}</a>.
      </p>
    </div>
  );
}

import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import { createInquiryDraft, INQUIRY_EMAIL, INQUIRY_MESSAGE_LIMIT } from '../data/inquiry';

const publicSlugs = Object.values(import.meta.glob<string>('../../content/articles/*.json', { eager: true, import: 'slug' }));
const inputClass = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

export default function InquiryPage() {
  const { search } = useLocation();
  const [message, setMessage] = useState('');
  const [attempted, setAttempted] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  let draft = createInquiryDraft('', search, publicSlugs);
  let error = '';
  try { draft = createInquiryDraft(message, search, publicSlugs); }
  catch (cause) { error = cause instanceof Error ? cause.message : 'Please simplify your overview.'; }

  return (
    <main className="py-12 md:py-20">
      <Container>
        <div className="max-w-2xl mx-auto">
          <a href="/articles/" className="text-sm text-[var(--color-accent)]">← Explore the articles</a>
          <p className="mt-10 mb-3 text-xs uppercase tracking-widest text-[var(--color-accent)]">Start a conversation</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">What would you like to improve?</h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-muted)] mb-8">Send Joshua a short note about your workflow or AI project. No appointment needed to start.</p>
          <section aria-label="Prepare an email" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
            <label htmlFor="inquiry-message" className="block font-medium mb-3">A brief overview <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label>
            <textarea id="inquiry-message" rows={4} maxLength={INQUIRY_MESSAGE_LIMIT} value={message} onChange={event => { setMessage(event.target.value); setAttempted(false); }} aria-describedby="inquiry-privacy inquiry-count" aria-invalid={Boolean(error)} className={`${inputClass} resize-y`} />
            <p id="inquiry-count" className="text-xs text-[var(--color-text-muted)] mt-2">{message.length}/{INQUIRY_MESSAGE_LIMIT} characters</p>
            <p id="inquiry-privacy" className="text-sm leading-relaxed text-[var(--color-text-muted)] mt-4 mb-6">Please leave out confidential client information, passwords, and sensitive financial or health details. This page doesn’t submit or save your note.</p>
            {error ? <p role="alert" className="text-red-300 mb-4">{error}</p> : <a href={draft.mailto} onClick={() => setAttempted(true)} className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-6 py-3 font-semibold text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-4">Email Joshua ↗</a>}
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)] mt-3">Opens a draft in your email app; review and send it there.</p>
            {attempted && <p role="status" className="mt-4 text-sm text-[var(--color-text-muted)]">Nothing has been sent from this page. If your email app didn’t open, use the address and draft below.</p>}
          </section>
          <section aria-labelledby="manual-email-heading" className="mt-8">
            <h2 id="manual-email-heading" className="text-xl font-semibold mb-3">Prefer to use your usual inbox?</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Copy the address and draft into a new email, then review and send it yourself.</p>
            <label htmlFor="inquiry-address" className="block text-sm mb-2">To</label>
            <div className="flex flex-col sm:flex-row gap-3"><input ref={addressRef} id="inquiry-address" readOnly value={INQUIRY_EMAIL} className={`${inputClass} min-w-0`} /><button type="button" onClick={() => { addressRef.current?.focus(); addressRef.current?.select(); }} className="shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm">Select email address</button></div>
            <label htmlFor="inquiry-draft" className="block text-sm mt-5 mb-2">Draft</label>
            <textarea ref={draftRef} id="inquiry-draft" readOnly rows={9} value={`Subject: ${draft.subject}\n\n${draft.body}`} className={`${inputClass} resize-y text-sm leading-relaxed`} />
            <button type="button" onClick={() => { draftRef.current?.focus(); draftRef.current?.select(); }} className="mt-3 text-sm text-[var(--color-accent)] underline underline-offset-4">Select draft text</button>
            {draft.context.source && <a href={`/articles/${draft.context.source}/`} className="block mt-6 text-sm text-[var(--color-accent)]">Return to the related article →</a>}
          </section>
        </div>
      </Container>
    </main>
  );
}

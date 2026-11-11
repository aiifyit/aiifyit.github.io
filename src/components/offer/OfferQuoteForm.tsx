import { useRef, useState } from 'react';
import { createOfferQuoteDraft, OFFER_QUOTE_SOURCE } from '../../data/offerQuote.ts';

const fieldClass =
  'mt-2 w-full border border-[var(--offer-line)] bg-white px-4 py-3 text-[var(--offer-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--offer-navy)]';

export default function OfferQuoteForm() {
  const [seats, setSeats] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [mailto, setMailto] = useState('');
  const [draftText, setDraftText] = useState('');
  const draftRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      className="offer-panel bg-[var(--offer-card)] p-6 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          const draft = createOfferQuoteDraft({
            name,
            company,
            email,
            seats,
            note,
          });
          setError('');
          setMailto(draft.mailto);
          setDraftText(`To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`);
          window.location.href = draft.mailto;
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Check the form and try again.');
        }
      }}
    >
      <input type="hidden" name="source" value={OFFER_QUOTE_SOURCE} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className="text-sm font-semibold">Name</label>
          <input id="quote-name" name="name" type="text" required autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-company" className="text-sm font-semibold">Company</label>
          <input id="quote-company" name="company" type="text" required autoComplete="organization" maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass} />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="quote-email" className="text-sm font-semibold">Email</label>
        <input id="quote-email" name="email" type="email" required autoComplete="email" maxLength={200} value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
      </div>
      <div className="mt-5">
        <label htmlFor="quote-seats" className="text-sm font-semibold">Rough number of seats</label>
        <input id="quote-seats" name="seats" type="text" required autoComplete="off" maxLength={40} value={seats} onChange={(event) => setSeats(event.target.value)} className={fieldClass} />
      </div>
      <div className="mt-5">
        <label htmlFor="quote-note" className="text-sm font-semibold">
          Anything we should know <span className="font-normal text-[var(--offer-muted)]">(optional)</span>
        </label>
        <textarea id="quote-note" name="note" rows={4} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className={`${fieldClass} resize-y`} />
        <p className="mt-2 text-right text-xs tabular-nums text-[var(--offer-muted)]">{note.length}/500</p>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-[#8d3b32]">{error}</p> : null}
      <button type="submit" className="offer-btn mt-6 w-full sm:w-auto">
        Get a quote
      </button>
      <p className="mt-4 text-sm leading-relaxed text-[var(--offer-muted)]">We reply personally. No automated sequence.</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--offer-muted)]">Opens a draft in your email app; review and send it there.</p>
      {draftText ? (
        <div className="mt-6">
          <p role="status" className="text-sm leading-relaxed text-[var(--offer-muted)]">
            Nothing has been sent from this page. If your email app did not open, use the draft below.
          </p>
          <label htmlFor="quote-draft" className="mt-4 block text-sm font-semibold">Draft</label>
          <textarea ref={draftRef} id="quote-draft" readOnly rows={10} value={draftText} className={`${fieldClass} text-sm leading-relaxed`} />
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button type="button" className="text-sm font-semibold text-[var(--offer-navy)] underline underline-offset-4" onClick={() => { draftRef.current?.focus(); draftRef.current?.select(); }}>
              Select draft text
            </button>
            <a href={mailto} className="text-sm font-semibold text-[var(--offer-navy)] underline underline-offset-4">Get a quote</a>
          </div>
        </div>
      ) : null}
    </form>
  );
}

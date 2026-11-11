import { motion } from 'framer-motion';
import { useMagnetic } from './useMagnetic';
import { useRef, useState } from 'react';
import { createOfferQuoteDraft, OFFER_LEAD_ENDPOINT, OFFER_QUOTE_SOURCE } from '../../data/offerQuote.ts';
import copy from '../../data/offerCopy.json';

const fieldClass = 'mt-2 w-full border border-[var(--offer-line)] bg-white px-4 py-3 text-[var(--offer-ink)]';
type Field = 'name' | 'company' | 'email' | 'note';
export default function OfferQuoteForm() {
  const magnetic = useMagnetic();
  const [fields, setFields] = useState({ name: '', company: '', email: '', note: '' });
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [mailto, setMailto] = useState('');
  const [draftText, setDraftText] = useState('');
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const update = (field: Field, value: string) => { setFields(prev => ({ ...prev, [field]: value })); if (invalid === field) { setInvalid(null); setError(''); } };
  function showError(message: string, field: Field | null) {
    setError(message); setInvalid(field);
    if (field) formRef.current?.querySelector<HTMLElement>(`#quote-${field}`)?.focus();
  }
  return <form ref={formRef} noValidate className="offer-panel bg-[var(--offer-card)] p-6 md:p-8" onSubmit={async event => {
    event.preventDefault();
    if (sending) return;
    setSuccess(false); setError(''); setInvalid(null); setDraftText(''); setMailto('');
    if (website) { setSuccess(true); setFields({ name: '', company: '', email: '', note: '' }); return; }
    let draft;
    try { draft = createOfferQuoteDraft(fields); }
    catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Check the form and try again.';
      const field: Field = /name/i.test(message) ? 'name' : /company/i.test(message) ? 'company' : /email/i.test(message) ? 'email' : 'note';
      showError(message, field); return;
    }
    setMailto(draft.mailto);
    setDraftText(`To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`);
    if (!OFFER_LEAD_ENDPOINT) { window.location.href = draft.mailto; return; }
    setSending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(OFFER_LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ name: fields.name.trim(), company: fields.company.trim(), email: fields.email.trim(), message: fields.note.trim(), source: OFFER_QUOTE_SOURCE, website }) });
      if (!response.ok) throw new Error('Delivery failed');
      setSuccess(true); setFields({ name: '', company: '', email: '', note: '' }); setWebsite(''); setDraftText(''); setMailto('');
    } catch { showError('Your message could not be delivered. Please try again or use the email draft below.', null); }
    finally { window.clearTimeout(timeout); setSending(false); }
  }}>
    <input type="hidden" name="source" value={OFFER_QUOTE_SOURCE}/>
    <div className="offer-honeypot" aria-hidden="true"><label htmlFor="quote-website">Website</label><input id="quote-website" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)}/></div>
    {success && <div role="status" className="offer-form-success">Thanks. Your message is on its way to Joshua. We reply personally.</div>}
    <div className="grid gap-5 md:grid-cols-2">{(['name','company'] as const).map(field => <div key={field}><label htmlFor={`quote-${field}`} className="text-sm font-semibold">{field === 'name' ? 'Name' : 'Company'}</label><input id={`quote-${field}`} name={field} type="text" required autoComplete={field === 'name' ? 'name' : 'organization'} maxLength={field === 'name' ? 120 : 160} value={fields[field]} onChange={e => update(field,e.target.value)} aria-invalid={invalid === field} aria-describedby={invalid === field ? 'quote-error' : undefined} className={fieldClass}/></div>)}</div>
    <div className="mt-5"><label htmlFor="quote-email" className="text-sm font-semibold">Email</label><input id="quote-email" name="email" type="email" required autoComplete="email" maxLength={200} value={fields.email} onChange={e => update('email',e.target.value)} aria-invalid={invalid === 'email'} aria-describedby={invalid === 'email' ? 'quote-error' : undefined} className={fieldClass}/></div>
    <div className="mt-5"><label htmlFor="quote-note" className="text-sm font-semibold">Anything we should know</label><textarea id="quote-note" name="message" required rows={4} maxLength={500} value={fields.note} onChange={e => update('note',e.target.value)} aria-invalid={invalid === 'note'} aria-describedby={invalid === 'note' ? 'quote-counter quote-error' : 'quote-counter'} className={`${fieldClass} resize-y`}/><p id="quote-counter" className="mt-2 text-right text-xs tabular-nums text-[var(--offer-muted)]">{fields.note.length}/500</p></div>
    {error && <p id="quote-error" role="alert" className="offer-form-error mt-4 text-sm">{error}</p>}
    <motion.button type="submit" disabled={sending} aria-busy={sending} className="offer-btn mt-6 w-full sm:w-auto" {...magnetic}>{copy.cta}</motion.button>
    <p className="mt-4 text-sm leading-relaxed text-[var(--offer-muted)]">{copy.quote.reply}</p>
    {!OFFER_LEAD_ENDPOINT && <p className="mt-2 text-sm leading-relaxed text-[var(--offer-muted)]">Opens a draft in your email app; review and send it there.</p>}
    {draftText && <div className="mt-6"><p role="status" className="text-sm leading-relaxed text-[var(--offer-muted)]">{OFFER_LEAD_ENDPOINT ? 'You can send your message with the email draft below.' : 'Nothing has been sent from this page. If your email app did not open, use the draft below.'}</p><label htmlFor="quote-draft" className="mt-4 block text-sm font-semibold">Draft</label><textarea ref={draftRef} id="quote-draft" readOnly rows={10} value={draftText} className={`${fieldClass} text-sm leading-relaxed`}/><div className="mt-3 flex flex-wrap items-center gap-4"><button type="button" className="offer-text-link" onClick={() => { draftRef.current?.focus(); draftRef.current?.select(); }}>Select draft text</button><a href={mailto} className="offer-text-link">{copy.cta}</a></div></div>}
  </form>;
}

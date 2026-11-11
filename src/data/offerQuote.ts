import { INQUIRY_EMAIL, INQUIRY_MESSAGE_LIMIT } from './inquiry.ts';

export const OFFER_QUOTE_SOURCE = '/new-offer';
export const OFFER_QUOTE_SUBJECT = 'AIify partner quote';

export interface OfferQuoteInput {
  name: string;
  company: string;
  email: string;
  seats: string;
  note?: string;
}

function rejectControlCharacters(value: string, label: string) {
  if (Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127;
  })) {
    throw new Error(`Remove unsupported control characters from ${label}.`);
  }
}

function oneLine(value: string, label: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`Keep ${label.toLowerCase()} under ${max} characters.`);
  if (/[\r\n]/.test(trimmed)) throw new Error(`Keep ${label.toLowerCase()} on one line.`);
  rejectControlCharacters(trimmed, label.toLowerCase());
  return trimmed;
}

export function createOfferQuoteDraft(input: OfferQuoteInput) {
  const name = oneLine(input.name, 'Name', 120);
  const company = oneLine(input.company, 'Company', 160);
  const email = oneLine(input.email, 'Email', 200);
  const seats = oneLine(input.seats, 'Rough number of seats', 40);
  const note = (input.note ?? '').trim();
  if (note.length > INQUIRY_MESSAGE_LIMIT) throw new Error('Keep your note to 500 characters.');
  if (note) rejectControlCharacters(note, 'the note');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');

  const lines = [
    'Hi Joshua,',
    '',
    "I'd like a quote for offering AI co-management under our name.",
    '',
    `Source: ${OFFER_QUOTE_SOURCE}`,
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Rough number of seats: ${seats}`,
  ];
  if (note) lines.push('', 'Anything we should know:', note);
  const body = lines.join('\n').replace(/\r\n|\r|\n/g, '\r\n');
  return {
    recipient: INQUIRY_EMAIL,
    subject: OFFER_QUOTE_SUBJECT,
    body,
    source: OFFER_QUOTE_SOURCE,
    mailto: `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(OFFER_QUOTE_SUBJECT)}&body=${encodeURIComponent(body)}`,
  };
}

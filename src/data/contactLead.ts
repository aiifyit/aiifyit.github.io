import { INQUIRY_EMAIL, INQUIRY_MESSAGE_LIMIT } from './inquiry.ts';
import { OFFER_LEAD_ENDPOINT } from './offerQuote.ts';
import { formatEastern, formatWebsiteInquiryEmail } from './websiteInquiryEmail.ts';

export { OFFER_LEAD_ENDPOINT, INQUIRY_EMAIL, INQUIRY_MESSAGE_LIMIT };
export const CONTACT_LEAD_TYPE = 'Inquiry';

export interface ContactLeadInput {
  name: string;
  company: string;
  email: string;
  message: string;
  source: string;
  cta: string;
  phone?: string;
  website?: string;
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

export function createContactDraft(input: ContactLeadInput) {
  const name = oneLine(input.name, 'Name', 120);
  const company = oneLine(input.company, 'Company', 160);
  const email = oneLine(input.email, 'Email', 200);
  const source = oneLine(input.source, 'Source', 200);
  const cta = oneLine(input.cta, 'CTA', 80);
  const phone = (input.phone ?? '').trim();
  const message = (input.message ?? '').trim();
  if (!message) throw new Error('Tell us a little about what you need.');
  if (message.length > INQUIRY_MESSAGE_LIMIT) throw new Error('Keep your note to 500 characters.');
  rejectControlCharacters(message, 'the note');
  if (phone) {
    if (phone.length > 40) throw new Error('Keep phone under 40 characters.');
    if (/[\r\n]/.test(phone)) throw new Error('Keep phone on one line.');
    rejectControlCharacters(phone, 'phone');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');

  const emailContent = formatWebsiteInquiryEmail({
    name,
    email,
    company,
    message,
    source,
    cta,
    sent: formatEastern(),
    ...(phone ? { phone } : {}),
  });
  const body = emailContent.text.replace(/\r\n|\r|\n/g, '\r\n');
  return {
    recipient: INQUIRY_EMAIL,
    subject: emailContent.subject,
    body,
    html: emailContent.html,
    source,
    mailto: `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(body)}`,
    payload: {
      name,
      company,
      email,
      message,
      source,
      cta,
      type: CONTACT_LEAD_TYPE,
      ...(phone ? { phone } : {}),
      website: input.website ?? '',
    },
  };
}

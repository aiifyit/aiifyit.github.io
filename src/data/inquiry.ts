import inquiry from '../../content/inquiry.json' with { type: 'json' };
import { BOOKING_PRIORITIES, BOOKING_SERVICES, parseBookingContext } from './booking.ts';

// Confirmed public business contact; this is an email-app handoff, not a sender service.
export const INQUIRY_EMAIL = inquiry.recipient;
export const INQUIRY_MESSAGE_LIMIT = 500;

export function createInquiryDraft(message = '', search = '', publicSlugs: readonly string[] = []) {
  if (message.length > INQUIRY_MESSAGE_LIMIT) throw new Error('Keep your overview to 500 characters.');
  if (Array.from(message).some(char => { const code = char.charCodeAt(0); return (code < 32 && ![9, 10, 13].includes(code)) || code === 127; })) {
    throw new Error('Remove unsupported control characters from your overview.');
  }
  const context = parseBookingContext(search, publicSlugs);
  const service = context.service ? BOOKING_SERVICES[context.service].label : undefined;
  const priority = context.priority ? BOOKING_PRIORITIES[context.priority].label : undefined;
  const subject = `AIify It inquiry${service ? `: ${service}` : ''}`;
  const body = ['Hi Joshua,', '', "I'd like to discuss a workflow or AI project.",
    ...(service ? ['', `Service: ${service}`] : []),
    ...(priority ? [`Topic: ${priority}`] : []),
    ...(context.source ? [`Article: https://aiifyit.com/articles/${context.source}/`] : []),
    ...(message.trim() ? ['', 'Brief overview:', message.trim()] : []),
  ].join('\n').replace(/\r\n|\r|\n/g, '\r\n');
  return { recipient: INQUIRY_EMAIL, subject, body, context,
    mailto: `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

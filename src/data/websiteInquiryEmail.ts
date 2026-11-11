export interface WebsiteInquiryEmail {
  name: string;
  email: string;
  company: string;
  message: string;
  source: string;
  cta: string;
  sent: string;
  phone?: string;
}

export function formatEastern(date: Date = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return `${formatted} ET`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatWebsiteInquiryEmail(input: WebsiteInquiryEmail) {
  const page = input.source;
  const pageUrl = page.startsWith('/') ? `https://aiifyit.com${page}` : page;
  const subject = `Website inquiry: ${input.name} (${input.company}) via ${page}`;
  const fields: Array<[string, string]> = [
    ['Name', input.name],
    ['Email', input.email],
    ['Company', input.company],
    ...(input.phone ? [['Phone', input.phone] as [string, string]] : []),
    ['Page', pageUrl],
    ['CTA clicked', input.cta],
    ['Sent', input.sent],
  ];

  const text = [
    'AIIFY WEBSITE INQUIRY',
    '=====================',
    '',
    ...fields.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message',
    '-------',
    input.message,
    '',
    'Reply directly to this email to reach the sender.',
  ].join('\n');

  const rows = fields.map(([label, value]) => `
              <tr>
                <td style="padding:8px 16px 8px 0;color:#5c6568;font-size:13px;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
                <td style="padding:8px 0;color:#121417;font-size:15px;vertical-align:top;">${escapeHtml(value)}</td>
              </tr>`).join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2f3;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f3;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #d5dee0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0d1114;padding:22px 28px;">
                <p style="margin:0 0 6px;color:#A3D7E2;font-size:11px;letter-spacing:.16em;text-transform:uppercase;">AIify website</p>
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">Website inquiry</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  ${rows}
                </table>
                <div style="margin-top:24px;padding-top:20px;border-top:1px solid #d5dee0;">
                  <p style="margin:0 0 8px;color:#5c6568;font-size:13px;">Message</p>
                  <p style="margin:0;color:#121417;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f6f8f8;color:#5c6568;font-size:12px;line-height:1.5;">
                Reply directly to this email to reach the sender.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return { subject, text, html };
}

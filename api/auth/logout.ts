import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearCookie, isSameOrigin, SESSION_COOKIE } from '../_lib/auth.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!isSameOrigin(request)) return response.status(403).json({ error: 'Invalid request origin' });

  response.setHeader('Set-Cookie', clearCookie(SESSION_COOKIE));
  return response.status(204).end();
}

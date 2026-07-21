import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readSession } from '../_lib/auth.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const user = await readSession(request);
  if (!user) return response.status(401).json({ authenticated: false });
  return response.status(200).json({ authenticated: true, user });
}

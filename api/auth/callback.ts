import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  baseUrl,
  clearCookie,
  constantTimeEqual,
  createSessionToken,
  getCookie,
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCleanupCookies,
  requiredEnv,
  secureCookie,
  SESSION_COOKIE,
  verifyGoogleIdToken,
} from '../_lib/auth.js';

function redirectToWorkspace(response: VercelResponse, error?: string) {
  response.statusCode = 302;
  response.setHeader('Location', error ? `/sow?auth_error=${encodeURIComponent(error)}` : '/sow');
  return response.end();
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const code = typeof request.query.code === 'string' ? request.query.code : undefined;
  const returnedState = typeof request.query.state === 'string' ? request.query.state : undefined;
  const expectedState = getCookie(request, OAUTH_STATE_COOKIE);
  const expectedNonce = getCookie(request, OAUTH_NONCE_COOKIE);
  const verifier = getCookie(request, OAUTH_VERIFIER_COOKIE);

  response.setHeader('Set-Cookie', oauthCleanupCookies());
  if (!code || !expectedNonce || !verifier || !constantTimeEqual(returnedState, expectedState)) {
    return redirectToWorkspace(response, 'invalid_request');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: requiredEnv('GOOGLE_CLIENT_ID'),
        client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
        redirect_uri: `${baseUrl(request)}/api/auth/callback`,
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
    });

    if (!tokenResponse.ok) return redirectToWorkspace(response, 'google_exchange');
    const tokens = await tokenResponse.json() as { id_token?: string };
    if (!tokens.id_token) return redirectToWorkspace(response, 'missing_identity');

    const user = await verifyGoogleIdToken(tokens.id_token, expectedNonce);
    const sessionToken = await createSessionToken(user);
    response.setHeader('Set-Cookie', [
      ...oauthCleanupCookies(),
      secureCookie(SESSION_COOKIE, sessionToken, 60 * 60 * 8),
    ]);
    return redirectToWorkspace(response);
  } catch (error) {
    response.setHeader('Set-Cookie', [
      ...oauthCleanupCookies(),
      clearCookie(SESSION_COOKIE),
    ]);
    const message = error instanceof Error ? error.message : '';
    return redirectToWorkspace(response, message.includes('domain') ? 'domain' : 'authentication');
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  allowedWorkspaceDomain,
  baseUrl,
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  pkceChallenge,
  randomToken,
  requiredEnv,
  secureCookie,
} from '../_lib/auth.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const state = randomToken();
    const nonce = randomToken();
    const verifier = randomToken(48);
    const callbackUrl = `${baseUrl(request)}/api/auth/callback`;
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.search = new URLSearchParams({
      client_id: requiredEnv('GOOGLE_CLIENT_ID'),
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      nonce,
      hd: allowedWorkspaceDomain(),
      prompt: 'select_account',
      access_type: 'online',
      code_challenge: pkceChallenge(verifier),
      code_challenge_method: 'S256',
    }).toString();

    response.setHeader('Set-Cookie', [
      secureCookie(OAUTH_STATE_COOKIE, state, 600),
      secureCookie(OAUTH_NONCE_COOKIE, nonce, 600),
      secureCookie(OAUTH_VERIFIER_COOKIE, verifier, 600),
    ]);
    response.statusCode = 302;
    response.setHeader('Location', authorizationUrl.toString());
    return response.end();
  } catch {
    return response.status(503).json({ error: 'Google sign-in is not configured' });
  }
}

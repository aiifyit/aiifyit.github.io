import crypto from 'node:crypto';
import type { VercelRequest } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

export const SESSION_COOKIE = '__Host-aiify_sow_session';
export const OAUTH_STATE_COOKIE = '__Host-aiify_sow_oauth_state';
export const OAUTH_NONCE_COOKIE = '__Host-aiify_sow_oauth_nonce';
export const OAUTH_VERIFIER_COOKIE = '__Host-aiify_sow_oauth_verifier';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const SESSION_ISSUER = 'aiify-sow-auth';
const SESSION_AUDIENCE = 'aiify-sow-workspace';

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  domain: string;
};

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function allowedWorkspaceDomain(): string {
  return (process.env.GOOGLE_WORKSPACE_DOMAIN || 'aiifyit.com').trim().toLowerCase();
}

export function baseUrl(request: VercelRequest): string {
  const configured = process.env.AUTH_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const host = request.headers['x-forwarded-host'] || request.headers.host;
  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol || 'https';
  const resolvedHost = Array.isArray(host) ? host[0] : host;
  if (!resolvedHost) throw new Error('Unable to determine request host');
  return `${protocol}://${resolvedHost}`;
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function pkceChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export function constantTimeEqual(left?: string, right?: string): boolean {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getCookie(request: VercelRequest, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=');
    if (separator === -1) continue;
    const cookieName = cookie.slice(0, separator).trim();
    if (cookieName !== name) continue;
    return decodeURIComponent(cookie.slice(separator + 1));
  }

  return undefined;
}

export function secureCookie(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function oauthCleanupCookies(): string[] {
  return [
    clearCookie(OAUTH_STATE_COOKIE),
    clearCookie(OAUTH_NONCE_COOKIE),
    clearCookie(OAUTH_VERIFIER_COOKIE),
  ];
}

export async function verifyGoogleIdToken(idToken: string, expectedNonce: string): Promise<SessionUser> {
  const clientId = requiredEnv('GOOGLE_CLIENT_ID');
  const domain = allowedWorkspaceDomain();
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    audience: clientId,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
  });

  if (!constantTimeEqual(typeof payload.nonce === 'string' ? payload.nonce : undefined, expectedNonce)) {
    throw new Error('Invalid Google authentication nonce');
  }
  if (payload.email_verified !== true) throw new Error('Google email is not verified');
  if (typeof payload.hd !== 'string' || payload.hd.toLowerCase() !== domain) {
    throw new Error('Google Workspace domain is not authorized');
  }
  if (typeof payload.email !== 'string' || !payload.email.toLowerCase().endsWith(`@${domain}`)) {
    throw new Error('Google email domain is not authorized');
  }
  if (typeof payload.sub !== 'string') throw new Error('Google account identifier is missing');

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: typeof payload.name === 'string' ? payload.name : payload.email,
    picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    domain,
  };
}

function sessionSecret(): Uint8Array {
  const secret = requiredEnv('AUTH_SECRET');
  if (secret.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    picture: user.picture,
    domain: user.domain,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.sub)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(sessionSecret());
}

export async function readSession(request: VercelRequest): Promise<SessionUser | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ['HS256'],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    const domain = allowedWorkspaceDomain();
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.domain !== 'string' ||
      payload.domain.toLowerCase() !== domain ||
      !payload.email.toLowerCase().endsWith(`@${domain}`)
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : payload.email,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      domain,
    };
  } catch {
    return null;
  }
}

export function isSameOrigin(request: VercelRequest): boolean {
  const origin = request.headers.origin;
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  const resolvedOrigin = Array.isArray(origin) ? origin[0] : origin;
  const resolvedHost = Array.isArray(host) ? host[0] : host;
  if (!resolvedOrigin || !resolvedHost) return false;

  try {
    return new URL(resolvedOrigin).host === resolvedHost;
  } catch {
    return false;
  }
}

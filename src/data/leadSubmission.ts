/** Resolve only when the configured endpoint accepts the request; never log form data. */
export async function submitLeadRequest(endpoint: string, payload: unknown, send: typeof fetch = fetch): Promise<void> {
  if (!endpoint) throw new Error('Lead endpoint is not configured');
  const response = await send(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Lead endpoint returned HTTP ${response.status}`);
}

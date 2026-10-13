import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKING_PRIORITIES, BOOKING_SERVICES, createBookingUrl, parseBookingContext } from '../src/data/booking.ts';

const calendar = 'https://calendly.com/jon-aiifyit/30min';
const articles = ['ai-workflow-wrong-route'];

test('every fixed service and priority survives the booking handoff', () => {
  for (const service of Object.keys(BOOKING_SERVICES)) {
    for (const priority of Object.keys(BOOKING_PRIORITIES)) {
      const context = parseBookingContext(`?service=${service}&priority=${priority}&source=${articles[0]}`, articles);
      assert.deepEqual(context, { service, priority, source: articles[0] });
      const url = new URL(createBookingUrl(calendar, context));
      assert.equal(url.origin + url.pathname, calendar);
      assert.equal(url.searchParams.get('utm_campaign'), service);
      assert.equal(url.searchParams.get('utm_term'), priority);
      assert.equal(url.searchParams.get('utm_content'), articles[0]);
    }
  }
});

test('unknown, prototype, mixed-case, and free-text selections are dropped', () => {
  for (const value of ['__proto__', 'constructor', 'toString', 'Workflow-Automation', 'unknown', 'name@example.com', '<script>']) {
    const query = new URLSearchParams({ service: value, priority: value, source: value });
    assert.deepEqual(parseBookingContext(query.toString(), articles), {});
  }
});

test('source must be a known public slug, not merely slug-shaped', () => {
  assert.deepEqual(parseBookingContext('?source=unpublished-client-name', articles), {});
  assert.deepEqual(parseBookingContext(`?source=${articles[0]}`), {});
  for (const source of ['../private', 'https://example.com', 'a'.repeat(101), 'name@example.com']) {
    assert.deepEqual(parseBookingContext(`?source=${encodeURIComponent(source)}`, [...articles, source]), {});
  }
});

test('duplicate recognized keys fail closed, even when their values match', () => {
  assert.deepEqual(parseBookingContext('?service=workflow-automation&service=custom-ai-agents&priority=routing&priority=routing&source=ai-workflow-wrong-route&source=ai-workflow-wrong-route', articles), {});
  assert.deepEqual(parseBookingContext('?service=workflow-automation&service=unknown&priority=routing', articles), { priority: 'routing' });
});

test('unrelated query data never enters the calendar link', () => {
  const context = parseBookingContext('?service=workflow-integration&priority=integrations&email=private@example.com&name=Private&notes=secret&utm_content=private&redirect=https://example.com', articles);
  const url = new URL(createBookingUrl(calendar, context));
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    utm_source: 'aiifyit',
    utm_medium: 'website',
    utm_campaign: 'workflow-integration',
    utm_term: 'integrations',
    utm_content: 'direct',
  });
});

test('empty and malformed queries use generic defaults', () => {
  for (const search of ['', '?', '?service=&priority=&source=', '?service=%E0%A4%A&priority=%ZZ']) {
    assert.deepEqual(parseBookingContext(search, articles), {});
  }
  const url = new URL(createBookingUrl(calendar, {}));
  assert.equal(url.searchParams.get('utm_campaign'), 'strategy-call');
  assert.equal(url.searchParams.get('utm_term'), 'general');
  assert.equal(url.searchParams.get('utm_content'), 'direct');
});

test('configured destination and options are preserved while UTM values are deterministic', () => {
  const url = new URL(createBookingUrl(`${calendar}?hide_event_type_details=1&utm_source=old`, { service: 'custom-ai-agents' }));
  assert.equal(url.origin + url.pathname, calendar);
  assert.equal(url.searchParams.get('hide_event_type_details'), '1');
  assert.equal(url.searchParams.getAll('utm_source').length, 1);
  assert.equal(url.searchParams.get('utm_source'), 'aiifyit');
});

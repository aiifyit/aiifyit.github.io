import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { auditArticles, auditDirectory, PRIVACY_SCAN_LIMITATION } from './content-audit.mjs';

const site = {
  name: 'Example Studio',
  url: 'https://example.com',
  description: 'Practical guides to help teams design more reliable workflows.',
  founder: { name: 'Alex Example' },
  routes: ['/', '/book/', '/articles/'],
  articleIndex: { title: 'Practical workflow lessons', description: 'Useful lessons for teams designing clear and reliable business workflows.' },
};
const article = {
  slug: 'design-a-reliable-workflow',
  title: 'Design a reliable workflow before adding automation',
  description: 'A practical guide to documenting a workflow and defining a clear owner before introducing automation.',
  category: 'Workflow design',
  takeaway: 'Start with the handoff and decide who owns the next step.',
  sections: [{ id: 'start-with-ownership', title: 'Start with ownership', paragraphs: ['Choose a clear owner for the next action.'], bullets: ['Write down the handoff.'] }],
  cta: { title: 'Discuss your workflow', description: 'Bring a workflow you want to simplify.', label: 'Book a conversation', href: '/book/' },
  review: { privacy: 'approved', claims: 'approved', reviewedOn: '2026-10-13' },
};
const fixture = () => structuredClone(article);
const errorsFor = (value, identity = site) => auditArticles([value], identity).errors.join('\n');

test('valid reviewed content has no errors or claim warnings', () => {
  assert.deepEqual(auditArticles([fixture()], site), { errors: [], warnings: [] });
  assert.match(PRIVACY_SCAN_LIMITATION, /cannot establish anonymity/);
});

test('duplicate slugs fail the whole-library audit', () => {
  assert.match(auditArticles([fixture(), fixture()], site).errors.join('\n'), /duplicate slug/);
});

test('missing and unknown fields fail closed at every schema level', () => {
  for (const key of Object.keys(article)) {
    const changed = fixture();
    delete changed[key];
    assert.match(errorsFor(changed), new RegExp(`\\.${key}: required field is missing`));
  }
  for (const mutate of [
    (value) => { value.privateNotes = 'Do not publish.'; },
    (value) => { value.sections[0].transcript = 'Source material.'; },
    (value) => { value.cta.trackingId = 'tracking'; },
    (value) => { value.review.reviewerEmail = 'redacted'; },
  ]) {
    const changed = fixture();
    mutate(changed);
    assert.match(errorsFor(changed), /unknown field/);
  }
  assert.match(errorsFor(fixture(), { ...site, unused: true }), /unknown field/);
  assert.match(errorsFor(fixture(), { ...site, founder: { name: 'Alex Example', company: 'Example' } }), /unknown field/);
});

test('malformed metadata and invalid slugs are rejected', () => {
  for (const [key, value] of [['title', 'Tiny'], ['description', 'Too short'], ['title', 'x'.repeat(101)], ['description', 'x'.repeat(181)], ['slug', '../private'], ['category', 42]]) {
    const changed = fixture();
    changed[key] = value;
    assert.ok(auditArticles([changed], site).errors.length > 0, key);
  }
  const changed = fixture();
  changed.title += '\nInjected metadata';
  assert.match(errorsFor(changed), /control characters/);
  changed.title = '<script>alert(1)</script>';
  assert.match(errorsFor(changed), /HTML is not allowed/);
});

test('site identity requires valid HTTPS origin and known canonical routes', () => {
  for (const url of ['not-a-url', 'http://example.com', 'https://example.com/', 'https://user:password@example.com', 'https://example.com/private', 'https://example.com/?query=1', 'https://example.com/#fragment']) {
    assert.match(errorsFor(fixture(), { ...site, url }), /site.url/);
  }
  assert.match(errorsFor(fixture(), { ...site, routes: ['/'] }), /required route \/book\//);
  assert.match(errorsFor(fixture(), { ...site, routes: [...site.routes, '/book/'] }), /duplicate route/);
  assert.match(errorsFor(fixture(), { ...site, routes: [...site.routes, '/not-canonical'] }), /trailing slash/);
});

test('required article index metadata is strictly validated', () => {
  const identity = structuredClone(site);
  assert.deepEqual(auditArticles([fixture()], identity).errors, []);
  identity.articleIndex.description = 'Too short';
  assert.match(errorsFor(fixture(), identity), /site.articleIndex.description/);
  identity.articleIndex.extra = true;
  assert.match(errorsFor(fixture(), identity), /site.articleIndex.extra: unknown field/);
  delete identity.articleIndex.title;
  assert.match(errorsFor(fixture(), identity), /site.articleIndex.title: required field/);
  delete identity.articleIndex;
  assert.match(errorsFor(fixture(), identity), /site.articleIndex: required field is missing/);
});

test('site URL must equal its normalized origin to keep canonical paths unambiguous', () => {
  for (const url of ['https://example.com/', 'https://EXAMPLE.com', 'https://example.com:443']) {
    assert.match(errorsFor(fixture(), { ...site, url }), /must exactly match an HTTPS origin/);
  }
  assert.deepEqual(auditArticles([fixture()], { ...site, url: 'https://www.example.com' }).errors, []);
});

test('section IDs must be valid and unique within the article', () => {
  const changed = fixture();
  changed.sections.push(structuredClone(changed.sections[0]));
  assert.match(errorsFor(changed), /duplicate section ID/);
  changed.sections[1].id = 'Bad ID';
  assert.match(errorsFor(changed), /kebab-case section ID/);
});

test('paragraphs and optional bullets must be non-empty string arrays', () => {
  for (const key of ['paragraphs', 'bullets']) {
    for (const value of [[], null, 'text', [42], ['']]) {
      const changed = fixture();
      changed.sections[0][key] = value;
      assert.ok(auditArticles([changed], site).errors.length > 0, `${key}: ${JSON.stringify(value)}`);
    }
  }
});

test('internal links resolve across the complete library including section fragments', () => {
  const first = fixture();
  const second = fixture();
  second.slug = 'a-second-article';
  first.cta.href = '/articles/a-second-article/#start-with-ownership';
  assert.deepEqual(auditArticles([first, second], site).errors, []);
  for (const href of ['/missing/', '/articles/missing/', '/book', '//outside.example/', 'https://outside.example/', 'javascript:alert(1)', '/articles/a-second-article/#missing', '/#missing', '/book/../', '/book/?tracking=yes', '/book/#']) {
    first.cta.href = href;
    assert.ok(auditArticles([first, second], site).errors.length > 0, href);
  }
});

test('pending or missing privacy and claims approvals block publication', () => {
  for (const gate of ['privacy', 'claims']) {
    for (const value of ['pending', false, null, 'Approved']) {
      const changed = fixture();
      changed.review[gate] = value;
      assert.match(errorsFor(changed), /must be explicitly approved after human review/);
    }
  }
});

test('review dates are real ISO calendar dates', () => {
  for (const date of ['2026-02-30', '2026-02-29', '2026-13-01', '13/10/2026', '', null]) {
    const changed = fixture();
    changed.review.reviewedOn = date;
    assert.match(errorsFor(changed), /must be a real date/);
  }
  const changed = fixture();
  changed.review.reviewedOn = '2024-02-29';
  assert.deepEqual(auditArticles([changed], site).errors, []);
});

test('common direct identifiers and raw transcripts fail even with approval flags', () => {
  for (const content of [
    'Contact someone@example.com for the original details.',
    'transcript_id: transcript_123456789',
    'customerId=customer123456',
    'The account is cus_AbCdEfGh123456.',
    'Record recAbCdEfGh123456 uses the old process.',
    'https://app.fireflies.ai/view/example-transcript-id',
    'https://docs.google.com/document/d/private-document-id/edit',
    'https://example.salesforce.com/001AbCdEfGhIjKlM',
    'Speaker 1: Here is the source interview.',
    '[00:12:30] Person: Here is a source quote.',
    'WEBVTT\n\n00:00:01.000 --> 00:00:02.000',
  ]) {
    const changed = fixture();
    changed.sections[0].paragraphs = [content];
    const errors = errorsFor(changed);
    assert.match(errors, /possible (?:email address|provider identifier|provider record URL|raw transcript marker)/, content);
    assert.ok(!errors.includes(content), 'diagnostics must not repeat sensitive content');
  }
});

test('quantitative claims remain visible warnings and unapproved claims fail', () => {
  const changed = fixture();
  changed.sections[0].paragraphs = ['The process saved 20 hours and doubled revenue.'];
  const approved = auditArticles([changed], site);
  assert.equal(approved.errors.length, 0);
  assert.equal(approved.warnings.length, 1);
  assert.match(approved.warnings[0], /quantitative claim/);
  changed.review.claims = 'pending';
  const pending = auditArticles([changed], site);
  assert.match(pending.errors.join('\n'), /review.claims/);
  assert.equal(pending.warnings.length, 1);
});

test('invalid top-level inputs produce diagnostics rather than throw', () => {
  for (const value of [undefined, null, {}, 'bad', 42]) assert.ok(auditArticles(value, null).errors.length > 0);
  for (const value of [undefined, null, [], 'bad', 42]) assert.ok(auditArticles([value], site).errors.length > 0);
  assert.match(auditArticles([], site).errors.join('\n'), /at least one article/);
});

test('diagnostic order is deterministic', () => {
  const first = fixture();
  const second = fixture();
  first.extra = true;
  second.review.privacy = 'pending';
  const report = auditArticles([first, second], site);
  assert.deepEqual(report, auditArticles([first, second], site));
  assert.deepEqual(report.errors, [...report.errors].sort());
});

test('directory audit covers every file, validates filenames, and reports malformed JSON safely', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'article-audit-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'content/articles'), { recursive: true });
  await writeFile(path.join(root, 'content/site.json'), JSON.stringify(site));
  await writeFile(path.join(root, `content/articles/${article.slug}.json`), JSON.stringify(article));
  assert.deepEqual(await auditDirectory(root), { errors: [], warnings: [] });
  await writeFile(path.join(root, 'content/articles/wrong-name.json'), JSON.stringify(article));
  await writeFile(path.join(root, 'content/articles/broken.json'), '{"private":"someone@example.com"');
  await writeFile(path.join(root, 'content/articles/source.txt'), 'unreviewed source');
  const result = await auditDirectory(root);
  assert.match(result.errors.join('\n'), /duplicate slug/);
  assert.match(result.errors.join('\n'), /filename must match/);
  assert.match(result.errors.join('\n'), /broken.json: invalid JSON/);
  assert.match(result.errors.join('\n'), /only JSON article files/);
  assert.ok(!result.errors.join('\n').includes('someone@example.com'));
  assert.deepEqual(result, await auditDirectory(root));
});

test('missing source files fail closed', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'article-audit-missing-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const result = await auditDirectory(root);
  assert.match(result.errors.join('\n'), /content\/site.json: could not read/);
  assert.match(result.errors.join('\n'), /could not read article directory/);
});

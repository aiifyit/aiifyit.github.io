#!/usr/bin/env node
/**
 * Fail-closed validation for the public article library.
 * Privacy matching is deliberately limited: it catches common direct identifiers
 * and transcript shapes, not every name, confidential fact, or re-identification
 * risk. An editorial privacy/claims review is required even when this scan is clean.
 * Review values are attestations, not proof that an editorial review took place.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROUTE = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/;
const ARTICLE_FIELDS = ['slug', 'title', 'description', 'category', 'takeaway', 'sections', 'cta', 'review'];
const SITE_FIELDS = ['name', 'url', 'description', 'founder', 'routes', 'articleIndex'];
const REQUIRED_ROUTES = ['/', '/book/', '/articles/'];
const PRIVACY_PATTERNS = [
  ['email address', /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}\b/i],
  ['provider identifier', /\b(?:transcript|meeting|recording|conversation|customer|client|account|contact)[_-]?id\b\s*[=:]\s*["']?[A-Z0-9_-]{6,}/i],
  ['provider identifier', /\b(?:rec|app|tbl)[A-Za-z0-9]{14}\b|\b(?:cus|acct|sk_live|pk_live|ch|pi|sub)_[A-Za-z0-9]{8,}\b/],
  ['provider record URL', /https?:\/\/(?:app\.fireflies\.ai\/(?:view|meeting)|(?:[a-z0-9-]+\.)?otter\.ai\/u|[a-z0-9-]+\.salesforce\.com|app\.hubspot\.com\/contacts|docs\.google\.com\/(?:document|spreadsheets)\/d)\//i],
  ['raw transcript marker', /(?:^|\n)\s*(?:\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s+(?:[A-Z][\w .'-]{0,50}:)?|(?:speaker\s*\d+|interviewer|interviewee|participant\s*\d+)\s*:)/i],
  ['raw transcript marker', /\b(?:BEGIN\s+(?:RAW\s+)?TRANSCRIPT|WEBVTT|\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->)/i],
];
const QUANTITATIVE_CLAIM = /(?:\b\d+(?:[,.]\d+)*\s*(?:%|percent\b|percentage\b|times\b|x\b|hours?\b|minutes?\b|days?\b|weeks?\b|months?\b|dollars?\b|customers?\b|clients?\b|leads?\b|revenue\b|ROI\b)|[$£€]\s*\d|\b(?:double[ds]?|triple[ds]?|half|twice)\b|\b(?:one|two|three|four|five|ten|hundred|thousand)\s+(?:percent|hours?|minutes?|times|customers?|clients?)\b)/i;

export const PRIVACY_SCAN_LIMITATION = 'Privacy scan is limited to common identifier/transcript patterns; it cannot establish anonymity or replace editorial privacy and claims review.';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringEntries(value, prefix = '', result = []) {
  if (typeof value === 'string') result.push([prefix, value]);
  else if (Array.isArray(value)) value.forEach((item, index) => stringEntries(item, `${prefix}[${index}]`, result));
  else if (isObject(value)) Object.keys(value).sort().forEach((key) => stringEntries(value[key], `${prefix}.${key}`, result));
  return result;
}

/** Returns stable, human-readable diagnostics; inputs are plain JSON values. */
export function auditArticles(articles, site) {
  const errors = [];
  const warnings = [];
  const error = (location, message) => errors.push(`${location}: ${message}`);
  const shape = (value, location, required, optional = []) => {
    if (!isObject(value)) {
      error(location, 'must be an object');
      return false;
    }
    required.forEach((key) => {
      if (!Object.hasOwn(value, key)) error(`${location}.${key}`, 'required field is missing');
    });
    Object.keys(value).sort().forEach((key) => {
      if (![...required, ...optional].includes(key)) error(`${location}.${key}`, 'unknown field is not allowed');
    });
    return true;
  };
  const text = (value, location, max, min = 1, singleLine = false) => {
    if (typeof value !== 'string') return error(location, 'must be a string');
    if (value.trim().length < min || value.length > max) error(location, `must contain ${min}–${max} characters`);
    if (value !== value.trim()) error(location, 'must not have surrounding whitespace');
    if (/\p{Cc}/u.test(singleLine ? value : value.replace(/[\n\r\t]/g, ''))) error(location, 'contains unsupported control characters');
    if (/<\/?[a-z][^>]*>/i.test(value)) error(location, 'HTML is not allowed in plain-text content');
  };
  const textArray = (value, location) => {
    if (!Array.isArray(value) || value.length === 0) return error(location, 'must be a non-empty array of strings');
    value.forEach((item, index) => text(item, `${location}[${index}]`, 5000));
  };
  const privacy = (value, location) => {
    stringEntries(value, location).forEach(([field, content]) => {
      const matches = new Set(PRIVACY_PATTERNS.filter(([, pattern]) => pattern.test(content)).map(([kind]) => kind));
      matches.forEach((kind) => error(field, `possible ${kind}; remove private/source material before publication`));
    });
  };

  const routes = new Set();
  if (shape(site, 'site', SITE_FIELDS)) {
    text(site.name, 'site.name', 100, 2, true);
    text(site.description, 'site.description', 180, 20, true);
    text(site.url, 'site.url', 2048, 1, true);
    try {
      const url = new URL(site.url);
      if (url.protocol !== 'https:' || site.url !== url.origin || !url.hostname.includes('.')) {
        error('site.url', 'must exactly match an HTTPS origin without a trailing slash, credentials, path, query, or fragment');
      }
    } catch {
      error('site.url', 'must be a valid absolute HTTPS URL');
    }
    if (shape(site.founder, 'site.founder', ['name'])) text(site.founder.name, 'site.founder.name', 100, 2, true);
    if (Object.hasOwn(site, 'articleIndex') && shape(site.articleIndex, 'site.articleIndex', ['title', 'description'])) {
      text(site.articleIndex.title, 'site.articleIndex.title', 100, 10, true);
      text(site.articleIndex.description, 'site.articleIndex.description', 180, 40, true);
    }
    if (!Array.isArray(site.routes) || site.routes.length === 0) error('site.routes', 'must be a non-empty array of canonical routes');
    else site.routes.forEach((route, index) => {
      if (typeof route !== 'string' || !ROUTE.test(route)) error(`site.routes[${index}]`, 'must be a root-relative route with a trailing slash');
      else if (routes.has(route)) error(`site.routes[${index}]`, 'duplicate route');
      else routes.add(route);
    });
    REQUIRED_ROUTES.forEach((route) => {
      if (!routes.has(route)) error('site.routes', `required route ${route} is missing`);
    });
    privacy(site, 'site');
  }

  if (!Array.isArray(articles)) {
    error('articles', 'must be an array');
    return { errors: [...new Set(errors)].sort(), warnings };
  }
  if (articles.length === 0) error('articles', 'must contain at least one article');
  const slugs = new Set();
  const titles = new Set();
  const descriptions = new Set();
  const articleSections = new Map();
  const links = [];
  articles.forEach((article, index) => {
    const location = `articles[${index}]`;
    if (!shape(article, location, ARTICLE_FIELDS)) return;
    text(article.slug, `${location}.slug`, 100, 1, true);
    if (typeof article.slug !== 'string' || !SLUG.test(article.slug)) error(`${location}.slug`, 'must be a lowercase kebab-case slug');
    else if (slugs.has(article.slug)) error(`${location}.slug`, `duplicate slug ${article.slug}`);
    else {
      slugs.add(article.slug);
      routes.add(`/articles/${article.slug}/`);
    }
    text(article.title, `${location}.title`, 100, 10, true);
    text(article.description, `${location}.description`, 300, 40, true);
    for (const [field, seen] of [['title', titles], ['description', descriptions]]) {
      if (typeof article[field] === 'string') {
        const normalized = article[field].toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(normalized)) error(`${location}.${field}`, `duplicate ${field}`);
        seen.add(normalized);
      }
    }
    text(article.category, `${location}.category`, 60, 2, true);
    text(article.takeaway, `${location}.takeaway`, 1000, 10);
    const sectionIds = new Set();
    if (!Array.isArray(article.sections) || article.sections.length === 0) error(`${location}.sections`, 'must contain at least one section');
    else article.sections.forEach((section, sectionIndex) => {
      const sectionLocation = `${location}.sections[${sectionIndex}]`;
      if (!shape(section, sectionLocation, ['id', 'title', 'paragraphs'], ['bullets'])) return;
      text(section.id, `${sectionLocation}.id`, 100, 1, true);
      if (typeof section.id !== 'string' || !SLUG.test(section.id)) error(`${sectionLocation}.id`, 'must be a lowercase kebab-case section ID');
      else if (sectionIds.has(section.id)) error(`${sectionLocation}.id`, `duplicate section ID ${section.id}`);
      else sectionIds.add(section.id);
      text(section.title, `${sectionLocation}.title`, 150, 1, true);
      textArray(section.paragraphs, `${sectionLocation}.paragraphs`);
      if (Object.hasOwn(section, 'bullets')) textArray(section.bullets, `${sectionLocation}.bullets`);
    });
    if (typeof article.slug === 'string' && !articleSections.has(article.slug)) articleSections.set(article.slug, sectionIds);

    if (shape(article.cta, `${location}.cta`, ['title', 'description', 'label', 'href'])) {
      text(article.cta.title, `${location}.cta.title`, 150, 1, true);
      text(article.cta.description, `${location}.cta.description`, 1000, 1);
      text(article.cta.label, `${location}.cta.label`, 80, 1, true);
      text(article.cta.href, `${location}.cta.href`, 2048, 1, true);
      links.push([`${location}.cta.href`, article.cta.href]);
    }
    if (shape(article.review, `${location}.review`, ['privacy', 'claims', 'reviewedOn'])) {
      for (const gate of ['privacy', 'claims']) {
        if (article.review[gate] !== 'approved') error(`${location}.review.${gate}`, 'must be explicitly approved after editorial review');
      }
      const date = article.review.reviewedOn;
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
        error(`${location}.review.reviewedOn`, 'must be a real date in YYYY-MM-DD format');
      }
    }
    privacy(article, location);
    // Review metadata and URL/ID strings are not public prose or claim evidence.
    for (const [field, value] of stringEntries({ title: article.title, description: article.description, category: article.category, takeaway: article.takeaway, sections: article.sections, cta: article.cta }, location)) {
      if (/\.(?:id|href)$/.test(field)) continue;
      if (QUANTITATIVE_CLAIM.test(value)) warnings.push(`${field}: possible quantitative claim; verify evidence and context during claims review`);
    }
  });

  for (const [location, href] of links) {
    if (typeof href !== 'string') continue;
    const [pathname, fragment, ...extra] = href.split('#');
    if (!ROUTE.test(pathname) || extra.length > 0 || (fragment !== undefined && !SLUG.test(fragment))) {
      error(location, 'must be a canonical internal route, optionally followed by a kebab-case section fragment');
      continue;
    }
    if (!routes.has(pathname)) error(location, `unknown internal route ${pathname}`);
    if (fragment !== undefined) {
      const slug = /^\/articles\/([^/]+)\/$/.exec(pathname)?.[1];
      if (!slug || !articleSections.get(slug)?.has(fragment)) error(location, `unknown section fragment #${fragment} on ${pathname}`);
    }
  }
  return { errors: [...new Set(errors)].sort(), warnings: [...new Set(warnings)].sort() };
}

/** Read every article in filename order; errors never print source text. */
export async function auditDirectory(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const errors = [];
  const articles = [];
  let site;
  const readJson = async (filename) => {
    try {
      return JSON.parse(await readFile(path.join(root, filename), 'utf8'));
    } catch (cause) {
      errors.push(`${filename}: ${cause instanceof SyntaxError ? 'invalid JSON' : 'could not read file'}`);
      return undefined;
    }
  };
  site = await readJson('content/site.json');
  try {
    const entries = (await readdir(path.join(root, 'content/articles'), { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        errors.push(`content/articles/${entry.name}: only JSON article files are allowed`);
        continue;
      }
      const filename = `content/articles/${entry.name}`;
      const article = await readJson(filename);
      if (article === undefined) continue;
      if (isObject(article) && entry.name !== `${article.slug}.json`) errors.push(`${filename}: filename must match article slug`);
      articles.push(article);
    }
  } catch {
    errors.push('content/articles: could not read article directory');
  }
  const result = auditArticles(articles, site);
  if (Array.isArray(site?.routes) && site.routes.some(route => route.startsWith('/services/'))) {
    const services = await readJson('content/services.json');
    const serviceResult = auditServices(services, site);
    errors.push(...serviceResult.errors);
    result.warnings.push(...serviceResult.warnings);
  }
  return { errors: [...new Set([...errors, ...result.errors])].sort(), warnings: result.warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await auditDirectory();
  console.log(`Content audit: ${result.errors.length} error(s), ${result.warnings.length} warning(s).`);
  result.errors.forEach((message) => console.error(`ERROR ${message}`));
  result.warnings.forEach((message) => console.warn(`WARNING ${message}`));
  console.log(PRIVACY_SCAN_LIMITATION);
  if (result.errors.length > 0) process.exitCode = 1;
}

/** Services share the same publication review and plain-text privacy checks. */
export function auditServices(services, site) {
  if (!Array.isArray(services) || !services.length) return { errors: ['services: expected a non-empty array'], warnings: [] };
  const errors = [];
  const allowed = ['slug', 'title', 'description', 'intro', 'fit', 'discuss', 'priority', 'review'];
  const priorities = ['manual-work', 'routing', 'integrations', 'new-agent'];
  const articleShapes = services.map((service, index) => {
    if (!isObject(service)) { errors.push(`services[${index}]: must be an object`); return {}; }
    for (const key of allowed) if (!Object.hasOwn(service, key)) errors.push(`services[${index}].${key}: required field is missing`);
    for (const key of Object.keys(service)) if (!allowed.includes(key)) errors.push(`services[${index}].${key}: unknown field is not allowed`);
    if (!priorities.includes(service.priority)) errors.push(`services[${index}].priority: unapproved topic`);
    if (!site.routes?.includes(`/services/${service.slug}/`)) errors.push(`services[${index}].slug: service route is not registered`);
    return { slug:service.slug, title:service.title, description:service.description, category:'Services', takeaway:service.intro,
      sections:[{id:'fit', title:'Is this a fit?', paragraphs:service.fit}, {id:'discuss',title:'What we can discuss',paragraphs:service.discuss}],
      cta:{title:'Discuss your workflow',description:'Book a strategy conversation.',label:'Book a call',href:'/book/'}, review:service.review };
  });
  for (const route of site.routes ?? []) if (route.startsWith('/services/') && !services.some(service => service?.slug && route === `/services/${service.slug}/`)) errors.push(`services: no page generated for registered route ${route}`);
  const result = auditArticles(articleShapes, site);
  return {errors:[...errors,...result.errors.map(error => error.replace(/^articles/, 'services'))].sort(),warnings:result.warnings.map(warning => warning.replace(/^articles/, 'services'))};
}

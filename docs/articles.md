# Article library

Article source lives in `content/articles/*.json`. Company identity and index metadata live in `content/site.json`. The shared HTML template is `scripts/article-template.mjs`; article styling is `public/articles.css`. Existing fonts and design tokens are reused from the built marketing stylesheet. There is no CMS, new hosting service, runtime rendering service, or new package dependency.

## Read, review, preview

1. Edit source on a separate branch. Use plain text in all article fields; HTML is escaped by the template.
2. Review the **entire** library with `npm run content:audit`. It checks schema, unique slugs, section IDs, metadata, approved internal routes, explicit privacy/claim review gates, and some potentially identifying or quantitative text patterns. A passing script is not proof of anonymity, factual accuracy, or completed AI review. Have a reviewer inspect all public-facing text; keep source transcripts and private evidence outside this repository.
3. Record `review.privacy` and `review.claims` as `approved` only after the respective review occurs, and record the actual review date. Editing copy requires a fresh review. The flags are assertions by editors, not automatic evidence of review.
4. Run `npm test`, `npm run lint`, and `npm run content:dry-run`. The dry run writes only local `dist/`; it never commits, pushes, or publishes. `npm run build` includes the TypeScript check and static-page generation.
5. Run `npm run preview` and open `/articles/` and the article URL. Static articles are generated at build time, so use **build plus preview**, not Vite's development SPA fallback. Check desktop, mobile, keyboard focus, heading navigation, and links.
6. Inspect `git diff -- content scripts public/articles.css` for whole-library changes. For optional AI-assisted review, supply only already-sanitized files to an authorized reviewer, request claim/privacy/consistency findings, and review those findings yourself. This repository does not send content to an AI service or claim an automated AI review happened.
7. Open a draft PR. Review and merge are separate decisions. Merging into `main` triggers the existing GitHub Pages deployment; a draft PR is not permission to deploy. Revert the merge commit in a new reviewed PR to roll back published changes. Before merge, normal branch edits or `git restore` can discard uncommitted changes.

## Adding a post

Copy an existing JSON file, assign a unique kebab-case slug and section IDs, and update every visible field. The allowed schema is enforced by `scripts/content-audit.mjs`. There are no separate duplicated SEO fields: title and description feed both the visible page and its metadata. Author/publisher identity comes from the company record. No publication date is invented for a draft. A read-time estimate is computed from the article copy.

An article is emitted to `dist/articles/<slug>/index.html`, with its complete text, canonical URL, Open Graph data and Article JSON-LD in the initial response. The index is also real HTML and links use ordinary anchors. These pages work with JavaScript disabled. Existing marketing, booking, SOW, and SPA fallback entry points remain intact. The public sitemap contains verified public routes and all generated posts; it deliberately excludes SOW and feedback forms. Robots exclusions are indexing hints, not access control.

## Content safety

Never store raw transcripts, private meeting/source identifiers, client names, contact details, credentials, or source ledgers here. This repository is public, including draft PR branches. Anonymization must consider combinations of details, not just names. Label synthetic examples, qualify reported outcomes, and do not turn qualitative feedback into numerical results. The auditor's heuristic scan can miss identifying content and produce false positives; it does not replace judgment.

All generated article URLs use a trailing slash. Test these canonical URLs with the local preview. GitHub Pages normally redirects directory paths to their slash form, but production redirects and visual browser checks must be verified before merge; no public preview deployment is part of this draft. The booking entry has its own canonical, and the SOW entry carries a noindex directive without changing its application behavior.

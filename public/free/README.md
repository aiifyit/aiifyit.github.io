# /free

Static landing page for the AIify free AI chief of staff file.

This directory is copied into `dist/free/` by the existing Vite build, so after a merge to `main` the page would be served at `https://aiifyit.com/free/` (and `https://www.aiifyit.com/free/`). It is a standalone vanilla HTML/CSS/JS page. It is not part of the React app.

The file is no longer gated. A direct `/api/file` link on `https://aiify-free-file.joshua-509.workers.dev` starts the download immediately, with no form or email required. The Worker serves the file and logs valid session downloads; the page also sends deduplicated funnel events. The downloadable file is not in this folder.

Do not add a `CNAME` here. The live site's custom domain remains `aiifyit.com` / `www.aiifyit.com`. Attaching `free.aiifyit.com` to this same GitHub Pages repo would replace that domain. DNS has not been changed.

## Post-download flow (`/free/flow/`)

`flow/flow.js` and `flow/flow.css` are shared by `/free` and `/free/b`. When the download animation reveals `#download-success`, the page shows:

1. A how-to video (upload the file to ChatGPT, Claude or Grok). It tries to autoplay with sound and falls back to muted with a "Tap for sound" button.
2. The free 4-PDF suite ("Free for a limited time"), downloaded with "Download all 4" (`/api/suite`, one zip).
3. A sales video and an "I'm interested in Hiring AIify" form (name, email, phone; phone not required). The form posts to `/api/hire`, and the Worker emails an alert to joshua@aiifyit.com.

Media (videos, suite image, covers, zip) is served from the Worker's R2 bucket at `/media/*`. Flow steps are sent to `/api/flow` and shown on the Worker dashboard. Each lander's theme comes from `html[data-variant]`, so `/free/b` uses its zinc and pale-blue palette and fonts. Add `?aiify_test=1` to flag test rows.

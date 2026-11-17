# /free

Static landing page for the AIify free AI chief of staff file.

This directory is copied into `dist/free/` by the existing Vite build, so after a merge to `main` the page would be served at `https://aiifyit.com/free/` (and `https://www.aiifyit.com/free/`). It is a standalone vanilla HTML/CSS/JS page. It is not part of the React app.

The file is no longer gated. A direct `/api/file` link on `https://aiify-free-file.joshua-509.workers.dev` starts the download immediately, with no form or email required. The Worker serves the file and logs valid session downloads; the page also sends deduplicated funnel events. The downloadable file is not in this folder.

Do not add a `CNAME` here. The live site's custom domain remains `aiifyit.com` / `www.aiifyit.com`. Attaching `free.aiifyit.com` to this same GitHub Pages repo would replace that domain. DNS has not been changed.

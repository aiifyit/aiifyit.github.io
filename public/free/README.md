# /free

Static landing page for the AIify free AI chief of staff file.

This directory is copied into `dist/free/` by the existing Vite build, so after a merge to `main` the page would be served at `https://aiifyit.com/free/` (and `https://www.aiifyit.com/free/`). It is a standalone vanilla HTML/CSS/JS page. It is not part of the React app.

The form posts to the Cloudflare Worker at `https://aiify-free-file.joshua-509.workers.dev`. The downloadable file is not in this folder; the Worker serves it only after a successful lead submission.

Do not add a `CNAME` here. The live site's custom domain remains `aiifyit.com` / `www.aiifyit.com`. Attaching `free.aiifyit.com` to this same GitHub Pages repo would replace that domain. DNS has not been changed.

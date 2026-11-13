# /free/b

Site-branded variant of the free AI chief of staff landing page, for traffic from the v4 ad.

After a merge to `main`, this directory is copied into `dist/free/b/` by the existing Vite build and would be served at https://aiifyit.com/free/b/ (and the www equivalent). It is standalone vanilla HTML/CSS/JS, not part of the React app.

Behavior matches `/free`: the same three-step form posts to `https://aiify-free-file.joshua-509.workers.dev` and the Worker stores `page_variant=b` on the lead. The downloadable file is not in this folder.

This page uses the official AIIFY logo and site fonts already hosted at `/images/` and `/fonts/`. It does not change `public/CNAME` or DNS, and it does not replace `/free`.

# /free/b

Site-branded variant of the free AI chief of staff landing page, for traffic from the v4 ad.

After a merge to `main`, this directory is copied into `dist/free/b/` by the existing Vite build and would be served at https://aiifyit.com/free/b/ (and the www equivalent). It is standalone vanilla HTML/CSS/JS, not part of the React app.

The file is no longer gated: the download link immediately serves `/api/file` from `https://aiify-free-file.joshua-509.workers.dev`, with no form or email required. The page hardcodes `page_variant=b` in events and `v=b` in the file URL. The downloadable file is not in this folder.

This page uses the official AIIFY logo and site fonts already hosted at `/images/` and `/fonts/`. It does not change `public/CNAME` or DNS, and it does not replace `/free`.

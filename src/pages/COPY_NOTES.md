# Copy notes — /partner-program

Not linked from the nav, footer, homepage, articles, or sitemap. The page keeps its own OfferChrome without the regular site Header/Footer. It remains `noindex, nofollow` (including googlebot and bingbot), outside the sitemap, and unlisted in `robots.txt` and `llms.txt`. It is not Disallowed in robots.txt, so crawlers can still fetch the page and see the noindex tag. The public URL is `https://aiifyit.com/partner-program/`.

The page is the partner co-management offer. Headlines, body, table, calculator labels, questions, and the quote form use the locked copy. The button is “Get a quote”. Do not add a `/partners` route.

Fulfillment fees are $2,000 per seat per month for Standard and $4,000 per seat per month for Executive. Gross profit is (price − fee) × seats, and annualized profit is that figure × 12. When the price is at or below the fee, the page shows the no-spread message and does not show a positive profit.

The quote form prepares an email draft to the existing inquiry address and records the source as `/partner-program`. `/new-offer/` forwards to `/partner-program/`. It does not send the email by itself.

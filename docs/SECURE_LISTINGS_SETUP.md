# BBAS secure listings deployment

The repository contains only anonymized public listing information. Do not commit source brochures, actual listing photographs, exact names, addresses, buyer records, signed NDAs, financial records or private credentials.

## Architecture

- Public site: anonymous listing summaries and listing-specific inquiry routing.
- `admin.businessbuyingandselling.com` or `/admin/`: staff dashboard protected by Cloudflare Access.
- `/private-listings/`: noindex buyer portal; all private data is returned only after a server-validated access grant.
- D1 binding `DB`: listings, buyers, inquiries, NDAs, access grants, tasks and event analytics.
- Private R2 binding `PRIVATE_LISTING_ASSETS`: seller-authorized PDFs and images.
- Secret `BUYER_SESSION_SECRET`: signs short-lived HttpOnly buyer sessions.

## Required Cloudflare resources

1. Create a D1 database for BBAS production.
2. Apply `db/migrations/0001_secure_listings.sql` to the database.
3. Bind the database to the Pages project as `DB` in production and preview.
4. Create a private R2 bucket with no public development URL and bind it as `PRIVATE_LISTING_ASSETS`.
5. Generate a random secret of at least 32 bytes and save it as the encrypted Pages secret `BUYER_SESSION_SECRET`.
6. Set `PUBLIC_SITE_URL=https://businessbuyingandselling.com`.

Example commands, after authenticating Wrangler and substituting the real resource names:

```sh
npx wrangler d1 execute BBAS_DATABASE_NAME --remote --file db/migrations/0001_secure_listings.sql
npx wrangler pages secret put BUYER_SESSION_SECRET --project-name BUSINESS_BUYING_AND_SELLING_PROJECT
```

Configure D1 and R2 bindings in the Cloudflare Pages project dashboard or the project’s existing deployment configuration. Do not commit database IDs, account IDs or secrets merely to satisfy an example.

## Protect staff administration

Create a Cloudflare Access self-hosted application covering both of these paths or an admin subdomain routed to the project:

- `businessbuyingandselling.com/admin/*`
- `businessbuyingandselling.com/api/admin/*`

Allow only approved staff identities. Configure these environment variables:

- `CF_ACCESS_TEAM_DOMAIN`: the account Access team domain, without `https://`.
- `CF_ACCESS_AUD`: the Access application audience tag.

The middleware verifies the Access JWT signature, issuer, audience and expiration. It fails closed when the production configuration is missing. For local Wrangler development only, `ADMIN_DEV_BYPASS=true` permits localhost access; never set it in production.

Also protect the project’s `pages.dev` admin routes so they cannot bypass the custom-domain policy.

## Add confidential listing data

1. Open the protected admin dashboard.
2. Select a seeded anonymous reference such as `BBAS-101`.
3. Add the private name, address, exact figures and structured private details.
4. Save the listing.
5. Upload source PDFs and images through the private asset uploader.

The upload endpoint accepts PDF, JPG, PNG and WebP files up to 25 MB and stores them only in private R2. The original source PDFs in Downloads are intentionally excluded from GitHub.

## Buyer access workflow

1. Buyer submits a listing-specific inquiry.
2. Staff qualifies the buyer and records follow-up status.
3. Staff sends and receives the NDA outside the portal during the initial release.
4. In **NDA access**, record the signed date and document reference.
5. Generate an access URL with a 3, 7, 14 or 30 day expiration.
6. Send the URL to the approved buyer.
7. Revoke the grant immediately if access is no longer authorized.

The raw grant token is shown only when it is created. D1 stores only its SHA-256 hash. The token is exchanged for an HttpOnly, Secure, SameSite session cookie and removed from the browser address bar.

## Analytics

The existing GA4 implementation remains active. In addition, high-value first-party events are sent to `/api/events` and stored without names, email addresses, phone numbers or raw IP addresses. The dashboard reports:

- active listings;
- open inquiries;
- signed NDAs;
- active access grants;
- 30-day page views;
- 30-day listing inquiries;
- recent listing activity and inquiries.

Future phases can add the GA4 Data API, Search Console API, email templates, automated NDA provider webhooks, buyer-to-listing matching and full task automation without changing the core privacy model.

## Release checklist

- Apply the D1 migration before opening `/admin/`.
- Bind the private R2 bucket before uploading seller materials.
- Confirm Cloudflare Access protects admin HTML and admin APIs.
- Confirm the `pages.dev` hostname cannot bypass Access.
- Verify public pages contain no actual names, addresses, images or private document metadata.
- Test one NDA grant, private login, document view, expiration and revocation.
- Confirm private responses send `no-store`, `noindex` and `no-referrer` headers.
- Confirm public listing inquiry URLs preserve the anonymous listing reference.

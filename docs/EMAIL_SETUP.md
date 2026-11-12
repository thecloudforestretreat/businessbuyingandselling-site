# Zero-cost domain email setup

This site is prepared to use `info@businessbuyingandselling.com` without making email delivery a single point of failure.

## Lead capture architecture

- `/api/contact` stores general contact requests in the existing D1 `inquiries` table.
- `/api/consultation` stores homepage buyer and seller consultation requests in the same table.
- Listing-specific inquiries use `/api/listing-inquiry` and the same save-and-notify pipeline as general contact and consultation requests.
- A successfully saved lead returns an inquiry ID. If Resend cannot deliver the internal alert, the submission remains in D1 and a `lead_notification_failed` activity event is recorded for admin follow-up.
- Saved leads appear in the protected admin dashboard even when an email provider is unavailable.
- Email notifications are optional and are attempted only after the D1 record exists.

## Receive mail free with Cloudflare Email Routing

1. In Cloudflare, open **Compute > Email Service > Email Routing**.
2. Onboard `businessbuyingandselling.com` and allow Cloudflare to add the required MX and authentication records.
3. Add and verify the destination inbox that will receive forwarded messages.
4. Create a routing rule for `info@businessbuyingandselling.com` to that verified destination.
5. Send a test message from an unrelated address and confirm it reaches the destination inbox.

## Send mail free with Resend

1. Create a Resend free account and add `businessbuyingandselling.com` as a sending domain.
2. Add the DNS records supplied by Resend and wait for the domain to verify.
3. Create an API key limited to sending access.
4. In the Cloudflare Pages project, add these production variables:

   - Encrypted secret `RESEND_API_KEY`
   - `CONTACT_FROM_EMAIL` = `Business Buying and Selling <info@businessbuyingandselling.com>`
   - `CONTACT_NOTIFICATION_EMAIL` = the verified inbox that should receive lead alerts

5. Redeploy and submit one test contact request. Confirm both the D1 inquiry and notification message.

Resend also provides SMTP credentials for a desktop email client. Because consumer Gmail is ending third-party “Send mail as” support in January 2027, use a client such as Thunderbird or Apple Mail for durable manual sending from `info@businessbuyingandselling.com` rather than depending on Gmail's alias interface.

## DNS and deliverability checks

- Keep only one valid SPF policy at the root domain; merge authorized senders instead of creating competing SPF records.
- Publish the DKIM records supplied by the sending provider.
- Add a DMARC policy and begin with reporting before moving to enforcement.
- Keep Cloudflare Email Routing MX records intact for inbound mail.
- Test replies in both directions and confirm that `Reply-To` returns to the website visitor for lead notifications.

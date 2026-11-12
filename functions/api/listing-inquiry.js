import { body, clean, id, json, requireBinding } from "../_lib/http.js";
import { notifyLead, saveInquiry, verifyTurnstile } from "../_lib/leads.js";

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  try {
    const data = await body(context.request);
    const listingId = id(data.listing_reference);
    const email = clean(data.email, 254).toLowerCase();
    const firstName = clean(data.first_name, 100);
    const lastName = clean(data.last_name, 100);
    const message = clean(data.message, 5000);
    const token = clean(data.turnstile_token || data["cf-turnstile-response"], 3000);
    if (!listingId || !email.includes("@") || !firstName || !lastName || !message) return json({ success: false, message: "Required inquiry fields are missing." }, 400);
    const listing = await context.env.DB.prepare("SELECT id FROM listings WHERE id=? AND status='active'").bind(listingId).first();
    if (!listing) return json({ success: false, message: "The listing reference is unavailable." }, 404);
    if (!await verifyTurnstile(context.request, context.env, token)) return json({ success: false, message: "Verification failed. Please try again." }, 403);
    let sourceParams = new URL(context.request.url).searchParams;
    try { sourceParams = new URL(data.source_url || context.request.url).searchParams; } catch (_) {}
    const lead = {
      listingId, firstName, lastName, email, phone: data.phone, city: data.city, state: data.state,
      message, sourceUrl: data.source_url, pagePath: "/contact/",
      source: clean(data.utm_source || sourceParams.get("utm_source"), 120) || "website",
      medium: clean(data.utm_medium || sourceParams.get("utm_medium"), 120) || "listing_inquiry",
      campaign: clean(data.utm_campaign || sourceParams.get("utm_campaign"), 120) || listingId,
      leadType: "listing_inquiry", subject: `Listing inquiry: ${listingId}`
    };
    const saved = await saveInquiry(context.env, lead);
    const notification = await notifyLead(context.env, lead, saved.inquiryId);
    return json({ success: true, inquiry_id: saved.inquiryId, notification_sent: notification.sent });
  } catch (error) {
    return json({ success: false, message: "Unable to save the listing inquiry." }, 500);
  }
}

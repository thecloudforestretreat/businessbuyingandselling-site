import { body, clean, json, requireBinding } from "../_lib/http.js";
import { notifyLead, saveInquiry, verifyTurnstile } from "../_lib/leads.js";

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  try {
    const data = await body(context.request);
    const email = clean(data.email, 254).toLowerCase();
    const firstName = clean(data.first_name, 100);
    const lastName = clean(data.last_name, 100);
    const message = clean(data.message, 5000);
    const topic = clean(data.topic, 80);
    const token = clean(data.turnstile_token || data["cf-turnstile-response"], 3000);
    if (!email.includes("@") || !firstName || !lastName || !message || !topic) return json({ success: false, message: "Required contact fields are missing." }, 400);
    if (!await verifyTurnstile(context.request, context.env, token)) return json({ success: false, message: "Verification failed. Please try again." }, 403);
    const url = new URL(context.request.url);
    const lead = {
      firstName, lastName, email, phone: data.phone, city: data.city, state: data.state,
      message: `Topic: ${topic}\n\n${message}`,
      sourceUrl: data.source_url, pagePath: "/contact/", source: clean(data.utm_source || url.searchParams.get("utm_source"), 120) || "website",
      medium: clean(data.utm_medium || url.searchParams.get("utm_medium"), 120) || "contact_form",
      campaign: clean(data.utm_campaign || url.searchParams.get("utm_campaign"), 120) || topic,
      leadType: "general_contact", subject: `${topic.replace(/_/g, " ")} inquiry`
    };
    const saved = await saveInquiry(context.env, lead);
    const notification = await notifyLead(context.env, lead, saved.inquiryId);
    return json({ success: true, inquiry_id: saved.inquiryId, notification_sent: notification.sent });
  } catch (_) {
    return json({ success: false, message: "Unable to save the contact request." }, 500);
  }
}

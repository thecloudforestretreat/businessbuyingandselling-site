import { body, clean, json, requireBinding } from "../_lib/http.js";
import { notifyLead, saveInquiry, verifyTurnstile } from "../_lib/leads.js";

const OMIT = new Set(["turnstile_token", "cf-turnstile-response", "first_name", "last_name", "email", "phone"]);

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  try {
    const data = await body(context.request);
    const branch = clean(data.branch, 20).toLowerCase();
    const email = clean(data.email, 254).toLowerCase();
    const firstName = clean(data.first_name, 100);
    const lastName = clean(data.last_name, 100);
    const phone = clean(data.phone, 60);
    const token = clean(data.turnstile_token || data["cf-turnstile-response"], 3000);
    if (!["buy", "sell"].includes(branch) || !email.includes("@") || !firstName || !lastName || !phone) return json({ success: false, message: "Required consultation fields are missing." }, 400);
    if (!await verifyTurnstile(context.request, context.env, token)) return json({ success: false, message: "Verification failed. Please try again." }, 403);
    const details = Object.entries(data)
      .filter(([key]) => !OMIT.has(key))
      .map(([key, value]) => `${key.replace(/_/g, " ")}: ${clean(value, 500)}`)
      .join("\n");
    const city = clean(data.business_city || data.want_city, 120);
    const state = clean(data.business_state || data.want_state, 120);
    let sourceParams = new URL(context.request.url).searchParams;
    try { sourceParams = new URL(data.source_url || context.request.url).searchParams; } catch (_) {}
    const lead = {
      firstName, lastName, email, phone, city, state,
      company: branch === "sell" ? data.business_name : "",
      capitalRange: branch === "buy" ? data.buy_purchase_price : "",
      message: `${branch === "sell" ? "Seller" : "Buyer"} consultation request\n\n${details}`,
      sourceUrl: data.source_url || "https://businessbuyingandselling.com/", pagePath: "/",
      source: clean(data.utm_source || sourceParams.get("utm_source"), 120) || "website",
      medium: clean(data.utm_medium || sourceParams.get("utm_medium"), 120) || "homepage_funnel",
      campaign: clean(data.utm_campaign || sourceParams.get("utm_campaign"), 120) || `${branch}_consultation`, leadType: `${branch}_consultation`,
      subject: `${branch === "sell" ? "Seller" : "Buyer"} consultation request`
    };
    const saved = await saveInquiry(context.env, lead);
    const notification = await notifyLead(context.env, lead, saved.inquiryId);
    return json({ success: true, inquiry_id: saved.inquiryId, notification_sent: notification.sent });
  } catch (_) {
    return json({ success: false, message: "Unable to save the consultation request." }, 500);
  }
}

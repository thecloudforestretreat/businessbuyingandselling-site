import { body, clean, id, json, requireBinding } from "../_lib/http.js";

async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json();
  return result.success === true;
}

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
    const buyer = await context.env.DB.prepare(`INSERT INTO buyers (email,first_name,last_name,phone,qualification_status,updated_at)
      VALUES (?,?,?,?,'new',CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET first_name=excluded.first_name,last_name=excluded.last_name,phone=excluded.phone,updated_at=CURRENT_TIMESTAMP RETURNING id`)
      .bind(email, firstName, lastName, clean(data.phone, 60)).first();
    const params = new URL(context.request.url).searchParams;
    await context.env.DB.prepare(`INSERT INTO inquiries
      (listing_id,buyer_id,first_name,last_name,email,phone,city,state,message,source_url,source,medium,campaign,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'new')`)
      .bind(listingId, buyer.id, firstName, lastName, email, clean(data.phone, 60), clean(data.city, 120), clean(data.state, 120), message, clean(data.source_url, 500), clean(data.utm_source || params.get("utm_source"), 120), clean(data.utm_medium || params.get("utm_medium"), 120), clean(data.utm_campaign || params.get("utm_campaign"), 120)).run();
    await context.env.DB.prepare(`INSERT INTO activity_events (event_name,listing_id,buyer_id,page_path,metadata_json) VALUES ('form_submit_success',?,?,?,'{}')`).bind(listingId, buyer.id, "/contact/").run();
    return json({ success: true });
  } catch (error) {
    return json({ success: false, message: "Unable to save the listing inquiry." }, 500);
  }
}

import { clean } from "./http.js";

export async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json();
  return result.success === true;
}

export async function saveInquiry(env, lead) {
  const email = clean(lead.email, 254).toLowerCase();
  const firstName = clean(lead.firstName, 100);
  const lastName = clean(lead.lastName, 100);
  const buyer = await env.DB.prepare(`INSERT INTO buyers
    (email,first_name,last_name,phone,company,qualification_status,capital_range,financing_stage,experience,updated_at)
    VALUES (?,?,?,?,?,'new',?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      first_name=excluded.first_name,last_name=excluded.last_name,phone=excluded.phone,
      company=CASE WHEN excluded.company<>'' THEN excluded.company ELSE buyers.company END,
      capital_range=CASE WHEN excluded.capital_range<>'' THEN excluded.capital_range ELSE buyers.capital_range END,
      financing_stage=CASE WHEN excluded.financing_stage<>'' THEN excluded.financing_stage ELSE buyers.financing_stage END,
      experience=CASE WHEN excluded.experience<>'' THEN excluded.experience ELSE buyers.experience END,
      updated_at=CURRENT_TIMESTAMP RETURNING id`)
    .bind(email, firstName, lastName, clean(lead.phone, 60), clean(lead.company, 160), clean(lead.capitalRange, 120), clean(lead.financingStage, 120), clean(lead.experience, 500)).first();

  const inquiry = await env.DB.prepare(`INSERT INTO inquiries
    (listing_id,buyer_id,first_name,last_name,email,phone,city,state,message,source_url,source,medium,campaign,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'new') RETURNING id`)
    .bind(lead.listingId || null, buyer.id, firstName, lastName, email, clean(lead.phone, 60), clean(lead.city, 120), clean(lead.state, 120), clean(lead.message, 5000), clean(lead.sourceUrl, 500), clean(lead.source, 120), clean(lead.medium, 120), clean(lead.campaign, 120)).first();

  await env.DB.prepare(`INSERT INTO activity_events
    (event_name,listing_id,buyer_id,page_path,source,medium,campaign,metadata_json)
    VALUES ('form_submit_success',?,?,?,?,?,?,?)`)
    .bind(lead.listingId || null, buyer.id, clean(lead.pagePath, 500), clean(lead.source, 120), clean(lead.medium, 120), clean(lead.campaign, 120), JSON.stringify({ inquiry_id: inquiry.id, lead_type: clean(lead.leadType, 80) })).run();
  return { buyerId: buyer.id, inquiryId: inquiry.id };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function notifyLead(env, lead, inquiryId) {
  async function failed(reason) {
    if (env.DB) {
      try {
        await env.DB.prepare(`INSERT INTO activity_events
          (event_name,listing_id,page_path,metadata_json) VALUES ('lead_notification_failed',?,?,?)`)
          .bind(lead.listingId || null, lead.pagePath || "/contact/", JSON.stringify({ inquiry_id: inquiryId, reason })).run();
      } catch (_) {}
    }
    return { sent: false, reason };
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_NOTIFICATION_EMAIL || !env.CONTACT_FROM_EMAIL) return failed("email-not-configured");
  const subject = `[BBAS lead ${inquiryId}] ${clean(lead.subject, 160) || "Website inquiry"}`;
  const html = `<h2>${escapeHtml(subject)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(`${lead.firstName} ${lead.lastName}`.trim())}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}<br><strong>Phone:</strong> ${escapeHtml(lead.phone || "Not provided")}</p>
    <p><strong>Lead type:</strong> ${escapeHtml(lead.leadType || "Website inquiry")}<br><strong>Listing:</strong> ${escapeHtml(lead.listingId || "General inquiry")}</p>
    <p><strong>Location:</strong> ${escapeHtml([lead.city, lead.state].filter(Boolean).join(", ") || "Not provided")}</p>
    <p><strong>Source:</strong> ${escapeHtml(lead.sourceUrl || lead.pagePath)}</p>
    <pre style="white-space:pre-wrap;font:14px/1.5 system-ui,sans-serif">${escapeHtml(lead.message)}</pre>`;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_NOTIFICATION_EMAIL],
        reply_to: clean(lead.email, 254),
        subject,
        html
      })
    });
    return response.ok ? { sent: true } : failed(`email-provider-${response.status}`);
  } catch (_) {
    return failed("email-provider-unavailable");
  }
}

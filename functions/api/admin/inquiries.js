import { body, clean, json, requireBinding } from "../../_lib/http.js";

export async function onRequestGet(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const { results } = await context.env.DB.prepare(`SELECT i.*, l.public_title FROM inquiries i LEFT JOIN listings l ON l.id=i.listing_id ORDER BY i.created_at DESC LIMIT 250`).all();
  return json({ ok: true, inquiries: results });
}

export async function onRequestPatch(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const data = await body(context.request);
  const inquiryId = Number(data.id);
  const status = clean(data.status, 40);
  const allowed = ["new","contacted","qualifying","qualified","nda_sent","nda_signed","private_access","diligence","loi","closed","not_qualified"];
  if (!inquiryId || !allowed.includes(status)) return json({ ok: false, error: "invalid-inquiry-update" }, 400);
  await context.env.DB.prepare("UPDATE inquiries SET status=?, assigned_to=?, next_follow_up=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(status, clean(data.assigned_to, 120), clean(data.next_follow_up, 40) || null, inquiryId).run();
  return json({ ok: true });
}

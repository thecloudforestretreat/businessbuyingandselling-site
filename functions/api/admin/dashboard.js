import { json, requireBinding } from "../../_lib/http.js";

export async function onRequestGet(context) {
  const missing = requireBinding(context.env, "DB");
  if (missing) return missing;
  const db = context.env.DB;
  const results = await db.batch([
    db.prepare("SELECT COUNT(*) AS count FROM listings WHERE status = 'active'"),
    db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status NOT IN ('closed','not_qualified')"),
    db.prepare("SELECT COUNT(*) AS count FROM nda_records WHERE status = 'signed'"),
    db.prepare("SELECT COUNT(*) AS count FROM access_grants WHERE status = 'active' AND datetime(expires_at) > CURRENT_TIMESTAMP"),
    db.prepare("SELECT COUNT(*) AS count FROM activity_events WHERE event_name = 'page_view_enhanced' AND datetime(created_at) >= datetime('now','-30 days')"),
    db.prepare("SELECT COUNT(*) AS count FROM activity_events WHERE event_name = 'listing_inquiry' AND datetime(created_at) >= datetime('now','-30 days')"),
    db.prepare(`SELECT listing_id, COUNT(*) AS views FROM activity_events
      WHERE event_name IN ('listing_click','page_view_enhanced') AND listing_id IS NOT NULL
      AND datetime(created_at) >= datetime('now','-30 days') GROUP BY listing_id ORDER BY views DESC LIMIT 8`),
    db.prepare(`SELECT event_name, listing_id, page_path, created_at FROM activity_events ORDER BY created_at DESC LIMIT 20`),
    db.prepare(`SELECT id, listing_id, first_name, last_name, email, status, next_follow_up, created_at FROM inquiries ORDER BY created_at DESC LIMIT 12`)
  ]);
  return json({ ok: true, metrics: {
    active_listings: results[0].results[0]?.count || 0,
    open_inquiries: results[1].results[0]?.count || 0,
    signed_ndas: results[2].results[0]?.count || 0,
    active_grants: results[3].results[0]?.count || 0,
    page_views_30d: results[4].results[0]?.count || 0,
    listing_inquiries_30d: results[5].results[0]?.count || 0,
  }, top_listings: results[6].results, recent_events: results[7].results, recent_inquiries: results[8].results });
}

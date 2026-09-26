import { json, requireBinding } from "../../_lib/http.js";
import { readBuyerSession } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const session = await readBuyerSession(context.request, context.env);
  if (!session) return json({ ok: false, error: "buyer-auth-required" }, 401);
  const { results } = await context.env.DB.prepare(`SELECT l.*,g.expires_at,g.last_accessed_at
    FROM access_grants g JOIN listings l ON l.id=g.listing_id JOIN nda_records n ON n.id=g.nda_id
    WHERE g.buyer_id=? AND g.status='active' AND n.status='signed' AND datetime(g.expires_at)>CURRENT_TIMESTAMP
    ORDER BY l.sort_order,l.id`).bind(session.sub).all();
  const listings = [];
  for (const listing of results) {
    const assets = await context.env.DB.prepare("SELECT id,display_name,asset_type,mime_type,size_bytes FROM listing_assets WHERE listing_id=? ORDER BY sort_order,id").bind(listing.id).all();
    let details = {};
    try { details = JSON.parse(listing.private_details_json || "{}"); } catch {}
    listings.push({
      id: listing.id, public_title: listing.public_title, public_category: listing.public_category,
      private_name: listing.private_name, private_address: listing.private_address, private_city: listing.private_city,
      private_state: listing.private_state, private_postal_code: listing.private_postal_code,
      private_asking_price: listing.private_asking_price, private_revenue: listing.private_revenue,
      private_details: details, access_expires_at: listing.expires_at,
      assets: assets.results.map((asset) => ({ ...asset, url: `/api/private/assets/${encodeURIComponent(listing.id)}/${asset.id}` }))
    });
    await context.env.DB.prepare(`INSERT INTO activity_events (event_name,listing_id,buyer_id,page_path,metadata_json) VALUES ('private_listing_view',?,?,?,'{}')`).bind(listing.id, session.sub, "/private-listings/").run();
  }
  return json({ ok: true, buyer: { email: session.email }, listings });
}

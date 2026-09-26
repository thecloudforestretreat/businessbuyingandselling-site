import { json, requireBinding } from "../../../_lib/http.js";
import { readBuyerSession } from "../../../_lib/auth.js";

export async function onRequestGet(context) {
  const missingDb = requireBinding(context.env, "DB"); if (missingDb) return missingDb;
  const missingR2 = requireBinding(context.env, "PRIVATE_LISTING_ASSETS"); if (missingR2) return missingR2;
  const session = await readBuyerSession(context.request, context.env);
  if (!session) return json({ ok: false, error: "buyer-auth-required" }, 401);
  const path = Array.isArray(context.params.path) ? context.params.path : String(context.params.path || "").split("/");
  const listingId = decodeURIComponent(path[0] || "").toUpperCase();
  const assetId = Number(path[1]);
  if (!listingId || !assetId) return json({ ok: false, error: "asset-not-found" }, 404);
  const authorized = await context.env.DB.prepare(`SELECT 1 FROM access_grants g JOIN nda_records n ON n.id=g.nda_id
    WHERE g.buyer_id=? AND g.listing_id=? AND g.status='active' AND n.status='signed' AND datetime(g.expires_at)>CURRENT_TIMESTAMP LIMIT 1`)
    .bind(session.sub, listingId).first();
  if (!authorized) return json({ ok: false, error: "asset-access-denied" }, 403);
  const asset = await context.env.DB.prepare("SELECT * FROM listing_assets WHERE id=? AND listing_id=?").bind(assetId, listingId).first();
  if (!asset) return json({ ok: false, error: "asset-not-found" }, 404);
  const object = await context.env.PRIVATE_LISTING_ASSETS.get(asset.r2_key);
  if (!object) return json({ ok: false, error: "asset-object-missing" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "private, no-store");
  headers.set("content-disposition", `inline; filename="${asset.display_name.replace(/[\r\n"\\]/g, "-")}"`);
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("referrer-policy", "no-referrer");
  return new Response(object.body, { headers });
}

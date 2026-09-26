import { body, clean, id, json, requireBinding } from "../../_lib/http.js";
import { randomToken, sha256 } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const { results } = await context.env.DB.prepare(`SELECT g.id,g.listing_id,g.status,g.expires_at,g.first_accessed_at,g.last_accessed_at,g.access_count,g.created_at,b.email,b.first_name,b.last_name,l.public_title
    FROM access_grants g JOIN buyers b ON b.id=g.buyer_id JOIN listings l ON l.id=g.listing_id ORDER BY g.created_at DESC LIMIT 250`).all();
  return json({ ok: true, grants: results });
}

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const data = await body(context.request);
  const listingId = id(data.listing_id);
  const email = clean(data.email, 254).toLowerCase();
  const signedAt = clean(data.signed_at, 40);
  const days = Math.min(30, Math.max(1, Number(data.access_days) || 7));
  if (!listingId || !email.includes("@") || !signedAt) return json({ ok: false, error: "listing-email-and-signed-date-required" }, 400);
  const listing = await context.env.DB.prepare("SELECT id FROM listings WHERE id=?").bind(listingId).first();
  if (!listing) return json({ ok: false, error: "listing-not-found" }, 404);

  const buyer = await context.env.DB.prepare(`INSERT INTO buyers (email,first_name,last_name,qualification_status,updated_at)
    VALUES (?,?,?,'qualified',CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET first_name=excluded.first_name,last_name=excluded.last_name,qualification_status='qualified',updated_at=CURRENT_TIMESTAMP RETURNING id`)
    .bind(email, clean(data.first_name, 100), clean(data.last_name, 100)).first();
  const nda = await context.env.DB.prepare(`INSERT INTO nda_records (buyer_id,listing_id,status,document_provider,document_reference,signed_at,approved_by,notes)
    VALUES (?,?,'signed',?,?,?,?,?) RETURNING id`)
    .bind(buyer.id, listingId, clean(data.document_provider, 80) || "manual", clean(data.document_reference, 500), signedAt, clean(context.data.admin?.email, 254), clean(data.notes, 2000)).first();
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  await context.env.DB.prepare(`INSERT INTO access_grants (buyer_id,listing_id,nda_id,token_hash,expires_at,created_by)
    VALUES (?,?,?,?,?,?)`).bind(buyer.id, listingId, nda.id, tokenHash, expiresAt, clean(context.data.admin?.email, 254)).run();
  const base = clean(context.env.PUBLIC_SITE_URL, 300) || new URL(context.request.url).origin;
  return json({ ok: true, access_url: `${base}/private-listings/?token=${encodeURIComponent(token)}`, expires_at: expiresAt }, 201);
}

export async function onRequestPatch(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const data = await body(context.request);
  const grantId = Number(data.id);
  if (!grantId) return json({ ok: false, error: "grant-id-required" }, 400);
  await context.env.DB.prepare("UPDATE access_grants SET status='revoked',revoked_at=CURRENT_TIMESTAMP WHERE id=?").bind(grantId).run();
  return json({ ok: true });
}

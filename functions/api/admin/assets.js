import { clean, id, json, requireBinding } from "../../_lib/http.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf","image/jpeg","image/png","image/webp"]);

export async function onRequestGet(context) {
  const missingDb = requireBinding(context.env, "DB"); if (missingDb) return missingDb;
  const listingId = id(new URL(context.request.url).searchParams.get("listing_id"));
  const { results } = await context.env.DB.prepare("SELECT id,listing_id,display_name,asset_type,mime_type,size_bytes,sort_order,created_at FROM listing_assets WHERE listing_id=? ORDER BY sort_order,id").bind(listingId).all();
  return json({ ok: true, assets: results });
}

export async function onRequestPost(context) {
  const missingDb = requireBinding(context.env, "DB"); if (missingDb) return missingDb;
  const missingR2 = requireBinding(context.env, "PRIVATE_LISTING_ASSETS"); if (missingR2) return missingR2;
  const form = await context.request.formData();
  const listingId = id(form.get("listing_id"));
  const file = form.get("file");
  const assetType = clean(form.get("asset_type"), 40) || "document";
  if (!listingId || !(file instanceof File)) return json({ ok: false, error: "listing-and-file-required" }, 400);
  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) return json({ ok: false, error: "unsupported-or-oversized-file" }, 400);
  const listing = await context.env.DB.prepare("SELECT id FROM listings WHERE id=?").bind(listingId).first();
  if (!listing) return json({ ok: false, error: "listing-not-found" }, 404);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "asset";
  const key = `${listingId}/${crypto.randomUUID()}-${safeName}`;
  await context.env.PRIVATE_LISTING_ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { listingId, uploadedBy: clean(context.data.admin?.email, 254) } });
  await context.env.DB.prepare(`INSERT INTO listing_assets (listing_id,r2_key,display_name,asset_type,mime_type,size_bytes)
    VALUES (?,?,?,?,?,?)`).bind(listingId, key, clean(form.get("display_name"), 200) || file.name, assetType, file.type, file.size).run();
  return json({ ok: true }, 201);
}

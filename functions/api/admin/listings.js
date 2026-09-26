import { body, clean, id, json, requireBinding } from "../../_lib/http.js";

const FIELDS = ["public_slug","public_title","public_category","public_summary","public_price_band","public_revenue_band","public_asset_label","placeholder_image","status","private_name","private_address","private_city","private_state","private_postal_code","private_asking_price","private_revenue","private_details_json"];

export async function onRequestGet(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const { results } = await context.env.DB.prepare("SELECT * FROM listings ORDER BY sort_order, id").all();
  return json({ ok: true, listings: results });
}

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  const data = await body(context.request);
  const listingId = id(data.id);
  if (!listingId || !clean(data.public_title, 200)) return json({ ok: false, error: "listing-id-and-title-required" }, 400);
  const values = FIELDS.map((field) => clean(data[field], field === "private_details_json" ? 12000 : 1000));
  if (values[17]) { try { JSON.parse(values[17]); } catch { return json({ ok: false, error: "invalid-private-details-json" }, 400); } }
  const columns = FIELDS.join(",");
  const placeholders = FIELDS.map(() => "?").join(",");
  const updates = FIELDS.map((field) => `${field}=excluded.${field}`).join(",");
  await context.env.DB.prepare(`INSERT INTO listings (id,${columns},updated_at) VALUES (?,${placeholders},CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET ${updates},updated_at=CURRENT_TIMESTAMP`).bind(listingId, ...values).run();
  return json({ ok: true, id: listingId }, 201);
}

export async function onRequestPatch(context) { return onRequestPost(context); }

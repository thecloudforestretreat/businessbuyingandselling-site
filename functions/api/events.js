import { body, clean, id, json, requireBinding, cors } from "../_lib/http.js";

const ALLOWED = new Set([
  "page_view_enhanced", "listing_click", "listing_inquiry", "listing_filter",
  "form_start", "form_submit_success", "private_access_requested"
]);

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request), "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" } });
}

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB");
  if (missing) return missing;
  try {
    const data = await body(context.request);
    const eventName = clean(data.event_name, 64);
    if (!ALLOWED.has(eventName)) return json({ ok: false, error: "unsupported-event" }, 400, cors(context.request));
    const metadata = data.metadata && typeof data.metadata === "object" ? data.metadata : {};
    await context.env.DB.prepare(`INSERT INTO activity_events
      (event_name, listing_id, page_path, session_id, source, medium, campaign, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(eventName, id(data.listing_id) || null, clean(data.page_path, 500), clean(data.session_id, 80), clean(data.source, 120), clean(data.medium, 120), clean(data.campaign, 120), JSON.stringify(metadata).slice(0, 4000))
      .run();
    return json({ ok: true }, 201, cors(context.request));
  } catch (error) {
    return json({ ok: false, error: "event-write-failed" }, 500, cors(context.request));
  }
}

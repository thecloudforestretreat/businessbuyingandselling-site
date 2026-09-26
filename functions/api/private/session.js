import { body, clean, json, requireBinding } from "../../_lib/http.js";
import { createBuyerSession, sha256 } from "../../_lib/auth.js";

export async function onRequestPost(context) {
  const missing = requireBinding(context.env, "DB"); if (missing) return missing;
  try {
    const data = await body(context.request);
    const token = clean(data.token, 500);
    if (!token) return json({ ok: false, error: "access-token-required" }, 400);
    const grant = await context.env.DB.prepare(`SELECT g.id,g.buyer_id,g.listing_id,g.expires_at,b.email,n.status AS nda_status
      FROM access_grants g JOIN buyers b ON b.id=g.buyer_id JOIN nda_records n ON n.id=g.nda_id
      WHERE g.token_hash=? AND g.status='active' AND datetime(g.expires_at)>CURRENT_TIMESTAMP LIMIT 1`)
      .bind(await sha256(token)).first();
    if (!grant || grant.nda_status !== "signed") return json({ ok: false, error: "invalid-or-expired-access" }, 403);
    await context.env.DB.prepare(`UPDATE access_grants SET first_accessed_at=COALESCE(first_accessed_at,CURRENT_TIMESTAMP),last_accessed_at=CURRENT_TIMESTAMP,access_count=access_count+1 WHERE id=?`).bind(grant.id).run();
    await context.env.DB.prepare(`INSERT INTO activity_events (event_name,listing_id,buyer_id,page_path,metadata_json) VALUES ('private_access_requested',?,?,?,'{}')`).bind(grant.listing_id, grant.buyer_id, "/private-listings/").run();
    const session = await createBuyerSession(context.env, { sub: grant.buyer_id, email: grant.email });
    return json({ ok: true }, 200, { "set-cookie": `bbas_buyer_session=${encodeURIComponent(session)}; Max-Age=28800; Path=/; HttpOnly; Secure; SameSite=Strict` });
  } catch (error) {
    return json({ ok: false, error: "private-session-failed" }, 500);
  }
}

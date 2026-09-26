import { json } from "../../_lib/http.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "set-cookie": "bbas_buyer_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict" });
}

import { adminGuard } from "../_lib/auth.js";

export async function onRequest(context) {
  const blocked = await adminGuard(context);
  if (blocked) return blocked;
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("cache-control", "private, no-store");
  headers.set("referrer-policy", "no-referrer");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

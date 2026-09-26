export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

export async function body(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

export function id(value) {
  return clean(value, 64).toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function requireBinding(env, name) {
  if (env && env[name]) return null;
  return json({ ok: false, error: `missing-${name.toLowerCase()}-binding` }, 503);
}

export function cors(request) {
  const origin = request.headers.get("origin") || "";
  const allowed = ["https://businessbuyingandselling.com", "https://www.businessbuyingandselling.com"];
  return allowed.includes(origin) ? { "access-control-allow-origin": origin, vary: "origin" } : {};
}

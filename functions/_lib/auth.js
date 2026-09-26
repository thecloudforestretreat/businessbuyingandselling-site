import { json } from "./http.js";

let accessKeys;
let accessKeysExpires = 0;

function fromB64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
}

function toB64url(bytes) {
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parsePart(value) {
  return JSON.parse(new TextDecoder().decode(fromB64url(value)));
}

async function getAccessKeys(teamDomain) {
  if (accessKeys && Date.now() < accessKeysExpires) return accessKeys;
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("Unable to load Cloudflare Access signing keys");
  accessKeys = await response.json();
  accessKeysExpires = Date.now() + 60 * 60 * 1000;
  return accessKeys;
}

function audienceMatches(claim, expected) {
  const values = Array.isArray(claim) ? claim : [claim];
  return values.includes(expected);
}

export async function verifyAccess(request, env) {
  const url = new URL(request.url);
  if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && env.ADMIN_DEV_BYPASS === "true") {
    return { email: "local-admin@businessbuyingandselling.com", sub: "local-admin", dev: true };
  }

  const token = request.headers.get("cf-access-jwt-assertion") || "";
  const teamDomain = String(env.CF_ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const expectedAud = String(env.CF_ACCESS_AUD || "");
  if (!token || !teamDomain || !expectedAud) throw new Error("Cloudflare Access authentication is required");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid Access token");
  const header = parsePart(parts[0]);
  const payload = parsePart(parts[1]);
  if (header.alg !== "RS256") throw new Error("Unsupported Access token algorithm");
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error("Expired Access token");
  if (!audienceMatches(payload.aud, expectedAud)) throw new Error("Invalid Access audience");
  if (payload.iss !== `https://${teamDomain}`) throw new Error("Invalid Access issuer");

  const certs = await getAccessKeys(teamDomain);
  const jwk = (certs.keys || []).find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Unknown Access signing key");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, fromB64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!verified) throw new Error("Invalid Access signature");
  return payload;
}

export async function adminGuard(context) {
  try {
    const user = await verifyAccess(context.request, context.env);
    context.data.admin = user;
    return null;
  } catch (error) {
    return json({ ok: false, error: "admin-auth-required", message: error.message }, 401);
  }
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toB64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function createBuyerSession(env, payload, ttlSeconds = 8 * 60 * 60) {
  if (!env.BUYER_SESSION_SECRET) throw new Error("Missing buyer session secret");
  const now = Math.floor(Date.now() / 1000);
  const encoded = toB64url(new TextEncoder().encode(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds })));
  return `${encoded}.${await hmac(env.BUYER_SESSION_SECRET, encoded)}`;
}

export async function readBuyerSession(request, env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)bbas_buyer_session=([^;]+)/);
  if (!match || !env.BUYER_SESSION_SECRET) return null;
  const token = decodeURIComponent(match[1]);
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || signature !== await hmac(env.BUYER_SESSION_SECRET, encoded)) return null;
  const payload = parsePart(encoded);
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return toB64url(data);
}

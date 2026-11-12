import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url).pathname;

function files(dir, suffix) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if ([".git", "node_modules"].includes(name)) return [];
    return statSync(path).isDirectory() ? files(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

test("every inline browser script parses", () => {
  const errors = [];
  for (const file of files(root, ".html")) {
    const html = readFileSync(file, "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    scripts.forEach((match, index) => {
      const attributes = match[1] || "";
      const source = match[2] || "";
      if (/\bsrc\s*=|application\/ld\+json|application\/json/i.test(attributes) || !source.trim()) return;
      try { new Function(source); }
      catch (error) { errors.push(`${relative(root, file)} inline script ${index + 1}: ${error.message}`); }
    });
  }
  assert.deepEqual(errors, []);
});

test("analytics uses one loader with controlled dual destinations", () => {
  const site = readFileSync(join(root, "assets/js/site.js"), "utf8");
  assert.match(site, /G-EH99SDCSFD/);
  assert.match(site, /G-EZNS547QYN/);
  assert.equal((site.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 2, "selector and loader URL should be the only gtag.js references");
  assert.match(site, /track\("generate_lead", payload\)/);
  assert.match(site, /form\[data-analytics-form\]/);
});

test("all public lead paths report confirmed success", () => {
  const contact = readFileSync(join(root, "contact/index.html"), "utf8");
  const home = readFileSync(join(root, "index.html"), "utf8");
  const legacyHome = readFileSync(join(root, "home/index.html"), "utf8");
  for (const [name, source] of [["contact", contact], ["home", home], ["legacy home", legacyHome]]) {
    assert.match(source, /BBAS\.formSuccess/, `${name} must report a server-confirmed lead`);
    assert.match(source, /notification_sent/, `${name} must retain notification status`);
  }
  assert.match(contact, /listing_id:/);
  assert.match(home, /source_url/);
  assert.match(legacyHome, /source_url/);
});

test("listing inquiries use the shared save and email pipeline", () => {
  const endpoint = readFileSync(join(root, "functions/api/listing-inquiry.js"), "utf8");
  assert.match(endpoint, /saveInquiry/);
  assert.match(endpoint, /notifyLead/);
  assert.match(endpoint, /notification_sent/);
  assert.doesNotMatch(endpoint, /INSERT INTO inquiries/);
});

test("deprecated Gmail destination is absent", () => {
  for (const file of files(root, ".js").concat(files(root, ".html"), files(root, ".toml"))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /businessbuyingandselling@gmail\.com/i, relative(root, file));
  }
});

import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost as submitListingInquiry } from "../functions/api/listing-inquiry.js";
import { notifyLead } from "../functions/_lib/leads.js";

function makeDb() {
  const calls = [];
  return {
    calls,
    prepare(sql) {
      const call = { sql, values: [] };
      calls.push(call);
      return {
        bind(...values) {
          call.values = values;
          return this;
        },
        async first() {
          if (sql.includes("SELECT id FROM listings")) return { id: "BBAS-101" };
          if (sql.includes("RETURNING id") && sql.includes("buyers")) return { id: 41 };
          if (sql.includes("RETURNING id") && sql.includes("inquiries")) return { id: 73 };
          return null;
        },
        async run() { return { success: true }; }
      };
    }
  };
}

test("listing inquiries save once and send a Resend notification", async () => {
  const db = makeDb();
  const outbound = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    outbound.push({ url: String(url), options });
    if (String(url).includes("turnstile")) return new Response(JSON.stringify({ success: true }), { status: 200 });
    if (String(url).includes("api.resend.com")) return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const request = new Request("https://businessbuyingandselling.com/api/listing-inquiry", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.1" },
      body: JSON.stringify({
        listing_reference: "BBAS-101",
        first_name: "Test",
        last_name: "Buyer",
        email: "buyer@example.com",
        phone: "555-0100",
        city: "Charlotte",
        state: "NC",
        message: "Please send the confidential information process.",
        source_url: "https://businessbuyingandselling.com/contact/?listing=BBAS-101&utm_source=qa&utm_medium=organic&utm_campaign=listing-test",
        turnstile_token: "verified-test-token"
      })
    });
    const response = await submitListingInquiry({
      request,
      env: {
        DB: db,
        TURNSTILE_SECRET_KEY: "turnstile-secret",
        RESEND_API_KEY: "resend-secret",
        CONTACT_FROM_EMAIL: "Business Buying and Selling <info@businessbuyingandselling.com>",
        CONTACT_NOTIFICATION_EMAIL: "juanpgranda@gmail.com"
      }
    });
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(result, { success: true, inquiry_id: 73, notification_sent: true });
    assert.equal(db.calls.filter((call) => call.sql.includes("INSERT INTO inquiries")).length, 1);
    assert.equal(db.calls.filter((call) => call.sql.includes("INSERT INTO activity_events")).length, 1);

    const emailRequest = outbound.find((call) => call.url.includes("api.resend.com"));
    assert.ok(emailRequest);
    const email = JSON.parse(emailRequest.options.body);
    assert.equal(email.from, "Business Buying and Selling <info@businessbuyingandselling.com>");
    assert.deepEqual(email.to, ["juanpgranda@gmail.com"]);
    assert.equal(email.reply_to, "buyer@example.com");
    assert.match(email.subject, /Listing inquiry: BBAS-101/);
    assert.match(email.html, /BBAS-101/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("notification HTML escapes submitted content", async () => {
  let sent;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return new Response("{}", { status: 200 });
  };
  try {
    const result = await notifyLead({
      RESEND_API_KEY: "resend-secret",
      CONTACT_FROM_EMAIL: "Business Buying and Selling <info@businessbuyingandselling.com>",
      CONTACT_NOTIFICATION_EMAIL: "juanpgranda@gmail.com"
    }, {
      firstName: "<script>", lastName: "Buyer", email: "buyer@example.com",
      message: "<img src=x onerror=alert(1)>", leadType: "general_contact",
      sourceUrl: "https://businessbuyingandselling.com/contact/"
    }, 88);
    assert.equal(result.sent, true);
    assert.doesNotMatch(sent.html, /<script>|<img/);
    assert.match(sent.html, /&lt;script&gt;/);
    assert.match(sent.html, /&lt;img/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("notification failures are recorded for admin follow-up", async () => {
  const db = makeDb();
  const result = await notifyLead({ DB: db }, {
    listingId: "BBAS-101", pagePath: "/contact/", firstName: "Test", lastName: "Buyer",
    email: "buyer@example.com", message: "Test"
  }, 99);
  assert.deepEqual(result, { sent: false, reason: "email-not-configured" });
  const failure = db.calls.find((call) => call.sql.includes("lead_notification_failed"));
  assert.ok(failure);
  assert.equal(failure.values[0], "BBAS-101");
  assert.match(failure.values[2], /"inquiry_id":99/);
});

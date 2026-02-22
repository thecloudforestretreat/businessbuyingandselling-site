export async function onRequestPost(context) {
  try {
    const req = context.request;
    const form = await req.formData();

    // Turnstile token field
    const token = form.get("cf-turnstile-response"); //  [oai_citation:3‡Cloudflare Docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "missing-turnstile-token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = context.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ ok: false, error: "missing-secret-key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify with Cloudflare
    const verifyForm = new FormData();
    verifyForm.append("secret", secret);
    verifyForm.append("response", token); //  [oai_citation:4‡Cloudflare Docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

    const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: verifyForm,
    });

    const verify = await verifyResp.json();

    if (!verify.success) {
      return new Response(JSON.stringify({ ok: false, error: "turnstile-failed", details: verify }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For now: just accept the submission (later: write to Google Sheet)
    // You can still read the other form fields here:
    // const firstName = form.get("first_name") || "";
    // const lastName  = form.get("last_name") || "";
    // const email     = form.get("email") || "";

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "internal-error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

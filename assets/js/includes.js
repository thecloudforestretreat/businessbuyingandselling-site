async function loadInclude(selector, url) {
  const el = document.querySelector(selector);
  if (!el) {
    console.error("Include target missing:", selector);
    return;
  }

  try {
    const res = await fetch(url + "?v=" + Date.now(), {
      cache: "no-store",
      headers: { "Accept": "text/html" }
    });

    if (!res.ok) {
      throw new Error("Failed include (" + res.status + "): " + url);
    }

    const html = await res.text();
    if (!html || !html.trim()) {
      throw new Error("Include empty HTML: " + url);
    }

    el.innerHTML = html;
    console.log("Included:", url, "->", selector);
  } catch (e) {
    console.error("Include error for", url, e);
    el.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadInclude("#siteHeader", "/assets/includes/header.html");
  await loadInclude("#siteFooter", "/assets/includes/footer.html");

  document.dispatchEvent(new CustomEvent("includes:loaded"));
});

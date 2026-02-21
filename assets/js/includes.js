/* /assets/js/includes.js */
(function () {
  function inject(targetId, url) {
    var el = document.getElementById(targetId);
    if (!el) return Promise.resolve({ id: targetId, ok: false, reason: "missing_target" });

    // If you had placeholder text like "Header did not load yet.", this clears it.
    el.innerHTML = "";

    return fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        return { id: targetId, ok: true };
      })
      .catch(function (err) {
        el.innerHTML =
          '<div style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;color:#6b7280;font:14px/1.4 system-ui;">' +
          (targetId === "siteHeader" ? "Header" : "Footer") +
          " failed to load.</div>";
        return { id: targetId, ok: false, reason: String(err && err.message ? err.message : err) };
      });
  }

  function run() {
    Promise.all([
      inject("siteHeader", "/assets/includes/header.html"),
      inject("siteFooter", "/assets/includes/footer.html")
    ]).then(function (results) {
      // Let site.js know includes are ready (if it wants to re-bind behavior).
      document.dispatchEvent(
        new CustomEvent("bbas:includes:loaded", { detail: { results: results } })
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

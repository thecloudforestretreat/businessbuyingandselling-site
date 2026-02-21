/* /assets/js/includes.js */
(function () {
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  async function inject(id, url) {
    var mount = document.getElementById(id);
    if (!mount) return;

    try {
      var res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      mount.innerHTML = await res.text();
    } catch (e) {
      // Fail quietly. Do not render scary banners.
      // If you want a visible fallback later, we can add it behind a debug flag.
      console.warn("BBAS include failed:", id, url, e && e.message ? e.message : e);
    }
  }

  onReady(function () {
    // Adjust these paths only if you store includes elsewhere
    inject("siteHeader", "/assets/includes/header.html");
    inject("siteFooter", "/assets/includes/footer.html");
  });
})();

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
    // Pin the shared navigation assets to the current release so returning
    // visitors do not keep an older cached menu or positioning rule.
    var headerCss = document.querySelector('link[href*="/assets/css/header.css"]');
    if (!headerCss) {
      headerCss = document.createElement("link");
      headerCss.rel = "stylesheet";
      document.head.appendChild(headerCss);
    }
    headerCss.href = "/assets/css/header.css?v=20260926-sticky-tools-v1";

    var resourceCss = document.querySelector('link[href*="/assets/css/resource.css"]');
    if (resourceCss) resourceCss.href = "/assets/css/resource.css?v=20260926-sticky-tools-v1";

    inject("siteHeader", "/assets/includes/header.html?v=20260926-sticky-tools-v1");
    inject("siteFooter", "/assets/includes/footer.html");
  });
})();

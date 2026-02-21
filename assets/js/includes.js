/* /assets/js/includes.js
   Injects global header/footer HTML into #siteHeader and #siteFooter
*/

(function () {
  function inject(selector, url) {
    var mount = document.querySelector(selector);
    if (!mount) return Promise.resolve(false);

    return fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
        return res.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        return true;
      })
      .catch(function (err) {
        console.error(err);
        return false;
      });
  }

  function init() {
    // Only inject if mounts exist on the page
    var headerPromise = inject("#siteHeader", "/assets/includes/header.html");
    var footerPromise = inject("#siteFooter", "/assets/includes/footer.html");

    Promise.all([headerPromise, footerPromise]).then(function () {
      // Optional: expose a small signal for debugging
      document.documentElement.classList.add("bbas-includes-loaded");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

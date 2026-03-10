/* /assets/js/site.js */
(function () {
  function initMobileNav() {
    var root = document.querySelector("[data-bbas-header]");
    var toggle = document.querySelector("[data-bbas-nav-toggle]");
    var mobile = document.querySelector("[data-bbas-mobile-nav]");
    if (!root || !toggle || !mobile) return false;
    if (toggle.dataset.bbasNavBound === "true") return true;

    toggle.dataset.bbasNavBound = "true";

    function closeMenu() {
      mobile.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.documentElement.classList.remove("bbas-menu-open");
    }

    function openMenu() {
      mobile.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.documentElement.classList.add("bbas-menu-open");
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", function (e) {
      var closeHit = e.target && e.target.closest ? e.target.closest("[data-bbas-nav-close]") : null;
      if (closeHit) {
        closeMenu();
        return;
      }

      if (mobile.hidden) return;

      var insideHeader = e.target && e.target.closest ? e.target.closest("[data-bbas-header]") : null;
      if (!insideHeader) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 901) closeMenu();
    });

    closeMenu();
    return true;
  }

  function boot() {
    if (initMobileNav()) return;

    var observer = new MutationObserver(function () {
      if (initMobileNav()) observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.setTimeout(function () {
      if (observer) observer.disconnect();
      initMobileNav();
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

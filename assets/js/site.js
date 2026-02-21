/* /assets/js/site.js */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var toggle = document.querySelector("[data-bbas-nav-toggle]");
    var mobile = document.querySelector("[data-bbas-mobile-nav]");
    if (!toggle || !mobile) return;

    function closeMenu() {
      mobile.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("bbas-menu-open");
    }

    function openMenu() {
      mobile.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("bbas-menu-open");
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", function (e) {
      var closeHit = e.target && e.target.closest ? e.target.closest("[data-bbas-nav-close]") : null;
      if (closeHit) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // If window resizes up to desktop, force-close the mobile menu
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 901) closeMenu();
    });
  });
})();

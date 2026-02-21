/* /assets/js/site.js */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function bindMobileNav() {
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

    // Ensure initial state is closed
    closeMenu();

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", function (e) {
      // Close if user clicks a link/button inside the mobile menu that has the close attribute
      var closeHit = e.target && e.target.closest ? e.target.closest("[data-bbas-nav-close]") : null;
      if (closeHit) closeMenu();

      // Optional: click outside the menu closes it (only when open)
      if (!mobile.hidden) {
        var insideMenu = e.target && e.target.closest ? e.target.closest("[data-bbas-mobile-nav], [data-bbas-nav-toggle]") : null;
        if (!insideMenu) closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Close menu on resize up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 901) closeMenu();
    });
  }

  ready(function () {
    bindMobileNav();

    // If includes load after initial bind, re-bind (safe).
    document.addEventListener("bbas:includes:loaded", function () {
      bindMobileNav();
    });

    // Footer year helper (if your footer uses #year)
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();

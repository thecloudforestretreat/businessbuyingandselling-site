function setActiveNav() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const links = document.querySelectorAll('.nav-link, .mobile-link');

  links.forEach(a => {
    const href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
    if (href === path) a.classList.add("is-active");
  });
}

function bindMobileMenu() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const btn = header.querySelector(".hamburger");
  const menu = header.querySelector("#mobileMenu");
  const closeBtn = header.querySelector(".mobile-close");

  if (!btn || !menu || !closeBtn) return;

  const open = () => {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    if (menu.hidden) open();
    else close();
  });

  closeBtn.addEventListener("click", close);

  menu.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.classList.contains("mobile-link")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.addEventListener("includes:loaded", () => {
  setActiveNav();
  bindMobileMenu();
});

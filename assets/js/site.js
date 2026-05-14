/* /assets/js/site.js */
(function () {
  "use strict";

  var GA4_ID = "G-EH99SDCSFD";
  var SCROLL_DEPTHS = [25, 50, 75, 90, 100];
  var sentScrollDepths = {};
  var formStarted = {};

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function closest(el, selector) {
    return el && el.closest ? el.closest(selector) : null;
  }

  function getPageType() {
    return document.body ? (document.body.getAttribute("data-page-type") || "unknown") : "unknown";
  }

  function getPrimaryGoal() {
    return document.body ? (document.body.getAttribute("data-primary-goal") || "unknown") : "unknown";
  }

  function getPath(url) {
    try {
      return new URL(url, window.location.origin).pathname;
    } catch (e) {
      return String(url || "");
    }
  }

  function ensureAnalytics() {
    if (window.__BBAS_ANALYTICS_DISABLED__ === true) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    var existing = document.querySelector('script[src*="googletagmanager.com/gtag/js?id=' + GA4_ID + '"]');
    if (!existing) {
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
      document.head.appendChild(script);
    }

    if (!window.__BBAS_GA4_CONFIGURED__) {
      window.gtag("js", new Date());
      window.gtag("config", GA4_ID, {
        send_page_view: false
      });
      window.__BBAS_GA4_CONFIGURED__ = true;
    }
  }

  function track(eventName, params) {
    ensureAnalytics();
    if (typeof window.gtag !== "function") return;

    var payload = Object.assign({
      page_type: getPageType(),
      primary_goal: getPrimaryGoal(),
      page_path: window.location.pathname,
      page_title: document.title
    }, params || {});

    window.gtag("event", eventName, payload);
  }

  window.BBAS = window.BBAS || {};
  window.BBAS.track = track;

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
      track("mobile_menu_open", { event_category: "navigation" });
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", function (e) {
      var closeHit = closest(e.target, "[data-bbas-nav-close]");
      if (closeHit) {
        closeMenu();
        return;
      }

      if (mobile.hidden) return;

      var insideHeader = closest(e.target, "[data-bbas-header]");
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

  function initMobileNavBoot() {
    if (initMobileNav()) return;

    var observer = new MutationObserver(function () {
      if (initMobileNav()) observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.setTimeout(function () {
      observer.disconnect();
      initMobileNav();
    }, 4000);
  }

  function initEnhancedPageView() {
    track("page_view_enhanced", {
      event_category: "page",
      canonical_url: document.querySelector('link[rel="canonical"]') ? document.querySelector('link[rel="canonical"]').href : window.location.href,
      referrer: document.referrer || ""
    });
  }

  function initScrollDepth() {
    function onScroll() {
      var doc = document.documentElement;
      var body = document.body;
      var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
      var height = Math.max(body.scrollHeight, doc.scrollHeight, body.offsetHeight, doc.offsetHeight, body.clientHeight, doc.clientHeight) - window.innerHeight;
      if (height <= 0) return;

      var percent = Math.min(100, Math.round((scrollTop / height) * 100));
      SCROLL_DEPTHS.forEach(function (depth) {
        if (percent >= depth && !sentScrollDepths[depth]) {
          sentScrollDepths[depth] = true;
          track("scroll_depth", {
            event_category: "engagement",
            scroll_percent: depth
          });
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initClickTracking() {
    document.addEventListener("click", function (e) {
      var link = closest(e.target, "a[href]");
      var explicit = closest(e.target, "[data-analytics-event]");

      if (explicit) {
        track(explicit.getAttribute("data-analytics-event") || "cta_click", {
          event_category: "interaction",
          event_label: explicit.getAttribute("data-analytics-label") || explicit.textContent.trim().slice(0, 120),
          event_location: explicit.getAttribute("data-analytics-location") || "unknown",
          event_section: explicit.getAttribute("data-analytics-section") || "unknown",
          event_goal: explicit.getAttribute("data-analytics-goal") || getPrimaryGoal(),
          destination_url: explicit.getAttribute("href") || ""
        });
      }

      if (!link) return;

      var href = link.getAttribute("href") || "";
      var text = (link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
      var url;

      try {
        url = new URL(href, window.location.origin);
      } catch (err) {
        return;
      }

      if (href.indexOf("mailto:") === 0) {
        track("email_click", { event_category: "lead", event_label: text || href, destination_url: href });
        return;
      }

      if (href.indexOf("tel:") === 0) {
        track("phone_click", { event_category: "lead", event_label: text || href, destination_url: href });
        return;
      }

      if (url.origin === window.location.origin) {
        var eventName = "internal_link_click";
        if (link.matches(".btn, .hero-btn, .listing-btn, .contact-btn, .home-text-link")) eventName = "cta_click";
        if (getPath(url.href).indexOf("/listings/") === 0) eventName = "listing_click";
        if (getPath(url.href).indexOf("/blog/") === 0) eventName = "blog_link_click";

        track(eventName, {
          event_category: "navigation",
          event_label: link.getAttribute("data-analytics-label") || text || getPath(url.href),
          destination_url: url.href,
          destination_path: getPath(url.href),
          event_section: link.getAttribute("data-analytics-section") || "inferred"
        });
      } else {
        track("outbound_link_click", {
          event_category: "navigation",
          event_label: text || url.hostname,
          destination_url: url.href,
          destination_domain: url.hostname
        });
      }
    });
  }

  function initFormTracking() {
    document.addEventListener("input", function (e) {
      var form = closest(e.target, "form");
      if (!form) return;

      var key = form.getAttribute("id") || form.getAttribute("name") || form.getAttribute("data-analytics-form") || "form";
      if (formStarted[key]) return;
      formStarted[key] = true;

      track("form_start", {
        event_category: "form",
        form_id: key,
        form_name: form.getAttribute("data-analytics-form") || key,
        event_goal: form.getAttribute("data-analytics-goal") || getPrimaryGoal()
      });
    }, true);

    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || !form.matches || !form.matches("form")) return;

      var key = form.getAttribute("id") || form.getAttribute("name") || form.getAttribute("data-analytics-form") || "form";
      track("form_submit_attempt", {
        event_category: "form",
        form_id: key,
        form_name: form.getAttribute("data-analytics-form") || key,
        event_goal: form.getAttribute("data-analytics-goal") || getPrimaryGoal()
      });
    }, true);

    document.addEventListener("bbas:form-success", function (e) {
      track("form_submit_success", {
        event_category: "form",
        form_id: e.detail && e.detail.form_id ? e.detail.form_id : "form",
        form_name: e.detail && e.detail.form_name ? e.detail.form_name : "form",
        event_goal: e.detail && e.detail.goal ? e.detail.goal : getPrimaryGoal()
      });
    });

    document.addEventListener("bbas:form-error", function (e) {
      track("form_submit_error", {
        event_category: "form",
        form_id: e.detail && e.detail.form_id ? e.detail.form_id : "form",
        form_name: e.detail && e.detail.form_name ? e.detail.form_name : "form",
        error_message: e.detail && e.detail.message ? e.detail.message : "unknown"
      });
    });
  }

  function initFaqTracking() {
    document.addEventListener("toggle", function (e) {
      var details = e.target;
      if (!details || details.tagName !== "DETAILS" || !details.open) return;
      var summary = details.querySelector("summary");
      track("faq_expand", {
        event_category: "engagement",
        event_label: summary ? summary.textContent.trim().slice(0, 120) : "FAQ",
        event_section: details.getAttribute("data-analytics-section") || "faq"
      });
    }, true);
  }

  function boot() {
    ensureAnalytics();
    initMobileNavBoot();
    initEnhancedPageView();
    initScrollDepth();
    initClickTracking();
    initFormTracking();
    initFaqTracking();
  }

  ready(boot);
})();

/* =====================================================
   FINAL PRODUCTION FORM EVENT HELPERS
   Optional helpers for AJAX forms to report success/error to global analytics.
   Existing pages can call:
   window.BBAS.formSuccess(form, goal)
   window.BBAS.formError(form, message)
   ===================================================== */
(function(){
  window.BBAS = window.BBAS || {};

  if (!window.BBAS.formSuccess) {
    window.BBAS.formSuccess = function(form, goal){
      var formId = form && (form.getAttribute("id") || form.getAttribute("name") || form.getAttribute("data-analytics-form")) || "form";
      document.dispatchEvent(new CustomEvent("bbas:form-success", {
        detail: {
          form_id: formId,
          form_name: form && form.getAttribute("data-analytics-form") || formId,
          goal: goal || (document.body && document.body.getAttribute("data-primary-goal")) || "unknown"
        }
      }));
    };
  }

  if (!window.BBAS.formError) {
    window.BBAS.formError = function(form, message){
      var formId = form && (form.getAttribute("id") || form.getAttribute("name") || form.getAttribute("data-analytics-form")) || "form";
      document.dispatchEvent(new CustomEvent("bbas:form-error", {
        detail: {
          form_id: formId,
          form_name: form && form.getAttribute("data-analytics-form") || formId,
          message: message || "unknown"
        }
      }));
    };
  }
})();

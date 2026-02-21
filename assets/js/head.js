(function () {
  const GA_ID = "G-EH99SDCSFD";

  const defaults = {
    title: "Business Buying and Selling",
    description: "A marketplace and resource for buying and selling established businesses.",
    imagePath: "/assets/images/og-image.jpg"
  };

  function getMeta(name) {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el ? el.getAttribute("content") : "";
  }

  const pageTitle = getMeta("page:title") || defaults.title;
  const pageDesc = getMeta("page:description") || defaults.description;
  const pageImage = getMeta("page:image") || defaults.imagePath;

  const origin = window.location.origin;
  const url = origin + window.location.pathname;
  const absImage = pageImage.startsWith("http") ? pageImage : (origin + pageImage);

  document.title = pageTitle;

  function upsertMeta(attr, key, value) {
    let el;
    if (attr === "name") el = document.querySelector(`meta[name="${key}"]`);
    if (attr === "property") el = document.querySelector(`meta[property="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function upsertLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  function addLink(rel, href, extra) {
    const el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("href", href);
    if (extra) {
      Object.keys(extra).forEach(k => el.setAttribute(k, extra[k]));
    }
    document.head.appendChild(el);
  }

  function addScript(src, async) {
    const s = document.createElement("script");
    if (async) s.async = true;
    s.src = src;
    document.head.appendChild(s);
    return s;
  }

  // Canonical
  upsertLink("canonical", url);

  // Primary SEO
  upsertMeta("name", "description", pageDesc);

  // Open Graph
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:title", pageTitle);
  upsertMeta("property", "og:description", pageDesc);
  upsertMeta("property", "og:image", absImage);

  // Twitter
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:url", url);
  upsertMeta("name", "twitter:title", pageTitle);
  upsertMeta("name", "twitter:description", pageDesc);
  upsertMeta("name", "twitter:image", absImage);

  // Favicons and manifest
  addLink("icon", "/favicon.ico");
  addLink("apple-touch-icon", "/apple-touch-icon.png");
  addLink("manifest", "/site.webmanifest");

  // Fonts (only once)
  addLink("preconnect", "https://fonts.googleapis.com");
  addLink("preconnect", "https://fonts.gstatic.com", { crossorigin: "" });
  addLink("stylesheet", "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Montserrat:wght@400;500&family=DM+Sans:wght@400;500&display=swap");

  // Google Analytics (gtag)
  addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, true);
  const inline = document.createElement("script");
  inline.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;
  document.head.appendChild(inline);
})();

(() => {
  const links = window.CARECONNECT_LINKS || {};
  document.querySelectorAll("[data-link]").forEach(link => {
    const key = link.dataset.link;
    if (links[key]) link.href = links[key];
  });

  const header = document.querySelector(".site-header");
  const samePageLinks = document.querySelectorAll('a[href^="#"]');

  function scrollToTarget(target, updateHistory = true) {
    if (!target) return;

    const parentDetails = target.closest("details");
    if (parentDetails) parentDetails.open = true;
    if (target.tagName === "DETAILS") target.open = true;

    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });

    if (updateHistory && target.id) {
      history.pushState(null, "", `#${target.id}`);
    }
  }

  samePageLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href").slice(1);
      const target = targetId ? document.getElementById(targetId) : document.getElementById("top");
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);
    });
  });

  if (window.location.hash) {
    window.addEventListener("load", () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) window.setTimeout(() => scrollToTarget(target, false), 0);
    });
  }

  const trackedSections = ["platform", "status", "roadmap", "agentforce", "build"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const primaryLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];

  if ("IntersectionObserver" in window && trackedSections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      primaryLinks.forEach(link => {
        const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0.01, 0.25, 0.5]
    });

    trackedSections.forEach(section => observer.observe(section));
  }

  const lightbox = document.getElementById("lightbox");
  const image = lightbox ? lightbox.querySelector(".lightbox-image") : null;
  const closeButton = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  let previousFocus = null;

  function openLightbox(button) {
    if (!lightbox || !image || !closeButton) return;
    previousFocus = document.activeElement;
    image.src = button.dataset.full;
    image.alt = button.querySelector("img").alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox || !image) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    image.src = "";
    document.body.classList.remove("no-scroll");
    if (previousFocus) previousFocus.focus();
  }

  document.querySelectorAll(".image-button").forEach(button => {
    button.addEventListener("click", () => openLightbox(button));
  });

  if (closeButton) closeButton.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lightbox && lightbox.classList.contains("open")) closeLightbox();
  });
})();

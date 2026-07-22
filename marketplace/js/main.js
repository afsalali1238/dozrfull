/* =================================================================
   Shared page behavior - nav, category tabs, mobile menu.
   Page-specific logic (e.g. rendering the Browse grid from
   data/equipment.js) belongs in a js/<page>.js file, not here.
   ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initCategoryTabs();
  markActiveNavLink();
});

/**
 * Sets aria-current="page" on whichever site-nav link matches the current
 * page, "false" on the rest. Previously every page hardcoded its own
 * correct value in markup (9 pages x 5 links) - real drift risk flagged in
 * the 2026-07-22 UI/UX audit (header markup duplicated across pages with
 * no template mechanism). This makes the nav's active-link state the one
 * thing that's computed instead of copy-pasted, without needing a build
 * step or templating for the rest of the header.
 */
function markActiveNavLink() {
  const links = document.querySelectorAll(".site-nav .links a[href]");
  if (!links.length) return;
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((link) => {
    const linkPage = link.getAttribute("href").split("#")[0].split("?")[0] || "index.html";
    link.setAttribute("aria-current", linkPage === currentPage ? "page" : "false");
  });
}

function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.getAttribute("data-open") === "true";
    menu.setAttribute("data-open", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (e) => {
    if (menu.getAttribute("data-open") === "true" && !menu.contains(e.target) && e.target !== toggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.getAttribute("data-open") === "true") {
      closeMenu();
      toggle.focus();
    }
  });
}

/**
 * Wires up the EquipmentShare-style category tab bar on browse.html.
 * Expects buttons with [data-category] and a container with
 * [data-category-results] to re-render when the active category changes.
 * Actual grid rendering stays in browse.html since it depends on that
 * page's markup/card template.
 */
function initCategoryTabs() {
  const tabs = document.querySelectorAll("[data-category]");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-current", "false"));
      tab.setAttribute("aria-current", "true");

      const categoryId = tab.getAttribute("data-category");
      const event = new CustomEvent("dozr:category-change", {
        detail: { categoryId },
      });
      document.dispatchEvent(event);
    });
  });
}




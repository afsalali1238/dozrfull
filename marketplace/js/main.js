/* =================================================================
   Shared page behavior - nav, category tabs, mobile menu.
   Page-specific logic (e.g. rendering the Browse grid from
   data/equipment.js) belongs in a js/<page>.js file, not here.
   ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initCategoryTabs();
});

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




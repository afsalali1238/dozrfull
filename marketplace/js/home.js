/* Home page rendering and feature tabs. */
document.addEventListener("DOMContentLoaded", () => {
  const categories = window.DOZR_CATEGORIES || [];
  const equipment = window.DOZR_EQUIPMENT || [];
  const categoryGrid = document.getElementById("category-grid");
  categoryGrid.innerHTML = categories.map((category) => `
    <a class="category-tile" href="browse.html?category=${category.id}" aria-label="Browse ${category.label}">
      <div class="photo" style="background-image: url('assets/categories/${category.id}.jpg');" role="img" aria-label="${category.label}" data-cap="${category.label}"></div>
      <div class="tile-body"><strong>${category.label}</strong><span>${category.units} units</span></div>
    </a>
  `).join("");

  const featuredGrid = document.getElementById("featured-grid");
  featuredGrid.innerHTML = equipment.filter((unit) => unit.featuredOnHome).slice(0, 3).map((unit) => {
    const quoteHref = DozrWhatsApp.requestQuote(unit.name, "12-26 Aug", "Al Quoz Industrial 3");
    const specs = Object.values(unit.specs || {}).slice(0, 3).map((value) => `<span>${value}</span>`).join("");
    return `<article class="listing-card">
      <a class="card-link" href="equipment-detail.html?id=${unit.id}" aria-label="View ${unit.name} details">
        <div class="photo card-photo" style="background-image: url('assets/equipment/${unit.id}-hero.jpg');" role="img" aria-label="${unit.categoryLabel}" data-cap="${unit.categoryLabel}">${unit.verified ? '<span class="verified-badge">Verified</span>' : ''}</div>
        <div class="card-body"><div class="card-kicker">${unit.categoryLabel}</div><div class="card-name">${unit.name}</div><div class="spec-pills">${specs}</div></div>
      </a>
      <div class="card-actions"><span class="status-text">${unit.gpsTracked ? 'GPS tracked' : 'Quote available'}</span><a class="btn btn-secondary" href="${quoteHref}">Request quote</a></div>
    </article>`;
  }).join("");

  const captions = { track: "Live GPS tracking link", verify: "Driver + client ePOD sign-off", pay: "Auto-generated VAT invoice" };
  const visual = document.getElementById("feature-visual");
  document.querySelectorAll(".feature-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".feature-tab").forEach((item) => item.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      const caption = captions[tab.dataset.feature];
      visual.style.backgroundImage = `url('assets/feature/${tab.dataset.feature}.jpg')`;
      visual.setAttribute("aria-label", caption);
      visual.setAttribute("data-cap", caption);
    });
  });
});

/* Browse page category and filter behavior. */
document.addEventListener("DOMContentLoaded", () => {
  const categories = window.DOZR_CATEGORIES || [];
  const tabs = document.getElementById("category-tabs");
  const params = new URLSearchParams(window.location.search);
  const filters = { weight: null, availability: null, gps: false, verified: false };
  const searchLocation = params.get("location") || "Al Quoz, Dubai";
  const searchStart = params.get("start") || "2026-08-12";
  const searchEnd = params.get("end") || "2026-08-26";
  let activeCategory = params.get("category") || "excavators";
  if (!categories.some((category) => category.id === activeCategory)) activeCategory = "excavators";

  tabs.innerHTML = categories.map((category) => `<button type="button" data-category="${category.id}" aria-current="${category.id === activeCategory}">${category.label}</button>`).join("");
  initCategoryTabs();

  const mobileFilterToggle = document.getElementById("mobileFilterToggle");
  const filtersAside = document.getElementById("filters");
  if (mobileFilterToggle && filtersAside) {
    mobileFilterToggle.addEventListener("click", () => {
      const isOpen = filtersAside.getAttribute("data-filters-open") === "true";
      filtersAside.setAttribute("data-filters-open", String(!isOpen));
      mobileFilterToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  document.querySelectorAll("#filters .chip[data-weight]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const selected = chip.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("#filters .chip[data-weight]").forEach((item) => item.setAttribute("aria-pressed", "false"));
      filters.weight = selected ? chip.dataset.weight : null;
      chip.setAttribute("aria-pressed", String(selected));
      render(activeCategory);
    });
  });

  document.querySelectorAll("#filters [data-availability]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("#filters [data-availability]").forEach((item) => {
        item.setAttribute("aria-pressed", "false");
        item.querySelector(".fake-check").removeAttribute("data-on");
        item.querySelector(".fake-check").textContent = "";
      });
      filters.availability = selected ? button.dataset.availability : null;
      button.setAttribute("aria-pressed", String(selected));
      if (selected) button.querySelector(".fake-check").setAttribute("data-on", "true");
      else button.querySelector(".fake-check").removeAttribute("data-on");
      button.querySelector(".fake-check").textContent = selected ? "✓" : "";
      render(activeCategory);
    });
  });

  document.querySelectorAll("#filters [data-toggle-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.toggleFilter;
      filters[key] = !filters[key];
      button.setAttribute("aria-pressed", String(filters[key]));
      render(activeCategory);
    });
  });

  function render(categoryId) {
    activeCategory = categoryId;
    const category = categories.find((item) => item.id === categoryId) || categories[0];
    const baseUnits = getEquipmentByCategory(categoryId);
    const units = baseUnits.filter(matchesFilters);
    const cards = units.length ? units.map(renderCard).join("") : renderEmptyState(category, baseUnits.length);
    document.getElementById("results").innerHTML = `
      <div class="search-summary"><strong>${category.label}</strong> near ${searchLocation} · ${formatDate(searchStart)} to ${formatDate(searchEnd)}</div>
      <div class="results-header"><div><span class="results-count">${units.length} ${category.label.toLowerCase()}</span><span class="text-muted" style="font-size:14px;margin-left:8px">near ${searchLocation}</span></div><span class="eyebrow">Sort: availability</span></div>
      <div class="results-grid">${cards}</div>`;
  }

  function matchesFilters(unit) {
    if (filters.weight && !matchesWeight(unit)) return false;
    if (filters.availability && getAvailability(unit) !== filters.availability) return false;
    if (filters.gps && !unit.gpsTracked) return false;
    if (filters.verified && !unit.verified) return false;
    return true;
  }

  function matchesWeight(unit) {
    const tonnes = unit.weightTonnes;
    if (!tonnes) return filters.weight !== "up-to-6" && filters.weight !== "20-plus";
    if (filters.weight === "up-to-6") return tonnes <= 6;
    if (filters.weight === "6-20") return tonnes > 6 && tonnes <= 20;
    if (filters.weight === "20-plus") return tonnes > 20;
    return true;
  }

  // Delegates to data/equipment.js's getEquipmentAvailability() so Browse
  // and equipment-detail.html can never disagree on a unit's availability
  // tier (see that function's comment - fixed 2026-07-22).
  function getAvailability(unit) {
    return getEquipmentAvailability(unit);
  }

  function renderEmptyState(category, categoryCount) {
    const copy = categoryCount ? "No units match those filters yet. Clear one filter or ask Dozr to source a match from verified vendors." : "This category is ready in the Marketplace, but sample inventory has not been added yet. Send the request and Dozr will source it from verified vendors.";
    const dateRange = `${formatDate(searchStart)} to ${formatDate(searchEnd)}`;
    return `<div class="card" style="padding:24px"><h2 style="font-size:20px;margin-bottom:8px">${category.label} quotes are handled on WhatsApp</h2><p class="text-muted" style="margin:0 0 16px;line-height:1.6">${copy}</p><a class="btn btn-primary" href="${DozrWhatsApp.requestQuote(category.label, dateRange, searchLocation)}">Request quote</a></div>`;
  }

  function formatDate(value) {
    if (!value) return "Date TBD";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderCard(unit) {
    const weight = unit.weightTonnes ? `${unit.weightTonnes}T` : "Verified";
    const dateRange = `${formatDate(searchStart)} to ${formatDate(searchEnd)}`;
    const quoteHref = DozrWhatsApp.requestQuote(unit.name, dateRange, searchLocation);
    return `<article class="listing-card">
      <a class="card-link" href="equipment-detail.html?id=${unit.id}" aria-label="View ${unit.name} details">
        <div class="photo card-photo" style="background-image: url('assets/equipment/${unit.id}-hero.jpg');" role="img" aria-label="${unit.categoryLabel}" data-cap="${unit.categoryLabel}">${unit.verified ? '<span class="verified-badge">Verified</span>' : ''}</div>
        <div class="card-body"><div class="card-kicker">${unit.categoryLabel} - ${weight}</div><div class="card-name">${unit.name}</div><div class="spec-pills"><span>${getAvailability(unit).replace('-', ' ')}</span>${unit.gpsTracked ? '<span>GPS on</span>' : ''}</div></div>
      </a>
      <div class="card-actions" style="justify-content:flex-end"><a class="btn btn-secondary" href="${quoteHref}">Request quote</a></div>
    </article>`;
  }

  document.addEventListener("dozr:category-change", (event) => render(event.detail.categoryId));
  render(activeCategory);
});
